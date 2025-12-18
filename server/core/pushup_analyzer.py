import cv2
import mediapipe as mp
import numpy as np
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils

def calculate_angle(a, b, c):
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    ba = a - b
    bc = c - b
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    return int(np.degrees(np.arccos(cosine_angle)))

def get_form_rating(elbow_angle, hip_drop):
    if elbow_angle > 120: depth = "Very Shallow"
    elif elbow_angle > 100: depth = "Shallow"
    elif elbow_angle > 80: depth = "Good Depth"
    else: depth = "Excellent Depth"
    
    if hip_drop > 40: alignment = " - Significant Sag"
    elif hip_drop > 20: alignment = " - Mild Sag"
    else: alignment = " - Good Alignment"
    return depth + alignment

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
        
        shoulder_mid = ((l_shoulder[0] + r_shoulder[0]) // 2, (l_shoulder[1] + r_shoulder[1]) // 2)
        hip_mid = ((pixel_coord(23)[0] + pixel_coord(24)[0]) // 2, (pixel_coord(23)[1] + pixel_coord(24)[1]) // 2)
        metrics['shoulder_angle'] = calculate_angle(l_elbow, l_shoulder, hip_mid)
        
        l_ankle = pixel_coord(27)
        r_ankle = pixel_coord(28)
        ankle_mid = ((l_ankle[0] + r_ankle[0]) // 2, (l_ankle[1] + r_ankle[1]) // 2)
        
        line_vec = np.array(ankle_mid) - np.array(shoulder_mid)
        point_vec = np.array(hip_mid) - np.array(shoulder_mid)
        cross = np.cross(line_vec, point_vec)
        distance = np.linalg.norm(cross) / (np.linalg.norm(line_vec) + 1e-6)
        metrics['hip_drop'] = int(distance)
        metrics['torso_angle'] = calculate_angle(shoulder_mid, hip_mid, ankle_mid)
    except:
        metrics = {k: None for k in ['left_elbow', 'right_elbow', 'shoulder_angle', 'hip_drop', 'torso_angle']}
    return metrics

def add_metric_overlays(image, metrics):
    y_pos = 40
    if metrics['left_elbow'] is not None:
        if 80 <= metrics['left_elbow'] <= 100: color = (0, 255, 0)
        elif 100 < metrics['left_elbow'] <= 120: color = (0, 165, 255)
        else: color = (0, 0, 255)
        cv2.putText(image, f"Elbow: {metrics['left_elbow']} (NSCA: 90)", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    if metrics['shoulder_angle'] is not None:
        shoulder_color = (0, 255, 0) if 40 <= metrics['shoulder_angle'] <= 50 else (0, 165, 255)
        cv2.putText(image, f"Shoulder: {metrics['shoulder_angle']} (Opt: 45)", (20, y_pos + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, shoulder_color, 2)
    if metrics['hip_drop'] is not None:
        hip_color = (0, 255, 0) if metrics['hip_drop'] < 20 else (0, 165, 255)
        cv2.putText(image, f"Hip Drop: {metrics['hip_drop']}px", (20, y_pos + 60), cv2.FONT_HERSHEY_SIMPLEX, 0.6, hip_color, 2)
    return image

def add_info_panel(image, frame, total_frames, fps, reps, current_elbow_angle, hip_drop):
    h, w = image.shape[:2]
    panel_height = 100
    panel = np.zeros((panel_height, w, 3), dtype=np.uint8)
    panel[:, :] = (40, 40, 40)
    image_with_panel = np.vstack([image, panel])
    new_h = h + panel_height
    cv2.putText(image_with_panel, f"Frame: {frame}/{total_frames}", (20, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    cv2.putText(image_with_panel, f"Reps: {reps}", (w//2 - 100, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    cv2.putText(image_with_panel, f"Elbow: {current_elbow_angle}", (w//2 - 100, new_h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 1)
    cv2.putText(image_with_panel, "NSCA Standard:", (w - 250, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 255), 1)
    cv2.putText(image_with_panel, " Elbows at 90", (w - 250, new_h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    return image_with_panel

def analyze_pushup_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    output_frames = []
    rep_data = []
    in_pushup = False
    rep_count = 0
    min_elbow_angle = 180
    max_hip_drop = 0
    
    with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7, model_complexity=1) as pose:
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
                metrics = get_key_metrics(landmarks, width, height)
                
                if metrics['left_elbow'] is not None:
                    if not in_pushup and metrics['left_elbow'] < 140:
                        in_pushup = True
                        min_elbow_angle = 180
                        max_hip_drop = 0
                    if in_pushup:
                        if metrics['left_elbow'] < min_elbow_angle:
                            min_elbow_angle = metrics['left_elbow']
                        if metrics['hip_drop'] and metrics['hip_drop'] > max_hip_drop:
                            max_hip_drop = metrics['hip_drop']
                    if in_pushup and metrics['left_elbow'] > 160:
                        in_pushup = False
                        rep_count += 1
                        rep_data.append({"rep": rep_count, "min_elbow_angle": min_elbow_angle, "max_hip_drop": max_hip_drop, "form_rating": get_form_rating(min_elbow_angle, max_hip_drop)})
                
                image_rgb = add_metric_overlays(image_rgb, metrics)
            
            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, min_elbow_angle, max_hip_drop)
            output_frames.append(final_image)
    
    cap.release()
    
    if output_path and output_frames:
        try:
            if "recorded_video" in os.path.basename(video_path):
                fps = len(output_frames) / 10.0
            from moviepy.editor import ImageSequenceClip
            clip = ImageSequenceClip(output_frames, fps=fps)
            clip.write_videofile(output_path, codec='libx264', audio=False, logger=None, preset='ultrafast', threads=4)
        except Exception as e:
            return {"error": str(e)}
    
    avg_depth = 0
    feedback_summary = []
    corrections = []
    
    if rep_data:
        avg_depth = np.mean([r["min_elbow_angle"] for r in rep_data])
        avg_hip_drop = np.mean([r["max_hip_drop"] for r in rep_data])
        
        if avg_depth > 100:
            feedback_summary.append("Insufficient Depth")
            corrections.append("Not reaching 90° elbow angle. Lower your chest further.")
        elif 80 <= avg_depth <= 100:
            feedback_summary.append("Good Depth (NSCA Standard)")
            corrections.append("Hitting proper elbow angle.")
        else:
            feedback_summary.append("Excellent Range of Motion")
        
        if avg_hip_drop > 30:
            feedback_summary.append("Significant Hip Sag")
            corrections.append("Engage core to prevent hips from dropping.")
        elif avg_hip_drop > 15:
            feedback_summary.append("Mild Hip Sag")
            corrections.append("Keep body in a straight line.")
    else:
        feedback_summary.append("No Reps Detected")
        corrections.append("Ensure full extension and side profile view.")
    
    return {"reps_count": rep_count, "avg_depth": int(avg_depth), "feedback": feedback_summary, "corrections": corrections, "rep_details": rep_data}
