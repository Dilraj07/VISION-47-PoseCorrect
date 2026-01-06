import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Starting runtime dependency check...")

try:
    import cv2
    print(f"cv2 imported. Version: {cv2.__version__}")
except Exception as e:
    print(f"CRITICAL: cv2 import failed: {e}")

try:
    import mediapipe as mp
    print("mediapipe imported")
    try:
        mp_pose = mp.solutions.pose
        # Try checking for attribute existence specifically
        print(f"mp.solutions.pose exists: {mp_pose is not None}")
        
        # Try initializing the model object
        pose = mp_pose.Pose(static_image_mode=True, min_detection_confidence=0.5)
        print("mediapipe.solutions.pose.Pose initialized successfully")
        pose.close()
    except Exception as e:
        print(f"CRITICAL: mediapipe usage/initialization failed: {e}")
except Exception as e:
    print(f"CRITICAL: mediapipe import failed: {e}")

try:
    from moviepy.editor import ImageSequenceClip
    print("moviepy imported successfully")
except Exception as e:
    print(f"CRITICAL: moviepy import failed: {e}")
