-- First, let's see what policies exist and fix the security issue
-- Drop all existing service role policies for profiles
DROP POLICY IF EXISTS "Service role webhook access only" ON public.profiles;

-- Create a more secure approach using a security definer function
-- This prevents bulk access to customer emails
CREATE OR REPLACE FUNCTION public.get_profile_for_webhook(profile_id uuid)
RETURNS json AS $$
DECLARE
  profile_data json;
BEGIN
  -- Only allow service role to call this function
  IF current_setting('role') != 'service_role' THEN
    RAISE EXCEPTION 'Access denied: Function can only be called by service role';
  END IF;

  -- Return only the minimal data needed for webhook processing
  SELECT json_build_object(
    'id', id,
    'email', email,
    'stripe_customer_id', stripe_customer_id,
    'plan', plan,
    'subscription_status', subscription_status,
    'current_period_end', current_period_end
  ) INTO profile_data
  FROM public.profiles 
  WHERE id = profile_id;

  RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to service role only
REVOKE ALL ON FUNCTION public.get_profile_for_webhook(uuid) FROM PUBLIC;
GRANT EXECUTE ON FUNCTION public.get_profile_for_webhook(uuid) TO service_role;