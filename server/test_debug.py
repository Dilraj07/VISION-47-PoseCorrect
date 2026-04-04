"""Debug test: analyze sample_squat.mp4 locally to find the error."""
import sys, os
sys.path.insert(0, ".")
os.chdir(r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server")

from core.squat_analyzer import analyze_squat_video
import traceback

video = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\sample_squat.mp4"
output = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server\outputs\debug_test.mp4"

try:
    result = analyze_squat_video(video, output)
    if "error" in result:
        print(f"ERROR in result: {result['error']}")
    else:
        print(f"SUCCESS: {result['reps_count']} reps detected")
        print(f"Confidence: {result.get('confidence_stats')}")
        print(f"Preprocessing: {result.get('preprocessing_stats')}")
        print(f"Enhancements: {result.get('enhancements')}")
        print(f"Feedback: {result.get('feedback')}")
except Exception as e:
    traceback.print_exc()
