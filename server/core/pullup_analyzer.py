import cv2
import mediapipe as mp
import numpy as np
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

try:
    from core.landmark_filter import LandmarkStabilizer
    from core.preprocessing import AdaptivePreprocessor
    from core.confidence import ConfidenceChecker, draw_confidence_warning
    from core.velocity_tracker import VelocityTracker
except ImportError:
    from landmark_filter import LandmarkStabilizer
    from preprocessing import AdaptivePreprocessor
    from confidence import ConfidenceChecker, draw_confidence_warning
    from velocity_tracker import VelocityTracker


def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    return int(np.degrees(np.arccos(cosine_angle)))

def get_key_metrics(landmarks, width, height):
    def pixel_coord(idx):
        lm = landmarks[idx]
        return (int(lm.x * width), int(lm.y * height))

    metrics = {}
    try:
        l_shoulder = pixel_coord(11)
        l_elbow = pixel_coord(13)
        l_wrist = pixel_coord(15)
        metrics['left_extension'] = calculate_angle(l_shoulder, l_elbow, l_wrist)

        r_shoulder = pixel_coord(12)
        r_elbow = pixel_coord(14)
        r_wrist = pixel_coord(16)
        metrics['right_extension'] = calculate_angle(r_shoulder, r_elbow, r_wrist)

        nose = pixel_coord(0)
        metrics['nose_y'] = nose[1]
        metrics['left_wrist_y'] = l_wrist[1]
        metrics['right_wrist_y'] = r_wrist[1]
    except:
        metrics = {k: None for k in ['left_extension', 'right_extension', 'nose_y', 'left_wrist_y', 'right_wrist_y']}
    return metrics

def add_info_panel(image, frame, fps, reps, current_extension, state, velocity_str="--"):
    h, w = image.shape[:2]
    panel_height = 100
    panel = np.zeros((panel_height, w, 3), dtype=np.uint8)
    panel[:, :] = (40, 40, 40)
    image_with_panel = np.vstack([image, panel])
    new_h = h + panel_height
    cv2.putText(image_with_panel, f"State: {state}", (20, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
    cv2.putText(image_with_panel, f"Reps: {reps}", (w//2 - 100, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    cv2.putText(image_with_panel, f"Ext: {current_extension}", (w//2 - 100, new_h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 1)
    if velocity_str != "--":
        cv2.putText(image_with_panel, f"Vel: {velocity_str} d/s", (w - 250, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    cv2.putText(image_with_panel, "Chin over bar", (w - 250, new_h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    return image_with_panel

def analyze_pullup_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # ===== Enhancement pipeline =====
    stabilizer = LandmarkStabilizer(method="one_euro", min_cutoff=1.5, beta=0.01)
    preprocessor = AdaptivePreprocessor()
    confidence_checker = ConfidenceChecker(threshold=0.65)
    velocity_tracker = VelocityTracker(fps=fps, min_displacement=25.0, min_velocity_threshold=20.0)

    # Initialize video writer (stream to disk instead of accumulating in memory)
    video_writer = None
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    rep_data = []
    state = "down"
    rep_count = 0
    current_rep_max_extension = 0
    last_velocity_str = "--"

    # Carry-forward state
    last_good_metrics = {k: None for k in ['left_extension', 'right_extension', 'nose_y', 'left_wrist_y', 'right_wrist_y']}

    with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7, model_complexity=1) as pose:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            frame_count += 1

            # ===== Adaptive preprocessing =====
            frame = preprocessor.enhance(frame)

            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)
            current_ext = 0

            if results.pose_landmarks:
                # ===== Landmark stabilization =====
                landmarks = stabilizer.smooth(results.pose_landmarks.landmark, fps)

                # ===== Confidence check =====
                frame_confidence = confidence_checker.evaluate(landmarks)

                mp_drawing.draw_landmarks(image_rgb, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

                if not frame_confidence.is_reliable:
                    image_rgb = draw_confidence_warning(image_rgb, frame_confidence)
                    metrics = last_good_metrics
                else:
                    metrics = get_key_metrics(landmarks, width, height)
                    last_good_metrics = metrics.copy()

                track_side = "left"
                l_vis = (landmarks[11].visibility + landmarks[13].visibility + landmarks[15].visibility) / 3
                r_vis = (landmarks[12].visibility + landmarks[14].visibility + landmarks[16].visibility) / 3

                if r_vis > l_vis and metrics['right_extension'] is not None:
                    track_side = "right"
                    current_ext = metrics['right_extension']
                    wrist_y = metrics['right_wrist_y']
                else:
                    current_ext = metrics['left_extension'] if metrics['left_extension'] else 0
                    wrist_y = metrics['left_wrist_y']

                if current_ext:
                    # ===== Velocity tracking =====
                    vel_data = velocity_tracker.update(current_ext)
                    last_velocity_str = str(vel_data["smoothed_velocity"])

                nose_y = metrics['nose_y']
                is_above_bar = nose_y < wrist_y if (nose_y and wrist_y) else False

                if state == "down":
                    if is_above_bar:
                        state = "up"
                        # ===== Velocity-based rep validation =====
                        rep_metrics = velocity_tracker.get_rep_metrics()
                        is_valid = velocity_tracker.is_valid_rep(min_displacement=25.0)

                        if is_valid:
                            rep_count += 1
                            current_rep_max_extension = 0
                        velocity_tracker.start_new_rep()
                    if current_ext > current_rep_max_extension:
                        current_rep_max_extension = current_ext
                elif state == "up":
                    if not is_above_bar and current_ext > 90:
                        state = "down"
                        if current_rep_max_extension > 0:
                            rep_data.append({
                                "rep": rep_count,
                                "extension": current_rep_max_extension,
                                "velocity_metrics": velocity_tracker.get_rep_metrics(),
                            })

            final_image = add_info_panel(image_rgb, frame_count, fps, rep_count, current_ext, state, last_velocity_str)
            # Write frame to disk (BGR for cv2.VideoWriter)
            if video_writer is not None:
                frame_bgr = cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR) if len(final_image.shape) == 3 else final_image
                video_writer.write(frame_bgr)

    cap.release()
    if video_writer is not None:
        video_writer.release()


    avg_extension = 0
    feedback = []
    corrections = []

    if rep_data:
        avg_extension = np.mean([r["extension"] for r in rep_data])
        if avg_extension < 140:
            feedback.append("Poor Extension")
            corrections.append("Fully straighten your arms at the bottom.")
        elif avg_extension < 160:
            feedback.append("Good Range")
            corrections.append("Try to relax into a dead hang.")
        else:
            feedback.append("Excellent Form")
            corrections.append("Great full range of motion!")
    else:
        if rep_count == 0:
            feedback.append("No Reps Detected")
            corrections.append("Ensure your chin clears the bar.")

    return {
        "reps_count": rep_count,
        "avg_depth": int(avg_extension),
        "feedback": feedback,
        "corrections": corrections,
        "rep_details": rep_data,
        "confidence_stats": confidence_checker.stats,
        "preprocessing_stats": preprocessor.stats,
        "enhancements": ["landmark_stabilization", "adaptive_preprocessing", "confidence_aware", "velocity_validation"],
    }
