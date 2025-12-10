from fastapi import FastAPI, UploadFile, File, HTTPException, Form
from fastapi.middleware.cors import CORSMiddleware
from fastapi.staticfiles import StaticFiles
import shutil
import os
import sys
import time
from pathlib import Path

# Add current directory to path to allow imports
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

# Lazy imports - analyzers will be imported when needed to avoid blocking startup

app = FastAPI()

# CORS Setup
origins = [
    "*", # Allow all origins for deployment
    "http://localhost:5173",  # React Frontend
    "http://localhost:3000",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/")
async def root():
    return {"status": "online", "message": "GymBro Backend is functioning"}

@app.get("/health")
async def health_check():
    return {"status": "healthy"}

# Constants
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"

# Ensure directories exist
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

@app.get("/")
def read_root():
    return {"message": "GymBro AI Backend is Running"}

from fastapi import Request

@app.post("/analyze")
async def analyze_video(
    request: Request,
    file: UploadFile = File(...), 
    exercise_type: str = Form("squat")
):
    try:
        # 1. Save uploaded file
        file_path = os.path.join(UPLOAD_DIR, file.filename)
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # 2. Define output path
        output_filename = f"analyzed_{Path(file.filename).stem}.mp4"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        print(f"Analyzing {file_path} -> {output_path} (Type: {exercise_type})")
        
        # 3. Select Analyzer
        print(f"DEBUG: Received request for {exercise_type}")
        print(f"DEBUG: File saved to {file_path}")
        
        start_time = time.time()
        
        # Lazy import analyzers to avoid blocking server startup
        if exercise_type == "squat":
            print("DEBUG: Starting Squat Analysis...")
            from core.squat_analyzer import analyze_squat_video
            analysis_result = analyze_squat_video(file_path, output_path)
        elif exercise_type == "pushup":
            print("DEBUG: Starting Pushup Analysis...")
            from core.pushup_analyzer import analyze_pushup_video
            analysis_result = analyze_pushup_video(file_path, output_path)
        elif exercise_type == "pullup":
            print("DEBUG: Starting Pullup Analysis...")
            from core.pullup_analyzer import analyze_pullup_video
            analysis_result = analyze_pullup_video(file_path, output_path)
        elif exercise_type == "deadlift":
            print("DEBUG: Starting Deadlift Analysis...")
            from core.deadlift_analyzer import analyze_deadlift_video
            analysis_result = analyze_deadlift_video(file_path, output_path)
        elif exercise_type == "benchpress":
            print("DEBUG: Starting BenchPress Analysis...")
            from core.bench_press_analyzer import analyze_bench_press_video
            analysis_result = analyze_bench_press_video(file_path, output_path)
        elif exercise_type == "lunge":
            print("DEBUG: Starting Lunge Analysis...")
            from core.lunge_analyzer import analyze_lunge_video
            analysis_result = analyze_lunge_video(file_path, output_path)
        elif exercise_type == "bicep_curl":
            print("DEBUG: Starting Bicep Curl Analysis...")
            from core.bicep_curl_analyzer import analyze_bicep_curl_video
            analysis_result = analyze_bicep_curl_video(file_path, output_path)
        else:
            # Fallback to squat if unknown
            print(f"Unknown exercise type: {exercise_type}, defaulting to squat")
            from core.squat_analyzer import analyze_squat_video
            analysis_result = analyze_squat_video(file_path, output_path)
            
        print(f"DEBUG: Analysis complete in {time.time() - start_time:.2f}s")
        
        if "error" in analysis_result:
             raise HTTPException(status_code=500, detail=analysis_result["error"])

        if not os.path.exists(output_path):
             raise HTTPException(status_code=500, detail="Analysis failed to produce output video")

        # 4. Return the result
        base_url = str(request.base_url).rstrip('/')
        return {
            "status": "success", 
            "original_file": file.filename, 
            "analyzed_file": output_filename,
            "download_url": f"{base_url}/download/{output_filename}",
            "analysis_data": analysis_result
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

from fastapi.responses import FileResponse

@app.get("/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="video/mp4", filename=filename)
    raise HTTPException(status_code=404, detail="File not found")
