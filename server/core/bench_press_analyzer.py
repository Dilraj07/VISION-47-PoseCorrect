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
    cv2.putText(image_with_panel, "NSCA Standard:", (w - 280, new_h - 70), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (200, 200, 255), 1)
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
    
    output_frames = []
    rep_data = []
    in_press = False
    rep_count = 0
    min_elbow_angle = 180
    max_elbow_flare = 0
    
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
                    if not in_press and current_angle > 150:
                        in_press = True
                        min_elbow_angle = 180
                        max_elbow_flare = 0
                    if in_press:
                        if current_angle < min_elbow_angle: min_elbow_angle = current_angle
                        if current_flare and current_flare > max_elbow_flare: max_elbow_flare = current_flare
                    if in_press and current_angle > 150 and min_elbow_angle < 135:
                        in_press = False
                        rep_count += 1
                        rep_data.append({"rep": rep_count, "min_elbow_angle": min_elbow_angle, "max_elbow_flare": max_elbow_flare, "depth_rating": get_depth_rating(min_elbow_angle)})
                
                image_rgb = add_metric_overlays(image_rgb, metrics)
            
            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, min_elbow_angle)
            if final_image.dtype != np.uint8: final_image = final_image.astype(np.uint8)
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
            print(f"Error writing video: {e}")
    
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
    
    return {"reps_count": rep_count, "avg_elbow_angle": int(avg_elbow_angle), "feedback": feedback_summary, "corrections": corrections, "rep_details": rep_data}
