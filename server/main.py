from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional
import shutil
import os
import sys
import time
import uuid
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from pymongo import MongoClient
from openai import OpenAI

load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(title="GYMBRO AI Backend", version="2.0")

# CORS Setup
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# MongoDB Setup
MONGO_URL = os.environ.get("MONGO_URL", "mongodb://localhost:27017/gymbro")
client = MongoClient(MONGO_URL)
db = client.gymbro
workouts_collection = db.workouts
chats_collection = db.chats
users_collection = db.users

# OpenAI Setup (Emergent LLM Key)
EMERGENT_LLM_KEY = os.environ.get("EMERGENT_LLM_KEY")
openai_client = OpenAI(
    api_key=EMERGENT_LLM_KEY,
    base_url="https://api.emergentmethods.ai/v1"
) if EMERGENT_LLM_KEY else None

# Constants
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============ MODELS ============
class ChatMessage(BaseModel):
    role: str
    content: str

class ChatRequest(BaseModel):
    messages: List[ChatMessage]
    user_id: Optional[str] = None

class WorkoutLog(BaseModel):
    user_id: str
    exercise_type: str
    reps: int
    feedback: List[str]
    avg_depth: Optional[int] = 0
    session_duration: Optional[int] = 0

class WorkoutPlan(BaseModel):
    name: str
    exercises: List[dict]
    duration_minutes: int
    difficulty: str

# ============ ROUTES ============
@app.get("/api/health")
async def health_check():
    return {"status": "healthy", "service": "GYMBRO AI Backend v2.0"}

@app.get("/api/")
async def root():
    return {"status": "online", "message": "GYMBRO AI Backend is running"}

# ============ VIDEO ANALYSIS ============
@app.post("/api/analyze")
async def analyze_video(
    request: Request,
    file: UploadFile = File(...),
    exercise_type: str = Form("squat")
):
    try:
        file_id = str(uuid.uuid4())[:8]
        file_path = os.path.join(UPLOAD_DIR, f"{file_id}_{file.filename}")
        
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        output_filename = f"analyzed_{file_id}.mp4"
        output_path = os.path.join(OUTPUT_DIR, output_filename)

        print(f"Analyzing {file_path} -> {output_path} (Type: {exercise_type})")
        start_time = time.time()

        # Import and run analyzer
        if exercise_type == "squat":
            from core.squat_analyzer import analyze_squat_video
            analysis_result = analyze_squat_video(file_path, output_path)
        elif exercise_type == "pushup":
            from core.pushup_analyzer import analyze_pushup_video
            analysis_result = analyze_pushup_video(file_path, output_path)
        elif exercise_type == "pullup":
            from core.pullup_analyzer import analyze_pullup_video
            analysis_result = analyze_pullup_video(file_path, output_path)
        elif exercise_type == "deadlift":
            from core.deadlift_analyzer import analyze_deadlift_video
            analysis_result = analyze_deadlift_video(file_path, output_path)
        elif exercise_type == "benchpress":
            from core.bench_press_analyzer import analyze_bench_press_video
            analysis_result = analyze_bench_press_video(file_path, output_path)
        elif exercise_type == "shoulder_press":
            from core.shoulder_press_analyzer import analyze_shoulder_press_video
            analysis_result = analyze_shoulder_press_video(file_path, output_path)
        elif exercise_type == "plank":
            from core.plank_analyzer import analyze_plank_video
            analysis_result = analyze_plank_video(file_path, output_path)
        elif exercise_type == "lunge":
            from core.lunge_analyzer import analyze_lunge_video
            analysis_result = analyze_lunge_video(file_path, output_path)
        elif exercise_type == "bicep_curl":
            from core.bicep_curl_analyzer import analyze_bicep_curl_video
            analysis_result = analyze_bicep_curl_video(file_path, output_path)
        else:
            from core.squat_analyzer import analyze_squat_video
            analysis_result = analyze_squat_video(file_path, output_path)

        print(f"Analysis complete in {time.time() - start_time:.2f}s")

        if "error" in analysis_result:
            raise HTTPException(status_code=500, detail=analysis_result["error"])

        base_url = str(request.base_url).rstrip('/')
        return {
            "status": "success",
            "original_file": file.filename,
            "analyzed_file": output_filename,
            "download_url": f"{base_url}/api/download/{output_filename}",
            "analysis_data": analysis_result
        }

    except Exception as e:
        print(f"Error: {str(e)}")
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="video/mp4", filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

