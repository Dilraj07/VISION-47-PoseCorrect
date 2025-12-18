# GYMBRO - AI Fitness Coach 🏋️‍♂️🤖

**Your Personal Trainer, Reimagined.**

Gymbro is a next-generation full-stack fitness application that leverages advanced computer vision and real-time AI to democratize professional-grade fitness coaching. Designed with a high-energy "Brutalist Neon" aesthetic, it combines a sleek, immersive React frontend with a powerful Python AI backend to provide instant, frame-by-frame biomechanical analysis of your workouts.

This isn't just an app; it's a digital fitness companion that visually and audibly interacts with you, ensuring your form is perfect and your motivation is high.

![Gymbro Demo](assets/demo.webp)

---

## 🚀 Key Features

### 🟢 1. AI Video Analysis (Upload & Analyze)
Upload your workout videos to get instant, frame-by-frame biomechanical analysis. The AI breaks down every movement to ensure safety and efficiency.
*   **Squat Analyzer**: Checks for NSCA-standard depth (Hip crease below knee top) and torso alignment. It flags "half-reps" and "good-mornings."
*   **Deadlift Analyzer**: Tracks the critical "Setup → Pull → Lockout" phases. It monitors back neutrality (keeping it within the safe 40-50° range) and ensures full hip extension at the top.
*   **Push-Up Analyzer**: Monitors elbow angle (aiming for 90°), shoulder position (45° relative to torso), and detects hip sag to prevent injury.

### 🔴 2. Real-Time AI Coach
Train live with your webcam! The Real-Time Coach counts your reps and analyzes your form **as you move**.
*   **Live Rep Counter**: Hand-free rep tracking displayed in massive, easy-to-read typography.
*   **Instant Feedback Loop**: Get immediate visual feedback on your depth and extension.
*   **Session Reports**: After your set, generate a detailed report card with average depth, total reps, and specific actionable advice like "Go deeper on rep 4."

### 🎵 3. Immersive Audio-Visual Experience
Gymbro is designed to feel alive.
*   **Music Visualizer**: A dynamic, wave-based audio visualizer built into the Navbar. It syncs with the app's soundtrack, animating in real-time to the beat (Neon Pink/Green waves).
*   **Beat-Synced Intro**: The application launch sequence ("YOUR FITNESS REIMAGINED") is rhythmically synchronized to the bass beats of the intro track, creating a hype-building startup.
*   **Global Audio Control**: Seamlessly toggle music across the entire app directly from the visualizer.

### 📊 4. Professional-Grade Analytics
*   **Visual Overlays**: See your skeleton, joint angles, and error flags directly overlaid on your video during analysis.
*   **Actionable Corrections**: The AI doesn't just say "Bad Rep." It says "Sit back deeper," "Don't round your back," or "Engage core."
*   **Privacy First**: All video processing happens locally or in a secure session, ensuring your workout data remains private.

### 🎨 5. Premium "Dark Mode" Aesthetic
*   **Kinetic Interface**: Smooth `framer-motion` animations, page transitions, and hover effects.
*   **Design System**: A curated palette of "Void Black," "Neon Green," and "Hot Pink" with "Outfit" and "Anton" typography for a modern, high-impact look.

---

## 🛠️ System Architecture

Gymbro follows a modern Monorepo structure separating the Client (Frontend) and Server (Backend).

### **Frontend (Client)**
*   **Framework**: React (Vite)
*   **Styling**: Vanilla CSS (Variables, Flexbox/Grid) + Framer Motion (Animations).
*   **State Management**: React Context (`AuthContext` for users, `AudioContext` for global sound/visualizers).
*   **Routing**: `react-router-dom`.
*   **Icons**: `lucide-react`.

### **Backend (Server)**
*   **Framework**: FastAPI (Python).
*   **Computer Vision**: `MediaPipe` (Pose Estimation), `OpenCV` (Frame processing).
*   **Video Processing**: `MoviePy`.
*   **Database**: Supabase (PostgreSQL) for storing user history and analytics.

---

## 📦 Installation & Quick Start

You will need **two terminal windows** (or tabs) to run the full application locally.

### Prerequisites
*   Node.js (v16+)
*   Python (v3.9+)
*   Git

### Step 1: Clone the Repository
```bash
git clone https://github.com/aryawadhwa/gymbro.git
cd gymbro
```

### Step 2: Terminal 1 - Frontend (The Interface)
```bash
cd client
npm install
npm run dev
```
👉 **Open Browser:** `http://localhost:5173`

### Step 3: Terminal 2 - Backend (The AI Engine)
```bash
cd server  
# (Optional) Create a virtual environment
# python -m venv venv 
# source venv/bin/activate (Mac/Linux) or venv\Scripts\activate (Windows)

pip install -r requirements.txt
uvicorn main:app --reload --port 8000
```
👉 **API Status:** `http://localhost:8000`

---

## 📂 Project Structure

```bash
gymbro/
├── client/                     # React Application
│   ├── src/
│   │   ├── components/         # Reusable UI (Navbar, IntroAnimation)
│   │   ├── context/            # Global State (Audio, Auth)
│   │   ├── pages/              # Main Views (Dashboard, RealTimeCoach)
│   │   ├── hooks/              # Custom Hooks
│   │   └── styles/             # Global CSS & Variables
│   └── package.json
│
├── server/                     # Python Backend
│   ├── main.py                 # API Entry Point
│   ├── core/                   # AI Analyzers & Logic
│   │   ├── squat_analysis.py
│   │   └── deadlift_analysis.py
│   ├── uploads/                # Temp storage for video processing
│   └── requirements.txt        # Python dependencies
│
└── README.md                   # This file
```

---

## 🎮 How to Use

### Real-Time Coaching
1.  Navigate to **Dashboard** -> **Real-Time Coach**.
2.  Allow Camera permissions.
3.  Select your exercise (Squat/Pushup/Pullup).
4.  Step back until your full body is visible.
5.  Wait for the **3-2-1 Countdown**.
6.  Start exercising! The AI will count reps and fix your form live.

### Video Upload Analysis
1.  Navigate to **Dashboard** -> **Video Analysis**.
2.  Drag & Drop your pre-recorded workout video.
3.  Click **Upload & Analyze**.
4.  Wait for the processing to finish.
5.  View your **Report Card** and refined video with skeletal overlays.

---

## 👥 Meet the Team

Built with ❤️ by students from **RV College of Engineering, Bangalore**.

*   **Arya Wadhwa** - Full Stack & Computer Vision
*   **Dilraj Singh** - Backend & Architecture
*   **Shlokk Sikka** - Frontend & UI/UX
*   **Anirudh M** - AI Model Optimization
*   **Ashwin Acharya** - Data Pipeline & Testing

---

## 🤝 Contributing

We welcome contributions!
1.  Fork the Project.
2.  Create your Feature Branch (`git checkout -b feature/AmazingFeature`).
3.  Commit your Changes (`git commit -m 'Add some AmazingFeature'`).
4.  Push to the Branch (`git push origin feature/AmazingFeature`).
5.  Open a Pull Request.

---
*© 2025 Gymbro Inc.*
