#!/usr/bin/env bash
# exit on error
set -o errexit

# Install system dependencies for OpenCV and MediaPipe
# Render's base Ubuntu image might need these
apt-get update && apt-get install -y libgl1-mesa-glx libglib2.0-0 ffmpeg

# Install Python dependencies
pip install -r requirements.txt
