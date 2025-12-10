import cv2
import mediapipe as mp
import numpy as np
import math
from core.biomechanics import calculate_angle, get_landmarks, get_landmark_coords

def analyze_lunge_video(video_path, output_path=None):
    mp_pose = mp.solutions.pose
    pose = mp_pose.Pose(min_detection_confidence=0.5, min_tracking_confidence=0.5)
    cap = cv2.VideoCapture(video_path)

    # Video properties
    width = int(cap.get(cv2.CAP_PROP_FRAME_WIDTH))
    height = int(cap.get(cv2.CAP_PROP_FRAME_HEIGHT))
    fps = int(cap.get(cv2.CAP_PROP_FPS))
    fourcc = cv2.VideoWriter_fourcc(*'mp4v')
    
    if output_path is None:
        output_path = video_path.replace(".mp4", "_analyzed.mp4")
        
    out = cv2.VideoWriter(output_path, fourcc, fps, (width, height))

    reps = 0
    state = "up" # up, down
    feedback = []
    
    # Tracking optimal ranges
    max_depth_angle = 0
    
    frames_buffer = []

    while cap.isOpened():
        ret, frame = cap.read()
        if not ret:
            break

        image = cv2.cvtColor(frame, cv2.COLOR_BGR2RGB)
        image.flags.writeable = False
        results = pose.process(image)
        image.flags.writeable = True
        image = cv2.cvtColor(image, cv2.COLOR_RGB2BGR)

        current_feedback = "Good"

        if results.pose_landmarks:
            landmarks = results.pose_landmarks.landmark
            
            # Determine side (simplified: use side with more visibility if needed, defaulting to left/right check)
            # For simplicity, we'll check left side first
            
            # Lunge mechanics: Focused on front leg knee angle approx 90 deg
            
            # Left side
            l_hip = get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP, width, height)
            l_knee = get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_KNEE, width, height)
            l_ankle = get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE, width, height)
            
            # Right side
            r_hip = get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_HIP, width, height)
            r_knee = get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE, width, height)
            r_ankle = get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE, width, height)

            # Calculate angles
            angle_l = calculate_angle(l_hip, l_knee, l_ankle)
            angle_r = calculate_angle(r_hip, r_knee, r_ankle)
            
            # Assume active leg is the one bending more
            angle = angle_l if angle_l < angle_r else angle_r
            side = "Left" if angle_l < angle_r else "Right"
            
            # State Machine
            if angle > 160:
                if state == "down":
                    reps += 1
                    state = "up"
            
            if angle < 100: # Lunge depth
                state = "down"
                
            # Feedback
            if state == "down" and angle < 70:
                current_feedback = "Too low!"
            elif state == "down" and angle > 110:
                current_feedback = "Go lower"
                
            # Visuals
            cv2.putText(image, f"Reps: {reps}", (50, 100), cv2.FONT_HERSHEY_SIMPLEX, 2, (255, 255, 255), 3)
            cv2.putText(image, f"{side} Knee: {int(angle)}", (50, 150), cv2.FONT_HERSHEY_SIMPLEX, 1, (255, 255, 255), 2)
            cv2.putText(image, current_feedback, (50, 200), cv2.FONT_HERSHEY_SIMPLEX, 1, (0, 255, 0) if current_feedback == "Good" else (0, 0, 255), 2)
            
            mp.solutions.drawing_utils.draw_landmarks(image, results.pose_landmarks, mp_pose.POSE_CONNECTIONS)

        out.write(image)

    cap.release()
    out.release()
    
    return {
        "reps": reps,
        "feedback": ["Keep chest up", "Ensure front knee doesn't pass toes" if "lower" in str(feedback) else "Good depth"], 
        "video_path": output_path
    }
