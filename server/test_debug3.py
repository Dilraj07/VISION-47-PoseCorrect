import sys, os, json
sys.path.insert(0, ".")
os.chdir(r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server")

from core.squat_analyzer import analyze_squat_video

video = r"C:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\uploads\2d27cce7_squat.mp4"
output = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server\outputs\debug_2d27cce7.mp4"

result = analyze_squat_video(video, output)
print(json.dumps(result, indent=2, default=str))
