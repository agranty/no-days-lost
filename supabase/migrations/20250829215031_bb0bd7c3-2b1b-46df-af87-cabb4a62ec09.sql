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
('Core', false, NULL);

-- Seed exercises by body part
INSERT INTO public.exercises (name, category, primary_body_part_id, is_machine_based, default_unit) 
SELECT 'Bench Press', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Chest'
UNION ALL
SELECT 'Incline Bench Press', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Chest'
UNION ALL
SELECT 'Dumbbell Bench Press', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Chest'
UNION ALL
SELECT 'Push-ups', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Chest'
UNION ALL
SELECT 'Chest Fly', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Chest'
UNION ALL
SELECT 'Dips', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Chest'
UNION ALL
SELECT 'Pull-ups', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Back'
UNION ALL
SELECT 'Lat Pulldown', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Back'
UNION ALL
SELECT 'Barbell Row', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Back'
UNION ALL
SELECT 'Dumbbell Row', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Back'
UNION ALL
SELECT 'Deadlift', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Back'
UNION ALL
SELECT 'Cable Row', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Back'
UNION ALL
SELECT 'Overhead Press', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Shoulders'
UNION ALL
SELECT 'Lateral Raise', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Shoulders'
UNION ALL
SELECT 'Front Raise', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Shoulders'
UNION ALL
SELECT 'Rear Delt Fly', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Shoulders'
UNION ALL
SELECT 'Shoulder Press Machine', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Shoulders'
UNION ALL
SELECT 'Arnold Press', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Shoulders'
UNION ALL
SELECT 'Bicep Curls', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Biceps'
UNION ALL
SELECT 'Hammer Curls', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Biceps'
UNION ALL
SELECT 'Preacher Curls', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Biceps'
UNION ALL
SELECT 'Cable Curls', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Biceps'
UNION ALL
SELECT 'Chin-ups', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Biceps'
UNION ALL
SELECT 'Tricep Dips', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Triceps'
UNION ALL
SELECT 'Close Grip Bench Press', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Triceps'
UNION ALL
SELECT 'Tricep Pushdown', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Triceps'
UNION ALL
SELECT 'Overhead Tricep Extension', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Triceps'
UNION ALL
SELECT 'Diamond Push-ups', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Triceps'
UNION ALL
SELECT 'Squat', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Quads'
UNION ALL
SELECT 'Leg Press', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Quads'
UNION ALL
SELECT 'Leg Extension', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Quads'
UNION ALL
SELECT 'Front Squat', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Quads'
UNION ALL
SELECT 'Bulgarian Split Squat', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Quads'
UNION ALL
SELECT 'Lunges', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Quads'
UNION ALL
SELECT 'Romanian Deadlift', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Hamstrings'
UNION ALL
SELECT 'Leg Curl', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Hamstrings'
UNION ALL
SELECT 'Stiff Leg Deadlift', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Hamstrings'
UNION ALL
SELECT 'Good Mornings', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Hamstrings'
UNION ALL
SELECT 'Nordic Curls', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Hamstrings'
UNION ALL
SELECT 'Hip Thrust', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Glutes'
UNION ALL
SELECT 'Glute Bridge', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Glutes'
UNION ALL
SELECT 'Sumo Deadlift', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Glutes'
UNION ALL
SELECT 'Clamshells', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Glutes'
UNION ALL
SELECT 'Lateral Walks', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Glutes'
UNION ALL
SELECT 'Calf Raise', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Calves'
UNION ALL
SELECT 'Seated Calf Raise', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Calves'
UNION ALL
SELECT 'Standing Calf Raise', 'strength'::exercise_category, bp.id, true, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Calves'
UNION ALL
SELECT 'Donkey Calf Raise', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Calves'
UNION ALL
SELECT 'Plank', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Core'
UNION ALL
SELECT 'Crunches', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Core'
UNION ALL
SELECT 'Russian Twists', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Core'
UNION ALL
SELECT 'Leg Raises', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Core'
UNION ALL
SELECT 'Dead Bug', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Core'
UNION ALL
SELECT 'Mountain Climbers', 'strength'::exercise_category, bp.id, false, 'kg'::unit_type FROM body_parts bp WHERE bp.name = 'Core';