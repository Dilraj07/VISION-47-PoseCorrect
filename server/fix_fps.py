import os
import glob

core_dir = os.path.join(os.path.dirname(__file__), "core")
for filepath in glob.glob(os.path.join(core_dir, "*_analyzer.py")):
    with open(filepath, "r") as f:
        content = f.read()

    # The typical pattern: fps = cap.get(cv2.CAP_PROP_FPS) or 30
    if "cv2.CAP_PROP_FPS" in content:
        # We find where fps is assigned and insert a cap right after it.
        # It's usually like:
        # fps = cap.get(cv2.CAP_PROP_FPS) or 30
        # total_frames = ...
        
        # We can just do a dumb replacement:
        content = content.replace(
            "fps = cap.get(cv2.CAP_PROP_FPS) or 30",
            "fps = cap.get(cv2.CAP_PROP_FPS)\n    if not fps or fps <= 0 or fps > 120:\n        fps = 30.0"
        )
        content = content.replace(
            "fps = int(cap.get(cv2.CAP_PROP_FPS))",
            "fps = cap.get(cv2.CAP_PROP_FPS)\n    if not fps or fps <= 0 or fps > 120:\n        fps = 30.0\n    fps = int(fps)"
        )
        
        with open(filepath, "w") as f:
            f.write(content)

print("Fixed FPS bugs in core analyzers!")
