import cv2
import mediapipe as mp
import numpy as np
import os
from .biomechanics import calculate_angle, get_landmark_coords

def analyze_bicep_curl_video(video_path, output_path=None):
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
    state = "down"
    rep_data = []
    min_angle = 180
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break
        
        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        results = pose.process(image)
        current_feedback = "Good Form"
        
        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            left_vis = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].visibility
            right_vis = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].visibility
            side_prefix = "LEFT" if left_vis > right_vis else "RIGHT"
            
            shoulder = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_SHOULDER"), width, height)
            elbow = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_ELBOW"), width, height)
            wrist = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_WRIST"), width, height)
            
            angle = calculate_angle(shoulder, elbow, wrist)
            
            if angle > 160:
                if state == "up":
                    rep_data.append({"rep": reps, "min_angle": min_angle})
                state = "down"
                min_angle = 180
            
            if angle < 40 and state == "down":
                reps += 1
                state = "up"
            
            if state == "up" and angle < min_angle:
                min_angle = angle
            
            cv2.putText(image, f"Reps: {reps}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
            cv2.putText(image, f"Angle: {int(angle)}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(image, current_feedback, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
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
    
    if rep_data and reps > 0:
        avg_contraction = np.mean([r["min_angle"] for r in rep_data if r["min_angle"] < 180])
        if avg_contraction > 50:
            feedback.append("Incomplete Contraction")
            corrections.append("Curl higher for full bicep contraction.")
        else:
            feedback.append("Full Range of Motion")
            corrections.append("Great contraction at top!")
    else:
        feedback.append("No Reps Detected")
        corrections.append("Try to extend arm fully between reps.")
    
    return {
        "reps_count": reps,
        "avg_depth": int(np.mean([r["min_angle"] for r in rep_data])) if rep_data and reps > 0 else 0,
        "feedback": feedback,
        "corrections": corrections,
        "rep_details": rep_data
    }