# ============ AI COACHING CHAT ============
SYSTEM_PROMPT = """You are GYMBRO, an expert AI fitness coach with deep knowledge of:
- Exercise form and biomechanics (NSCA/ACSM standards)
- Workout programming and periodization
- Nutrition for muscle building and fat loss
- Injury prevention and recovery
- Motivation and mindset coaching

Your personality:
- Encouraging but direct - like a supportive gym buddy
- Use fitness slang naturally ("gains", "PRs", "pump")
- Keep responses concise but informative
- Always prioritize safety and proper form
- Be enthusiastic about fitness!

When giving advice:
1. Be specific with exercise cues
2. Explain the "why" behind recommendations
3. Offer alternatives when appropriate
4. Encourage progressive overload safely
"""

@app.post("/api/chat")
async def chat_with_coach(request: ChatRequest):
    if not openai_client:
        raise HTTPException(status_code=500, detail="AI Coach not configured")
    
    try:
        messages = [{"role": "system", "content": SYSTEM_PROMPT}]
        for msg in request.messages:
            messages.append({"role": msg.role, "content": msg.content})
        
        response = openai_client.chat.completions.create(
            model="gpt-4o-mini",
            messages=messages,
            max_tokens=500,
            temperature=0.7
        )
        
        assistant_message = response.choices[0].message.content
        
        # Save chat to DB
        if request.user_id:
            chats_collection.insert_one({
                "user_id": request.user_id,
                "messages": [m.dict() for m in request.messages] + [{"role": "assistant", "content": assistant_message}],
                "timestamp": datetime.utcnow()
            })
        
        return {"response": assistant_message}
    
    except Exception as e:
        print(f"Chat error: {e}")
        raise HTTPException(status_code=500, detail=str(e))

# ============ WORKOUT LOGGING ============
@app.post("/api/workouts")
async def log_workout(workout: WorkoutLog):
    workout_data = workout.dict()
    workout_data["id"] = str(uuid.uuid4())
    workout_data["timestamp"] = datetime.utcnow()
    workouts_collection.insert_one(workout_data)
    return {"status": "saved", "id": workout_data["id"]}

@app.get("/api/workouts/{user_id}")
async def get_workouts(user_id: str, limit: int = 50):
    workouts = list(workouts_collection.find(
        {"user_id": user_id},
        {"_id": 0}
    ).sort("timestamp", -1).limit(limit))
    return {"workouts": workouts}

@app.get("/api/stats/{user_id}")
async def get_user_stats(user_id: str):
    pipeline = [
        {"$match": {"user_id": user_id}},
        {"$group": {
            "_id": "$exercise_type",
            "total_reps": {"$sum": "$reps"},
            "sessions": {"$sum": 1},
            "avg_depth": {"$avg": "$avg_depth"}
        }}
    ]
    stats = list(workouts_collection.aggregate(pipeline))
    
    total_workouts = workouts_collection.count_documents({"user_id": user_id})
    total_reps = sum(s.get("total_reps", 0) for s in stats)
    
    return {
        "total_workouts": total_workouts,
        "total_reps": total_reps,
        "by_exercise": stats
    }

