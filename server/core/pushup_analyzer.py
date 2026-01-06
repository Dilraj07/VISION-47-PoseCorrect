import cv2
import mediapipe as mp
import numpy as np
import os

mp_pose = mp.solutions.pose
mp_drawing = mp.solutions.drawing_utils
try:
    from core.biomechanics import draw_angle_visualization
except:
    from biomechanics import draw_angle_visualization


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

def draw_neon_text(img, text, pos, font_scale, color, thickness=2):
    # Glow effect (thick line underneath)
    cv2.putText(img, text, pos, cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness + 4, lineType=cv2.LINE_AA)
    # Main text (white or bright color on top)
    # To simulate glow, we usually draw colored thick text then white thin text. 
    # But here we just want sharp text. 
    # Let's stick to simple sharp text for performance, maybe just standard cv2 putText with specific colors.
    cv2.putText(img, text, pos, cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness, lineType=cv2.LINE_AA)

def add_metric_overlays(image, metrics):
    h, w = image.shape[:2]
    # Create a side panel or overlay for metrics
    overlay = image.copy()
    
    # Semi-transparent background for top-left stats
    cv2.rectangle(overlay, (10, 10), (350, 130), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, image, 0.4, 0, image)
    
    y_pos = 40
    # Neon Colors (BGR)
    NEON_GREEN = (57, 255, 20)   # #14FF39
    NEON_BLUE = (255, 243, 0)    # #00F3FF (Cyan)
    NEON_PINK = (147, 20, 255)   # #FF1493
    
    if metrics['left_elbow'] is not None:
        if 80 <= metrics['left_elbow'] <= 100: color = NEON_GREEN
        elif 100 < metrics['left_elbow'] <= 120: color = NEON_BLUE
        else: color = NEON_PINK
        cv2.putText(image, f"Elbow: {metrics['left_elbow']} (Goal: 90)", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)

    if metrics['shoulder_angle'] is not None:
        color = NEON_GREEN if 40 <= metrics['shoulder_angle'] <= 50 else NEON_BLUE
        cv2.putText(image, f"Shoulder: {metrics['shoulder_angle']} (Opt: 45)", (20, y_pos + 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1, cv2.LINE_AA)

    if metrics['hip_drop'] is not None:
        color = NEON_PINK if metrics['hip_drop'] > 20 else NEON_GREEN
        cv2.putText(image, f"Hip Drop: {metrics['hip_drop']}px", (20, y_pos + 70), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1, cv2.LINE_AA)
        
    return image

def add_info_panel(image, frame, total_frames, fps, reps, current_elbow_angle, hip_drop):
    h, w = image.shape[:2]
    
    # HUD Bottom Bar (Overlay instead of append)
    overlay = image.copy()
    cv2.rectangle(overlay, (0, h - 80), (w, h), (0, 0, 0), -1) # Bottom bar background
    cv2.addWeighted(overlay, 0.7, image, 0.3, 0, image)
    
    # Colors
    NEON_GREEN = (57, 255, 20)
    NEON_BLUE = (255, 243, 0)
    WHITE = (255, 255, 255)
    
    # Text Placement
    # Frame Counter
    cv2.putText(image, f"FRAME {frame}/{total_frames}", (20, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1, cv2.LINE_AA)
    
    # Center Rep Counter (Big)
    rep_text = f"REPS: {reps}"
    text_size = cv2.getTextSize(rep_text, cv2.FONT_HERSHEY_SIMPLEX, 1.2, 3)[0]
    center_x = (w - text_size[0]) // 2
    cv2.putText(image, rep_text, (center_x, h - 25), cv2.FONT_HERSHEY_SIMPLEX, 1.2, NEON_BLUE, 3, cv2.LINE_AA)
    
    # Right Side Status
    status_text = "GOOD FORM" if (current_elbow_angle <= 100 and hip_drop < 20) else "ADJUST FORM"
    status_color = NEON_GREEN if status_text == "GOOD FORM" else (147, 20, 255) # Pink
    
    cv2.putText(image, status_text, (w - 200, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2, cv2.LINE_AA)
    
    return image

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
                
                # Visual Overlays
                try:
                    def get_coord(idx):
                        return (int(landmarks[idx].x * width), int(landmarks[idx].y * height))
                    
                    l_shoulder = get_coord(11)
                    l_elbow = get_coord(13)
                    l_wrist = get_coord(15)
                    l_hip = get_coord(23)
                    l_ankle = get_coord(27)
                    
                    # Draw Elbow Angle
                    if metrics['left_elbow']:
                        image_rgb = draw_angle_visualization(image_rgb, l_shoulder, l_elbow, l_wrist, metrics['left_elbow'])
                    
                    # Draw Torso Line/Angle
                    # Use landmarks directly or the calculated midpoints if preferred. 
                    # The metric uses midpoints, let's stick to left side for simplicity or calc midpoints
                    # The image shows side view, so left side is fine.
                    if metrics['torso_angle']:
                         image_rgb = draw_angle_visualization(image_rgb, l_shoulder, l_hip, l_ankle, metrics['torso_angle'])
                         
                except Exception as e:
                    print(f"Overlay error: {e}")

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
