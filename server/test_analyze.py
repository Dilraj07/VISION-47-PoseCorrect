"""Smoke test: analyze sample_squat.mp4 with all enhancements active."""
import requests
import json

url = "http://localhost:8000/api/analyze"
video_path = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\sample_squat.mp4"

with open(video_path, "rb") as f:
    response = requests.post(
        url,
        files={"file": ("sample_squat.mp4", f, "video/mp4")},
        data={"exercise_type": "squat"},
    )

result = response.json()
print(json.dumps(result, indent=2))
