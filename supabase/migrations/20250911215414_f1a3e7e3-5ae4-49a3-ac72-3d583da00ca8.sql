-- First, let's check if there are any existing profiles
-- Then create missing profiles for existing auth users

-- Insert profiles for existing auth users who don't have profiles yet
INSERT INTO public.profiles (id, email, role, plan, subscription_status, last_login_at, created_at, updated_at)
SELECT 
  au.id,
  au.email,
  'user' as role,
  'free' as plan,
  'inactive' as subscription_status,
  au.last_sign_in_at,
  au.created_at,
  now() as updated_at
FROM auth.users au
LEFT JOIN public.profiles p ON au.id = p.id
WHERE p.id IS NULL
ON CONFLICT (id) DO NOTHING;

-- Make sure the trigger is properly set up for future users
DROP TRIGGER IF EXISTS on_auth_user_created ON auth.users;

CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, role, plan, subscription_status, last_login_at, created_at, updated_at)
  VALUES (
    NEW.id,
    NEW.email,
    'user',
    'free',
    'inactive',
    NEW.last_sign_in_at,
    NEW.created_at,
    now()
  )
  ON CONFLICT (id) DO UPDATE SET
    email = NEW.email,
    last_login_at = NEW.last_sign_in_at,
    updated_at = now();
  RETURN NEW;
END;
$$;

-- Create the trigger for new user signups
CREATE TRIGGER on_auth_user_created
  AFTER INSERT ON auth.users
  FOR EACH ROW 
  EXECUTE FUNCTION public.handle_new_user();