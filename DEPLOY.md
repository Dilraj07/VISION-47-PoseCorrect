# 🚀 GYMBRO Deployment Guide (Free Tier)

This guide provides the exact steps to deploy GymBro for free using **Render** (Backend) and **Vercel/Netlify** (Frontend).

## 🛠 Prerequisites
1. A **GitHub** account.
2. A **Clerk** account (for Authentication).
3. A **Supabase** account (for Database).

---

## 🏗 Part 1: Backend Deployment (Render)

1. **Create a New Web Service** on [Render](https://render.com/).
2. **Connect your GitHub Repository**.
3. **Configure Settings**:
   - **Environment**: `Python 3`
   - **Build Command**: `./render-build.sh`
   - **Start Command**: `uvicorn main:app --host 0.0.0.0 --port $PORT`
4. **Add Environment Variables**:
   - `SUPABASE_URL`: Your Supabase Project URL.
   - `SUPABASE_KEY`: Your Supabase `anon` or `service_role` key.
   - `CLERK_JWKS_URL`: `https://your-clerk-frontend-api.clerk.accounts.dev/.well-known/jwks.json`
     - *Find this in Clerk Dashboard -> API Keys -> Advanced -> JWKS URL.*
   - `PYTHON_VERSION`: `3.10.0` (or your preferred version).

---

## 🎨 Part 2: Frontend Deployment (Vercel)

1. **Create a New Project** on [Vercel](https://vercel.com/).
2. **Connect your GitHub Repository**.
3. **Configure Framework Preset**: `Vite`.
4. **Add Environment Variables**:
   - `VITE_API_URL`: The URL provided by Render (e.g., `https://gymbro-api.onrender.com`).
   - `VITE_CLERK_PUBLISHABLE_KEY`: Your Clerk Publishable Key.
5. **Deploy!**

---

## ✅ Deployment Checklist

- [ ] **Supabase**: Ensure `workouts` table exists with columns: `id`, `user_id`, `exercise_type`, `reps`, `feedback` (jsonb), `avg_depth`, `created_at`.
- [ ] **CORS**: The `main.py` is configured for `*` (All origins), which is fine for easy deployment, but consider restricting to your Vercel URL later.
- [ ] **JWKS**: Ensure the `CLERK_JWKS_URL` is exact. Without this, the backend will reject every request.

## ⚠️ Free Tier Limitations
- **Render Spin-up**: The backend will "sleep" after 15 mins of inactivity. The first request might take 30-60 seconds to respond.
- **Memory**: 512MB RAM. Avoid uploading videos longer than 30 seconds to prevent OOM errors.
