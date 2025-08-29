-- Enable necessary extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- Create enums
CREATE TYPE exercise_category AS ENUM ('strength', 'cardio', 'mobility');
CREATE TYPE unit_type AS ENUM ('kg', 'lb');
CREATE TYPE distance_unit_type AS ENUM ('km', 'mile');
CREATE TYPE pr_type AS ENUM ('one_rm_estimate', 'best_weight_single_set', 'best_volume_day', 'fastest_1k', 'fastest_mile', 'fastest_5k', 'longest_distance');

-- Create BodyPart table
CREATE TABLE public.body_parts (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    is_user_defined BOOLEAN NOT NULL DEFAULT FALSE,
    created_by_user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CardioType table
CREATE TABLE public.cardio_types (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL UNIQUE,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Machine table
CREATE TABLE public.machines (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    name TEXT NOT NULL,
    location TEXT,
    selector_setting_name TEXT,
    calibration_notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create Exercise table
CREATE TABLE public.exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    name TEXT NOT NULL,
    category exercise_category NOT NULL,
    primary_body_part_id UUID REFERENCES public.body_parts(id),
    secondary_body_part_ids UUID[] DEFAULT '{}',
    default_unit unit_type DEFAULT 'kg',
    is_machine_based BOOLEAN DEFAULT FALSE,
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create WorkoutSession table
CREATE TABLE public.workout_sessions (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    start_time TIME,
    end_time TIME,
    perceived_exertion INTEGER CHECK (perceived_exertion >= 1 AND perceived_exertion <= 10),
    notes TEXT,
    tags TEXT[] DEFAULT '{}',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create WorkoutExercise table
CREATE TABLE public.workout_exercises (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    session_id UUID NOT NULL REFERENCES public.workout_sessions(id) ON DELETE CASCADE,
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    sort_index INTEGER NOT NULL DEFAULT 0,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create WorkoutSet table
CREATE TABLE public.workout_sets (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_exercise_id UUID NOT NULL REFERENCES public.workout_exercises(id) ON DELETE CASCADE,
    set_index INTEGER NOT NULL DEFAULT 1,
    -- Strength fields
    weight DECIMAL(6,2),
    unit unit_type,
    reps INTEGER,
    rir INTEGER,
    tempo TEXT,
    machine_id UUID REFERENCES public.machines(id),
    machine_setting TEXT,
    -- Cardio fields
    distance_m DECIMAL(10,2),
    duration_sec INTEGER,
    avg_hr_bpm INTEGER,
    -- Derived fields
    estimated_1rm DECIMAL(8,2),
    pace_sec_per_km INTEGER,
    pace_sec_per_mile INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create CardioDetail table
CREATE TABLE public.cardio_details (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    workout_set_id UUID NOT NULL REFERENCES public.workout_sets(id) ON DELETE CASCADE,
    cardio_type_id UUID NOT NULL REFERENCES public.cardio_types(id),
    incline_percent DECIMAL(5,2),
    resistance_level INTEGER,
    cadence_rpm INTEGER,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create PersonalRecord table
CREATE TABLE public.personal_records (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    exercise_id UUID NOT NULL REFERENCES public.exercises(id) ON DELETE CASCADE,
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    type pr_type NOT NULL,
    value DECIMAL(10,2) NOT NULL,
    unit TEXT,
    achieved_at TIMESTAMP WITH TIME ZONE NOT NULL,
    session_id UUID REFERENCES public.workout_sessions(id),
    set_id UUID REFERENCES public.workout_sets(id),
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Create BodyWeightLog table
CREATE TABLE public.body_weight_logs (
    id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
    user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
    date DATE NOT NULL DEFAULT CURRENT_DATE,
    body_weight DECIMAL(6,2) NOT NULL,
    unit unit_type NOT NULL DEFAULT 'kg',
    notes TEXT,
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    UNIQUE(user_id, date)
);

-- Create UserPreference table
CREATE TABLE public.user_preferences (
    user_id UUID PRIMARY KEY REFERENCES auth.users(id) ON DELETE CASCADE,
    default_unit unit_type DEFAULT 'kg',
    distance_unit distance_unit_type DEFAULT 'km',
    created_at TIMESTAMP WITH TIME ZONE DEFAULT NOW(),
    updated_at TIMESTAMP WITH TIME ZONE DEFAULT NOW()
);

-- Enable RLS on all tables
ALTER TABLE public.body_parts ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_types ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.machines ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sessions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_exercises ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.workout_sets ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.cardio_details ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.personal_records ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.body_weight_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.user_preferences ENABLE ROW LEVEL SECURITY;

-- RLS Policies for body_parts
CREATE POLICY "Users can view all body parts" ON public.body_parts
    FOR SELECT USING (true);

CREATE POLICY "Users can insert their own body parts" ON public.body_parts
    FOR INSERT WITH CHECK (created_by_user_id = auth.uid() OR created_by_user_id IS NULL);

-- RLS Policies for cardio_types
CREATE POLICY "Users can view all cardio types" ON public.cardio_types
    FOR SELECT USING (true);

-- RLS Policies for machines
CREATE POLICY "Users can manage their own machines" ON public.machines
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for exercises
CREATE POLICY "Users can view all exercises" ON public.exercises
    FOR SELECT USING (true);

-- RLS Policies for workout_sessions
CREATE POLICY "Users can manage their own workout sessions" ON public.workout_sessions
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for workout_exercises
CREATE POLICY "Users can manage workout exercises for their sessions" ON public.workout_exercises
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_sessions 
            WHERE id = session_id AND user_id = auth.uid()
        )
    );

-- RLS Policies for workout_sets
CREATE POLICY "Users can manage sets for their workout exercises" ON public.workout_sets
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_exercises we
            JOIN public.workout_sessions ws ON we.session_id = ws.id
            WHERE we.id = workout_exercise_id AND ws.user_id = auth.uid()
        )
    );

-- RLS Policies for cardio_details
CREATE POLICY "Users can manage cardio details for their sets" ON public.cardio_details
    FOR ALL USING (
        EXISTS (
            SELECT 1 FROM public.workout_sets wset
            JOIN public.workout_exercises we ON wset.workout_exercise_id = we.id
            JOIN public.workout_sessions ws ON we.session_id = ws.id
            WHERE wset.id = workout_set_id AND ws.user_id = auth.uid()
        )
    );

-- RLS Policies for personal_records
CREATE POLICY "Users can manage their own personal records" ON public.personal_records
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for body_weight_logs
CREATE POLICY "Users can manage their own body weight logs" ON public.body_weight_logs
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- RLS Policies for user_preferences
CREATE POLICY "Users can manage their own preferences" ON public.user_preferences
    FOR ALL USING (user_id = auth.uid())
    WITH CHECK (user_id = auth.uid());

-- Create indexes for performance
CREATE INDEX idx_body_parts_user_id ON public.body_parts(created_by_user_id);
CREATE INDEX idx_machines_user_id ON public.machines(user_id);
CREATE INDEX idx_workout_sessions_user_id ON public.workout_sessions(user_id);
CREATE INDEX idx_workout_sessions_date ON public.workout_sessions(date);
CREATE INDEX idx_workout_exercises_session_id ON public.workout_exercises(session_id);
CREATE INDEX idx_workout_sets_workout_exercise_id ON public.workout_sets(workout_exercise_id);
CREATE INDEX idx_personal_records_user_id ON public.personal_records(user_id);
CREATE INDEX idx_personal_records_exercise_id ON public.personal_records(exercise_id);
CREATE INDEX idx_body_weight_logs_user_id ON public.body_weight_logs(user_id);

-- Create functions for updating timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
    NEW.updated_at = NOW();
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create triggers for automatic timestamp updates
CREATE TRIGGER update_machines_updated_at
    BEFORE UPDATE ON public.machines
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_exercises_updated_at
    BEFORE UPDATE ON public.exercises
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_workout_sessions_updated_at
    BEFORE UPDATE ON public.workout_sessions
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_user_preferences_updated_at
    BEFORE UPDATE ON public.user_preferences
    FOR EACH ROW
    EXECUTE FUNCTION public.update_updated_at_column();

-- Insert seed data for body parts
INSERT INTO public.body_parts (name) VALUES
    ('chest'),
    ('back'),
    ('shoulders'),
    ('biceps'),
    ('triceps'),
    ('quads'),
    ('hamstrings'),
    ('glutes'),
    ('calves'),
    ('core');

-- Insert seed data for cardio types
INSERT INTO public.cardio_types (name) VALUES
    ('Stationary Bike'),
    ('Treadmill Run'),
    ('Outdoor Run'),
    ('Rowing'),
    ('Elliptical');

-- Insert seed data for exercises
INSERT INTO public.exercises (name, category, primary_body_part_id, default_unit, is_machine_based, notes) 
SELECT 
    exercise_data.name,
    exercise_data.category::exercise_category,
    bp.id,
    exercise_data.default_unit::unit_type,
    exercise_data.is_machine_based,
    exercise_data.notes
FROM (
    VALUES 
        ('Barbell Back Squat', 'strength', 'quads', 'kg', false, 'Compound movement'),
        ('Barbell Bench Press', 'strength', 'chest', 'kg', false, 'Compound movement'),
        ('Deadlift', 'strength', 'back', 'kg', false, 'Compound movement'),
        ('Overhead Press', 'strength', 'shoulders', 'kg', false, 'Compound movement'),
        ('Lat Pulldown', 'strength', 'back', 'kg', true, 'Back isolation'),
        ('Seated Row', 'strength', 'back', 'kg', true, 'Back isolation'),
        ('Leg Press', 'strength', 'quads', 'kg', true, 'Leg isolation'),
        ('Hack Squat', 'strength', 'quads', 'kg', true, 'Leg isolation'),
        ('Dumbbell Bench Press', 'strength', 'chest', 'kg', false, 'Chest isolation'),
        ('Cable Fly', 'strength', 'chest', 'kg', true, 'Chest isolation'),
        ('Stationary Bike', 'cardio', 'quads', 'kg', true, 'Cardio exercise'),
        ('Treadmill Run', 'cardio', 'quads', 'kg', true, 'Cardio exercise'),
        ('Outdoor Run', 'cardio', 'quads', 'kg', false, 'Cardio exercise')
) AS exercise_data(name, category, body_part_name, default_unit, is_machine_based, notes)
JOIN public.body_parts bp ON bp.name = exercise_data.body_part_name;