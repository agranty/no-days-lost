import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save } from 'lucide-react';
import {
  DndContext,
  closestCenter,
  KeyboardSensor,
  PointerSensor,
  useSensor,
  useSensors,
  DragEndEvent,
} from '@dnd-kit/core';
import {
  arrayMove,
  SortableContext,
  sortableKeyboardCoordinates,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import WorkoutHeader from '@/components/workout/WorkoutHeader';
import ExerciseSelector from '@/components/workout/ExerciseSelector';
import DraggableExerciseCard from '@/components/workout/DraggableExerciseCard';
import SessionNotes from '@/components/workout/SessionNotes';

interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_body_part_id: string;
  is_machine_based: boolean;
}

interface BodyPart {
  id: string;
  name: string;
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
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [perceivedExertion, setPerceivedExertion] = useState<number>(5);
  const [loading, setLoading] = useState(false);
  
  // New state for workout details
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [workoutType, setWorkoutType] = useState<string>('');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    loadExercises();
    loadBodyParts();
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

  const loadBodyParts = async () => {
    const { data, error } = await supabase
      .from('body_parts')
      .select('*')
      .order('name');

    if (error) {
      toast({
        variant: 'destructive',
        title: 'Error loading body parts',
        description: error.message,
      });
    } else {
      setBodyParts(data || []);
    }
  };

  const createNewSession = async () => {
    if (!user) return;

    const { data, error } = await supabase
      .from('workout_sessions')
      .insert({
        user_id: user.id,
        date: workoutDate.toISOString().split('T')[0],
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

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id) {
      setWorkoutExercises((exercises) => {
        const activeIndex = exercises.findIndex((_, index) => `exercise-${index}` === active.id);
        const overIndex = exercises.findIndex((_, index) => `exercise-${index}` === over?.id);

        const reorderedExercises = arrayMove(exercises, activeIndex, overIndex);
        
        // Update sort_index to match new order
        return reorderedExercises.map((exercise, index) => ({
          ...exercise,
          sort_index: index,
        }));
      });
    }
  };

  // Filter exercises based on selected body parts and workout type
  const filteredExercises = exercises.filter(exercise => {
    const matchesBodyPart = selectedBodyParts.length === 0 || 
      selectedBodyParts.includes(exercise.primary_body_part_id);
    const matchesWorkoutType = workoutType === '' || workoutType === 'mixed' || 
      exercise.category === workoutType;
    return matchesBodyPart && matchesWorkoutType;
  });

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
          date: workoutDate.toISOString().split('T')[0],
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
      setWorkoutDate(new Date());
      setWorkoutType('');
      setSelectedBodyParts([]);
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

      {/* Workout Header with Date, Type, and Body Parts */}
      <WorkoutHeader
        date={workoutDate}
        onDateChange={(date) => date && setWorkoutDate(date)}
        workoutType={workoutType}
        onWorkoutTypeChange={setWorkoutType}
        selectedBodyParts={selectedBodyParts}
        onBodyPartsChange={setSelectedBodyParts}
        bodyParts={bodyParts}
      />

      {/* Exercise Selector - now filtered */}
      <ExerciseSelector
        exercises={filteredExercises}
        onSelectExercise={addExercise}
      />

      {/* Draggable Workout Exercises */}
      <DndContext
        sensors={sensors}
        collisionDetection={closestCenter}
        onDragEnd={handleDragEnd}
      >
        <SortableContext
          items={workoutExercises.map((_, index) => `exercise-${index}`)}
          strategy={verticalListSortingStrategy}
        >
          {workoutExercises.map((workoutExercise, exerciseIndex) => (
            <DraggableExerciseCard
              key={exerciseIndex}
              workoutExercise={workoutExercise}
              exerciseIndex={exerciseIndex}
              onRemoveExercise={removeExercise}
              onAddSet={addSet}
              onRemoveSet={removeSet}
              onUpdateSet={updateSet}
            />
          ))}
        </SortableContext>
      </DndContext>

      {/* Session Notes */}
      <SessionNotes
        notes={notes}
        onNotesChange={setNotes}
        perceivedExertion={perceivedExertion}
        onPerceivedExertionChange={setPerceivedExertion}
      />
    </div>
  );
}