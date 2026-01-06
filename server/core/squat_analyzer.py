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

def get_depth_rating(knee_angle):
    if knee_angle > 120: return "Very Shallow"
    elif knee_angle > 100: return "Shallow"
    elif knee_angle > 85: return "Good (Parallel)"
    elif knee_angle > 70: return "Excellent"
    else: return "Very Deep"

def get_key_angles(landmarks, width, height):
    def pixel_coord(idx):
        lm = landmarks[idx]
        return (int(lm.x * width), int(lm.y * height))
    
    angles = {}
    try:
        l_hip = pixel_coord(23)
        l_knee = pixel_coord(25)
        l_ankle = pixel_coord(27)
        angles['left_knee'] = calculate_angle(l_hip, l_knee, l_ankle)
        
        r_hip = pixel_coord(24)
        r_knee = pixel_coord(26)
        r_ankle = pixel_coord(28)
        angles['right_knee'] = calculate_angle(r_hip, r_knee, r_ankle)
        
        l_shoulder = pixel_coord(11)
        r_shoulder = pixel_coord(12)
        shoulder_mid = ((l_shoulder[0] + r_shoulder[0]) // 2, (l_shoulder[1] + r_shoulder[1]) // 2)
        hip_mid = ((l_hip[0] + r_hip[0]) // 2, (l_hip[1] + r_hip[1]) // 2)
        vertical_point = (hip_mid[0], hip_mid[1] - 100)
        angles['torso'] = calculate_angle(vertical_point, hip_mid, shoulder_mid)
        angles['left_hip'] = calculate_angle(l_shoulder, l_hip, l_knee)
        angles['right_hip'] = calculate_angle(r_shoulder, r_hip, r_knee)
    except:
        angles = {k: None for k in ['left_knee', 'right_knee', 'torso', 'left_hip', 'right_hip']}
    return angles

def draw_neon_text(img, text, pos, font_scale, color, thickness=2):
    cv2.putText(img, text, pos, cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness + 4, lineType=cv2.LINE_AA)
    cv2.putText(img, text, pos, cv2.FONT_HERSHEY_SIMPLEX, font_scale, color, thickness, lineType=cv2.LINE_AA)

def add_angle_overlays(image, angles):
    h, w = image.shape[:2]
    overlay = image.copy()
    
    # Semi-transparent background for top-left stats
    cv2.rectangle(overlay, (10, 10), (350, 100), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.6, image, 0.4, 0, image)

    y_pos = 40
    # Neon Colors (BGR)
    NEON_GREEN = (57, 255, 20)
    NEON_BLUE = (255, 243, 0)
    NEON_PINK = (147, 20, 255)

    if angles['left_knee'] is not None:
        if 80 <= angles['left_knee'] <= 100: color = NEON_GREEN
        elif 100 < angles['left_knee'] <= 120: color = NEON_BLUE
        else: color = NEON_PINK
        cv2.putText(image, f"Knee: {angles['left_knee']} (Goal: 90)", (20, y_pos), cv2.FONT_HERSHEY_SIMPLEX, 0.7, color, 2, cv2.LINE_AA)
        
    if angles['torso'] is not None:
        color = NEON_GREEN if 40 <= angles['torso'] <= 50 else NEON_BLUE
        cv2.putText(image, f"Torso: {angles['torso']} (Opt: 45)", (20, y_pos + 35), cv2.FONT_HERSHEY_SIMPLEX, 0.6, color, 1, cv2.LINE_AA)
    return image

def add_info_panel(image, frame, total_frames, fps, reps, current_knee_angle, last_vel="Ready", last_vel_val="--"):
    h, w = image.shape[:2]
    
    # HUD Bottom Bar (Overlay)
    overlay = image.copy()
    cv2.rectangle(overlay, (0, h - 80), (w, h), (0, 0, 0), -1)
    cv2.addWeighted(overlay, 0.7, image, 0.3, 0, image)
    
    NEON_GREEN = (57, 255, 20)
    NEON_BLUE = (255, 243, 0)
    
    # Frame Counter
    cv2.putText(image, f"FRAME {frame}/{total_frames}", (20, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150, 150, 150), 1, cv2.LINE_AA)
    
    # Center Rep Counter
    rep_text = f"REPS: {reps}"
    text_size = cv2.getTextSize(rep_text, cv2.FONT_HERSHEY_SIMPLEX, 1.2, 3)[0]
    center_x = (w - text_size[0]) // 2
    cv2.putText(image, rep_text, (center_x, h - 25), cv2.FONT_HERSHEY_SIMPLEX, 1.2, NEON_BLUE, 3, cv2.LINE_AA)
    
    # Velocity (Left Side)
    # cv2.putText(image, "VELOCITY", (center_x - 200, h - 45), cv2.FONT_HERSHEY_SIMPLEX, 0.5, (150,150,150), 1, cv2.LINE_AA)
    cv2.putText(image, f"{last_vel}", (center_x - 250, h - 25), cv2.FONT_HERSHEY_SIMPLEX, 0.7, NEON_GREEN, 2, cv2.LINE_AA)
    
    # Right Side Status
    status_text = "GOOD DEPTH" if current_knee_angle <= 100 else "GO LOWER"
    status_color = NEON_GREEN if status_text == "GOOD DEPTH" else (147, 20, 255) # Pink
    
    cv2.putText(image, status_text, (w - 200, h - 30), cv2.FONT_HERSHEY_SIMPLEX, 0.7, status_color, 2, cv2.LINE_AA)
    
    return image

def analyze_squat_video(video_path, output_path=None):
    if not os.path.exists(video_path):
        return {"error": "Video not found"}
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        return {"error": "Cannot open video"}
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    
    output_frames = []
    rep_data = []
    in_squat = False
    rep_count = 0
    min_knee_angle = 180
    
    with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7, model_complexity=1) as pose:
        frame_count = 0
        while cap.isOpened():
            ret, frame = cap.read()
            if not ret:
                break
            frame_count += 1
            
            image_rgb = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
            results = pose.process(image_rgb)
            current_angle_val = 0
            
            if results.pose_landmarks:
                mp_drawing.draw_landmarks(
                    image_rgb, results.pose_landmarks, mp_pose.POSE_CONNECTIONS,
                    landmark_drawing_spec=mp_drawing.DrawingSpec(color=(0, 255, 0), thickness=2, circle_radius=2),
                    connection_drawing_spec=mp_drawing.DrawingSpec(color=(255, 255, 255), thickness=2)
                )
                landmarks = results.pose_landmarks.landmark
                angles = get_key_angles(landmarks, width, height)
                
                if angles['left_knee'] is not None:
                    current_angle_val = angles['left_knee']
                    
                    # State Machine & Velocity Tracking
                    if not in_squat and angles['left_knee'] < 160: # Threshold to start descent
                        in_squat = True
                        min_knee_angle = 180
                        bottom_frame = frame_count
                        # Get hip height (average of left/right hip Y coordinate)
                        try:
                            l_hip_y = landmarks[23].y * height
                            r_hip_y = landmarks[24].y * height
                            bottom_hip_y = (l_hip_y + r_hip_y) / 2
                        except:
                            bottom_hip_y = 0
                            
                    if in_squat:
                        # Track bottom of squat
                        if angles['left_knee'] < min_knee_angle:
                            min_knee_angle = angles['left_knee']
                            bottom_frame = frame_count
                            try:
                                l_hip_y = landmarks[23].y * height
                                r_hip_y = landmarks[24].y * height
                                bottom_hip_y = (l_hip_y + r_hip_y) / 2
                            except:
                                pass
                                
                    # Rep Completion (Ascent finished)
                    if in_squat and angles['left_knee'] > 165:
                        in_squat = False
                        
                        # Calculate Velocity
                        concentric_frames = frame_count - bottom_frame
                        if concentric_frames < 1: concentric_frames = 1
                        concentric_time = concentric_frames / fps
                        
                        try:
                            current_hip_y = (landmarks[23].y * height + landmarks[24].y * height) / 2
                            # Moving UP means Y decreases. Displacement = Bottom_Y - Constant_Top_Y? 
                            # Actually just verify we moved up. 
                            displacement_px = bottom_hip_y - current_hip_y
                            if displacement_px < 0: displacement_px = 0 # Should count even if effective displacement is weird?
                            
                            velocity = displacement_px / concentric_time # pixels per second
                        except:
                            velocity = 0
                        
                        # Categorize Velocity
                        # These thresholds are heuristic based on pixel movement
                        if velocity > 250: vel_cat = "Fast (Power)"
                        elif velocity > 100: vel_cat = "Solid"
                        else: vel_cat = "Grind"
                        
                        rep_count += 1
                        rep_data.append({
                            "rep": rep_count, 
                            "min_angle": min_knee_angle, 
                            "depth_rating": get_depth_rating(min_knee_angle),
                            "velocity": f"{velocity:.1f} px/s",
                            "velocity_category": vel_cat
                        })
                
                image_rgb = add_angle_overlays(image_rgb, angles)
            
            # Pass velocity data to info panel
            last_vel = rep_data[-1]["velocity_category"] if rep_data else "Ready"
            last_vel_val = rep_data[-1]["velocity"] if rep_data else "--"
            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, min_knee_angle, last_vel, last_vel_val)
            output_frames.append(final_image)
    
    cap.release()
    
    if output_path and output_frames:
        try:
            if "recorded_video" in os.path.basename(video_path) and len(output_frames) > 0:
                fps = len(output_frames) / 10.0
            from moviepy.editor import ImageSequenceClip
            clip = ImageSequenceClip(output_frames, fps=fps)
            clip.write_videofile(output_path, codec='libx264', audio=False, logger=None, preset='ultrafast', threads=4)
        except Exception as e:
            print(f"Error writing video: {e}")
            return {"error": str(e)}
    
    avg_depth = 0
    feedback_summary = []
    corrections = []
    
    if rep_data:
        avg_depth = np.mean([r["min_angle"] for r in rep_data])
        if avg_depth > 100:
            feedback_summary.append("Insufficient Depth")
            corrections.append("Not reaching parallel (90° knee angle). Sit back deeper.")
            corrections.append("Practice with a box or bench.")
        elif 85 <= avg_depth <= 100:
            feedback_summary.append("Good Depth (NSCA Standard)")
            corrections.append("Great work hitting parallel.")
        else:
            feedback_summary.append("Excellent Depth")
            corrections.append("Great depth! Maintain control at bottom.")
            
        # Velocity Feedback
        avg_velocity_val = np.mean([float(r["velocity"].split()[0]) for r in rep_data])
        feedback_summary.append(f"Avg Velocity: {avg_velocity_val:.0f} px/s")

    else:
        feedback_summary.append("No Reps Detected")
        corrections.append("Could not detect full squats. Ensure your whole body is in frame.")
    
    return {
        "reps_count": rep_count,
        "avg_depth": int(avg_depth),
        "feedback": feedback_summary,
        "corrections": corrections,
        "rep_details": rep_data
    }
