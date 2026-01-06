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

def add_info_panel(image, frame, total_frames, fps, reps, current_knee_angle, status, last_vel_val="--"):
    h, w = image.shape[:2]
    
    # Minimal Overlay - Top Right for Reps
    # Transparent background for readability
    cv2.putText(image, f"REPS: {reps}", (w - 180, 50), cv2.FONT_HERSHEY_SIMPLEX, 1.2, (57, 255, 20), 3, cv2.LINE_AA)
    
    # Status Indicator (Floating, Center Bottom)
    if status != "Good Form":
        color = (147, 20, 255) # Pink/Red for issues
    else:
        color = (57, 255, 20) # Green
        
    text_size = cv2.getTextSize(status, cv2.FONT_HERSHEY_SIMPLEX, 1, 2)[0]
    center_x = (w - text_size[0]) // 2
    cv2.putText(image, status, (center_x, h - 50), cv2.FONT_HERSHEY_SIMPLEX, 1, color, 2, cv2.LINE_AA)
    
    return image


def analyze_squat_video(video_path, output_path=None):
    import datetime
    def log_debug(msg):
        with open("analyzer_debug.log", "a") as f:
            f.write(f"[{datetime.datetime.now()}] {msg}\n")
            
    log_debug(f"Starting analysis for {video_path}")

    if not os.path.exists(video_path):
        log_debug("Video file not found")
        return {"error": "Video not found"}
    
    cap = cv2.VideoCapture(video_path)
    if not cap.isOpened():
        log_debug("Cannot open video capture")
        return {"error": "Cannot open video"}
    
    fps = cap.get(cv2.CAP_PROP_FPS) or 30
    total_frames = int(cap.get(cv2.CAP_PROP_FRAME_COUNT))
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    log_debug(f"Video Info: {width}x{height} @ {fps}fps, {total_frames} frames")
    
    # State variables for advanced tracking
    # State variables for advanced tracking
    start_descent_frame = 0
    bottom_frame = 0
    output_frames = []
    rep_data = []
    in_squat = False
    rep_count = 0
    min_knee_angle = 180
    
    # Rep history data
    rep_history = [] 
    
    with mp_pose.Pose(min_detection_confidence=0.7, min_tracking_confidence=0.7, model_complexity=1) as pose:
        frame_count = 0
        log_debug("Entering frame loop")
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
                    
                    # --- State Machine ---
                    # 1. Start Descent
                    if not in_squat and angles['left_knee'] < 165:
                        in_squat = True
                        start_descent_frame = frame_count
                        min_knee_angle = 180
                        max_torso_lean = 0
                        min_valgus_ratio = 2.0 # High start
                        max_heel_lift = 0
                        
                        # Capture baseline heel Y (to check for lift)
                        try:
                            baseline_heel_y = landmarks[29].y * height # Left heel
                        except:
                            baseline_heel_y = 0

                    if in_squat:
                        # Track Bottom (Max Depth)
                        if angles['left_knee'] < min_knee_angle:
                            min_knee_angle = angles['left_knee']
                            bottom_frame = frame_count
                        
                        # Track Max Torso Lean (deviation from 180 vertical)
                        if angles['torso']:
                            # Torso angle here is calc'd against vertical: 0 is upright? 
                            # logic in get_key_angles: vertical_point(hip_x, hip_y-100) -> hip -> shoulder.
                            # So upright is ~0 or 180? calculate_angle usually returns inner angle (0-180).
                            # If vertical point is UP, and shoulder is UP, angle is 0. 
                            # Let's assume larger angle = more lean or vice versa. 
                            # Actually, usually 0 is upright. Let's track the MAX value.
                            if angles['torso'] > max_torso_lean:
                                max_torso_lean = angles['torso']

                        # Track Valgus (Knee Width / Hip Width)
                        try:
                             l_hip_x = landmarks[23].x
                             r_hip_x = landmarks[24].x
                             l_knee_x = landmarks[25].x
                             r_knee_x = landmarks[26].x
                             
                             hip_width = abs(l_hip_x - r_hip_x)
                             knee_width = abs(l_knee_x - r_knee_x)
                             
                             if hip_width > 0:
                                 ratio = knee_width / hip_width
                                 if ratio < min_valgus_ratio:
                                     min_valgus_ratio = ratio
                        except:
                            pass
                            
                        # Track Heel Lift
                        try:
                             current_heel_y = landmarks[29].y * height
                             # If heel moves UP (y decreases), lift is positive
                             lift = baseline_heel_y - current_heel_y
                             if lift > max_heel_lift:
                                 max_heel_lift = lift
                        except:
                            pass

                    # 2. End Ascent (Rep Complete)
                    if in_squat and angles['left_knee'] > 168:
                        in_squat = False
                        end_frame = frame_count
                        
                        # Calculate Phase Timings
                        eccentric_frames = bottom_frame - start_descent_frame
                        concentric_frames = end_frame - bottom_frame
                        if eccentric_frames < 1: eccentric_frames = 1
                        if concentric_frames < 1: concentric_frames = 1
                        
                        ecc_time = eccentric_frames / fps
                        con_time = concentric_frames / fps
                        
                        rep_count += 1
                        
                        # Diagnosis
                        issues = []
                        if min_knee_angle > 100: issues.append("Shallow Depth")
                        if min_valgus_ratio < 0.8: issues.append("Knee Valgus") # Knees narrower than hips
                        if max_torso_lean > 50: issues.append("Excessive Lean")
                        if max_heel_lift > 15: issues.append("Heels Lifting") # Threshold px
                        if con_time > 1.5: issues.append("Slow Ascent")
                        
                        rep_data.append({
                            "rep": rep_count,
                            "min_angle": min_knee_angle,
                            "eccentric_time": ecc_time,
                            "concentric_time": con_time,
                            "valgus_ratio": min_valgus_ratio,
                            "torso_angle": max_torso_lean,
                            "heel_lift": max_heel_lift,
                            "issues": issues
                        })

                # Visual Overlays
                try:
                    def get_coord(idx):
                        return (int(landmarks[idx].x * width), int(landmarks[idx].y * height))
                    
                    l_hip = get_coord(23)
                    l_knee = get_coord(25)
                    l_ankle = get_coord(27)
                    l_shoulder = get_coord(11)
                    
                    if angles['left_knee']:
                        image_rgb = draw_angle_visualization(image_rgb, l_hip, l_knee, l_ankle, angles['left_knee'])
                    if angles['torso']:
                        vertical_point = (l_hip[0], l_hip[1] - 100)
                        image_rgb = draw_angle_visualization(image_rgb, vertical_point, l_hip, l_shoulder, angles['torso'])
                except Exception as e:
                    pass

                image_rgb = add_angle_overlays(image_rgb, angles)
            
            # Simple info on video
            last_rep_issues = rep_data[-1]["issues"] if rep_data else []
            status = last_rep_issues[0] if last_rep_issues else "Good Form"
            final_image = add_info_panel(image_rgb, frame_count, total_frames, fps, rep_count, min_knee_angle if in_squat else 180, status, "--")
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
            return {"error": str(e)}
    
    # --- Generate Professional Coach Notes ---
    feedback_summary = []
    corrections = []
    
    if rep_data:
        depths = [r["min_angle"] for r in rep_data]
        valgus_ratios = [r["valgus_ratio"] for r in rep_data]
        torso_angles = [r["torso_angle"] for r in rep_data]
        heel_lifts = [r["heel_lift"] for r in rep_data]
        ecc_times = [r["eccentric_time"] for r in rep_data]
        con_times = [r["concentric_time"] for r in rep_data]
        
        avg_depth = np.mean(depths)
        avg_depth_str = ""
        
        # 1. Depth Classification (Simplified)
        if avg_depth > 105:
            avg_depth_str = "Too Shallow"
            corrections.append("You are not going down far enough.")
        elif 95 < avg_depth <= 105:
            avg_depth_str = "Almost Parallel"
            corrections.append("Try to go a little lower.")
        elif 80 <= avg_depth <= 95:
            avg_depth_str = "Good Depth"
        else:
            avg_depth_str = "Deep Squat"
        
        feedback_summary.append(f"Depth: {avg_depth_str}")
        
        # 2. Knee Stability (Valgus) -> Simplified
        min_v = np.min(valgus_ratios)
        if min_v < 0.75:
            feedback_summary.append("Knees: Caving In")
            corrections.append("Your knees are collapsing inward. Push them out.")
        elif min_v < 0.9:
            feedback_summary.append("Knees: Slight Cave")
            corrections.append("Keep your knees in line with your toes.")
        else:
            feedback_summary.append("Knees: Good & Stable")
            
        # 3. Torso / Back Angle (Simplified)
        max_lean = np.max(torso_angles)
        if max_lean > 55:
            feedback_summary.append("Back: Leaning Forward Too Much")
            corrections.append("Keep your chest up and core tight.")
        elif max_lean > 40:
             feedback_summary.append("Back: Good Posture")
        else:
             feedback_summary.append("Back: Very Upright (Great)")
             
        # 4. Tempo & Speed (Simplified)
        avg_ecc = np.mean(ecc_times)
        avg_con = np.mean(con_times)
        
        tempo_str = "Controlled"
        if avg_ecc < 0.8:
            tempo_str = "Dropping Too Fast"
            corrections.append("Go down slower to maintain control.")
        elif avg_con > 1.5:
             tempo_str = "Hard Push"
             corrections.append("Good effort pushing back up.")
        elif avg_con < 0.5:
             tempo_str = "Fast & Powerful"
        
        feedback_summary.append(f"Speed: {tempo_str}")
        
        # 5. Consistency (Simplified)
        depth_std = np.std(depths)
        if depth_std < 3.0:
            feedback_summary.append("Consistency: Perfect")
        elif depth_std < 7.0:
            feedback_summary.append("Consistency: Good")
        else:
            feedback_summary.append("Consistency: Uneven")
            corrections.append("Try to squat to the same depth every time.")

    else:
        feedback_summary.append("No Reps Detected")
        corrections.append("Could not detect full squats. Ensure your whole body is in frame.")
    
    return {
        "reps_count": rep_count,
        "avg_depth": int(avg_depth) if rep_data else 0,
        "feedback": feedback_summary,
        "corrections": corrections,
        "rep_details": rep_data
    }
