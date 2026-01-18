-- Remove the auto-profile creation trigger
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;
DROP FUNCTION IF EXISTS public.handle_new_user();

-- Profiles will now only be created through the onboarding flow
-- This ensures new users always see the onboarding screen
