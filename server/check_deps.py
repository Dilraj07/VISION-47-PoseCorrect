import sys
import os

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

print("Checking dependencies...")
try:
    import cv2
    print("cv2 imported successfully")
except Exception as e:
    print(f"FAILED to import cv2: {e}")

try:
    import mediapipe as mp
    print("mediapipe imported successfully")
except Exception as e:
    print(f"FAILED to import mediapipe: {e}")

try:
    # Set IMAGEIO_FFMPEG_EXE if needed, but lets see if it works default
    from moviepy.editor import ImageSequenceClip
    print("moviepy imported successfully")
except Exception as e:
    print(f"FAILED to import moviepy: {e}")

try:
    from core.squat_analyzer import analyze_squat_video
    print("squat_analyzer imported successfully")
except Exception as e:
    print(f"FAILED to import squat_analyzer: {e}")
