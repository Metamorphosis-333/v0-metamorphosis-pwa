-- Create sleep tracking table
CREATE TABLE IF NOT EXISTS public.sleep_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sleep_start TIMESTAMP WITH TIME ZONE NOT NULL,
  sleep_end TIMESTAMP WITH TIME ZONE NOT NULL,
  duration_minutes INTEGER NOT NULL,
  sleep_quality TEXT CHECK (sleep_quality IN ('poor', 'fair', 'good', 'excellent')),
  notes TEXT,
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.sleep_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "sleep_logs_select_own" ON public.sleep_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "sleep_logs_insert_own" ON public.sleep_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "sleep_logs_update_own" ON public.sleep_logs FOR UPDATE USING (auth.uid() = user_id);

-- Create resting heart rate tracking table
CREATE TABLE IF NOT EXISTS public.heart_rate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  resting_heart_rate INTEGER NOT NULL,
  max_heart_rate INTEGER,
  heart_rate_variability DECIMAL(6,2),
  logged_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, logged_at)
);

ALTER TABLE public.heart_rate_logs ENABLE ROW LEVEL SECURITY;
CREATE POLICY "heart_rate_logs_select_own" ON public.heart_rate_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "heart_rate_logs_insert_own" ON public.heart_rate_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "heart_rate_logs_update_own" ON public.heart_rate_logs FOR UPDATE USING (auth.uid() = user_id);

-- Create daily readiness scores table
CREATE TABLE IF NOT EXISTS public.readiness_scores (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  score INTEGER CHECK (score >= 0 AND score <= 100),
  sleep_score DECIMAL(3,1),
  recovery_score DECIMAL(3,1),
  stress_score DECIMAL(3,1),
  activity_score DECIMAL(3,1),
  nutrition_score DECIMAL(3,1),
  recommendations TEXT[],
  scored_at DATE DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
  UNIQUE(user_id, scored_at)
);

ALTER TABLE public.readiness_scores ENABLE ROW LEVEL SECURITY;
CREATE POLICY "readiness_scores_select_own" ON public.readiness_scores FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "readiness_scores_insert_own" ON public.readiness_scores FOR INSERT WITH CHECK (auth.uid() = user_id);
