"""Shoulder Press Analyzer - NEW"""
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

def get_key_metrics(landmarks, width, height):
    def pixel_coord(idx):
        lm = landmarks[idx]
        return (int(lm.x * width), int(lm.y * height))
    
    metrics = {}
    try:
        # Shoulder-elbow-wrist angles for arm extension
        l_shoulder = pixel_coord(11)
        l_elbow = pixel_coord(13)
        l_wrist = pixel_coord(15)
        metrics['left_elbow'] = calculate_angle(l_shoulder, l_elbow, l_wrist)
        
        r_shoulder = pixel_coord(12)
        r_elbow = pixel_coord(14)
        r_wrist = pixel_coord(16)
        metrics['right_elbow'] = calculate_angle(r_shoulder, r_elbow, r_wrist)
        
        # Shoulder angle (hip-shoulder-elbow) for overhead position
        l_hip = pixel_coord(23)
        r_hip = pixel_coord(24)
        metrics['left_shoulder_angle'] = calculate_angle(l_hip, l_shoulder, l_elbow)
        metrics['right_shoulder_angle'] = calculate_angle(r_hip, r_shoulder, r_elbow)
        
        # Wrist positions for tracking bar path
        metrics['left_wrist_y'] = l_wrist[1]
        metrics['right_wrist_y'] = r_wrist[1]
        metrics['shoulder_y'] = (l_shoulder[1] + r_shoulder[1]) // 2
        
    except:
        metrics = {k: None for k in ['left_elbow', 'right_elbow', 'left_shoulder_angle', 'right_shoulder_angle', 'left_wrist_y', 'right_wrist_y', 'shoulder_y']}
    return metrics

def get_form_rating(elbow_angle, shoulder_angle):
    if elbow_angle > 160:
        return "Full Lockout"
    elif elbow_angle > 120:
        return "Partial Extension"
    elif elbow_angle > 90:
        return "Good Start Position"
    else:
        return "Too Low"

def add_metric_overlays(image, metrics):
    y_pos = 40
    if metrics['left_elbow'] is not None:
        # Full extension is ~170-180 degrees
        if 160 <= metrics['left_elbow'] <= 180:
            color = (0, 255, 0)  # Green - full lockout
        elif 120 <= metrics['left_elbow'] < 160:
            color = (0, 200, 255)  # Yellow - partial
        else:
            color = (255, 200, 0)  # Orange - starting position
        cv2.putText(image, f"Elbow: {metrics['left_elbow']} (Lockout: 170+)", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2)
    
    if metrics['left_shoulder_angle'] is not None:
        # Ideal overhead is ~170-180 degrees
        shoulder_color = (0, 255, 0) if metrics['left_shoulder_angle'] > 150 else (0, 165, 255)
        cv2.putText(image, f"Shoulder: {metrics['left_shoulder_angle']} (Overhead: 170+)", (20, y_pos + 30), cv2.FONT_HERSHEY_SIMPLEX, 0.6, shoulder_color, 2)
    return image

def add_info_panel(image, frame, total_frames, fps, reps, current_elbow_angle):
    h, w = image.shape[:2]
    panel_height = 100
    panel = np.zeros((panel_height, w, 3), dtype=np.uint8)
    panel[:, :] = (40, 40, 40)
    image_with_panel = np.vstack([image, panel])
    new_h = h + panel_height
    
    cv2.putText(image_with_panel, f"Frame: {frame}/{total_frames}", (20, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 255, 255), 1)
    cv2.putText(image_with_panel, f"Reps: {reps}", (w//2 - 100, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 255, 255), 2)
    cv2.putText(image_with_panel, f"Elbow: {current_elbow_angle}", (w//2 - 100, new_h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.6, (255, 200, 0), 1)
    cv2.putText(image_with_panel, "Shoulder Press:", (w - 280, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 255), 1)
    cv2.putText(image_with_panel, "Full lockout overhead", (w - 280, new_h - 50), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    cv2.putText(image_with_panel, "Control the descent", (w - 280, new_h - 35), cv2.FONT_HERSHEY_SIMPLEX, 0.4, (150, 255, 150), 1)
    return image_with_panel

def analyze_shoulder_press_video(video_path, output_path=None):
    if not os.path.exists(video_path): return {"error": "Video not found"}
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened(): return {"error": "Cannot open video"}
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    output_frames = []
    rep_data = []
    in_press = False
    rep_count = 0
    max_elbow_angle = 0  # Track max extension
    max_shoulder_angle = 0
    
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
                
                # Use average of both arms
                current_elbow = metrics.get('left_elbow')
                current_shoulder = metrics.get('left_shoulder_angle')
                
                if current_elbow is not None:
                    # Detect start of press (arms at shoulder level, elbow bent)
                    if not in_press and current_elbow < 120:
                        in_press = True
                        max_elbow_angle = 0
                        max_shoulder_angle = 0
                    
                    if in_press:
                        if current_elbow > max_elbow_angle:
                            max_elbow_angle = current_elbow
                        if current_shoulder and current_shoulder > max_shoulder_angle:
                            max_shoulder_angle = current_shoulder
                    
                    # Detect rep completion (full lockout then back down)
                    if in_press and max_elbow_angle > 150 and current_elbow < 120:
                        in_press = False
                        rep_count += 1
                        rep_data.append({
                            "rep": rep_count,
                            "max_elbow_angle": max_elbow_angle,
                            "max_shoulder_angle": max_shoulder_angle,
                            "form_rating": get_form_rating(max_elbow_angle, max_shoulder_angle)
                        })
                
                image_rgb = add_metric_overlays(image_rgb, metrics)
            
            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, max_elbow_angle)
            output_frames.append(final_image)
    
    cap.release()
    
    if output_path and output_frames:
        try:
            if "recorded_video" in os.path.basename(video_path): fps = len(output_frames) / 10.0
            if fps <= 0 or fps > 120: fps = 30.0
            from moviepy.editor import ImageSequenceClip
            clip = ImageSequenceClip(output_frames, fps=fps)
            clip.write_videofile(output_path, codec='libx264', audio=False, logger=None, preset='ultrafast', threads=4)
        except Exception as e:
            return {"error": str(e)}
    
    feedback_summary = []
    corrections = []
    
    if rep_data:
        avg_extension = np.mean([r["max_elbow_angle"] for r in rep_data])
        
        if avg_extension < 150:
            feedback_summary.append("Incomplete Lockout")
            corrections.append("Fully extend arms overhead.")
            corrections.append("Drive through the full range of motion.")
        elif 150 <= avg_extension < 170:
            feedback_summary.append("Good Extension")
            corrections.append("Try to achieve full lockout (170+°).")
        else:
            feedback_summary.append("Excellent Form")
            corrections.append("Great full lockout overhead!")
            corrections.append("Keep core engaged throughout.")
    else:
        feedback_summary.append("No Reps Detected")
        corrections.append("Ensure full body is visible in frame.")
        corrections.append("Film from front or side view.")
    
    return {
        "reps_count": rep_count,
        "avg_depth": int(np.mean([r["max_elbow_angle"] for r in rep_data])) if rep_data else 0,
        "feedback": feedback_summary,
        "corrections": corrections,
        "rep_details": rep_data
    }
