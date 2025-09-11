-- Add role and audit fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN role text NOT NULL DEFAULT 'user' CHECK (role IN ('user', 'admin')),
ADD COLUMN last_login_at timestamp with time zone;

-- Create audit log table for admin actions
CREATE TABLE public.audit_logs (
  id uuid NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  actor_user_id uuid NOT NULL,
  target_user_id uuid,
  action text NOT NULL,
  metadata jsonb DEFAULT '{}',
  created_at timestamp with time zone NOT NULL DEFAULT now()
);

-- Enable RLS on audit logs
ALTER TABLE public.audit_logs ENABLE ROW LEVEL SECURITY;

-- Create policies for audit logs (only admins can view)
CREATE POLICY "Admins can view all audit logs" 
ON public.audit_logs 
FOR SELECT 
USING (EXISTS (
  SELECT 1 FROM public.profiles 
  WHERE id = auth.uid() AND role = 'admin'
));

CREATE POLICY "System can insert audit logs" 
ON public.audit_logs 
FOR INSERT 
WITH CHECK (true);

-- Update the handle_new_user function to track login time
CREATE OR REPLACE FUNCTION public.handle_new_user()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  INSERT INTO public.profiles (id, email, plan, subscription_status, last_login_at)
  VALUES (
    NEW.id,
    NEW.email,
    'free',
    'inactive',
    now()
  );
  RETURN NEW;
END;
$$;

-- Create function to update last login time
CREATE OR REPLACE FUNCTION public.update_last_login()
RETURNS trigger
LANGUAGE plpgsql
SECURITY DEFINER SET search_path = public
AS $$
BEGIN
  UPDATE public.profiles 
  SET last_login_at = now() 
  WHERE id = NEW.id;
  RETURN NEW;
END;
$$;

-- Create trigger to update last login on auth state change
DROP TRIGGER IF EXISTS on_auth_user_login ON auth.users;
CREATE TRIGGER on_auth_user_login
  AFTER UPDATE ON auth.users
  FOR EACH ROW 
  WHEN (OLD.last_sign_in_at IS DISTINCT FROM NEW.last_sign_in_at)
  EXECUTE FUNCTION public.update_last_login();

-- Create admin authorization function
CREATE OR REPLACE FUNCTION public.is_admin(user_id uuid)
RETURNS boolean
LANGUAGE sql
STABLE
SECURITY DEFINER
SET search_path = public
AS $$
  SELECT EXISTS (
    SELECT 1
    FROM public.profiles
    WHERE id = user_id AND role = 'admin'
  );
$$;

-- Grant permissions
GRANT EXECUTE ON FUNCTION public.is_admin(uuid) TO authenticated;