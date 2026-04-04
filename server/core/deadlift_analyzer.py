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
    try:
        a = np.array(a)
        b = np.array(b)
        c = np.array(c)
        ba = a - b
        bc = c - b
        cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
        cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
        return int(np.degrees(np.arccos(cosine_angle)))
    except:
        return None

def get_deadlift_angles(landmarks, width, height):
    angles = {}
    try:
        def pixel_coord(idx):
            lm = landmarks[idx]
            return (int(lm.x * width), int(lm.y * height))

        l_shoulder = pixel_coord(11)
        r_shoulder = pixel_coord(12)
        l_hip = pixel_coord(23)
        r_hip = pixel_coord(24)
        l_knee = pixel_coord(25)
        r_knee = pixel_coord(26)
        l_ankle = pixel_coord(27)
        r_ankle = pixel_coord(28)

        shoulder_mid = ((l_shoulder[0] + r_shoulder[0]) // 2, (l_shoulder[1] + r_shoulder[1]) // 2)
        hip_mid = ((l_hip[0] + r_hip[0]) // 2, (l_hip[1] + r_hip[1]) // 2)

        vertical_point = (hip_mid[0], hip_mid[1] - 100)
        angles['back_angle'] = calculate_angle(vertical_point, hip_mid, shoulder_mid)
        angles['left_knee'] = calculate_angle(l_hip, l_knee, l_ankle)
        angles['right_knee'] = calculate_angle(r_hip, r_knee, r_ankle)
        angles['hip_angle'] = calculate_angle(shoulder_mid, hip_mid, l_knee)
    except:
        angles = {'back_angle': None, 'left_knee': None, 'right_knee': None, 'hip_angle': None}
    return angles

def detect_lift_phase(knee_angle, current_phase):
    if knee_angle is None: return current_phase
    if knee_angle > 170: return "lockout"
    elif knee_angle < 100: return "setup"
    elif 100 <= knee_angle <= 140: return "pull"
    else: return "lower"

def add_deadlift_overlays(image, angles, phase, rep_count, width, height):
    h, w = image.shape[:2]
    y_pos = 40

    back_angle = angles.get('back_angle')
    if back_angle is not None:
        if 40 <= back_angle <= 50: color = (0, 255, 0)
        elif 35 <= back_angle < 40 or 50 < back_angle <= 55: color = (0, 165, 255)
        else: color = (0, 0, 255)
        cv2.putText(image, f"Back: {back_angle} (NSCA: 40-50)", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)

    knee_angle = angles.get('left_knee') or angles.get('right_knee')
    if knee_angle is not None:
        knee_color = (0, 255, 0) if knee_angle > 170 else (0, 165, 255)
        cv2.putText(image, f"Knee: {knee_angle}", (20, y_pos + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, knee_color, 2)

    phase_color = {"setup": (255, 255, 0), "pull": (0, 255, 255), "lockout": (0, 255, 0), "lower": (255, 165, 0)}.get(phase, (255, 255, 255))
    cv2.putText(image, f"Phase: {phase.upper()}", (w - 150, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, phase_color, 2)
    cv2.putText(image, f"Reps: {rep_count}", (w - 150, y_pos + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)
    return image

def add_info_panel(image, frame, total_frames, fps, reps, phase, warnings, width, height, velocity_str="--"):
    h, w = image.shape[:2]
    panel_height = 100
    panel = np.zeros((panel_height, w, 3), dtype=np.uint8)
    panel[:, :] = (40, 40, 40)
    image_with_panel = np.vstack([image, panel])
    new_h = h + panel_height

    cv2.putText(image_with_panel, f"Frame: {frame}/{total_frames}", (20, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    phase_color = {"setup": (255, 255, 0), "pull": (0, 255, 255), "lockout": (0, 255, 0), "lower": (255, 165, 0)}.get(phase, (255, 255, 255))
    cv2.putText(image_with_panel, f"Phase: {phase.upper()}", (w//2 - 100, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.7, phase_color, 2)
    cv2.putText(image_with_panel, f"Reps: {reps}", (w//2 - 100, new_h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.7, (0, 255, 255), 2)

    if velocity_str != "--":
        cv2.putText(image_with_panel, f"Vel: {velocity_str} d/s", (w - 250, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 200), 1)

    if warnings:
        last_warning = warnings[-1] if isinstance(warnings[-1], str) else str(warnings[-1])
        if len(last_warning) > 40: last_warning = last_warning[:37] + "..."
        cv2.putText(image_with_panel, f"Last: {last_warning}", (20, new_h - 20), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (0, 0, 255), 1)
    return image_with_panel

def analyze_deadlift_video(video_path, output_path=None):
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
    current_rep = {"frames": [], "back_angles": [], "knee_angles": [], "start_frame": 0}
    lift_phase = "setup"
    in_lift = False
    rep_count = 0
    warning_flags = []
    last_velocity_str = "--"

    # Carry-forward state
    last_good_angles = {'back_angle': None, 'left_knee': None, 'right_knee': None, 'hip_angle': None}

    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=1) as pose:
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
                    angles = last_good_angles
                else:
                    angles = get_deadlift_angles(landmarks, width, height)
                    last_good_angles = angles.copy()

                current_knee_angle = angles.get('left_knee') or angles.get('right_knee')

                if current_knee_angle is not None:
                    # ===== Velocity tracking =====
                    vel_data = velocity_tracker.update(current_knee_angle)
                    last_velocity_str = str(vel_data["smoothed_velocity"])

                    lift_phase = detect_lift_phase(current_knee_angle, lift_phase)

                    if not in_lift and current_knee_angle < 140 and frame_count > 10:
                        in_lift = True
                        current_rep = {"frames": [], "back_angles": [], "knee_angles": [], "start_frame": frame_count}
                        velocity_tracker.start_new_rep()

                    if in_lift:
                        current_rep["frames"].append(frame_count)
                        if angles.get('back_angle'): current_rep["back_angles"].append(angles['back_angle'])
                        current_rep["knee_angles"].append(current_knee_angle)

                    if in_lift and current_knee_angle > 170 and frame_count - current_rep["start_frame"] > 10:
                        in_lift = False

                        # ===== Velocity-based rep validation =====
                        rep_metrics = velocity_tracker.get_rep_metrics()
                        is_valid = velocity_tracker.is_valid_rep(min_displacement=30.0)

                        if not is_valid:
                            velocity_tracker.start_new_rep()
                        else:
                            rep_count += 1
                            if current_rep["knee_angles"]:
                                warnings = []
                                if current_rep["back_angles"]:
                                    start_back = current_rep["back_angles"][0]
                                    if start_back > 55: warnings.append(f"Back too horizontal at start ({start_back}°)")
                                    elif start_back < 35: warnings.append(f"Back too vertical at start ({start_back}°)")
                                rep_data.append({
                                    "rep": rep_count,
                                    "warnings": warnings,
                                    "frames": len(current_rep["frames"]),
                                    "velocity_metrics": rep_metrics,
                                })
                                warning_flags.extend(warnings)
                            velocity_tracker.start_new_rep()

                image_rgb = add_deadlift_overlays(image_rgb, angles, lift_phase, rep_count, width, height)

            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, lift_phase, warning_flags, width, height, last_velocity_str)
            # Write frame to disk (BGR for cv2.VideoWriter)
            if video_writer is not None:
                frame_bgr = cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR) if len(final_image.shape) == 3 else final_image
                video_writer.write(frame_bgr)

    cap.release()
    if video_writer is not None:
        video_writer.release()


    feedback = []
    corrections = []
    all_warnings = []
    for rep in rep_data:
        all_warnings.extend(rep.get("warnings", []))

    unique_warnings = list(set(all_warnings))
    if unique_warnings:
        feedback.append("Form Issues Detected")
        corrections.extend(unique_warnings)
        if any("Back" in w for w in unique_warnings):
            corrections.append("Keep spine neutral to avoid injury.")
    else:
        if rep_count > 0:
            feedback.append("Excellent Deadlift Form")
            corrections.append("Great neutral spine and full lockout.")
        else:
            feedback.append("No Reps Detected")
            corrections.append("Ensure you perform the full movement.")

    return {
        "reps_count": rep_count,
        "avg_depth": 0,
        "feedback": feedback,
        "corrections": corrections,
        "rep_details": rep_data,
        "confidence_stats": confidence_checker.stats,
        "preprocessing_stats": preprocessor.stats,
        "enhancements": ["landmark_stabilization", "adaptive_preprocessing", "confidence_aware", "velocity_validation"],
    }
