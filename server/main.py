from fastapi import FastAPI, UploadFile, File, HTTPException, Form, Request
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import FileResponse
from fastapi.staticfiles import StaticFiles
from pydantic import BaseModel
from typing import List, Optional, Dict, Any
import shutil
import os
import sys
import time
import uuid
import json
import cv2
import numpy as np
from datetime import datetime
from pathlib import Path
from dotenv import load_dotenv
from supabase import create_client, Client
import mediapipe as mp
import jwt
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from fastapi import Depends

load_dotenv()

# Add current directory to path
sys.path.append(os.path.dirname(os.path.abspath(__file__)))

app = FastAPI(title="GYMBRO Backend", version="2.0")

# CORS Setup
origins = ["*"]
app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

# Supabase Setup
SUPABASE_URL = os.environ.get("SUPABASE_URL")
SUPABASE_KEY = os.environ.get("SUPABASE_KEY")

if not SUPABASE_URL or not SUPABASE_KEY:
    print("WARNING: Supabase credentials missing. Database features will fail.")
    supabase: Client = None
else:
    try:
        supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
        print("Connected to Supabase")
    except Exception as e:
        print(f"Failed to connect to Supabase: {e}")
        supabase = None

# Clerk JWT Setup
security = HTTPBearer()

CLERK_JWKS_URL = os.environ.get("CLERK_JWKS_URL")

# Cache for public keys
_jwks_cache = None
_jwks_last_fetch = 0

async def get_clerk_public_key(kid: str):
    global _jwks_cache, _jwks_last_fetch
    now = time.time()
    
    # Refresh cache every hour
    if not _jwks_cache or (now - _jwks_last_fetch > 3600):
        if not CLERK_JWKS_URL:
             # Fallback to a warning if URL is missing
             print("CRITICAL: CLERK_JWKS_URL missing. Authentication will fail.")
             return None
             
        import httpx
        try:
            async with httpx.AsyncClient() as client:
                response = await client.get(CLERK_JWKS_URL)
                _jwks_cache = response.json()
                _jwks_last_fetch = now
        except Exception as e:
            print(f"Failed to fetch JWKS: {e}")
            return None

    for key_data in _jwks_cache.get("keys", []):
        if key_data.get("kid") == kid:
            return jwt.algorithms.RSAAlgorithm.from_jwk(json.dumps(key_data))
    return None

async def get_current_user_id(credentials: HTTPAuthorizationCredentials = Depends(security)) -> str:
    token = credentials.credentials
    try:
        # Get the unverified header to find the 'kid'
        header = jwt.get_unverified_header(token)
        kid = header.get("kid")
        if not kid:
            raise HTTPException(status_code=401, detail="Missing kid in JWT header")
            
        public_key = await get_clerk_public_key(kid)
        if not public_key:
            raise HTTPException(status_code=401, detail="Could not verify token: public key not found")

        # Verify segments and signature
        decoded = jwt.decode(
            token, 
            public_key, 
            algorithms=["RS256"],
            options={"verify_exp": True, "verify_aud": False} # Browser sends azp, not aud sometimes
        )
        
        user_id = decoded.get("sub")
        if not user_id:
            raise HTTPException(status_code=401, detail="Invalid token: missing sub")
        return user_id
    except jwt.ExpiredSignatureError:
        raise HTTPException(status_code=401, detail="Token has expired")
    except Exception as e:
        print(f"Auth error: {str(e)}")
        raise HTTPException(status_code=401, detail="Authentication failed")

# Constants
UPLOAD_DIR = "uploads"
OUTPUT_DIR = "outputs"
os.makedirs(UPLOAD_DIR, exist_ok=True)
os.makedirs(OUTPUT_DIR, exist_ok=True)

# ============ MODELS ============
# Models adjusted for DB

class WorkoutLog(BaseModel):
    user_id: str
    exercise_type: str
    reps: int
    feedback: List[str]
    avg_depth: Optional[float] = 0.0

class ScheduleData(BaseModel):
    user_id: str
    schedule: Dict[str, str]

class UserSettings(BaseModel):
    user_id: str
    theme: str
    units: str
    notifications: bool

class UserProfile(BaseModel):
    user_id: str
    height_cm: float = 175.0
    weight_kg: float = 70.0
    age: int = 25

# ============ ROUTES ============
@app.get("/")
async def root_path():
    return {"message": "GYMBRO Backend is running. Access API at /api/"}

@app.get("/api/health")
async def health_check():
    db_status = "connected" if supabase else "disconnected"
    return {"status": "healthy", "service": "GYMBRO Backend v2.0", "database": db_status}

