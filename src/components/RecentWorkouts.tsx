import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { useResponsiveDate } from '@/lib/responsive-utils';
import { format } from 'date-fns';

interface RecentWorkout {
  date: string;
  workout_type: string;
  body_parts: string[];
  rpe: number;
  ai_summary: string | null;
}

export default function RecentWorkouts() {
  const [workouts, setWorkouts] = useState<RecentWorkout[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const navigate = useNavigate();
  const { formatDateShort } = useResponsiveDate();

  useEffect(() => {
    if (user) {
      loadRecentWorkouts();
    }
  }, [user]);

  const loadRecentWorkouts = async () => {
    try {
      const { data: sessions, error } = await supabase
        .from('workout_sessions')
        .select(`
          id,
          date,
          perceived_exertion,
          workout_exercises(
            exercise_id,
            exercises(
              name,
              primary_body_part_id,
              body_parts!exercises_primary_body_part_id_fkey(name)
            )
          ),
          workout_summary(summary_text)
        `)
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(5);

      if (error) {
        console.error('Error loading recent workouts:', error);
        return;
      }

      const processedWorkouts: RecentWorkout[] = sessions?.map(session => {
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
          ai_summary: Array.isArray(session.workout_summary) && session.workout_summary.length > 0 
            ? session.workout_summary[0].summary_text 
            : null
        };
      }) || [];

      setWorkouts(processedWorkouts);
    } catch (error) {
      console.error('Error loading recent workouts:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleRowClick = (date: string) => {
    navigate(`/workouts/${date}`);
  };

  if (loading) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-4">Loading...</div>
        </CardContent>
      </Card>
    );
  }

  if (workouts.length === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle>Recent Workouts</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <p className="text-muted-foreground mb-4">No workouts logged yet</p>
            <Button onClick={() => navigate('/log')}>Log Your First Workout</Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle>Recent Workouts</CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          {workouts.map((workout, index) => (
            <div
              key={`${workout.date}-${index}`}
              onClick={() => handleRowClick(workout.date)}
              className="flex items-center justify-between p-3 rounded-lg border hover:bg-muted/50 cursor-pointer transition-colors"
            >
              <div className="flex items-center space-x-4 flex-1">
                <div className="text-sm font-medium">
                  {formatDateShort(new Date(workout.date))}
                </div>
                <div className="text-sm text-muted-foreground max-w-[150px] truncate">
                  {workout.workout_type}
                </div>
                <div className="text-sm text-muted-foreground">
                  {workout.body_parts.join(', ')}
                </div>
                <div className="text-sm">
                  {workout.rpe > 0 ? `RPE: ${workout.rpe}` : '-'}
                </div>
              </div>
              <div className="text-xs text-muted-foreground max-w-[200px] truncate">
                {workout.ai_summary || 'No summary'}
              </div>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Button variant="outline" onClick={() => navigate('/history')}>
            View All Workouts
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}