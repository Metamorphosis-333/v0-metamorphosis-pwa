-- Add Apple Health sync table to track imports
CREATE TABLE IF NOT EXISTS public.apple_health_syncs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  sync_type TEXT NOT NULL CHECK (sync_type IN ('manual', 'shortcuts', 'csv')),
  records_imported INTEGER DEFAULT 0,
  synced_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

ALTER TABLE public.apple_health_syncs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "apple_health_syncs_select_own" ON public.apple_health_syncs FOR SELECT USING (auth.uid() = user_id);
CREATE POLICY "apple_health_syncs_insert_own" ON public.apple_health_syncs FOR INSERT WITH CHECK (auth.uid() = user_id);
