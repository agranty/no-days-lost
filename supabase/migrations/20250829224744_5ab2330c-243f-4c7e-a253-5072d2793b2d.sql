-- Update workout_sets.weight to enforce 1 decimal precision
ALTER TABLE workout_sets 
ALTER COLUMN weight TYPE DECIMAL(6,1);

-- Update body_weight_logs.body_weight to enforce 1 decimal precision  
ALTER TABLE body_weight_logs 
ALTER COLUMN body_weight TYPE DECIMAL(6,1);