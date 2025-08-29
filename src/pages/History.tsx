import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Dumbbell, History as HistoryIcon } from 'lucide-react';

interface WorkoutData {
  date: string;
  workout_type: string;
  body_parts: string[];
  rpe: number;
  exercise_count: number;
  duration?: number;
}

export default function History() {
  const [workouts, setWorkouts] = useState<WorkoutData[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (user) {
      loadWorkoutHistory();
    }
  }, [user]);

  const loadWorkoutHistory = async () => {
    try {
      // Only load sessions that have workout exercises (i.e., actual data)
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          date,
          duration_min,
          perceived_exertion,
          workout_exercises!inner(
            exercise_id,
            exercises(
              name,
              primary_body_part_id,
              body_parts!exercises_primary_body_part_id_fkey(name)
            )
          )
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading workout history:', error);
        return;
      }

      const processedWorkouts: WorkoutData[] = sessions?.map(session => {
        const bodyParts = new Set<string>();
        const exerciseNames = new Set<string>();
        
        session.workout_exercises?.forEach(we => {
          if (we.exercises?.body_parts?.name) {
            bodyParts.add(we.exercises.body_parts.name);
          }
          if (we.exercises?.name) {
            exerciseNames.add(we.exercises.name);
          }
        });

        const workoutType = Array.from(exerciseNames).slice(0, 2).join(', ') + 
                           (exerciseNames.size > 2 ? '...' : '');

        return {
          date: session.date,
          workout_type: workoutType || 'General Workout',
          body_parts: Array.from(bodyParts),
          rpe: session.perceived_exertion || 0,
          exercise_count: session.workout_exercises?.length || 0,
          duration: session.duration_min
        };
      }) || [];

      setWorkouts(processedWorkouts);
    } catch (error) {
      console.error('Error loading workout history:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleWorkoutClick = (date: string) => {
    navigate(`/workouts/${date}`);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Workout History</h1>
        </div>
        <div className="text-center py-8">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p>Loading your workout history...</p>
        </div>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-2">
          <HistoryIcon className="h-8 w-8 text-primary" />
          <h1 className="text-3xl font-bold">Workout History</h1>
        </div>
        <Card>
          <CardContent className="text-center py-8">
            <Dumbbell className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-medium mb-2">No workouts yet</h3>
            <p className="text-muted-foreground mb-4">Start your fitness journey by logging your first workout!</p>
            <Button onClick={() => navigate('/log')}>
              Log Your First Workout
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <HistoryIcon className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Workout History</h1>
      </div>

      <div className="space-y-2">
        {workouts.map((workout, index) => (
          <Card 
            key={`${workout.date}-${index}`}
            className="cursor-pointer hover:bg-muted/50 transition-colors"
            onClick={() => handleWorkoutClick(workout.date)}
          >
            <CardContent className="p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-6 flex-1">
                  <div className="font-medium min-w-[120px]">
                    {format(new Date(workout.date), 'MMM dd, yyyy')}
                  </div>
                  <div className="text-muted-foreground max-w-[200px] truncate">
                    {workout.workout_type}
                  </div>
                  <div className="text-muted-foreground">
                    {workout.body_parts.join(', ')}
                  </div>
                  <div className="text-sm">
                    {workout.rpe > 0 ? `RPE: ${workout.rpe}` : '-'}
                  </div>
                </div>
                <div className="text-right text-sm text-muted-foreground">
                  <div>{workout.exercise_count} exercises</div>
                  {workout.duration && <div>{workout.duration}min</div>}
                </div>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}