# ============ WORKOUT PLANS ============
WORKOUT_PLANS = [
    {
        "id": "push",
        "name": "Push Day",
        "description": "Chest, Shoulders, Triceps",
        "difficulty": "Intermediate",
        "duration_minutes": 45,
        "exercises": [
            {"name": "Push-ups", "sets": 4, "reps": 12, "rest": 60, "exercise_id": "pushup"},
            {"name": "Bench Press", "sets": 4, "reps": 10, "rest": 90, "exercise_id": "benchpress"},
            {"name": "Shoulder Press", "sets": 3, "reps": 12, "rest": 60, "exercise_id": "shoulder_press"}
        ]
    },
    {
        "id": "pull",
        "name": "Pull Day",
        "description": "Back, Biceps",
        "difficulty": "Intermediate",
        "duration_minutes": 45,
        "exercises": [
            {"name": "Pull-ups", "sets": 4, "reps": 8, "rest": 90, "exercise_id": "pullup"},
            {"name": "Deadlift", "sets": 4, "reps": 6, "rest": 120, "exercise_id": "deadlift"},
            {"name": "Bicep Curls", "sets": 3, "reps": 12, "rest": 60, "exercise_id": "bicep_curl"}
        ]
    },
    {
        "id": "legs",
        "name": "Leg Day",
        "description": "Quads, Glutes, Hamstrings",
        "difficulty": "Intermediate",
        "duration_minutes": 50,
        "exercises": [
            {"name": "Squats", "sets": 4, "reps": 10, "rest": 90, "exercise_id": "squat"},
            {"name": "Lunges", "sets": 3, "reps": 12, "rest": 60, "exercise_id": "lunge"},
            {"name": "Deadlift", "sets": 3, "reps": 8, "rest": 90, "exercise_id": "deadlift"}
        ]
    },
    {
        "id": "fullbody",
        "name": "Full Body Blast",
        "description": "Complete workout for all muscle groups",
        "difficulty": "Beginner",
        "duration_minutes": 40,
        "exercises": [
            {"name": "Squats", "sets": 3, "reps": 12, "rest": 60, "exercise_id": "squat"},
            {"name": "Push-ups", "sets": 3, "reps": 10, "rest": 60, "exercise_id": "pushup"},
            {"name": "Lunges", "sets": 3, "reps": 10, "rest": 60, "exercise_id": "lunge"},
            {"name": "Plank", "sets": 3, "reps": 30, "rest": 45, "exercise_id": "plank", "is_timed": True}
        ]
    },
    {
        "id": "core",
        "name": "Core Crusher",
        "description": "Abs and core stability",
        "difficulty": "Beginner",
        "duration_minutes": 20,
        "exercises": [
            {"name": "Plank", "sets": 4, "reps": 45, "rest": 30, "exercise_id": "plank", "is_timed": True},
            {"name": "Push-ups", "sets": 3, "reps": 15, "rest": 45, "exercise_id": "pushup"}
        ]
    }
]

@app.get("/api/plans")
async def get_workout_plans():
    return {"plans": WORKOUT_PLANS}

@app.get("/api/plans/{plan_id}")
async def get_workout_plan(plan_id: str):
    plan = next((p for p in WORKOUT_PLANS if p["id"] == plan_id), None)
    if not plan:
        raise HTTPException(status_code=404, detail="Plan not found")
    return plan

# ============ VOICE FEEDBACK ============
@app.post("/api/voice-feedback")
async def generate_voice_feedback(feedback_type: str = Form("encouragement")):
    """Generate voice feedback text for TTS on frontend"""
    feedbacks = {
        "encouragement": [
            "Great rep! Keep pushing!",
            "You're crushing it!",
            "One more! You got this!",
            "Perfect form! Stay focused!",
            "That's the spirit! Keep going!"
        ],
        "form_correction": [
            "Go a little deeper on the next one",
            "Keep your back straight",
            "Control the movement, don't rush",
            "Engage your core",
            "Full range of motion!"
        ],
        "rest": [
            "Take a breath, you earned it",
            "Rest up, next set coming",
            "Shake it out, stay loose"
        ],
        "complete": [
            "Set complete! Amazing work!",
            "Workout done! You're a beast!",
            "That's a wrap! Great session!"
        ]
    }
    import random
    texts = feedbacks.get(feedback_type, feedbacks["encouragement"])
    return {"text": random.choice(texts)}
