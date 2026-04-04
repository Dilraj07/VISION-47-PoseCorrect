"""Smoke test: analyze test_squat_video.mp4."""
import sys, os
sys.path.insert(0, ".")
os.chdir(r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server")

from core.squat_analyzer import analyze_squat_video
import json

video = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\test_squat_video.mp4"
output = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server\outputs\debug_test2.mp4"

result = analyze_squat_video(video, output)
if "error" in result:
    print(f"ERROR: {result['error']}")
else:
    print(json.dumps(result, indent=2, default=str))
