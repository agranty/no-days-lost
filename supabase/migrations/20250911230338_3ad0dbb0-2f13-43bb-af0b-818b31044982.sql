-- Update default weight units from kg to lb across the database

-- Update user_preferences table default
ALTER TABLE public.user_preferences 
ALTER COLUMN default_unit SET DEFAULT 'lb'::unit_type;

-- Update body_weight_logs table default  
ALTER TABLE public.body_weight_logs 
ALTER COLUMN unit SET DEFAULT 'lb'::unit_type;

-- Update exercises table default
ALTER TABLE public.exercises 
ALTER COLUMN default_unit SET DEFAULT 'lb'::unit_type;

-- Update existing user preferences that are set to kg to lb (optional - keeps existing user choices)
-- Uncomment the line below if you want to update existing user preferences
-- UPDATE public.user_preferences SET default_unit = 'lb' WHERE default_unit = 'kg';