@app.get("/api/")
async def root():
    return {"status": "online", "message": "GYMBRO Backend is running"}

# ============ VIDEO ANALYSIS ============
@app.post("/api/analyze")
async def analyze_video(
    request: Request,
    file: UploadFile = File(...),
    exercise_type: str = Form("squat"),
    user_height: Optional[float] = Form(None),
    user_weight: Optional[float] = Form(None),
    # Optional dependency since some paths might not use auth (e.g. demo)
    # But we try to extract token from headers manually to avoid breaking form-data requests with Depends
):
    auth_header = request.headers.get("Authorization")
    user_id = None
    if auth_header and auth_header.startswith("Bearer "):
        token = auth_header.split(" ")[1]
        try:
            decoded = jwt.decode(token, options={"verify_signature": False})
            user_id = decoded.get("sub")
        except:
            pass
    
    file_path = None
    output_path = None
    temp_path = None
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

        # Transcode the mp4v file into web-friendly H.264
        try:
            print("Transcoding video for browser compatibility...")
            from moviepy.editor import VideoFileClip
            temp_path = output_path.replace(".mp4", "_temp.mp4")
            clip = VideoFileClip(output_path)
            # OpenCV sometimes fails to write metadata, causing clip.fps to be None
            target_fps = clip.fps if clip.fps else 30
            clip.write_videofile(temp_path, codec="libx264", audio=False, fps=target_fps, preset="ultrafast", threads=4, logger=None)
            clip.close()
            os.replace(temp_path, output_path)
            print("Transcoding complete.")
        except Exception as tc_err:
            print(f"Warning: Transcoding failed. Video may not play in browser. Error: {tc_err}")

        # Save to database if user is authenticated
        if user_id and supabase and "analysis_data" in locals() and "reps_count" in analysis_result:
            try:
                db_data = {
                    "user_id": user_id,
                    "exercise_type": exercise_type,
                    "reps": analysis_result.get("reps_count", 0),
                    "feedback": analysis_result.get("feedback", [])
                }
                supabase.table("workouts").insert(db_data).execute()
                print("Workout auto-saved to database.")
            except Exception as db_err:
                print(f"Error saving to DB: {db_err}")

        base_url = str(request.base_url).rstrip('/')
        return {
            "status": "success",
            "original_file": file.filename,
            "analyzed_file": output_filename,
            "download_url": f"{base_url}/api/download/{output_filename}",
            "analysis_data": analysis_result
        }

    except Exception as e:
        import traceback
        error_msg = f"Error: {str(e)}\n{traceback.format_exc()}"
        print(error_msg)
        with open("server_error.log", "w") as f:
            f.write(error_msg)
        raise HTTPException(status_code=500, detail=str(e))
    
    finally:
        # CLEANUP: Delete original uploaded file immediately
        if file_path and os.path.exists(file_path):
            try:
                os.remove(file_path)
                print(f"Cleaned up original file: {file_path}")
            except OSError as e:
                print(f"Error cleaning up file {file_path}: {e}")
        
        # NOTE: Analyzed files are kept temporarily in OUTPUT_DIR to allow download, 
        # but in a production app, these should be on S3 or deleted via cron.
    

@app.get("/api/download/{filename}")
async def download_file(filename: str):
    file_path = os.path.join(OUTPUT_DIR, filename)
    if os.path.exists(file_path):
        return FileResponse(file_path, media_type="video/mp4", filename=filename)
    raise HTTPException(status_code=404, detail="File not found")

# ============ CALIBRATION & USER PROFILE ============
@app.post("/api/calibrate")
async def calibrate_user(file: UploadFile = File(...)):
    """
    Accept a single T-pose image, extract body proportions, return CalibrationProfile.
    """
    try:
        from core.calibration import extract_proportions_from_tpose, CalibrationProfile

        file_id = str(uuid.uuid4())[:8]
        file_path = os.path.join(UPLOAD_DIR, f"tpose_{file_id}_{file.filename}")
        with open(file_path, "wb") as buffer:
            shutil.copyfileobj(file.file, buffer)

        # Read image and run pose detection
        image = cv2.imread(file_path)
        if image is None:
            raise HTTPException(status_code=400, detail="Cannot read image file")

        image_rgb = cv2.cvtColor(image, cv2.COLOR_BGR2RGB)

        mp_pose = mp.solutions.pose
        with mp_pose.Pose(
            static_image_mode=True,
            min_detection_confidence=0.5,
            model_complexity=2,
        ) as pose:
            results = pose.process(image_rgb)

        if not results.pose_landmarks:
            raise HTTPException(status_code=422, detail="No pose detected in T-pose image. Ensure full body is visible.")

        profile = extract_proportions_from_tpose(results.pose_landmarks.landmark)

        # Cleanup
        try:
            os.remove(file_path)
        except:
            pass

        return {"status": "success", "calibration_profile": profile.to_dict()}

    except HTTPException:
        raise
    except Exception as e:
        import traceback
        raise HTTPException(status_code=500, detail=f"Calibration failed: {str(e)}")


