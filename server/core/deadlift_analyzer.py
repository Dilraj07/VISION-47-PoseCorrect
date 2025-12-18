import cv2
import mediapipe as mp
import numpy as np
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

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

def add_info_panel(image, frame, total_frames, fps, reps, phase, warnings, width, height):
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
    
    output_frames = []
    rep_data = []
    current_rep = {"frames": [], "back_angles": [], "knee_angles": [], "start_frame": 0}
    lift_phase = "setup"
    in_lift = False
    rep_count = 0
    warning_flags = []
    
    with mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5, model_complexity=1) as pose:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret: break
            frame_count += 1
            
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)
            
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(image_rgb, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2))
                
                landmarks = results.pose_landmarks.landmark
                angles = get_deadlift_angles(landmarks, width, height)
                current_knee_angle = angles.get('left_knee') or angles.get('right_knee')
                
                if current_knee_angle is not None:
                    lift_phase = detect_lift_phase(current_knee_angle, lift_phase)
                    
                    if not in_lift and current_knee_angle < 140 and frame_count > 10:
                        in_lift = True
                        current_rep = {"frames": [], "back_angles": [], "knee_angles": [], "start_frame": frame_count}
                    
                    if in_lift:
                        current_rep["frames"].append(frame_count)
                        if angles.get('back_angle'): current_rep["back_angles"].append(angles['back_angle'])
                        current_rep["knee_angles"].append(current_knee_angle)
                    
                    if in_lift and current_knee_angle > 170 and frame_count - current_rep["start_frame"] > 10:
                        in_lift = False
                        rep_count += 1
                        if current_rep["knee_angles"]:
                            warnings = []
                            if current_rep["back_angles"]:
                                start_back = current_rep["back_angles"][0]
                                if start_back > 55: warnings.append(f"Back too horizontal at start ({start_back}°)")
                                elif start_back < 35: warnings.append(f"Back too vertical at start ({start_back}°)")
                            rep_data.append({"rep": rep_count, "warnings": warnings, "frames": len(current_rep["frames"])})
                            warning_flags.extend(warnings)
                
                image_rgb = add_deadlift_overlays(image_rgb, angles, lift_phase, rep_count, width, height)
            
            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, lift_phase, warning_flags, width, height)
            output_frames.append(final_image)
    
    cap.release()
    
    if output_path and output_frames:
        try:
            if "recorded_video" in os.path.basename(video_path): fps = len(output_frames) / 10.0
            from moviepy.editor import ImageSequenceClip
            clip = ImageSequenceClip(output_frames, fps=fps)
            clip.write_videofile(output_path, codec='libx264', audio=False, logger=None, preset='ultrafast', threads=4)
        except Exception as e:
            return {"error": str(e)}
    
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
    
    return {"reps_count": rep_count, "avg_depth": 0, "feedback": feedback, "corrections": corrections, "rep_details": rep_data}
