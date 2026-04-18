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


def analyze_bicep_curl_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = cap.get(cv2.CAP_PROP_FPS)
    if not fps or fps <= 0 or fps > 120:
        fps = 30.0
    fps = int(fps) or 30

    # ===== Enhancement pipeline =====
    stabilizer = LandmarkStabilizer(method="one_euro", min_cutoff=1.5, beta=0.01)
    preprocessor = AdaptivePreprocessor()
    confidence_checker = ConfidenceChecker(threshold=0.65)
    velocity_tracker = VelocityTracker(fps=fps, min_displacement=25.0, min_velocity_threshold=15.0)

    # Initialize video writer (stream to disk instead of accumulating in memory)
    video_writer = None
    if output_path:
        fourcc = cv2.VideoWriter_fourcc(*'mp4v')
        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    reps = 0
    state = "down"
    rep_data = []
    min_angle = 180
    last_velocity_str = "--"

    # Carry-forward state
    last_good_angle = 180

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5) as pose:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            frame_count += 1

            # ===== Adaptive preprocessing =====
            frame = preprocessor.enhance(frame)

            image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image)
            current_feedback = "Good Form"

            if results.pose_landmarks:
                # ===== Landmark stabilization =====
                landmarks_list = stabilizer.smooth(results.pose_landmarks.landmark, fps)

                # ===== Confidence check =====
                frame_confidence = confidence_checker.evaluate(landmarks_list)

                if not frame_confidence.is_reliable:
                    image = draw_confidence_warning(image, frame_confidence)
                    angle = last_good_angle
                else:
                    landmarks = results.pose_landmarks.landmark

                    left_vis = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].visibility
                    right_vis = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].visibility
                    side_prefix = "LEFT" if left_vis > right_vis else "RIGHT"

                    shoulder = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_SHOULDER"), width, height)
                    elbow = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_ELBOW"), width, height)
                    wrist = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_WRIST"), width, height)

                    angle = calculate_angle(shoulder, elbow, wrist)
                    last_good_angle = angle

                # ===== Velocity tracking =====
                vel_data = velocity_tracker.update(angle)
                last_velocity_str = str(vel_data["smoothed_velocity"])

                if angle > 160:
                    if state == "up":
                        # ===== Velocity-based rep validation =====
                        rep_metrics = velocity_tracker.get_rep_metrics()
                        is_valid = velocity_tracker.is_valid_rep(min_displacement=25.0)

                        if is_valid:
                            rep_data.append({
                                "rep": reps,
                                "min_angle": min_angle,
                                "velocity_metrics": rep_metrics,
                            })
                        velocity_tracker.start_new_rep()
                    state = "down"
                    min_angle = 180

                if angle < 40 and state == "down":
                    reps += 1
                    state = "up"
                    velocity_tracker.start_new_rep()

                if state == "up" and angle < min_angle:
                    min_angle = angle

                cv2.putText(image, f"Reps: {reps}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
                cv2.putText(image, f"Angle: {int(angle)}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                cv2.putText(image, current_feedback, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
                if last_velocity_str != "--":
                    cv2.putText(image, f"Vel: {last_velocity_str} d/s", (50, 240), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (200, 200, 200), 1)
                mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

            # Write frame to disk (BGR for cv2.VideoWriter)
        if video_writer is not None:
            frame_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) if len(image.shape) == 3 else image
            video_writer.write(frame_bgr)

    cap.release()
    if video_writer is not None:
        video_writer.release()


    feedback = []
    corrections = []

    if rep_data and reps > 0:
        avg_contraction = np.mean([r["min_angle"] for r in rep_data if r["min_angle"] < 180])
        if avg_contraction > 50:
            feedback.append("Incomplete Contraction")
            corrections.append("Curl higher for full bicep contraction.")
        else:
            feedback.append("Full Range of Motion")
            corrections.append("Great contraction at top!")
    else:
        feedback.append("No Reps Detected")
        corrections.append("Try to extend arm fully between reps.")

    return {
        "reps_count": reps,
        "avg_depth": int(np.mean([r["min_angle"] for r in rep_data])) if rep_data and reps > 0 else 0,
        "feedback": feedback,
        "corrections": corrections,
        "rep_details": rep_data,
        "confidence_stats": confidence_checker.stats,
        "preprocessing_stats": preprocessor.stats,
        "enhancements": ["landmark_stabilization", "adaptive_preprocessing", "confidence_aware", "velocity_validation"],
    }
