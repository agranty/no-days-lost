import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';
import { Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';

interface ExerciseData {
  id: string;
  name: string;
}

interface StrengthDataPoint {
  date: string;
  oneRM: number;
  topSetWeight: number;
  topSetReps: number;
  volume: number;
  isPR: boolean;
}

export default function StrengthTab() {
  const [exercises, setExercises] = useState<ExerciseData[]>([]);
  const [selectedExercise, setSelectedExercise] = useState<string>('');
  const [strengthData, setStrengthData] = useState<StrengthDataPoint[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadExercises();
    }
  }, [user]);

  useEffect(() => {
    if (selectedExercise) {
      loadStrengthData(selectedExercise);
    }
  }, [selectedExercise]);

  const loadExercises = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_exercises')
        .select(`
          exercises!inner(id, name)
        `)
        .eq('session_id', user!.id)
        .limit(1000);

      if (error) throw error;

      // Get unique exercises
      const uniqueExercises = new Map();
      data?.forEach(item => {
        if (item.exercises) {
          uniqueExercises.set(item.exercises.id, {
            id: item.exercises.id,
            name: item.exercises.name
          });
        }
      });

      const exerciseList = Array.from(uniqueExercises.values());
      setExercises(exerciseList);
      
      if (exerciseList.length > 0 && !selectedExercise) {
        setSelectedExercise(exerciseList[0].id);
      }
    } catch (error) {
      console.error('Error loading exercises:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadStrengthData = async (exerciseId: string) => {
    try {
      const { data, error } = await supabase
        .from('workout_sets')
        .select(`
          weight,
          reps,
          estimated_1rm,
          workout_exercises!inner(
            session_id,
            exercise_id,
            workout_sessions!inner(date, user_id)
          )
        `)
        .eq('workout_exercises.exercise_id', exerciseId)
        .eq('workout_exercises.workout_sessions.user_id', user!.id)
        .not('weight', 'is', null)
        .not('reps', 'is', null)
        .order('workout_exercises.workout_sessions.date', { ascending: true });

      if (error) throw error;

      // Group by session date and calculate metrics
      const sessionMap = new Map<string, {
        date: string;
        sets: Array<{ weight: number; reps: number; estimated_1rm?: number }>;
      }>();

      data?.forEach(set => {
        const session = set.workout_exercises?.workout_sessions;
        if (session && set.weight && set.reps) {
          const date = session.date;
          if (!sessionMap.has(date)) {
            sessionMap.set(date, { date, sets: [] });
          }
          sessionMap.get(date)!.sets.push({
            weight: set.weight,
            reps: set.reps,
            estimated_1rm: set.estimated_1rm || undefined
          });
        }
      });

      // Calculate metrics for each session
      const chartData: StrengthDataPoint[] = [];
      let bestOneRM = 0;
      let bestTopSet = { weight: 0, reps: 0 };

      Array.from(sessionMap.values()).forEach(session => {
        const topSet = session.sets.reduce((max, set) => 
          (set.weight * set.reps) > (max.weight * max.reps) ? set : max
        );

        const oneRM = Math.max(...session.sets.map(set => 
          set.estimated_1rm || (set.weight * (1 + set.reps / 30))
        ));

        const volume = session.sets.reduce((sum, set) => sum + (set.weight * set.reps), 0);

        const isOneRMPR = oneRM > bestOneRM;
        const isTopSetPR = (topSet.weight * topSet.reps) > (bestTopSet.weight * bestTopSet.reps);

        if (isOneRMPR) bestOneRM = oneRM;
        if (isTopSetPR) bestTopSet = topSet;

        chartData.push({
          date: session.date,
          oneRM: Math.round(oneRM * 10) / 10,
          topSetWeight: Math.round(topSet.weight * 10) / 10,
          topSetReps: topSet.reps,
          volume: Math.round(volume),
          isPR: isOneRMPR || isTopSetPR
        });
      });

      setStrengthData(chartData);
    } catch (error) {
      console.error('Error loading strength data:', error);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading exercises...</div>
      </div>
    );
  }

  if (exercises.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <p className="text-muted-foreground">No strength exercises found. Start logging workouts to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  const selectedExerciseName = exercises.find(e => e.id === selectedExercise)?.name || '';
  const prCount = strengthData.filter(d => d.isPR).length;
  const latestOneRM = strengthData[strengthData.length - 1]?.oneRM || 0;
  const firstOneRM = strengthData[0]?.oneRM || 0;
  const oneRMProgress = firstOneRM > 0 ? ((latestOneRM - firstOneRM) / firstOneRM * 100) : 0;

  return (
    <div className="space-y-6">
      {/* Exercise Selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Exercise Analysis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <Select value={selectedExercise} onValueChange={setSelectedExercise}>
            <SelectTrigger className="w-full">
              <SelectValue placeholder="Select an exercise" />
            </SelectTrigger>
            <SelectContent>
              {exercises.map(exercise => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {strengthData.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">No data found for {selectedExerciseName}</p>
          </CardContent>
        </Card>
      ) : (
        <>
          {/* Summary Cards */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <Card>
              <CardContent className="p-4">
                <div className="flex items-center gap-2">
                  <Trophy className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm font-medium">PRs Set</span>
                </div>
                <div className="text-2xl font-bold">{prCount}</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Current Est. 1RM</div>
                <div className="text-2xl font-bold">{latestOneRM.toFixed(1)} kg</div>
              </CardContent>
            </Card>
            <Card>
              <CardContent className="p-4">
                <div className="text-sm font-medium text-muted-foreground">Progress</div>
                <div className="text-2xl font-bold text-green-600">
                  +{oneRMProgress.toFixed(1)}%
                </div>
              </CardContent>
            </Card>
          </div>

          {/* 1RM Progress Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Estimated 1RM Progress - {selectedExerciseName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-80">
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                    />
                    <YAxis 
                      label={{ value: 'Weight (kg)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                      formatter={(value, name) => [
                        `${Number(value).toFixed(1)} kg`,
                        name === 'oneRM' ? 'Est. 1RM' : name
                      ]}
                    />
                    <Line 
                      type="monotone" 
                      dataKey="oneRM" 
                      stroke="hsl(var(--primary))" 
                      strokeWidth={2}
                      dot={(props) => {
                        const { cx, cy, payload } = props;
                        return payload?.isPR ? (
                          <Trophy 
                            x={cx - 6} 
                            y={cy - 6} 
                            className="h-3 w-3 fill-yellow-500 stroke-yellow-600" 
                          />
                        ) : (
                          <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />
                        );
                      }}
                    />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* Volume Chart */}
          <Card>
            <CardHeader>
              <CardTitle>Training Volume - {selectedExerciseName}</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="h-64">
                <ResponsiveContainer width="100%" height="100%">
                  <BarChart data={strengthData}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis 
                      dataKey="date"
                      tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                    />
                    <YAxis 
                      label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }}
                    />
                    <Tooltip 
                      labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                      formatter={(value) => [`${value} kg`, 'Volume']}
                    />
                    <Bar 
                      dataKey="volume" 
                      fill="hsl(var(--primary))" 
                      opacity={0.8}
                    />
                  </BarChart>
                </ResponsiveContainer>
              </div>
            </CardContent>
          </Card>

          {/* PR Highlights */}
          {prCount > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Trophy className="h-5 w-5 text-yellow-500" />
                  Recent PRs
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {strengthData
                    .filter(d => d.isPR)
                    .slice(-5)
                    .map((pr, index) => (
                      <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                        <div>
                          <div className="font-medium">
                            {format(parseISO(pr.date), 'MMM dd, yyyy')}
                          </div>
                          <div className="text-sm text-muted-foreground">
                            Est. 1RM: {pr.oneRM.toFixed(1)} kg • Top Set: {pr.topSetWeight.toFixed(1)}×{pr.topSetReps}
                          </div>
                        </div>
                        <Badge variant="secondary" className="text-yellow-600">
                          <Trophy className="h-3 w-3 mr-1" />
                          PR
                        </Badge>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          )}
        </>
      )}
    </div>
  );
}