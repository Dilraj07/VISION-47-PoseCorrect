"""Fix all analyzers: replace in-memory frame accumulation with cv2.VideoWriter."""
import re
import os

CORE_DIR = r"c:\Users\Dillu\Desktop\EL\Vision47\VISION-47-PoseCorrect\server\core"

# Files to fix (squat already fixed)
FILES = [
    "pushup_analyzer.py",
    "pullup_analyzer.py",
    "deadlift_analyzer.py",
    "bench_press_analyzer.py",
    "shoulder_press_analyzer.py",
    "plank_analyzer.py",
    "lunge_analyzer.py",
    "bicep_curl_analyzer.py",
]

for fname in FILES:
    fpath = os.path.join(CORE_DIR, fname)
    with open(fpath, "r", encoding="utf-8") as f:
        content = f.read()
    
    original = content
    
    # 1. Replace "output_frames = []" with video_writer init
    # Find the line and inject video_writer setup after the fps/width/height block
    content = content.replace(
        "    output_frames = []\n",
        "    # Initialize video writer (stream to disk instead of accumulating in memory)\n"
        "    video_writer = None\n"
        "    if output_path:\n"
        "        fourcc = cv2.VideoWriter_fourcc(*'mp4v')\n"
        "        video_writer = cv2.VideoWriter(output_path, fourcc, fps, (width, height))\n\n"
    )
    
    # 2. Replace "output_frames.append(final_image)" with video_writer.write
    content = content.replace(
        "            output_frames.append(final_image)\n",
        "            # Write frame to disk (BGR for cv2.VideoWriter)\n"
        "            if video_writer is not None:\n"
        "                frame_bgr = cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR) if len(final_image.shape) == 3 else final_image\n"
        "                video_writer.write(frame_bgr)\n"
    )
    
    # Also handle "        output_frames.append(final_image)" (different indent in some)
    content = content.replace(
        "        output_frames.append(final_image)\n",
        "        # Write frame to disk (BGR for cv2.VideoWriter)\n"
        "        if video_writer is not None:\n"
        "            frame_bgr = cv2.cvtColor(final_image, cv2.COLOR_RGB2BGR) if len(final_image.shape) == 3 else final_image\n"
        "            video_writer.write(frame_bgr)\n"
    )
    
    # Also handle "        output_frames.append(image)" (lunge/bicep use 'image' not 'final_image')
    content = content.replace(
        "        output_frames.append(image)\n",
        "        # Write frame to disk (BGR for cv2.VideoWriter)\n"
        "        if video_writer is not None:\n"
        "            frame_bgr = cv2.cvtColor(image, cv2.COLOR_RGB2BGR) if len(image.shape) == 3 else image\n"
        "            video_writer.write(frame_bgr)\n"
    )
    
    # 3. Replace the moviepy block with video_writer.release()
    # Pattern: cap.release() followed by moviepy block
    moviepy_patterns = [
        # Standard pattern
        (
            r"    cap\.release\(\)\n\n"
            r"    if output_path and output_frames:\n"
            r"        try:\n"
            r"            if \"recorded_video\".*?\n"
            r"(?:.*?\n)*?"
            r"            clip\.write_videofile\(.*?\n"
            r"        except Exception as e:\n"
            r"            return \{\"error\": str\(e\)\}\n",
            "    cap.release()\n"
            "    if video_writer is not None:\n"
            "        video_writer.release()\n\n"
        ),
        # Without the recorded_video check
        (
            r"    cap\.release\(\)\n\n"
            r"    if output_path and output_frames:\n"
            r"        try:\n"
            r"(?:.*?\n)*?"
            r"            clip\.write_videofile\(.*?\n"
            r"        except Exception as e:\n"
            r"            (?:return \{\"error\": str\(e\)\}|print\(.*?\))\n",
            "    cap.release()\n"
            "    if video_writer is not None:\n"
            "        video_writer.release()\n\n"
        ),
    ]
    
    for pattern, replacement in moviepy_patterns:
        content = re.sub(pattern, replacement, content)
    
    # If there's still a moviepy block, handle the pose.close() + cap.release() pattern
    # For lunge/bicep that had pose.close()
    
    if content != original:
        with open(fpath, "w", encoding="utf-8") as f:
            f.write(content)
        print(f"FIXED: {fname}")
    else:
        print(f"NO CHANGE: {fname} (may need manual fix)")
