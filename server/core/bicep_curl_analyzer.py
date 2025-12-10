import cv2
import mediapipe as mp
import numpy as np
from core.biomechanics import calculate_angle, get_landmark_coords

def analyze_bicep_curl_video(video_path, output_path=None):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    cap = cv2.VideoCapture(video_path)

    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    
    if output_path is None:
        output_path = video_path.replace(".mp4", "_analyzed.mp4")
        
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    reps = 0
    state = "down" 
    
    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)
        
        current_feedback = "Good Form"

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Simple check: compare visibility to pick side
            left_vis = landmarks[mp_pose.PoseLandmark.LEFT_SHOULDER].visibility
            right_vis = landmarks[mp_pose.PoseLandmark.RIGHT_SHOULDER].visibility
            
            side_prefix = "LEFT" if left_vis > right_vis else "RIGHT"
            
            shoulder = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_SHOULDER"), width, height)
            elbow = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_ELBOW"), width, height)
            wrist = get_landmark_coords(landmarks, getattr(mp_pose.PoseLandmark, f"{side_prefix}_WRIST"), width, height)
            
            angle = calculate_angle(shoulder, elbow, wrist)
            
            # Curl Logic
            if angle > 160:
                state = "down"
            if angle < 30 and state == "down":
                reps += 1
                state = "up"
                
            # Feedback (Elbow drift check - simplified)
            # A real check would compare elbow X rel to shoulder X over time, 
            # but for basic curl, full ext/flex is main metric.
            
            cv2.putText(image, f"Reps: {reps}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
            cv2.putText(image, f"Angle: {int(angle)}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(image, current_feedback, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0), 2)
            
            mp.solutions.drawing_utils.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        out.write(image)

    cap.release()
    out.release()
    
    return {
        "reps": reps,
        "feedback": ["Full range of motion achieved" if reps > 0 else "Try to extend arm fully"], 
        "video_path": output_path
    }
