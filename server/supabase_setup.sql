-- 1. Create the workouts table
create table workouts (
  id uuid default gen_random_uuid() primary key,
  user_id uuid references auth.users not null,
  exercise_type text not null,
  reps int default 0,
  feedback jsonb,
  created_at timestamptz default now()
);

-- 2. Enable Row Level Security (RLS)
-- This ensures users can't see each other's data
alter table workouts enable row level security;

-- 3. Create Policy: Allow users to view their own workouts
create policy "Users can see own workouts"
on workouts for select
using ( auth.uid() = user_id );

-- 4. Create Policy: Allow users to insert their own workouts
create policy "Users can save workouts"
on workouts for insert
with check ( auth.uid() = user_id );
