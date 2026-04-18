-- Run this in your Supabase SQL Editor to update the schema for Clerk Auth

-- 1. Drop foreign key constraints pointing to auth.users (Supabase Auth)
ALTER TABLE IF EXISTS workouts DROP CONSTRAINT IF EXISTS workouts_user_id_fkey;
ALTER TABLE IF EXISTS user_settings DROP CONSTRAINT IF EXISTS user_settings_user_id_fkey;
ALTER TABLE IF EXISTS schedules DROP CONSTRAINT IF EXISTS schedules_user_id_fkey;
ALTER TABLE IF EXISTS user_profiles DROP CONSTRAINT IF EXISTS user_profiles_user_id_fkey;

-- 2. Alter the user_id column from UUID to TEXT to accept Clerk string IDs
ALTER TABLE workouts ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE user_settings ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE schedules ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;
ALTER TABLE user_profiles ALTER COLUMN user_id TYPE TEXT USING user_id::TEXT;

-- 3. Since the FastAPI backend verifies JWTs and performs DB operations using the service_role key, 
-- we no longer need to strictly enforce RLS policies for client-side queries.
-- We can safely disable RLS for these tables to prevent permission issues.
ALTER TABLE workouts DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_settings DISABLE ROW LEVEL SECURITY;
ALTER TABLE schedules DISABLE ROW LEVEL SECURITY;
ALTER TABLE user_profiles DISABLE ROW LEVEL SECURITY;
