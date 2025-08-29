import { useState, useEffect } from 'react';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Calendar, Clock, Brain, Sparkles } from 'lucide-react';
import { format } from 'date-fns';

interface WorkoutSession {
  id: string;
  date: string;
  duration_min?: number;
  notes?: string;
  perceived_exertion?: number;
  workout_exercises: Array<{
    exercises: {
      name: string;
      category: string;
    };
    workout_sets: Array<{
      weight?: number;
      reps?: number;
      unit?: string;
      rpe?: number;
    }>;
  }>;
}

interface WorkoutSummary {
  summary_text: string;
  created_at: string;
}

export default function History() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [summaries, setSummaries] = useState<Record<string, WorkoutSummary>>({});
  const [loading, setLoading] = useState(true);
  const [generatingSummary, setGeneratingSummary] = useState<string | null>(null);

  useEffect(() => {
    if (user) {
      loadWorkoutHistory();
      loadWorkoutSummaries();
    }
  }, [user]);

  const loadWorkoutHistory = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          *,
          workout_exercises (
            exercises (name, category),
            workout_sets (weight, reps, unit, rpe)
          )
        `)
        .eq('user_id', user?.id)
        .order('date', { ascending: false });

      if (error) throw error;
      setSessions(data || []);
    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error loading workout history',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const loadWorkoutSummaries = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_summary')
        .select('*')
        .eq('user_id', user?.id);

      if (error) throw error;

      const summaryMap = (data || []).reduce((acc, summary) => {
        acc[summary.date] = summary;
        return acc;
      }, {} as Record<string, WorkoutSummary>);

      setSummaries(summaryMap);
    } catch (error: any) {
      console.error('Error loading summaries:', error);
    }
  };

  const generateWorkoutSummary = async (date: string) => {
    if (!user) return;

    setGeneratingSummary(date);

    try {
      const { data, error } = await supabase.functions.invoke('generate-workout-summary', {
        body: { userId: user.id, date }
      });

      if (error) throw error;

      toast({
        title: 'AI Summary Generated!',
        description: 'Your workout summary has been created.',
      });

      // Reload summaries to show the new one
      loadWorkoutSummaries();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error generating summary',
        description: error.message,
      });
    } finally {
      setGeneratingSummary(null);
    }
  };

  const calculateTotalVolume = (session: WorkoutSession) => {
    return session.workout_exercises.reduce((total, exercise) => {
      return total + exercise.workout_sets.reduce((exerciseTotal, set) => {
        return exerciseTotal + ((set.weight || 0) * (set.reps || 0));
      }, 0);
    }, 0);
  };

  const getTopSet = (session: WorkoutSession) => {
    let topSet = null;
    let maxVolume = 0;

    session.workout_exercises.forEach(exercise => {
      exercise.workout_sets.forEach(set => {
        const volume = (set.weight || 0) * (set.reps || 0);
        if (volume > maxVolume) {
          maxVolume = volume;
          topSet = { ...set, exerciseName: exercise.exercises.name };
        }
      });
    });

    return topSet;
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Workout History</h1>
        <div className="text-center py-8">Loading your workout history...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Workout History</h1>
        <Badge variant="secondary">{sessions.length} sessions</Badge>
      </div>

      {sessions.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <Calendar className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
            <h3 className="text-lg font-semibold mb-2">No Workouts Yet</h3>
            <p className="text-muted-foreground">Start logging your workouts to see them here!</p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-4">
          {sessions.map((session) => {
            const summary = summaries[session.date];
            const totalVolume = calculateTotalVolume(session);
            const topSet = getTopSet(session);

            return (
              <Card key={session.id}>
                <CardHeader>
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      <Calendar className="h-5 w-5 text-primary" />
                      <CardTitle>{format(new Date(session.date), 'EEEE, MMMM d, yyyy')}</CardTitle>
                    </div>
                    <div className="flex items-center gap-2">
                      {session.duration_min && (
                        <Badge variant="outline" className="flex items-center gap-1">
                          <Clock className="h-3 w-3" />
                          {session.duration_min}min
                        </Badge>
                      )}
                      {session.perceived_exertion && (
                        <Badge variant="secondary">
                          RPE {session.perceived_exertion}/10
                        </Badge>
                      )}
                    </div>
                  </div>
                </CardHeader>
                
                <CardContent className="space-y-4">
                  {/* Exercise Summary */}
                  <div>
                    <h4 className="font-semibold mb-2">Exercises ({session.workout_exercises.length})</h4>
                    <div className="flex flex-wrap gap-2">
                      {session.workout_exercises.map((exercise, index) => (
                        <Badge key={index} variant="outline">
                          {exercise.exercises.name}
                        </Badge>
                      ))}
                    </div>
                  </div>

                  {/* Quick Stats */}
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4 text-sm">
                    <div>
                      <span className="text-muted-foreground">Total Volume:</span>
                      <div className="font-semibold">{totalVolume.toLocaleString()}kg</div>
                    </div>
                    
                    {topSet && (
                      <div>
                        <span className="text-muted-foreground">Top Set:</span>
                        <div className="font-semibold">
                          {topSet.exerciseName}: {topSet.weight}kg × {topSet.reps}
                        </div>
                      </div>
                    )}

                    <div>
                      <span className="text-muted-foreground">Sets:</span>
                      <div className="font-semibold">
                        {session.workout_exercises.reduce((total, ex) => total + ex.workout_sets.length, 0)}
                      </div>
                    </div>
                  </div>

                  {session.notes && (
                    <>
                      <Separator />
                      <div>
                        <h4 className="font-semibold mb-2">Notes</h4>
                        <p className="text-sm text-muted-foreground">{session.notes}</p>
                      </div>
                    </>
                  )}

                  {/* AI Summary Section */}
                  <Separator />
                  <div>
                    <div className="flex items-center justify-between mb-2">
                      <h4 className="font-semibold flex items-center gap-2">
                        <Brain className="h-4 w-4" />
                        AI Workout Summary
                      </h4>
                      {!summary && (
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => generateWorkoutSummary(session.date)}
                          disabled={generatingSummary === session.date}
                        >
                          <Sparkles className="h-3 w-3 mr-1" />
                          {generatingSummary === session.date ? 'Generating...' : 'Generate Summary'}
                        </Button>
                      )}
                    </div>
                    
                    {summary ? (
                      <div className="bg-muted/50 rounded-lg p-3">
                        <p className="text-sm leading-relaxed">{summary.summary_text}</p>
                        <p className="text-xs text-muted-foreground mt-2">
                          Generated {format(new Date(summary.created_at), 'MMM d, h:mm a')}
                        </p>
                      </div>
                    ) : (
                      <p className="text-sm text-muted-foreground italic">
                        No AI summary available. Click "Generate Summary" to create one using AI.
                      </p>
                    )}
                  </div>
                </CardContent>
              </Card>
            );
          })}
        </div>
      )}
    </div>
  );
}