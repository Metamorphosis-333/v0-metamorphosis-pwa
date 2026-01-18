-- Create user evolution/progression table
CREATE TABLE IF NOT EXISTS public.user_evolution (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL UNIQUE REFERENCES auth.users(id) ON DELETE CASCADE,
  current_stage TEXT DEFAULT 'caterpillar' CHECK (current_stage IN ('caterpillar', 'chrysalis', 'butterfly', 'monarch')),
  experience_points INTEGER DEFAULT 0,
  stage_progress INTEGER DEFAULT 0,
  achievements TEXT[],
  milestone_streak INTEGER DEFAULT 0,
  last_updated TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.user_evolution ENABLE ROW LEVEL SECURITY;
CREATE POLICY "user_evolution_select_own" ON public.user_evolution FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "user_evolution_update_own" ON public.user_evolution FOR UPDATE USING (auth.uid() = user_id);

-- Create achievements table
CREATE TABLE IF NOT EXISTS public.achievements (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  achievement_type TEXT NOT NULL CHECK (achievement_type IN ('protein_goal', 'workout_streak', 'meditation', 'consistency', 'challenge')),
  title TEXT NOT NULL,
  description TEXT,
  icon TEXT,
  points INTEGER DEFAULT 10,
  unlocked_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.achievements ENABLE ROW LEVEL SECURITY;
CREATE POLICY "achievements_select_own" ON public.achievements FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "achievements_insert_own" ON public.achievements FOR INSERT WITH CHECK (auth.uid() = user_id);
