-- Reset body_parts to simplified 6 values
TRUNCATE TABLE body_parts CASCADE;

-- Insert the 6 simplified body parts (alphabetical)
INSERT INTO body_parts (id, name, is_user_defined) VALUES
('11111111-1111-1111-1111-111111111111', 'arms', false),
('22222222-2222-2222-2222-222222222222', 'back', false),
('33333333-3333-3333-3333-333333333333', 'chest', false),
('44444444-4444-4444-4444-444444444444', 'core', false),
('55555555-5555-5555-5555-555555555555', 'legs', false),
('66666666-6666-6666-6666-666666666666', 'shoulders', false);

-- Add new fields to exercises table
ALTER TABLE exercises 
ADD COLUMN IF NOT EXISTS is_user_defined boolean DEFAULT false,
ADD COLUMN IF NOT EXISTS created_by_user_id uuid;

-- Clear existing exercises and insert consolidated ones
TRUNCATE TABLE exercises CASCADE;

-- Insert consolidated exercises grouped by body part
INSERT INTO exercises (id, name, category, primary_body_part_id, is_user_defined) VALUES
-- Arms exercises
('e1111111-1111-1111-1111-111111111111', 'Barbell Curl', 'strength', '11111111-1111-1111-1111-111111111111', false),
('e1111111-1111-1111-1111-111111111112', 'Dumbbell Curl', 'strength', '11111111-1111-1111-1111-111111111111', false),
('e1111111-1111-1111-1111-111111111113', 'Tricep Pushdown', 'strength', '11111111-1111-1111-1111-111111111111', false),
('e1111111-1111-1111-1111-111111111114', 'Skull Crusher', 'strength', '11111111-1111-1111-1111-111111111111', false),
('e1111111-1111-1111-1111-111111111115', 'Dips', 'strength', '11111111-1111-1111-1111-111111111111', false),
('e1111111-1111-1111-1111-111111111116', 'Preacher Curl', 'strength', '11111111-1111-1111-1111-111111111111', false),

-- Back exercises
('e2222222-2222-2222-2222-222222222221', 'Pull-Up', 'strength', '22222222-2222-2222-2222-222222222222', false),
('e2222222-2222-2222-2222-222222222222', 'Lat Pulldown', 'strength', '22222222-2222-2222-2222-222222222222', false),
('e2222222-2222-2222-2222-222222222223', 'Seated Row', 'strength', '22222222-2222-2222-2222-222222222222', false),
('e2222222-2222-2222-2222-222222222224', 'Barbell Row', 'strength', '22222222-2222-2222-2222-222222222222', false),
('e2222222-2222-2222-2222-222222222225', 'T-Bar Row', 'strength', '22222222-2222-2222-2222-222222222222', false),
('e2222222-2222-2222-2222-222222222226', 'Face Pull', 'strength', '22222222-2222-2222-2222-222222222222', false),

-- Chest exercises
('e3333333-3333-3333-3333-333333333331', 'Barbell Bench Press', 'strength', '33333333-3333-3333-3333-333333333333', false),
('e3333333-3333-3333-3333-333333333332', 'Dumbbell Bench Press', 'strength', '33333333-3333-3333-3333-333333333333', false),
('e3333333-3333-3333-3333-333333333333', 'Incline Bench Press', 'strength', '33333333-3333-3333-3333-333333333333', false),
('e3333333-3333-3333-3333-333333333334', 'Chest Fly', 'strength', '33333333-3333-3333-3333-333333333333', false),
('e3333333-3333-3333-3333-333333333335', 'Push-Ups', 'strength', '33333333-3333-3333-3333-333333333333', false),
('e3333333-3333-3333-3333-333333333336', 'Pec Deck', 'strength', '33333333-3333-3333-3333-333333333333', false),
('e3333333-3333-3333-3333-333333333337', 'Cable Crossover', 'strength', '33333333-3333-3333-3333-333333333333', false),

