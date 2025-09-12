-- Add last_welcome_seen_at field to profiles table to track daily welcome page visits
ALTER TABLE public.profiles 
ADD COLUMN last_welcome_seen_at timestamp with time zone;