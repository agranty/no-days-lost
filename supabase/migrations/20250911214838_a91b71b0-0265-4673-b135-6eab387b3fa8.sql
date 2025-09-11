-- Seed admin user (replace with your actual email)
-- This ensures the first admin user exists
INSERT INTO public.profiles (id, email, role, plan, subscription_status, created_at, updated_at)
VALUES (
  '00000000-0000-0000-0000-000000000000', -- Placeholder ID
  'admin@example.com', -- REPLACE WITH YOUR EMAIL
  'admin',
  'pro',
  'active',
  now(),
  now()
) ON CONFLICT (id) DO UPDATE SET
  role = 'admin',
  plan = 'pro',
  subscription_status = 'active';