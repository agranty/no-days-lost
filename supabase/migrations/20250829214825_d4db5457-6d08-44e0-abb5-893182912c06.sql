-- Remove RIR and Tempo columns, add RPE and Rest
ALTER TABLE public.workout_sets 
DROP COLUMN IF EXISTS rir,
DROP COLUMN IF EXISTS tempo;

ALTER TABLE public.workout_sets 
ADD COLUMN rpe DECIMAL(2,1) CHECK (rpe >= 1.0 AND rpe <= 10.0),
ADD COLUMN rest_sec INTEGER CHECK (rest_sec >= 0);

-- Seed body parts
INSERT INTO public.body_parts (name, is_user_defined, created_by_user_id) VALUES
('Chest', false, NULL),
('Back', false, NULL),
('Shoulders', false, NULL),
('Biceps', false, NULL),
('Triceps', false, NULL),
('Quads', false, NULL),
('Hamstrings', false, NULL),
('Glutes', false, NULL),
('Calves', false, NULL),
('Core', false, NULL)
ON CONFLICT (name) DO NOTHING;

-- Seed exercises by body part
WITH body_part_ids AS (
  SELECT id, name FROM body_parts WHERE is_user_defined = false
)
INSERT INTO public.exercises (name, category, primary_body_part_id, is_machine_based, default_unit) VALUES
-- Chest exercises
('Bench Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Chest'), false, 'kg'),
('Incline Bench Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Chest'), false, 'kg'),
('Dumbbell Bench Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Chest'), false, 'kg'),
('Push-ups', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Chest'), false, 'kg'),
('Chest Fly', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Chest'), true, 'kg'),
('Dips', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Chest'), false, 'kg'),

-- Back exercises
('Pull-ups', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Back'), false, 'kg'),
('Lat Pulldown', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Back'), true, 'kg'),
('Barbell Row', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Back'), false, 'kg'),
('Dumbbell Row', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Back'), false, 'kg'),
('Deadlift', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Back'), false, 'kg'),
('Cable Row', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Back'), true, 'kg'),

-- Shoulders exercises
('Overhead Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Shoulders'), false, 'kg'),
('Lateral Raise', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Shoulders'), false, 'kg'),
('Front Raise', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Shoulders'), false, 'kg'),
('Rear Delt Fly', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Shoulders'), false, 'kg'),
('Shoulder Press Machine', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Shoulders'), true, 'kg'),
('Arnold Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Shoulders'), false, 'kg'),

-- Biceps exercises
('Bicep Curls', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Biceps'), false, 'kg'),
('Hammer Curls', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Biceps'), false, 'kg'),
('Preacher Curls', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Biceps'), false, 'kg'),
('Cable Curls', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Biceps'), true, 'kg'),
('Chin-ups', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Biceps'), false, 'kg'),

-- Triceps exercises
('Tricep Dips', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Triceps'), false, 'kg'),
('Close Grip Bench Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Triceps'), false, 'kg'),
('Tricep Pushdown', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Triceps'), true, 'kg'),
('Overhead Tricep Extension', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Triceps'), false, 'kg'),
('Diamond Push-ups', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Triceps'), false, 'kg'),

-- Quads exercises
('Squat', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Quads'), false, 'kg'),
('Leg Press', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Quads'), true, 'kg'),
('Leg Extension', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Quads'), true, 'kg'),
('Front Squat', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Quads'), false, 'kg'),
('Bulgarian Split Squat', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Quads'), false, 'kg'),
('Lunges', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Quads'), false, 'kg'),

-- Hamstrings exercises
('Romanian Deadlift', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Hamstrings'), false, 'kg'),
('Leg Curl', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Hamstrings'), true, 'kg'),
('Stiff Leg Deadlift', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Hamstrings'), false, 'kg'),
('Good Mornings', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Hamstrings'), false, 'kg'),
('Nordic Curls', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Hamstrings'), false, 'kg'),

-- Glutes exercises
('Hip Thrust', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Glutes'), false, 'kg'),
('Glute Bridge', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Glutes'), false, 'kg'),
('Sumo Deadlift', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Glutes'), false, 'kg'),
('Clamshells', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Glutes'), false, 'kg'),
('Lateral Walks', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Glutes'), false, 'kg'),

-- Calves exercises
('Calf Raise', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Calves'), false, 'kg'),
('Seated Calf Raise', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Calves'), true, 'kg'),
('Standing Calf Raise', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Calves'), true, 'kg'),
('Donkey Calf Raise', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Calves'), false, 'kg'),

-- Core exercises
('Plank', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Core'), false, 'kg'),
('Crunches', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Core'), false, 'kg'),
('Russian Twists', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Core'), false, 'kg'),
('Leg Raises', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Core'), false, 'kg'),
('Dead Bug', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Core'), false, 'kg'),
('Mountain Climbers', 'strength', (SELECT id FROM body_part_ids WHERE name = 'Core'), false, 'kg')
ON CONFLICT (name) DO NOTHING;