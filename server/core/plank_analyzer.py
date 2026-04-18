"""Plank Analyzer - Core stability tracking (Enhanced with CV pipeline)"""
import cv2
import mediapipe as mp
import numpy as np
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

try:
    from core.biomechanics import draw_angle_visualization
    from core.landmark_filter import LandmarkStabilizer
    from core.preprocessing import AdaptivePreprocessor
    from core.confidence import ConfidenceChecker, draw_confidence_warning
except ImportError:
    from biomechanics import draw_angle_visualization
    from landmark_filter import LandmarkStabilizer
    from preprocessing import AdaptivePreprocessor
    from confidence import ConfidenceChecker, draw_confidence_warning


def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    return int(np.degrees(np.arccos(cosine_angle)))

def get_plank_metrics(landmarks, width, height):
    def pixel_coord(idx):
        lm = landmarks[idx]
        return (int(lm.x * width), int(lm.y * height))

    metrics = {}
    try:
        l_shoulder = pixel_coord(11)
        r_shoulder = pixel_coord(12)
        l_hip = pixel_coord(23)
        r_hip = pixel_coord(24)
        l_ankle = pixel_coord(27)
        r_ankle = pixel_coord(28)

        shoulder_mid = ((l_shoulder[0] + r_shoulder[0]) // 2, (l_shoulder[1] + r_shoulder[1]) // 2)
        hip_mid = ((l_hip[0] + r_hip[0]) // 2, (l_hip[1] + r_hip[1]) // 2)
        ankle_mid = ((l_ankle[0] + r_ankle[0]) // 2, (l_ankle[1] + r_ankle[1]) // 2)

        metrics['body_alignment'] = calculate_angle(shoulder_mid, hip_mid, ankle_mid)

        line_vec = np.array(ankle_mid) - np.array(shoulder_mid)
        point_vec = np.array(hip_mid) - np.array(shoulder_mid)
        cross = np.cross(line_vec, point_vec)
        hip_deviation = np.linalg.norm(cross) / (np.linalg.norm(line_vec) + 1e-6)

        expected_y = shoulder_mid[1] + (hip_mid[0] - shoulder_mid[0]) * (ankle_mid[1] - shoulder_mid[1]) / (ankle_mid[0] - shoulder_mid[0] + 1e-6)
        if hip_mid[1] > expected_y:
            metrics['hip_position'] = int(hip_deviation)
        else:
            metrics['hip_position'] = -int(hip_deviation)

        metrics['shoulder_y'] = shoulder_mid[1]
        metrics['hip_y'] = hip_mid[1]
        metrics['ankle_y'] = ankle_mid[1]
    except:
        metrics = {k: None for k in ['body_alignment', 'hip_position', 'shoulder_y', 'hip_y', 'ankle_y']}
    return metrics

def get_form_rating(body_alignment, hip_position):
    if hip_position is None or body_alignment is None:
        return "Unable to detect"

    if 165 <= body_alignment <= 195 and abs(hip_position) < 15:
        return "Perfect Form"
    elif 150 <= body_alignment <= 210 and abs(hip_position) < 25:
        return "Good Form"
    elif hip_position > 25:
        return "Hip Sagging"
    elif hip_position < -25:
        return "Hip Piking"
    else:
        return "Adjust Position"

def add_metric_overlays(image, metrics, elapsed_time):
    y_pos = 40

    cv2.putText(image, f"TIME: {elapsed_time:.1f}s", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 1.0, (0, 255, 255), 2)

    if metrics['body_alignment'] is not None:
        if 165 <= metrics['body_alignment'] <= 195:
            color = (0, 255, 0)
        else:
            color = (0, 165, 255)
        cv2.putText(image, f"Alignment: {metrics['body_alignment']} (Opt: 180)", (20, y_pos + 40), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    if metrics['hip_position'] is not None:
        if abs(metrics['hip_position']) < 15:
            hip_color = (0, 255, 0)
            status = "Neutral"
        elif metrics['hip_position'] > 15:
            hip_color = (0, 0, 255)
            status = "Sagging"
        else:
            hip_color = (255, 165, 0)
            status = "Piking"
        cv2.putText(image, f"Hips: {status} ({metrics['hip_position']}px)", (20, y_pos + 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, hip_color, 2)

    form_rating = get_form_rating(metrics['body_alignment'], metrics['hip_position'])
    rating_color = (0, 255, 0) if "Perfect" in form_rating or "Good" in form_rating else (0, 165, 255)
    cv2.putText(image, f"Form: {form_rating}", (20, y_pos + 100), cv2.FONT_HERSHEY_SIMPLEX, 0.7, rating_color, 2)

    return image

def add_info_panel(image, elapsed_time, avg_alignment, form_rating):
    h, w = image.shape[:2]
    panel_height = 100
    panel = np.zeros((panel_height, w, 3), dtype=np.uint8)
    panel[:, :] = (40, 40, 40)
    image_with_panel = np.vstack([image, panel])
    new_h = h + panel_height

    cv2.putText(image_with_panel, f"Hold Time: {elapsed_time:.1f}s", (20, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    cv2.putText(image_with_panel, f"Avg Alignment: {avg_alignment}", (w//2 - 100, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 1)
    cv2.putText(image_with_panel, f"Form: {form_rating}", (w//2 - 100, new_h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (0, 255, 0), 1)
    cv2.putText(image_with_panel, "Plank Tips:", (w - 250, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 255), 1)
    cv2.putText(image_with_panel, "Keep body straight", (w - 250, new_h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    cv2.putText(image_with_panel, "Engage core", (w - 250, new_h - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    return image_with_panel

def analyze_plank_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}

    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or fps > 120:
        fps = 30.0
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))

    # ===== Enhancement pipeline (no velocity tracker for plank — hold-based exercise) =====
    stabilizer = LandmarkStabilizer(method="one_euro", min_cutoff=1.5, beta=0.01)
    preprocessor = AdaptivePreprocessor()
    confidence_checker = ConfidenceChecker(threshold=0.65)

    # Initialize video writer (stream to disk instead of accumulating in memory)
    video_writer = None
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    alignment_history = []
    hip_position_history = []
    in_plank = False
    plank_start_frame = 0
    total_plank_time = 0

    # Carry-forward state
    last_good_metrics = {k: None for k in ['body_alignment', 'hip_position', 'shoulder_y', 'hip_y', 'ankle_y']}

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

            elapsed_time = (frame_count - plank_start_frame) / fps if in_plank else 0

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
                    metrics = get_plank_metrics(landmarks, width, height)
                    last_good_metrics = metrics.copy()

                if metrics['body_alignment'] is not None:
                    alignment_history.append(metrics['body_alignment'])
                    if metrics['hip_position'] is not None:
                        hip_position_history.append(metrics['hip_position'])

                    if not in_plank and 120 <= metrics['body_alignment'] <= 220:
                        in_plank = True
                        plank_start_frame = frame_count
                    elif in_plank and (metrics['body_alignment'] < 90 or metrics['body_alignment'] > 250):
                        in_plank = False
                        total_plank_time += (frame_count - plank_start_frame) / fps

                # Visual Overlays
                try:
                    def get_coord(idx):
                        return (int(landmarks[idx].x * width), int(landmarks[idx].y * height))

                    l_shoulder = get_coord(11)
                    l_hip = get_coord(23)
                    l_ankle = get_coord(27)

                    if metrics['body_alignment'] is not None:
                        image_rgb = draw_angle_visualization(image_rgb, l_shoulder, l_hip, l_ankle, metrics['body_alignment'])
                except Exception as e:
                    pass

                image_rgb = add_metric_overlays(image_rgb, metrics, elapsed_time)

            avg_alignment = int(np.mean(alignment_history)) if alignment_history else 0
            form_rating = get_form_rating(avg_alignment, np.mean(hip_position_history) if hip_position_history else 0)
            final_image = add_info_panel(image_rgb, elapsed_time, avg_alignment, form_rating)
            # Write frame to disk (BGR for cv2.VideoWriter)
            if video_writer is not None:
                frame_bgr = cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR) if len(final_image.shape) == 3 else final_image
                video_writer.write(frame_bgr)

    cap.release()
    if video_writer is not None:
        video_writer.release()

    if in_plank:
        total_plank_time += (frame_count - plank_start_frame) / fps

    feedback_summary = []
    corrections = []

    avg_alignment = np.mean(alignment_history) if alignment_history else 0
    avg_hip_position = np.mean(hip_position_history) if hip_position_history else 0

    if total_plank_time > 0:
        if 165 <= avg_alignment <= 195 and abs(avg_hip_position) < 15:
            feedback_summary.append("Excellent Plank Form!")
            corrections.append("Great body alignment maintained.")
        elif avg_hip_position > 20:
            feedback_summary.append("Hip Sagging Detected")
            corrections.append("Engage your core to lift hips.")
            corrections.append("Think about pulling belly button to spine.")
        elif avg_hip_position < -20:
            feedback_summary.append("Hip Piking Detected")
            corrections.append("Lower your hips slightly.")
            corrections.append("Maintain a straight line from head to heels.")
        else:
            feedback_summary.append("Good Plank Hold")
            corrections.append("Focus on keeping body in straight line.")

        feedback_summary.append(f"Total Hold Time: {total_plank_time:.1f} seconds")
    else:
        feedback_summary.append("No Plank Detected")
        corrections.append("Ensure you're in a horizontal plank position.")
        corrections.append("Film from the side for best analysis.")

    return {
        "reps_count": 1 if total_plank_time > 0 else 0,
        "avg_depth": int(avg_alignment),
        "hold_time": round(total_plank_time, 1),
        "feedback": feedback_summary,
        "corrections": corrections,
        "rep_details": [{"hold_time": round(total_plank_time, 1), "avg_alignment": int(avg_alignment), "avg_hip_position": int(avg_hip_position)}],
        "confidence_stats": confidence_checker.stats,
        "preprocessing_stats": preprocessor.stats,
        "enhancements": ["landmark_stabilization", "adaptive_preprocessing", "confidence_aware"],
    }
