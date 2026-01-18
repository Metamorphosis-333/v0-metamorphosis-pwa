-- Add new columns to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS gender TEXT CHECK (gender IN ('male', 'female', 'other', 'prefer_not_to_say')),
ADD COLUMN IF NOT EXISTS evolution_path TEXT CHECK (evolution_path IN ('beast_mode', 'balanced', 'mindful', 'custom')),
ADD COLUMN IF NOT EXISTS journal_name TEXT,
ADD COLUMN IF NOT EXISTS unit_preference TEXT DEFAULT 'imperial' CHECK (unit_preference IN ('imperial', 'metric')),
ADD COLUMN IF NOT EXISTS trainer_personality TEXT DEFAULT 'balanced' CHECK (trainer_personality IN ('motivational', 'balanced', 'scientific', 'tough_love')),
ADD COLUMN IF NOT EXISTS psychiatrist_personality TEXT DEFAULT 'philosophical' CHECK (psychiatrist_personality IN ('philosophical', 'empathetic', 'direct', 'humorous')),
ADD COLUMN IF NOT EXISTS feature_toggles JSONB DEFAULT '{"journaling": true, "recipes": true, "meditation": true, "therapy_chat": true}',
ADD COLUMN IF NOT EXISTS accessibility_notes TEXT;

-- Create workouts table for manual logging
CREATE TABLE IF NOT EXISTS public.workouts (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  workout_type TEXT NOT NULL CHECK (workout_type IN ('hike', 'walk', 'gym', 'yoga', 'run', 'swim', 'bike', 'sports', 'dance', 'other')),
  duration_minutes INTEGER NOT NULL,
  intensity TEXT CHECK (intensity IN ('light', 'moderate', 'vigorous')),
  notes TEXT,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.workouts ENABLE ROW LEVEL SECURITY;
CREATE POLICY "workouts_select_own" ON public.workouts FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "workouts_insert_own" ON public.workouts FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "workouts_delete_own" ON public.workouts FOR DELETE USING (auth.uid() = user_id);

-- Create journal entries table
CREATE TABLE IF NOT EXISTS public.journal_entries (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  title TEXT,
  content TEXT NOT NULL,
  mood TEXT,
  tags TEXT[],
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.journal_entries ENABLE ROW LEVEL SECURITY;
CREATE POLICY "journal_entries_select_own" ON public.journal_entries FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "journal_entries_insert_own" ON public.journal_entries FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "journal_entries_update_own" ON public.journal_entries FOR UPDATE USING (auth.uid() = user_id);
CREATE POLICY "journal_entries_delete_own" ON public.journal_entries FOR DELETE USING (auth.uid() = user_id);
