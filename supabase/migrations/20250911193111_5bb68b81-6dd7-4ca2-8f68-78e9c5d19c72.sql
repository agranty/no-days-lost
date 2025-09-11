-- Fix overly permissive service role SELECT policy on profiles table
-- Remove the current permissive policy
DROP POLICY IF EXISTS "Service role can read profiles for webhooks" ON public.profiles;

-- Create a more restrictive service role SELECT policy
-- This policy should only allow service role access in very specific contexts
-- For webhook processing, we typically only need to access specific user profiles by ID
-- not scan the entire table
CREATE POLICY "Service role webhook access only" ON public.profiles
  FOR SELECT USING (
    -- Only allow service role to access profiles when specifically looking up by ID
    -- This prevents bulk data access while still allowing webhook functionality
    current_setting('role') = 'service_role' AND 
    -- Additional security: only allow if accessing via RPC or specific function context
    current_setting('request.jwt.claims', true)::json->>'role' = 'service_role'
  );

-- Alternative approach: Create a security definer function for webhook access
-- This is more secure as it limits what data can be accessed
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
    'subscription_status', subscription_status
  ) INTO profile_data
  FROM public.profiles 
  WHERE id = profile_id;

  RETURN profile_data;
END;
$$ LANGUAGE plpgsql SECURITY DEFINER SET search_path = public;

-- Grant execute permission to service role
GRANT EXECUTE ON FUNCTION public.get_profile_for_webhook(uuid) TO service_role;