import cv2
import mediapipe as mp
import numpy as np
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

try:
    from core.biomechanics import calculate_angle, get_landmark_coords
    from core.landmark_filter import LandmarkStabilizer
    from core.preprocessing import AdaptivePreprocessor
    from core.confidence import ConfidenceChecker, draw_confidence_warning
    from core.velocity_tracker import VelocityTracker
except ImportError:
    from biomechanics import calculate_angle, get_landmark_coords
    from landmark_filter import LandmarkStabilizer
    from preprocessing import AdaptivePreprocessor
    from confidence import ConfidenceChecker, draw_confidence_warning
    from velocity_tracker import VelocityTracker


def get_key_metrics(landmarks, width, height):
    def pixel_coord(idx):
        lm = landmarks[idx]
        return (int(lm.x * width), int(lm.y * height))

    metrics = {}
    try:
        l_shoulder = pixel_coord(11)
        l_elbow = pixel_coord(13)
        l_wrist = pixel_coord(15)
        metrics['left_elbow'] = calculate_angle(l_shoulder, l_elbow, l_wrist)

        r_shoulder = pixel_coord(12)
        r_elbow = pixel_coord(14)
        r_wrist = pixel_coord(16)
        metrics['right_elbow'] = calculate_angle(r_shoulder, r_elbow, r_wrist)

        l_hip = pixel_coord(23)
        r_hip = pixel_coord(24)
        hip_mid = ((l_hip[0] + r_hip[0]) // 2, (l_hip[1] + r_hip[1]) // 2)

        metrics['left_elbow_flare'] = calculate_angle(hip_mid, l_shoulder, l_elbow)
        metrics['right_elbow_flare'] = calculate_angle(hip_mid, r_shoulder, r_elbow)
        metrics['wrist_x'] = (l_wrist[0] + r_wrist[0]) // 2
    except:
        metrics = {k: None for k in ['left_elbow', 'right_elbow', 'left_elbow_flare', 'right_elbow_flare', 'wrist_x']}
    return metrics

def get_depth_rating(elbow_angle):
    if elbow_angle > 120: return "Partial ROM"
    elif 100 <= elbow_angle <= 120: return "Shallow"
    elif 80 <= elbow_angle < 100: return "Good Depth (NSCA)"
    else: return "Full ROM"

def add_metric_overlays(image, metrics):
    y_pos = 40
    if metrics['left_elbow'] is not None:
        if 80 <= metrics['left_elbow'] <= 100: color = (0, 255, 0)
        elif 100 < metrics['left_elbow'] <= 120: color = (0, 200, 255)
        else: color = (0, 0, 255)
        cv2.putText(image, f"Elbow: {metrics['left_elbow']} (NSCA: 80-100)", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    if metrics['left_elbow_flare'] is not None:
        flare_color = (0, 255, 0) if 30 <= metrics['left_elbow_flare'] <= 75 else (0, 165, 255)
        cv2.putText(image, f"Elbow Flare: {metrics['left_elbow_flare']} (Opt: 30-75)", (20, y_pos + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, flare_color, 2)
    return image

def add_info_panel(image, frame, total_frames, fps, reps, current_elbow_angle, velocity_str="--"):
    h, w = image.shape[:2]
    panel_height = 100
    panel = np.zeros((panel_height, w, 3), dtype=np.uint8)
    panel[:, :] = (40, 40, 40)
    image_with_panel = np.vstack([image, panel])
    new_h = h + panel_height
    cv2.putText(image_with_panel, f"Frame: {frame}/{total_frames}", (20, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    cv2.putText(image_with_panel, f"Reps: {reps}", (w//2 - 100, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    cv2.putText(image_with_panel, f"Elbow: {current_elbow_angle}", (w//2 - 100, new_h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 1)
    if velocity_str != "--":
        cv2.putText(image_with_panel, f"Vel: {velocity_str} d/s", (w - 280, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)
    cv2.putText(image_with_panel, " Bar to chest", (w - 280, new_h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    return image_with_panel

def analyze_bench_press_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}

    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # ===== Enhancement pipeline =====
    stabilizer = LandmarkStabilizer(method="one_euro", min_cutoff=1.5, beta=0.01)
    preprocessor = AdaptivePreprocessor()
    confidence_checker = ConfidenceChecker(threshold=0.65)
    velocity_tracker = VelocityTracker(fps=fps, min_displacement=30.0, min_velocity_threshold=20.0)

    # Initialize video writer (stream to disk instead of accumulating in memory)
    video_writer = None
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    rep_data = []
    in_press = False
    rep_count = 0
    min_elbow_angle = 180
    max_elbow_flare = 0
    last_velocity_str = "--"

    # Carry-forward state
    last_good_metrics = {k: None for k in ['left_elbow', 'right_elbow', 'left_elbow_flare', 'right_elbow_flare', 'wrist_x']}

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

            if results.pose_landmarks:
                # ===== Landmark stabilization =====
                landmarks = stabilizer.smooth(results.pose_landmarks.landmark, fps)

                # ===== Confidence check =====
                frame_confidence = confidence_checker.evaluate(landmarks)

                mp_drawing.draw_landmarks(image_rgb, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2))

                if not frame_confidence.is_reliable:
                    image_rgb = draw_confidence_warning(image_rgb, frame_confidence)
                    metrics = last_good_metrics
                else:
                    metrics = get_key_metrics(landmarks, width, height)
                    last_good_metrics = metrics.copy()

                current_angle = metrics.get('left_elbow')
                current_flare = metrics.get('left_elbow_flare')

                try:
                    l_vis = (landmarks[11].visibility + landmarks[13].visibility + landmarks[15].visibility) / 3
                    r_vis = (landmarks[12].visibility + landmarks[14].visibility + landmarks[16].visibility) / 3
                    if r_vis > l_vis:
                        current_angle = metrics['right_elbow']
                        current_flare = metrics['right_elbow_flare']
                except: pass

                if current_angle is not None:
                    # ===== Velocity tracking =====
                    vel_data = velocity_tracker.update(current_angle)
                    last_velocity_str = str(vel_data["smoothed_velocity"])

                    if not in_press and current_angle > 150:
                        in_press = True
                        min_elbow_angle = 180
                        max_elbow_flare = 0
                        velocity_tracker.start_new_rep()
                    if in_press:
                        if current_angle < min_elbow_angle: min_elbow_angle = current_angle
                        if current_flare and current_flare > max_elbow_flare: max_elbow_flare = current_flare
                    if in_press and current_angle > 150 and min_elbow_angle < 135:
                        in_press = False

                        # ===== Velocity-based rep validation =====
                        rep_metrics = velocity_tracker.get_rep_metrics()
                        is_valid = velocity_tracker.is_valid_rep(min_displacement=30.0)

                        if not is_valid:
                            velocity_tracker.start_new_rep()
                        else:
                            rep_count += 1
                            rep_data.append({
                                "rep": rep_count,
                                "min_elbow_angle": min_elbow_angle,
                                "max_elbow_flare": max_elbow_flare,
                                "depth_rating": get_depth_rating(min_elbow_angle),
                                "velocity_metrics": rep_metrics,
                            })
                            velocity_tracker.start_new_rep()

                image_rgb = add_metric_overlays(image_rgb, metrics)

            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, min_elbow_angle, last_velocity_str)
            if final_image.dtype != np.uint8: final_image = final_image.astype(np.uint8)
            # Write frame to disk (BGR for cv2.VideoWriter)
            if video_writer is not None:
                frame_bgr = cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR) if len(final_image.shape) == 3 else final_image
                video_writer.write(frame_bgr)

    cap.release()
    if video_writer is not None:
        video_writer.release()


    avg_elbow_angle = 0
    feedback_summary = []
    corrections = []

    if rep_data:
        avg_elbow_angle = np.mean([r["min_elbow_angle"] for r in rep_data])
        avg_elbow_flare = np.mean([r["max_elbow_flare"] for r in rep_data])

        if avg_elbow_angle > 100:
            feedback_summary.append("Insufficient Depth")
            corrections.append("Bar is not reaching chest level.")
        elif 80 <= avg_elbow_angle <= 100:
            feedback_summary.append("Good Depth (NSCA Standard)")
            corrections.append("Excellent depth achieved.")
        else:
            feedback_summary.append("Full ROM")
            corrections.append("Great range of motion.")

        if avg_elbow_flare > 75:
            feedback_summary.append("Excessive Elbow Flare")
            corrections.append("Keep elbows at 30-75° from torso.")
        elif avg_elbow_flare < 30:
            feedback_summary.append("Elbows Too Tucked")
            corrections.append("Allow natural 30-75° angle.")
    else:
        feedback_summary.append("No Reps Detected")
        corrections.append("Ensure your full upper body is visible.")

    return {
        "reps_count": rep_count,
        "avg_elbow_angle": int(avg_elbow_angle),
        "feedback": feedback_summary,
        "corrections": corrections,
        "rep_details": rep_data,
        "confidence_stats": confidence_checker.stats,
        "preprocessing_stats": preprocessor.stats,
        "enhancements": ["landmark_stabilization", "adaptive_preprocessing", "confidence_aware", "velocity_validation"],
    }
