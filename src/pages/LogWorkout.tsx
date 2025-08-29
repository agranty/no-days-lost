import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Plus, Trash2, Save } from 'lucide-react';

interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_body_part_id: string;
  is_machine_based: boolean;
}

interface WorkoutSet {
  id?: string;
  set_index: number;
  weight?: number;
  unit?: string;
  reps?: number;
  rir?: number;
  tempo?: string;
  machine_setting?: string;
  distance_m?: number;
  duration_sec?: number;
  avg_hr_bpm?: number;
}

interface WorkoutExercise {
  id?: string;
  exercise_id: string;
  exercise?: Exercise;
  sort_index: number;
  sets: WorkoutSet[];
}

export default function LogWorkout() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [perceivedExertion, setPerceivedExertion] = useState<number>(5);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    loadExercises();
    createNewSession();
  }, []);

  const loadExercises = async () => {
    const { data, error } = await supabase
      .from('exercises')
      .select('*')
      .order('name');

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading exercises',
        description: error.message,
      });
    } else {
      setExercises(data || []);
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        date: new Date().toISOString().split('T')[0],
      })
      .select()
      .single();

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error creating session',
        description: error.message,
      });
    } else {
      setSessionId(data.id);
    }
  };

  const addExercise = (exerciseId: string) => {
    const exercise = exercises.find(e => e.id === exerciseId);
    if (!exercise) return;

    const newWorkoutExercise: WorkoutExercise = {
      exercise_id: exerciseId,
      exercise,
      sort_index: workoutExercises.length,
      sets: [createEmptySet(0)],
    };

    setWorkoutExercises([...workoutExercises, newWorkoutExercise]);
  };

  const createEmptySet = (setIndex: number): WorkoutSet => ({
    set_index: setIndex + 1,
    weight: undefined,
    unit: 'kg',
    reps: undefined,
    rir: undefined,
    tempo: '',
    machine_setting: '',
    distance_m: undefined,
    duration_sec: undefined,
    avg_hr_bpm: undefined,
  });

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...workoutExercises];
    const exercise = updatedExercises[exerciseIndex];
    const newSet = createEmptySet(exercise.sets.length);
    exercise.sets.push(newSet);
    setWorkoutExercises(updatedExercises);
  };

  const updateSet = (exerciseIndex: number, setIndex: number, field: string, value: any) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets[setIndex] = {
      ...updatedExercises[exerciseIndex].sets[setIndex],
      [field]: value,
    };
    setWorkoutExercises(updatedExercises);
  };

  const removeExercise = (exerciseIndex: number) => {
    const updatedExercises = workoutExercises.filter((_, index) => index !== exerciseIndex);
    setWorkoutExercises(updatedExercises);
  };

  const removeSet = (exerciseIndex: number, setIndex: number) => {
    const updatedExercises = [...workoutExercises];
    updatedExercises[exerciseIndex].sets = updatedExercises[exerciseIndex].sets.filter(
      (_, index) => index !== setIndex
    );
    // Reindex the remaining sets
    updatedExercises[exerciseIndex].sets.forEach((set, index) => {
      set.set_index = index + 1;
    });
    setWorkoutExercises(updatedExercises);
  };

  const saveWorkout = async () => {
    if (!sessionId || !user) return;

    setLoading(true);

    try {
      // Update session with notes and perceived exertion
      await supabase
        .from('workout_sessions')
        .update({
          notes,
          perceived_exertion: perceivedExertion,
          end_time: new Date().toTimeString().split(' ')[0],
        })
        .eq('id', sessionId);

      // Save workout exercises and sets
      for (const workoutExercise of workoutExercises) {
        const { data: exerciseData, error: exerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            session_id: sessionId,
            exercise_id: workoutExercise.exercise_id,
            sort_index: workoutExercise.sort_index,
          })
          .select()
          .single();

        if (exerciseError) throw exerciseError;

        // Save sets
        for (const set of workoutExercise.sets) {
          const setData: any = {
            workout_exercise_id: exerciseData.id,
            set_index: set.set_index,
            weight: set.weight || null,
            unit: set.unit as 'kg' | 'lb' | null,
            reps: set.reps || null,
            rir: set.rir || null,
            tempo: set.tempo || null,
            machine_setting: set.machine_setting || null,
            distance_m: set.distance_m || null,
            duration_sec: set.duration_sec || null,
            avg_hr_bpm: set.avg_hr_bpm || null,
          };

          // Calculate estimated 1RM for strength exercises
          if (set.weight && set.reps && workoutExercise.exercise?.category === 'strength') {
            setData.estimated_1rm = set.weight * (1 + set.reps / 30);
          }

          const { error: setError } = await supabase
            .from('workout_sets')
            .insert(setData);

          if (setError) throw setError;
        }
      }

      toast({
        title: 'Workout saved!',
        description: 'Your workout has been logged successfully.',
      });

      // Reset form
      setWorkoutExercises([]);
      setNotes('');
      setPerceivedExertion(5);
      createNewSession();

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error saving workout',
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h1 className="text-3xl font-bold">Log Workout</h1>
        <Button onClick={saveWorkout} disabled={loading || workoutExercises.length === 0}>
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>

      {/* Exercise Selector */}
      <Card>
        <CardHeader>
          <CardTitle>Add Exercise</CardTitle>
        </CardHeader>
        <CardContent>
          <Select onValueChange={addExercise}>
            <SelectTrigger>
              <SelectValue placeholder="Select an exercise..." />
            </SelectTrigger>
            <SelectContent>
              {exercises.map((exercise) => (
                <SelectItem key={exercise.id} value={exercise.id}>
                  {exercise.name} 
                  <Badge variant="secondary" className="ml-2">
                    {exercise.category}
                  </Badge>
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </CardContent>
      </Card>

      {/* Workout Exercises */}
      {workoutExercises.map((workoutExercise, exerciseIndex) => (
        <Card key={exerciseIndex}>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                {workoutExercise.exercise?.name}
                <Badge variant="outline">
                  {workoutExercise.exercise?.category}
                </Badge>
              </CardTitle>
              <Button
                variant="destructive"
                size="sm"
                onClick={() => removeExercise(exerciseIndex)}
              >
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {/* Sets Table */}
              <div className="overflow-x-auto">
                <table className="w-full text-sm">
                  <thead>
                    <tr className="border-b">
                      <th className="text-left p-2">Set</th>
                      {workoutExercise.exercise?.category === 'strength' ? (
                        <>
                          <th className="text-left p-2">Weight</th>
                          <th className="text-left p-2">Reps</th>
                          <th className="text-left p-2">RIR</th>
                          <th className="text-left p-2">Tempo</th>
                          {workoutExercise.exercise?.is_machine_based && (
                            <th className="text-left p-2">Machine Setting</th>
                          )}
                        </>
                      ) : (
                        <>
                          <th className="text-left p-2">Distance (m)</th>
                          <th className="text-left p-2">Duration (sec)</th>
                          <th className="text-left p-2">Avg HR</th>
                        </>
                      )}
                      <th className="text-left p-2">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {workoutExercise.sets.map((set, setIndex) => (
                      <tr key={setIndex} className="border-b">
                        <td className="p-2">{set.set_index}</td>
                        {workoutExercise.exercise?.category === 'strength' ? (
                          <>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={set.weight || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || undefined)}
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={set.reps || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || undefined)}
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={set.rir || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'rir', parseInt(e.target.value) || undefined)}
                                className="w-20"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.tempo || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'tempo', e.target.value)}
                                className="w-24"
                                placeholder="3-1-2-0"
                              />
                            </td>
                            {workoutExercise.exercise?.is_machine_based && (
                              <td className="p-2">
                                <Input
                                  value={set.machine_setting || ''}
                                  onChange={(e) => updateSet(exerciseIndex, setIndex, 'machine_setting', e.target.value)}
                                  className="w-24"
                                />
                              </td>
                            )}
                          </>
                        ) : (
                          <>
                            <td className="p-2">
                              <Input
                                type="number"
                                step="0.1"
                                value={set.distance_m || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'distance_m', parseFloat(e.target.value) || undefined)}
                                className="w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={set.duration_sec || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'duration_sec', parseInt(e.target.value) || undefined)}
                                className="w-24"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                type="number"
                                value={set.avg_hr_bpm || ''}
                                onChange={(e) => updateSet(exerciseIndex, setIndex, 'avg_hr_bpm', parseInt(e.target.value) || undefined)}
                                className="w-20"
                              />
                            </td>
                          </>
                        )}
                        <td className="p-2">
                          <Button
                            variant="destructive"
                            size="sm"
                            onClick={() => removeSet(exerciseIndex, setIndex)}
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
              
              <Button onClick={() => addSet(exerciseIndex)} variant="outline" size="sm">
                <Plus className="mr-2 h-4 w-4" />
                Add Set
              </Button>
            </div>
          </CardContent>
        </Card>
      ))}

      {/* Session Notes */}
      <Card>
        <CardHeader>
          <CardTitle>Session Notes</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div>
            <Label htmlFor="perceived-exertion">Perceived Exertion (1-10)</Label>
            <Select
              value={perceivedExertion.toString()}
              onValueChange={(value) => setPerceivedExertion(parseInt(value))}
            >
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {[1, 2, 3, 4, 5, 6, 7, 8, 9, 10].map((num) => (
                  <SelectItem key={num} value={num.toString()}>
                    {num}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          
          <div>
            <Label htmlFor="notes">Notes</Label>
            <Textarea
              id="notes"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="How did the workout feel? Any observations..."
            />
          </div>
        </CardContent>
      </Card>
    </div>
  );
}