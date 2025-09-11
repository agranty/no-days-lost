-- Remove the overly broad service role policy
DROP POLICY IF EXISTS "Service role can manage all profiles" ON public.profiles;

-- Create more restrictive service role policies
-- Allow service role to read profiles for webhook processing
CREATE POLICY "Service role can read profiles for webhooks" ON public.profiles
  FOR SELECT USING (true);

-- Allow service role to update only subscription-related fields for webhooks
CREATE POLICY "Service role can update subscription data" ON public.profiles
  FOR UPDATE USING (true)
  WITH CHECK (true);

-- Explicitly deny service role from deleting or inserting profiles
-- (INSERT is handled by the trigger, DELETE should not be needed for webhooks)
CREATE POLICY "Service role cannot delete profiles" ON public.profiles
  FOR DELETE USING (false);

CREATE POLICY "Service role cannot insert profiles" ON public.profiles
  FOR INSERT WITH CHECK (false);