@app.post("/api/user-profile")
async def save_user_profile(profile: UserProfile):
    """
    Store user height/weight/age. Returns CalibrationProfile derived from anthropometrics.
    """
    try:
        from core.calibration import CalibrationProfile

        cal_profile = CalibrationProfile(
            height_cm=profile.height_cm,
            weight_kg=profile.weight_kg,
            age=profile.age,
        )

        # Optionally persist to Supabase
        if supabase:
            try:
                payload = {
                    "user_id": profile.user_id,
                    "height_cm": profile.height_cm,
                    "weight_kg": profile.weight_kg,
                    "age": profile.age,
                    "bmi": cal_profile.bmi,
                    "updated_at": "now()",
                }
                supabase.table("user_profiles").upsert(payload).execute()
            except Exception as db_err:
                print(f"DB save warning (non-fatal): {db_err}")

        return {
            "status": "success",
            "calibration_profile": cal_profile.to_dict(),
        }

    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

# Chat endpoint removed as part of architecture overhaul

# ============ WORKOUT LOGGING ============
@app.post("/api/workouts")
async def log_workout(workout: WorkoutLog):
    if not supabase:
        raise HTTPException(status_code=503, detail="Database not available")
        
    try:
        data = {
            "user_id": workout.user_id,
            "exercise_type": workout.exercise_type,
            "reps": workout.reps,
            "feedback": workout.feedback,
            "avg_depth": workout.avg_depth
        }
        res = supabase.table("workouts").insert(data).execute()
        return {"status": "saved", "data": res.data}
    except Exception as e:
        print(f"DB Error: {e}")
        raise HTTPException(status_code=500, detail="Failed to save workout. Check RLS policies or Backend Key.")

@app.get("/api/workouts")
async def get_workouts(limit: int = 50, user_id: str = Depends(get_current_user_id)):
    if not supabase:
        return {"workouts": []}
    
    try:
        res = supabase.table("workouts").select("*").eq("user_id", user_id).order("created_at", desc=True).limit(limit).execute()
        return {"workouts": res.data}
    except Exception as e:
        print(f"DB Error: {e}")
        return {"workouts": []}

@app.get("/api/stats")
async def get_user_stats(user_id: str = Depends(get_current_user_id)):
    if not supabase:
        return {"total_workouts": 0, "total_reps": 0, "by_exercise": []}
    
    try:
        # Get all workouts for user
        res = supabase.table("workouts").select("*").eq("user_id", user_id).execute()
        workouts = res.data
        
        total_workouts = len(workouts)
        total_reps = sum(w['reps'] for w in workouts)
        
        # Group by exercise
        stats_map = {}
        for w in workouts:
            etype = w['exercise_type']
            if etype not in stats_map:
                stats_map[etype] = {"total_reps": 0, "sessions": 0, "avg_depth": 0, "depth_sum": 0, "depth_count": 0}
            
            s = stats_map[etype]
            s['total_reps'] += w['reps']
            s['sessions'] += 1
            if w.get('avg_depth'):
                s['depth_sum'] += w['avg_depth']
                s['depth_count'] += 1
        
        by_exercise = []
        for etype, s in stats_map.items():
            avg_depth = s['depth_sum'] / s['depth_count'] if s['depth_count'] > 0 else 0
            by_exercise.append({
                "_id": etype,
                "total_reps": s['total_reps'],
                "sessions": s['sessions'],
                "avg_depth": avg_depth
            })
            
        return {
            "total_workouts": total_workouts,
            "total_reps": total_reps,
            "by_exercise": by_exercise
        }
    except Exception as e:
        print(f"DB Error: {e}")
        return {"total_workouts": 0, "total_reps": 0, "by_exercise": []}

# ============ SCHEDULE & SETTINGS ============
@app.post("/api/schedule")
async def save_schedule(data: ScheduleData, user_id: str = Depends(get_current_user_id)):
    if not supabase: raise HTTPException(status_code=503, detail="DB unavailable")
    try:
        # Upsert schedule
        payload = {
            "user_id": user_id,
            "data": data.schedule,
            "updated_at": "now()"
        }
        res = supabase.table("schedules").upsert(payload).execute()
        return {"status": "saved"}
    except Exception as e:
        raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/schedule")
