-- Add profile fields to profiles table
ALTER TABLE public.profiles 
ADD COLUMN display_name text,
ADD COLUMN birthday_month integer CHECK (birthday_month >= 1 AND birthday_month <= 12),
ADD COLUMN birthday_day integer CHECK (birthday_day >= 1 AND birthday_day <= 31),
ADD COLUMN goal text;