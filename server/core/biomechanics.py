"""
Exercise Biomechanics Database
Based on NSCA/ACSM standards
"""
import numpy as np
import mediapipe as mp
import cv2

def draw_angle_visualization(image, p1, p2, p3, angle, color=(255, 255, 255)):
    """Draw lines p1-p2-p3 and angle text at p2"""
    # Draw lines (White)
    cv2.line(image, p1, p2, color, 2, cv2.LINE_AA)
    cv2.line(image, p2, p3, color, 2, cv2.LINE_AA)
    
    # Draw joint circles
    # End points Green
    cv2.circle(image, p1, 8, (57, 255, 20), -1) 
    cv2.circle(image, p1, 10, (255, 255, 255), 2) 
    
    cv2.circle(image, p3, 8, (57, 255, 20), -1)
    cv2.circle(image, p3, 10, (255, 255, 255), 2)
    
    # Vertex Pink
    cv2.circle(image, p2, 8, (147, 20, 255), -1)
    cv2.circle(image, p2, 10, (255, 255, 255), 2)
    
    # Draw Angle Text
    label = f"{int(angle)} degrees"
    # Offset text slightly
    text_pos = (p2[0] + 25, p2[1])
    
    # Text outline (black)
    cv2.putText(image, label, text_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.8, (0, 0, 0), 4, cv2.LINE_AA)
    # Text fill (white)
    cv2.putText(image, label, text_pos, cv2.FONT_HERSHEY_SIMPLEX, 0.8, (255, 255, 255), 2, cv2.LINE_AA)
    
    return image


def calculate_angle(a, b, c):
    """Calculate angle at point b formed by a-b-c"""
    a = np.array(a)
    b = np.array(b)
    c = np.array(c)
    
    ba = a - b
    bc = c - b
    
    cosine_angle = np.dot(ba, bc) / (np.linalg.norm(ba) * np.linalg.norm(bc) + 1e-6)
    cosine_angle = np.clip(cosine_angle, -1.0, 1.0)
    
    return int(np.degrees(np.arccos(cosine_angle)))

def get_landmark_coords(landmarks, landmark_enum, width, height):
    """Get pixel coordinates for a landmark"""
    lm = landmarks[landmark_enum.value]
    return (int(lm.x * width), int(lm.y * height))

def get_landmarks(landmarks, width, height):
    """Get all key landmarks as pixel coordinates"""
    mp_pose = mp.solutions.pose
    return {
        'left_shoulder': get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_SHOULDER, width, height),
        'right_shoulder': get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_SHOULDER, width, height),
        'left_elbow': get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_ELBOW, width, height),
        'right_elbow': get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ELBOW, width, height),
        'left_wrist': get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_WRIST, width, height),
        'right_wrist': get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_WRIST, width, height),
        'left_hip': get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_HIP, width, height),
        'right_hip': get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_HIP, width, height),
        'left_knee': get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_KNEE, width, height),
        'right_knee': get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_KNEE, width, height),
        'left_ankle': get_landmark_coords(landmarks, mp_pose.PoseLandmark.LEFT_ANKLE, width, height),
        'right_ankle': get_landmark_coords(landmarks, mp_pose.PoseLandmark.RIGHT_ANKLE, width, height),
    }

EXERCISE_BIOMECHANICS = {
    "squat": {
        "key_joints": ["knee", "hip", "torso"],
        "ideal_angles": {
            "knee": {"range": (80, 100), "ideal": 90},
            "torso": {"range": (40, 50), "ideal": 45}
        }
    },
    "pushup": {
        "key_joints": ["elbow", "shoulder", "hip"],
        "ideal_angles": {
            "elbow": {"range": (80, 100), "ideal": 90},
            "torso": {"range": (170, 190), "ideal": 180}
        }
    },
    "deadlift": {
        "key_joints": ["knee", "hip", "back"],
        "ideal_angles": {
            "back_angle": {"range": (40, 50), "ideal": 45},
            "knee_start": {"range": (110, 120), "ideal": 115}
        }
    }
}

def get_exercise_angles(exercise_name):
    if exercise_name not in EXERCISE_BIOMECHANICS:
        return {}
    return EXERCISE_BIOMECHANICS[exercise_name]["ideal_angles"]

def get_exercise_errors(exercise_name):
    return {}
