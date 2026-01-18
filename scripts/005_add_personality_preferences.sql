-- Add personality preference columns to profiles table
ALTER TABLE public.profiles
ADD COLUMN IF NOT EXISTS trainer_personality TEXT DEFAULT 'balanced' CHECK (trainer_personality IN ('motivational', 'balanced', 'scientific', 'tough-love')),
ADD COLUMN IF NOT EXISTS psychiatrist_personality TEXT DEFAULT 'philosophical' CHECK (psychiatrist_personality IN ('philosophical', 'empathetic', 'direct', 'humorous'));

-- Add comments for documentation
COMMENT ON COLUMN public.profiles.trainer_personality IS 'User preferred trainer personality style';
COMMENT ON COLUMN public.profiles.psychiatrist_personality IS 'User preferred psychiatrist personality style';
