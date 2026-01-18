-- Create heart rate tracking table
CREATE TABLE IF NOT EXISTS public.heart_rate_logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  bpm INTEGER NOT NULL,
  logged_at TIMESTAMP WITH TIME ZONE NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.heart_rate_logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "heart_rate_logs_select_own" ON public.heart_rate_logs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "heart_rate_logs_insert_own" ON public.heart_rate_logs FOR INSERT WITH CHECK (auth.uid() = user_id);
CREATE POLICY "heart_rate_logs_delete_own" ON public.heart_rate_logs FOR DELETE USING (auth.uid() = user_id);
