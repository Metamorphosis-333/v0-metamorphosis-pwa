-- Add unit preference column to profiles table
ALTER TABLE public.profiles 
ADD COLUMN IF NOT EXISTS unit_preference TEXT DEFAULT 'imperial' CHECK (unit_preference IN ('imperial', 'metric'));
