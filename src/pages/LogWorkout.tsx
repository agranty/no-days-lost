import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Card } from '@/components/ui/card';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { Save, Dumbbell } from 'lucide-react';
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
import WorkoutDuration from '@/components/workout/WorkoutDuration';
import { MindsetTracker } from '@/components/MindsetTracker';
import { ProFeatureOverlay, useProAccess } from '@/components/ProFeatureOverlay';
import { ResponsiveDate } from '@/components/ui/responsive-date';
import { ResponsiveLabel } from '@/components/ui/responsive-label';

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
  rpe?: number;
  rest_sec?: number;
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
  const navigate = useNavigate();
  const { toast } = useToast();
  const { hasProAccess } = useProAccess();
  const [exercises, setExercises] = useState<Exercise[]>([]);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [workoutExercises, setWorkoutExercises] = useState<WorkoutExercise[]>([]);
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [notes, setNotes] = useState('');
  const [perceivedExertion, setPerceivedExertion] = useState<number>(5);
  const [mindset, setMindset] = useState<number>(2);
  const [loading, setLoading] = useState(false);
  
  // New state for workout details
  const [workoutDate, setWorkoutDate] = useState<Date>(new Date());
  const [workoutType, setWorkoutType] = useState<string>('');
  const [selectedBodyParts, setSelectedBodyParts] = useState<string[]>([]);
  const [workoutDuration, setWorkoutDuration] = useState<number | undefined>(undefined);

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
    unit: 'lb',
    reps: undefined,
    rpe: undefined,
    rest_sec: undefined,
    machine_setting: '',
    distance_m: undefined,
    duration_sec: undefined,
    avg_hr_bpm: undefined,
  });

  const addSet = (exerciseIndex: number) => {
    const updatedExercises = [...workoutExercises];
    const exercise = updatedExercises[exerciseIndex];
    
    // Auto-duplicate previous set values if available
    const previousSet = exercise.sets[exercise.sets.length - 1];
    const newSet = previousSet ? {
      ...previousSet,
      set_index: exercise.sets.length + 1,
      id: undefined // Remove ID so it creates a new set
    } : createEmptySet(exercise.sets.length);
    
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
          duration_min: workoutDuration || null,
          tags: [mindset.toString()], // Store mindset in tags for now
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
            rpe: set.rpe || null,
            rest_sec: set.rest_sec || null,
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
      setMindset(2);
      setWorkoutDate(new Date());
      setWorkoutType('');
      setSelectedBodyParts([]);
      setWorkoutDuration(undefined);
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
    <div className="space-y-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Add Workout</h1>
          <p className="text-muted-foreground text-lg">Track your training session</p>
        </div>
        <Button 
          onClick={saveWorkout} 
          disabled={loading || workoutExercises.length === 0}
          size="lg"
          className="h-11 px-6"
        >
          <Save className="mr-2 h-4 w-4" />
          {loading ? 'Saving...' : 'Save Workout'}
        </Button>
      </div>

      {/* Generate Workout Button at Top */}
      <Card className="p-4 bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-primary/10 p-2">
              <Dumbbell className="h-5 w-5 text-primary" />
            </div>
            <div>
              <h3 className="font-semibold">Need workout ideas?</h3>
              <p className="text-sm text-muted-foreground">Let AI create a personalized workout for you</p>
            </div>
          </div>
          {hasProAccess ? (
            <Button onClick={() => navigate('/generate')} variant="outline">
              <Dumbbell className="mr-2 h-4 w-4" />
              Generate Workout
            </Button>
          ) : (
            <div className="relative">
              <Button onClick={() => navigate('/upgrade')} variant="outline" className="relative">
                <Dumbbell className="mr-2 h-4 w-4" />
                Generate Workout
                <div className="absolute -top-1 -right-1 bg-primary text-white text-xs px-1 rounded-full">
                  Pro
                </div>
              </Button>
            </div>
          )}
        </div>
      </Card>

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

      {/* AI Workout CTA for empty state */}
      {workoutExercises.length === 0 && (
        <Card className="p-6 border-dashed border-2 border-primary/20 bg-primary/5">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto">
              <Dumbbell className="h-8 w-8 text-primary" />
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2">No exercises added yet</h3>
              <p className="text-muted-foreground mb-4">
                Add exercises manually or let AI create a personalized workout for you
              </p>
              <Button onClick={() => navigate('/generate')} variant="outline" size="lg">
                <Dumbbell className="mr-2 h-4 w-4" />
                Generate AI Workout
              </Button>
            </div>
          </div>
        </Card>
      )}

      {/* Exercise Selector - now filtered */}
      <ExerciseSelector
        exercises={filteredExercises}
        bodyParts={bodyParts}
        selectedBodyPart={selectedBodyParts[0]}
        onSelectExercise={addExercise}
        onExerciseCreated={loadExercises}
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

      {/* Workout Duration */}
      <WorkoutDuration
        duration={workoutDuration}
        onDurationChange={setWorkoutDuration}
      />

      {/* Mindset Tracker */}
      <MindsetTracker
        mindset={mindset}
        onMindsetChange={setMindset}
      />

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