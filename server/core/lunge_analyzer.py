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


def analyze_lunge_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30

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

    reps = 0
    state = "up"
    rep_data = []
    min_angle = 180
    last_velocity_str = "--"

    # Carry-forward state
    last_good_angle = 180
    last_good_side = "Left"

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
            current_feedback = "Good"

            if results.pose_landmarks:
                # ===== Landmark stabilization =====
                landmarks_list = stabilizer.smooth(results.pose_landmarks.landmark, fps)

                # ===== Confidence check =====
                frame_confidence = confidence_checker.evaluate(landmarks_list)

                if not frame_confidence.is_reliable:
                    image = draw_confidence_warning(image, frame_confidence)
                    angle = last_good_angle
                    side = last_good_side
                else:
                    landmarks = results.pose_landmarks.landmark

                    l_hip = get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP, width, height)
                    l_knee = get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_KNEE, width, height)
                    l_ankle = get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE, width, height)

                    r_hip = get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_HIP, width, height)
                    r_knee = get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE, width, height)
                    r_ankle = get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE, width, height)

                    angle_l = calculate_angle(l_hip, l_knee, l_ankle)
                    angle_r = calculate_angle(r_hip, r_knee, r_ankle)

                    angle = angle_l if angle_l < angle_r else angle_r
                    side = "Left" if angle_l < angle_r else "Right"
                    last_good_angle = angle
                    last_good_side = side

                # ===== Velocity tracking =====
                vel_data = velocity_tracker.update(angle)
                last_velocity_str = str(vel_data["smoothed_velocity"])

                if angle > 160:
                    if state == "down":
                        # ===== Velocity-based rep validation =====
                        rep_metrics = velocity_tracker.get_rep_metrics()
                        is_valid = velocity_tracker.is_valid_rep(min_displacement=30.0)

                        if is_valid:
                            reps += 1
                            rep_data.append({
                                "rep": reps,
                                "min_angle": min_angle,
                                "side": side,
                                "velocity_metrics": rep_metrics,
                            })
                        velocity_tracker.start_new_rep()
                        min_angle = 180
                    state = "up"

                if angle < 100:
                    state = "down"
                    if angle < min_angle:
                        min_angle = angle

                if state == "down" and angle < 70:
                    current_feedback = "Too low!"
                elif state == "down" and angle > 110:
                    current_feedback = "Go lower"

                cv2.putText(image, f"Reps: {reps}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
                cv2.putText(image, f"{side} Knee: {int(angle)}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
                cv2.putText(image, current_feedback, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if current_feedback == "Good" else (0, 0, 255), 2)
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

    if rep_data:
        avg_depth = np.mean([r["min_angle"] for r in rep_data])
        if avg_depth > 100:
            feedback.append("Insufficient Depth")
            corrections.append("Go lower - aim for 90° knee angle.")
        elif 80 <= avg_depth <= 100:
            feedback.append("Good Depth")
            corrections.append("Great form! Keep chest up.")
        else:
            feedback.append("Excellent Range")
            corrections.append("Watch knee doesn't pass toes.")
    else:
        feedback.append("No Reps Detected")
        corrections.append("Ensure full body is visible.")

    return {
        "reps_count": reps,
        "avg_depth": int(np.mean([r["min_angle"] for r in rep_data])) if rep_data else 0,
        "feedback": feedback,
        "corrections": corrections,
        "rep_details": rep_data,
        "confidence_stats": confidence_checker.stats,
        "preprocessing_stats": preprocessor.stats,
        "enhancements": ["landmark_stabilization", "adaptive_preprocessing", "confidence_aware", "velocity_validation"],
    }
