import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { useNavigate, useLocation } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Wand2, Zap, Clock, Dumbbell, X, Plus, RotateCcw, Save, GripVertical } from 'lucide-react';
import { Collapsible, CollapsibleContent, CollapsibleTrigger } from '@/components/ui/collapsible';
import { DndContext, closestCenter, KeyboardSensor, PointerSensor, useSensor, useSensors, DragEndEvent } from '@dnd-kit/core';
import { arrayMove, SortableContext, sortableKeyboardCoordinates, verticalListSortingStrategy } from '@dnd-kit/sortable';
import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';

interface BodyPart {
  id: string;
  name: string;
}

interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_body_part_id: string;
  is_machine_based?: boolean;
}

interface GeneratedSet {
  weight: number | null;
  unit: string;
  reps?: number;
  duration_sec?: number;
  rpe: number;
  rest_sec: number;
}

interface GeneratedExercise {
  name: string;
  body_part: string;
  is_machine_based: boolean;
  sets: GeneratedSet[];
}

interface GeneratedSession {
  estimated_duration_min: number;
  notes: string;
  exercises: GeneratedExercise[];
}

interface WorkoutFormData {
  bodyParts: string[];
  minutes: number;
  equipment: string[];
  intensity: number;
  notes: string;
  customBodyPart: string;
  // Advanced options
  minReps: number;
  maxReps: number;
  restTarget: number;
  allowSupersets: boolean;
}

const defaultFormData: WorkoutFormData = {
  bodyParts: [],
  minutes: 45,
  equipment: [],
  intensity: 3,
  notes: '',
  customBodyPart: '',
  minReps: 8,
  maxReps: 12,
  restTarget: 90,
  allowSupersets: false,
};

const BODY_PARTS = ['arms', 'back', 'chest', 'core', 'legs', 'shoulders'];
const EQUIPMENT_OPTIONS = [
  { id: 'machines', label: 'Machines' },
  { id: 'free_weights', label: 'Free Weights' },
  { id: 'cardio', label: 'Cardio Equipment' },
];

const INTENSITY_DESCRIPTIONS = {
  1: 'Light / Technique Focus',
  2: 'Light-Moderate',
  3: 'Moderate (Hypertrophy Base)',
  4: 'Challenging',
  5: 'Very Hard (Near-Limit Sets)',
};

