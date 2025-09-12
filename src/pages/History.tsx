import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { format } from 'date-fns';
import { Dumbbell, History as HistoryIcon, Sparkles } from 'lucide-react';
import { ProFeatureOverlay, useProAccess } from '@/components/ProFeatureOverlay';
import { ResponsiveDate } from '@/components/ui/responsive-date';
import { ResponsiveLabel } from '@/components/ui/responsive-label';

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
  const { hasProAccess, loading: proLoading } = useProAccess();
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

  if (loading || proLoading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Workout History</h1>
          <p className="text-muted-foreground text-lg">View your past workouts</p>
        </div>
        <Card className="p-12 border-0 shadow-sm">
          <div className="text-center">
            <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto mb-6">
              <Dumbbell className="h-12 w-12 text-primary animate-pulse" />
            </div>
            <p className="text-muted-foreground text-lg">Loading your workout history...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (workouts.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Workout History</h1>
          <p className="text-muted-foreground text-lg">View your past workouts</p>
        </div>
        <Card className="p-12 border-0 shadow-sm">
          <div className="text-center space-y-6">
            <div className="rounded-full bg-muted/30 p-6 w-fit mx-auto">
              <Dumbbell className="h-16 w-16 text-muted-foreground" />
            </div>
            <div>
              <h3 className="text-2xl font-bold mb-3">No workouts yet</h3>
              <p className="text-muted-foreground text-lg mb-8">Start your fitness journey by logging your first workout!</p>
              <div className="flex gap-4 justify-center">
                <Button onClick={() => navigate('/log')} size="lg" className="h-12 px-8">
                  Log Your First Workout
                </Button>
                <Button onClick={() => navigate('/generate')} variant="outline" size="lg" className="h-12 px-8">
                  <Sparkles className="mr-2 h-4 w-4" />
                  Generate AI Workout
                </Button>
              </div>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  // Get most recent workout's body parts for pre-filling
  const getRecentBodyParts = () => {
    if (workouts.length > 0) {
      return workouts[0].body_parts || [];
    }
    return [];
  };

  const handleGenerateFromHistory = () => {
    const recentBodyParts = getRecentBodyParts();
    navigate('/generate', { state: { bodyParts: recentBodyParts } });
  };

  return (
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Workout History</h1>
          <p className="text-muted-foreground text-lg">View your past workouts</p>
        </div>
        {workouts.length > 0 && (
          <Button onClick={handleGenerateFromHistory} variant="outline" size="lg">
            <Sparkles className="mr-2 h-4 w-4" />
            Generate Based on Recent Training
          </Button>
        )}
      </div>

      <div className="space-y-4">
        {workouts.map((workout, index) => {
          // Check if this workout is older than 2 days for pro restriction
          const workoutDate = new Date(workout.date);
          const twoDaysAgo = new Date();
          twoDaysAgo.setDate(twoDaysAgo.getDate() - 2);
          const isOlderThanTwoDays = workoutDate < twoDaysAgo;
          
          const workoutCard = (
            <Card 
              key={`${workout.date}-${index}`}
              className="cursor-pointer hover:shadow-lg transition-all duration-200 hover:scale-[1.005] border-0 shadow-sm bg-card/50"
              onClick={() => handleWorkoutClick(workout.date)}
            >
              <CardContent className="p-8">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-4 lg:space-x-8 flex-1 min-w-0">
                    <div className="font-bold text-xl min-w-0 text-primary flex-shrink-0">
                      <ResponsiveDate date={workout.date} />
                    </div>
                    <div className="text-muted-foreground min-w-0 flex-1 text-lg">
                      <ResponsiveLabel 
                        text={workout.workout_type} 
                        maxLength={{ sm: 10, md: 15, lg: 25 }}
                      />
                    </div>
                    <div className="text-muted-foreground min-w-0 hidden md:block">
                      <ResponsiveLabel 
                        text={workout.body_parts.join(', ')} 
                        maxLength={{ sm: 15, md: 20, lg: 30 }}
                      />
                    </div>
                    <div>
                      {workout.rpe > 0 ? (
                        <span className="bg-primary/15 text-primary px-3 py-1.5 rounded-full text-sm font-semibold">
                          RPE {workout.rpe}
                        </span>
                      ) : (
                        <span className="text-muted-foreground">-</span>
                      )}
                    </div>
                  </div>
                  <div className="text-right text-muted-foreground space-y-2">
                    <div className="font-semibold text-lg">{workout.exercise_count} exercises</div>
                    {workout.duration && <div className="text-sm">{workout.duration} minutes</div>}
                  </div>
                </div>
              </CardContent>
            </Card>
          );

          // Wrap older workouts in pro overlay for free users
          if (!hasProAccess && isOlderThanTwoDays) {
            return (
              <ProFeatureOverlay 
                key={`${workout.date}-${index}`}
                feature="Access full workout history beyond 2 days with detailed exercise tracking"
                blurIntensity="medium"
              >
                {workoutCard}
              </ProFeatureOverlay>
            );
          }

          return workoutCard;
        })}
      </div>
    </div>
  );
}