-- Core exercises
('e4444444-4444-4444-4444-444444444441', 'Plank', 'strength', '44444444-4444-4444-4444-444444444444', false),
('e4444444-4444-4444-4444-444444444442', 'Hanging Leg Raise', 'strength', '44444444-4444-4444-4444-444444444444', false),
('e4444444-4444-4444-4444-444444444443', 'Ab Rollout', 'strength', '44444444-4444-4444-4444-444444444444', false),
('e4444444-4444-4444-4444-444444444444', 'Cable Crunch', 'strength', '44444444-4444-4444-4444-444444444444', false),
('e4444444-4444-4444-4444-444444444445', 'Russian Twist', 'strength', '44444444-4444-4444-4444-444444444444', false),

-- Legs exercises
('e5555555-5555-5555-5555-555555555551', 'Barbell Squat', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555552', 'Dumbbell Squat', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555553', 'Deadlift', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555554', 'Leg Press', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555555', 'Lunge', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555556', 'Step-Up', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555557', 'Leg Curl', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555558', 'Leg Extension', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-555555555559', 'Calf Raise', 'strength', '55555555-5555-5555-5555-555555555555', false),
('e5555555-5555-5555-5555-55555555555a', 'Hip Thrust', 'strength', '55555555-5555-5555-5555-555555555555', false),

-- Shoulders exercises
('e6666666-6666-6666-6666-666666666661', 'Overhead Press', 'strength', '66666666-6666-6666-6666-666666666666', false),
('e6666666-6666-6666-6666-666666666662', 'Dumbbell Shoulder Press', 'strength', '66666666-6666-6666-6666-666666666666', false),
('e6666666-6666-6666-6666-666666666663', 'Arnold Press', 'strength', '66666666-6666-6666-6666-666666666666', false),
('e6666666-6666-6666-6666-666666666664', 'Lateral Raise', 'strength', '66666666-6666-6666-6666-666666666666', false),
('e6666666-6666-6666-6666-666666666665', 'Front Raise', 'strength', '66666666-6666-6666-6666-666666666666', false),
('e6666666-6666-6666-6666-666666666666', 'Rear Delt Fly', 'strength', '66666666-6666-6666-6666-666666666666', false),
('e6666666-6666-6666-6666-666666666667', 'Upright Row', 'strength', '66666666-6666-6666-6666-666666666666', false);

-- Add duration_min to workout_sessions
ALTER TABLE workout_sessions 
ADD COLUMN IF NOT EXISTS duration_min integer;

-- Create workout_summary table
CREATE TABLE IF NOT EXISTS workout_summary (
    id uuid PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id uuid NOT NULL,
    date date NOT NULL,
    summary_text text NOT NULL,
    created_at timestamp with time zone DEFAULT now()
);

-- Enable RLS on workout_summary
ALTER TABLE workout_summary ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for workout_summary
CREATE POLICY "Users can manage their own workout summaries"
ON workout_summary
FOR ALL
USING (user_id = auth.uid())
WITH CHECK (user_id = auth.uid());

-- Create unique constraint on user_id and date for workout_summary
CREATE UNIQUE INDEX IF NOT EXISTS workout_summary_user_date_idx 
ON workout_summary(user_id, date);

-- Update exercise RLS policies to allow user-defined exercises
DROP POLICY IF EXISTS "Users can view all exercises" ON exercises;

CREATE POLICY "Users can view all exercises" 
ON exercises 
FOR SELECT 
USING (true);

CREATE POLICY "Users can insert their own exercises" 
ON exercises 
FOR INSERT 
WITH CHECK (is_user_defined = true AND created_by_user_id = auth.uid());

CREATE POLICY "Users can update their own exercises" 
ON exercises 
FOR UPDATE 
USING (is_user_defined = true AND created_by_user_id = auth.uid());

CREATE POLICY "Users can delete their own exercises" 
ON exercises 
FOR DELETE 
USING (is_user_defined = true AND created_by_user_id = auth.uid());