// Sortable Exercise Component
function SortableExercise({ exercise, index, onEdit, onRemove }: {
  exercise: GeneratedExercise;
  index: number;
  onEdit: (index: number, updates: Partial<GeneratedExercise>) => void;
  onRemove: (index: number) => void;
}) {
  const { attributes, listeners, setNodeRef, transform, transition } = useSortable({
    id: `exercise-${index}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
  };

  return (
    <Card ref={setNodeRef} style={style} className="mb-4">
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="text-lg flex items-center gap-2">
            <GripVertical 
              className="h-4 w-4 text-muted-foreground cursor-grab" 
              {...attributes} 
              {...listeners}
            />
            {exercise.name}
            <Badge variant={exercise.is_machine_based ? "secondary" : "outline"}>
              {exercise.is_machine_based ? 'Machine' : 'Free Weight'}
            </Badge>
          </CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => onRemove(index)}
            className="text-destructive hover:text-destructive"
          >
            <X className="h-4 w-4" />
          </Button>
        </div>
      </CardHeader>
      <CardContent>
        <div className="space-y-3">
          {exercise.sets.map((set, setIndex) => (
            <div key={setIndex} className="border rounded p-3 space-y-2">
              <div className="flex justify-between items-center">
                <span className="font-medium">Set {setIndex + 1}</span>
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => {
                    const updatedSets = exercise.sets.filter((_, i) => i !== setIndex);
                    onEdit(index, { sets: updatedSets });
                  }}
                  className="text-destructive hover:text-destructive h-6 w-6 p-0"
                >
                  <X className="h-3 w-3" />
                </Button>
              </div>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                {set.duration_sec ? (
                  <div className="space-y-1">
                    <label className="text-xs text-muted-foreground">Duration</label>
                    <Input
                      type="number"
                      value={set.duration_sec}
                      onChange={(e) => {
                        const updatedSets = [...exercise.sets];
                        updatedSets[setIndex] = { ...set, duration_sec: parseInt(e.target.value) || 0 };
                        onEdit(index, { sets: updatedSets });
                      }}
                      className="h-8"
                      placeholder="30"
                    />
                    <span className="text-xs text-muted-foreground">seconds</span>
                  </div>
                ) : (
                  <>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Weight</label>
                      <Input
                        type="number"
                        value={set.weight || ''}
                        onChange={(e) => {
                          const updatedSets = [...exercise.sets];
                          updatedSets[setIndex] = { ...set, weight: parseFloat(e.target.value) || null };
                          onEdit(index, { sets: updatedSets });
                        }}
                        className="h-8"
                        placeholder="0"
                      />
                      <span className="text-xs text-muted-foreground">{set.unit}</span>
                    </div>
                    <div className="space-y-1">
                      <label className="text-xs text-muted-foreground">Reps</label>
                      <Input
                        type="number"
                        value={set.reps || ''}
                        onChange={(e) => {
                          const updatedSets = [...exercise.sets];
                          updatedSets[setIndex] = { ...set, reps: parseInt(e.target.value) || 0 };
                          onEdit(index, { sets: updatedSets });
                        }}
                        className="h-8"
                        placeholder="10"
                      />
                    </div>
                  </>
                )}
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">RPE</label>
                  <Input
                    type="number"
                    step="0.5"
                    min="1"
                    max="10"
                    value={set.rpe}
                    onChange={(e) => {
                      const updatedSets = [...exercise.sets];
                      updatedSets[setIndex] = { ...set, rpe: parseFloat(e.target.value) || 0 };
                      onEdit(index, { sets: updatedSets });
                    }}
                    className="h-8"
                    placeholder="7"
                  />
                </div>
                <div className="space-y-1">
                  <label className="text-xs text-muted-foreground">Rest</label>
                  <Input
                    type="number"
                    value={set.rest_sec}
                    onChange={(e) => {
                      const updatedSets = [...exercise.sets];
                      updatedSets[setIndex] = { ...set, rest_sec: parseInt(e.target.value) || 0 };
                      onEdit(index, { sets: updatedSets });
                    }}
                    className="h-8"
                    placeholder="90"
                  />
                  <span className="text-xs text-muted-foreground">seconds</span>
                </div>
              </div>
            </div>
          ))}
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              const newSet = {
                weight: null,
                unit: exercise.sets[0]?.unit || 'lb',
                reps: exercise.sets[0]?.duration_sec ? undefined : 10,
                duration_sec: exercise.sets[0]?.duration_sec ? 30 : undefined,
                rpe: 7,
                rest_sec: 90
              };
              onEdit(index, { sets: [...exercise.sets, newSet] });
            }}
            className="w-full"
          >
            <Plus className="h-4 w-4 mr-2" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}

export default function Generate() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();
  const { toast } = useToast();
  
  const [userProfile, setUserProfile] = useState<any>(null);
  const [bodyParts, setBodyParts] = useState<BodyPart[]>([]);
  const [formData, setFormData] = useState<WorkoutFormData>(defaultFormData);
  const [showAdvanced, setShowAdvanced] = useState(false);
  const [generatedSession, setGeneratedSession] = useState<GeneratedSession | null>(null);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  const sensors = useSensors(
    useSensor(PointerSensor),
    useSensor(KeyboardSensor, {
      coordinateGetter: sortableKeyboardCoordinates,
    })
  );

  useEffect(() => {
    if (user) {
      loadUserProfile();
      loadBodyParts();
      
      // Check if coming from history with pre-filled body parts
      const state = location.state as { bodyParts?: string[] };
      if (state?.bodyParts) {
        setFormData(prev => ({ ...prev, bodyParts: state.bodyParts }));
      }
    }
  }, [user, location.state]);

  const loadUserProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setUserProfile(data);
      
      // Check if user has Pro plan
      if (data?.plan !== 'pro') {
        toast({
          title: "Pro Feature",
          description: "AI workout generation is only available for Pro users.",
          variant: "destructive",
        });
        navigate('/');
        return;
      }
    } catch (error) {
      console.error('Error loading profile:', error);
    }
  };

  const loadBodyParts = async () => {
    try {
      const { data } = await supabase
        .from('body_parts')
        .select('*')
        .order('name');
      setBodyParts(data || []);
    } catch (error) {
      console.error('Error loading body parts:', error);
    }
  };

  const handleBodyPartToggle = (bodyPart: string) => {
    setFormData(prev => ({
      ...prev,
      bodyParts: prev.bodyParts.includes(bodyPart)
        ? prev.bodyParts.filter(bp => bp !== bodyPart)
        : [...prev.bodyParts, bodyPart]
    }));
  };

  const handleAddCustomBodyPart = () => {
    if (formData.customBodyPart.trim() && !formData.bodyParts.includes(formData.customBodyPart.trim())) {
      setFormData(prev => ({
        ...prev,
        bodyParts: [...prev.bodyParts, prev.customBodyPart.trim()],
        customBodyPart: ''
      }));
    }
  };

  const handleEquipmentToggle = (equipment: string) => {
    setFormData(prev => ({
      ...prev,
      equipment: prev.equipment.includes(equipment)
        ? prev.equipment.filter(eq => eq !== equipment)
        : [...prev.equipment, equipment]
    }));
  };

  const handleGenerate = async () => {
    if (formData.bodyParts.length === 0) {
      toast({
        title: "Validation Error",
        description: "Please select at least one body part.",
        variant: "destructive",
      });
      return;
    }

    if (formData.equipment.length === 0) {
      toast({
        title: "Validation Error", 
        description: "Please select at least one equipment type.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    try {
      const { data, error } = await supabase.functions.invoke('generate-workout', {
        body: {
          bodyParts: formData.bodyParts,
          minutes: formData.minutes,
          equipment: formData.equipment,
          intensity: formData.intensity,
          notes: formData.notes,
          preferences: {
            minReps: formData.minReps,
            maxReps: formData.maxReps,
            restTarget: formData.restTarget,
            allowSupersets: formData.allowSupersets,
          }
        }
      });

      if (error) {
        throw error;
      }

      if (data?.session) {
        setGeneratedSession(data.session);
        toast({
          title: "Workout Generated!",
          description: "Review and customize your workout below.",
        });
      } else {
        throw new Error('Invalid response format');
      }
    } catch (error) {
      console.error('Error generating workout:', error);
      toast({
        title: "Generation Failed",
        description: "Failed to generate workout. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleExerciseEdit = (index: number, updates: Partial<GeneratedExercise>) => {
    if (!generatedSession) return;
    
    const updatedExercises = [...generatedSession.exercises];
    updatedExercises[index] = { ...updatedExercises[index], ...updates };
    
    setGeneratedSession({
      ...generatedSession,
      exercises: updatedExercises
    });
  };

  const handleExerciseRemove = (index: number) => {
    if (!generatedSession) return;
    
    const updatedExercises = generatedSession.exercises.filter((_, i) => i !== index);
    setGeneratedSession({
      ...generatedSession,
      exercises: updatedExercises
    });
  };

  const handleDragEnd = (event: DragEndEvent) => {
    const { active, over } = event;

    if (active.id !== over?.id && generatedSession) {
      const activeIndex = parseInt(active.id.toString().split('-')[1]);
      const overIndex = parseInt(over!.id.toString().split('-')[1]);

      const updatedExercises = arrayMove(generatedSession.exercises, activeIndex, overIndex);
      setGeneratedSession({
        ...generatedSession,
        exercises: updatedExercises
      });
    }
  };

  const handleSaveToLog = async () => {
    if (!generatedSession || !user) return;

    setIsSaving(true);
    try {
      // Create workout session
      const { data: session, error: sessionError } = await supabase
        .from('workout_sessions')
        .insert({
          user_id: user.id,
          date: new Date().toISOString().split('T')[0],
          duration_min: generatedSession.estimated_duration_min,
          notes: generatedSession.notes
        })
        .select()
        .single();

      if (sessionError) throw sessionError;

      // Process each exercise
      for (let i = 0; i < generatedSession.exercises.length; i++) {
        const exercise = generatedSession.exercises[i];
        
        // Find or create exercise
        let { data: existingExercise } = await supabase
          .from('exercises')
          .select('id')
          .eq('name', exercise.name)
          .single();

        let exerciseId = existingExercise?.id;

        if (!exerciseId) {
          // Create new user-defined exercise
          const bodyPart = bodyParts.find(bp => bp.name.toLowerCase() === exercise.body_part.toLowerCase());
          const { data: newExercise, error: exerciseError } = await supabase
            .from('exercises')
            .insert({
              name: exercise.name,
              category: 'strength',
              primary_body_part_id: bodyPart?.id || bodyParts[0]?.id,
              is_machine_based: exercise.is_machine_based,
              is_user_defined: true,
              created_by_user_id: user.id
            })
            .select()
            .single();

          if (exerciseError) throw exerciseError;
          exerciseId = newExercise.id;
        }

        // Create workout exercise
        const { data: workoutExercise, error: workoutExerciseError } = await supabase
          .from('workout_exercises')
          .insert({
            session_id: session.id,
            exercise_id: exerciseId,
            sort_index: i
          })
          .select()
          .single();

        if (workoutExerciseError) throw workoutExerciseError;

        // Create workout sets
        for (let j = 0; j < exercise.sets.length; j++) {
          const set = exercise.sets[j];
          await supabase
            .from('workout_sets')
            .insert({
              workout_exercise_id: workoutExercise.id,
              set_index: j + 1,
              reps: set.reps,
              weight: set.weight,
              unit: (set.unit as 'kg' | 'lb') || 'kg',
              rpe: set.rpe,
              rest_sec: set.rest_sec
            });
        }
      }

      toast({
        title: "Workout Saved!",
        description: "Your workout plan has been saved to your log.",
      });

      navigate('/log');
    } catch (error) {
      console.error('Error saving workout:', error);
      toast({
        title: "Save Failed",
        description: "Failed to save workout to log. Please try again.",
        variant: "destructive",
      });
    } finally {
      setIsSaving(false);
    }
  };

  const resetForm = () => {
    setFormData(defaultFormData);
    setGeneratedSession(null);
  };

  const backToForm = () => {
    setGeneratedSession(null);
  };

  if (!userProfile || userProfile?.plan !== 'pro') {
    return (
      <div className="max-w-2xl mx-auto">
        <Card>
          <CardContent className="p-6">
            <div className="text-center">
              <Wand2 className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
              <h2 className="text-xl font-semibold mb-2">Pro Feature</h2>
              <p className="text-muted-foreground mb-4">
                AI workout generation is only available for Pro users.
              </p>
              <Button onClick={() => navigate('/')}>Go Back</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    );
  }

  if (generatedSession) {
    return (
      <div className="max-w-4xl mx-auto space-y-6">
        <div className="flex items-center justify-between">
          <h1 className="text-3xl font-bold">Generated Workout Plan</h1>
          <div className="flex gap-2">
            <Button variant="outline" onClick={backToForm}>
              Edit Inputs
            </Button>
            <Button variant="outline" onClick={handleGenerate} disabled={isGenerating}>
              {isGenerating ? 'Generating...' : 'Regenerate'}
            </Button>
          </div>
        </div>

        <Card>
          <CardHeader>
            <CardTitle>Workout Overview</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div className="text-center">
                <Clock className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Duration</p>
                <p className="font-semibold">{generatedSession.estimated_duration_min} min</p>
              </div>
              <div className="text-center">
                <Dumbbell className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Exercises</p>
                <p className="font-semibold">{generatedSession.exercises.length}</p>
              </div>
              <div className="text-center">
                <Zap className="h-6 w-6 mx-auto mb-2 text-primary" />
                <p className="text-sm text-muted-foreground">Body Parts</p>
                <p className="font-semibold">{formData.bodyParts.join(', ')}</p>
              </div>
            </div>
            {generatedSession.notes && (
              <p className="text-sm text-muted-foreground">{generatedSession.notes}</p>
            )}
          </CardContent>
        </Card>

        <div className="space-y-4">
          <h2 className="text-xl font-semibold">Exercises</h2>
          <DndContext 
            sensors={sensors}
            collisionDetection={closestCenter}
            onDragEnd={handleDragEnd}
          >
            <SortableContext 
              items={generatedSession.exercises.map((_, i) => `exercise-${i}`)}
              strategy={verticalListSortingStrategy}
            >
              {generatedSession.exercises.map((exercise, index) => (
                <SortableExercise
                  key={`exercise-${index}`}
                  exercise={exercise}
                  index={index}
                  onEdit={handleExerciseEdit}
                  onRemove={handleExerciseRemove}
                />
              ))}
            </SortableContext>
          </DndContext>
        </div>

        <div className="flex justify-end gap-4">
          <Button variant="outline" onClick={resetForm}>
            <RotateCcw className="h-4 w-4 mr-2" />
            Start Over
          </Button>
          <Button onClick={handleSaveToLog} disabled={isSaving}>
            <Save className="h-4 w-4 mr-2" />
            {isSaving ? 'Saving...' : 'Save to Workout Log'}
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <div className="text-center mb-8">
        <h1 className="text-3xl font-bold mb-2">Generate AI Workout</h1>
        <p className="text-muted-foreground">
          Create a personalized workout plan tailored to your goals and equipment
        </p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Wand2 className="h-5 w-5" />
            Workout Parameters
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Body Parts */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Target Body Parts *</Label>
            <div className="grid grid-cols-2 gap-2">
              {BODY_PARTS.map((bodyPart) => (
                <div key={bodyPart} className="flex items-center space-x-2">
                  <Checkbox
                    id={bodyPart}
                    checked={formData.bodyParts.includes(bodyPart)}
                    onCheckedChange={() => handleBodyPartToggle(bodyPart)}
                  />
                  <Label htmlFor={bodyPart} className="capitalize">{bodyPart}</Label>
                </div>
              ))}
            </div>
            <div className="flex gap-2">
              <Input
                placeholder="Add custom body part"
                value={formData.customBodyPart}
                onChange={(e) => setFormData(prev => ({ ...prev, customBodyPart: e.target.value }))}
                onKeyPress={(e) => e.key === 'Enter' && handleAddCustomBodyPart()}
              />
              <Button 
                type="button" 
                variant="outline" 
                size="sm"
                onClick={handleAddCustomBodyPart}
                disabled={!formData.customBodyPart.trim()}
              >
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            {formData.bodyParts.length > 0 && (
              <div className="flex flex-wrap gap-1">
                {formData.bodyParts.map((bodyPart) => (
                  <Badge 
                    key={bodyPart} 
                    variant="secondary"
                    className="cursor-pointer"
                    onClick={() => handleBodyPartToggle(bodyPart)}
                  >
                    {bodyPart} <X className="h-3 w-3 ml-1" />
                  </Badge>
                ))}
              </div>
            )}
          </div>

          {/* Workout Length */}
          <div className="space-y-2">
            <Label htmlFor="minutes">Workout Length (minutes) *</Label>
            <Input
              id="minutes"
              type="number"
              min="10"
              max="180"
              value={formData.minutes}
              onChange={(e) => setFormData(prev => ({ ...prev, minutes: parseInt(e.target.value) || 45 }))}
            />
          </div>

          {/* Equipment */}
          <div className="space-y-3">
            <Label className="text-sm font-medium">Available Equipment *</Label>
            <div className="space-y-2">
              {EQUIPMENT_OPTIONS.map((equipment) => (
                <div key={equipment.id} className="flex items-center space-x-2">
                  <Checkbox
                    id={equipment.id}
                    checked={formData.equipment.includes(equipment.id)}
                    onCheckedChange={() => handleEquipmentToggle(equipment.id)}
                  />
                  <Label htmlFor={equipment.id}>{equipment.label}</Label>
                </div>
              ))}
            </div>
          </div>

          {/* Intensity */}
          <div className="space-y-2">
            <Label htmlFor="intensity">Intensity Level *</Label>
            <Select value={formData.intensity.toString()} onValueChange={(value) => setFormData(prev => ({ ...prev, intensity: parseInt(value) }))}>
              <SelectTrigger>
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {Object.entries(INTENSITY_DESCRIPTIONS).map(([level, description]) => (
                  <SelectItem key={level} value={level}>
                    {level} - {description}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Notes */}
          <div className="space-y-2">
            <Label htmlFor="notes">Constraints/Notes (Optional)</Label>
            <Textarea
              id="notes"
              placeholder="e.g., no overhead pressing due to shoulder issue, prefer dumbbells..."
              value={formData.notes}
              onChange={(e) => setFormData(prev => ({ ...prev, notes: e.target.value }))}
              rows={3}
            />
          </div>

          {/* Advanced Options */}
          <Collapsible open={showAdvanced} onOpenChange={setShowAdvanced}>
            <CollapsibleTrigger asChild>
              <Button variant="ghost" className="w-full justify-between">
                Advanced Options
                <Plus className={`h-4 w-4 transition-transform ${showAdvanced ? 'rotate-45' : ''}`} />
              </Button>
            </CollapsibleTrigger>
            <CollapsibleContent className="space-y-4 pt-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="minReps">Min Reps</Label>
                  <Input
                    id="minReps"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.minReps}
                    onChange={(e) => setFormData(prev => ({ ...prev, minReps: parseInt(e.target.value) || 8 }))}
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="maxReps">Max Reps</Label>
                  <Input
                    id="maxReps"
                    type="number"
                    min="1"
                    max="30"
                    value={formData.maxReps}
                    onChange={(e) => setFormData(prev => ({ ...prev, maxReps: parseInt(e.target.value) || 12 }))}
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label htmlFor="restTarget">Target Rest Time (seconds)</Label>
                <Input
                  id="restTarget"
                  type="number"
                  min="30"
                  max="300"
                  value={formData.restTarget}
                  onChange={(e) => setFormData(prev => ({ ...prev, restTarget: parseInt(e.target.value) || 90 }))}
                />
              </div>
              <div className="flex items-center space-x-2">
                <Checkbox
                  id="allowSupersets"
                  checked={formData.allowSupersets}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, allowSupersets: !!checked }))}
                />
                <Label htmlFor="allowSupersets">Allow Supersets</Label>
              </div>
            </CollapsibleContent>
          </Collapsible>
        </CardContent>
      </Card>

      <div className="flex gap-4">
        <Button variant="outline" onClick={resetForm} className="flex-1">
          <RotateCcw className="h-4 w-4 mr-2" />
          Reset
        </Button>
        <Button onClick={handleGenerate} disabled={isGenerating} className="flex-1">
          <Wand2 className="h-4 w-4 mr-2" />
          {isGenerating ? 'Generating...' : 'Generate Workout'}
        </Button>
      </div>
    </div>
  );
}