async def get_schedule(user_id: str = Depends(get_current_user_id)):
    if not supabase: return {}
    try:
        res = supabase.table("schedules").select("data").eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]["data"]
        return {}
    except Exception as e:
        return {}

@app.post("/api/settings")
async def save_settings(data: UserSettings, user_id: str = Depends(get_current_user_id)):
    if not supabase: raise HTTPException(status_code=503, detail="DB unavailable")
    try:
        payload = {
            "user_id": user_id,
            "theme": data.theme,
            "units": data.units,
            "notifications": data.notifications,
            "updated_at": "now()"
        }
        res = supabase.table("user_settings").upsert(payload).execute()
        return {"status": "saved"}
    except Exception as e:
         raise HTTPException(status_code=500, detail=str(e))

@app.get("/api/settings")
async def get_settings(user_id: str = Depends(get_current_user_id)):
    if not supabase: return {}
    try:
        res = supabase.table("user_settings").select("*").eq("user_id", user_id).execute()
        if res.data:
            return res.data[0]
        return {}
    except Exception as e:
        return {}

# ============ WORKOUT PLANS (STATIC) ============
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

# ============ MOVEMENT MASTERY (ACADEMY) ============
# NOTE: Academy endpoints temporarily disabled - needs migration to Supabase
# MongoDB references removed to fix server startup

# class AcademyCue(BaseModel):
#     title: str
#     text: str

# class AcademyExercise(BaseModel):
#     id: str
#     title: str
#     difficulty: str
#     muscles: str
#     color: str
#     description: str
#     cues: List[AcademyCue]

# class MasteryLog(BaseModel):
#     user_id: str
#     exercise_id: str
#     status: str = "mastered" # started, mastered
#     timestamp: datetime = datetime.utcnow()

# Initial Data (From Frontend)
INITIAL_EXERCISES = [
    {
        "id": "squat",
        "title": "BARBELL SQUAT",
        "difficulty": "INTERMEDIATE",
        "muscles": "LEGS / CORE",
        "color": "var(--color-neon-pink)",
        "description": "The king of all exercises. Builds massive leg strength and core stability.",
        "cues": [
            { "title": "Stance", "text": "Feet shoulder-width apart, toes slightly out." },
            { "title": "Brace", "text": "Deep breath into your belly, tighten core." },
            { "title": "Descent", "text": "Hinge hips back, then bend knees simultaneously." },
            { "title": "Depth", "text": "Go until thighs are at least parallel to floor." },
            { "title": "Drive", "text": "Push through mid-foot, chest up, hips forward." }
        ]
    },
    {
        "id": "deadlift",
        "title": "DEADLIFT",
        "difficulty": "ADVANCED",
        "muscles": "BACK / LEGS",
        "color": "var(--color-neon-green)",
        "description": "Total body power. Teaches proper hip hinge mechanics.",
        "cues": [
            { "title": "Setup", "text": "Bar over mid-foot. Shins touching bar." },
            { "title": "Grip", "text": "Hands just outside legs. Arms straight." },
            { "title": "Tension", "text": "Squeeze armpits down, pull \"slack\" out." },
            { "title": "Lift", "text": "Push the floor away. Hips and shoulders rise together." }
        ]
    },
    {
        "id": "bench",
        "title": "BENCH PRESS",
        "difficulty": "INTERMEDIATE",
        "muscles": "CHEST / ARMS",
        "color": "var(--color-neon-blue)",
        "description": "Upper body strength standard. Develops pushing power.",
        "cues": [
            { "title": "Arch", "text": "Retract scapula, slight arch in lower back." },
            { "title": "Plant", "text": "Feet planted firmly on the ground." },
            { "title": "Path", "text": "Lower bar to lower chest/sternum." },
            { "title": "Press", "text": "Drive bar up and slightly back toward face." }
        ]
    }
]

@app.get("/api/academy/exercises")
async def get_academy_exercises():
    """Return static exercise data - TODO: migrate to Supabase"""
    return {"exercises": INITIAL_EXERCISES}

# @app.post("/api/academy/seed")
# async def seed_academy():
#     """Populate database with initial exercises if empty"""
#     # TODO: Migrate to Supabase
#     return {"status": "disabled", "message": "Academy seed endpoint disabled - needs Supabase migration"}

# @app.post("/api/academy/mastery")
# async def track_mastery(log: MasteryLog):
#     """Mark an exercise as mastered by a user"""
#     # TODO: Migrate to Supabase
#     return {"status": "disabled", "message": "Mastery tracking disabled - needs Supabase migration"}

# @app.get("/api/academy/mastery/{user_id}")
# async def get_user_mastery(user_id: str):
#     """Get list of mastered exercise IDs for a user"""
# Trigger server reload 10

