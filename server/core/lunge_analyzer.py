import cv2
import mediapipe as mp
import numpy as np
import os
from .biomechanics import calculate_angle, get_landmark_coords

def analyze_lunge_video(video_path, output_path=None):
    mp_pose = mp.solutions.pose
    mp_drawing = mp.solutions.drawing_utils
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    cap = cv2.VideoCapture(video_path)
    
    if not cap.isOpened():
        return {"error": "Cannot open video"}
    
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS)) or 30
    
    output_frames = []
    reps = 0
    state = "up"
    rep_data = []
    min_angle = 180
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        current_feedback = "Good"
        
        if results.pose_landmarks:
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
            
            if angle > 160:
                if state == "down":
                    reps += 1
                    rep_data.append({"rep": reps, "min_angle": min_angle, "side": side})
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
            mp_drawing.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)
        
        output_frames.append(image)
    
    cap.release()
    pose.close()
    
    if output_path and output_frames:
        try:
            if "recorded_video" in os.path.basename(video_path): fps = len(output_frames) / 10.0
            if fps <= 0 or fps > 120: fps = 30.0
            from moviepy.editor import ImageSequenceClip
            clip = ImageSequenceClip(output_frames, fps=fps)
            clip.write_videofile(output_path, codec='libx264', audio=False, logger=None, preset='ultrafast', threads=4)
        except Exception as e:
            return {"error": str(e)}
    
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
        "rep_details": rep_data
    }
