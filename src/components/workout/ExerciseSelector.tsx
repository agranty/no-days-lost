import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog';
import { Label } from '@/components/ui/label';
import { Plus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useToast } from '@/hooks/use-toast';

interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_body_part_id: string;
  is_user_defined?: boolean;
}

interface BodyPart {
  id: string;
  name: string;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  bodyParts: BodyPart[];
  selectedBodyPart?: string;
  onSelectExercise: (exerciseId: string) => void;
  onExerciseCreated: () => void;
}

export default function ExerciseSelector({ 
  exercises, 
  bodyParts, 
  selectedBodyPart,
  onSelectExercise, 
  onExerciseCreated 
}: ExerciseSelectorProps) {
  const { user } = useAuth();
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [newExerciseName, setNewExerciseName] = useState('');
  const [newExerciseBodyPart, setNewExerciseBodyPart] = useState(selectedBodyPart || '');
  const [creating, setCreating] = useState(false);

  // Group exercises by body part
  const exercisesByBodyPart = exercises.reduce((acc, exercise) => {
    const bodyPart = bodyParts.find(bp => bp.id === exercise.primary_body_part_id);
    const bodyPartName = bodyPart?.name || 'Unknown';
    
    if (!acc[bodyPartName]) {
      acc[bodyPartName] = [];
    }
    acc[bodyPartName].push(exercise);
    return acc;
  }, {} as Record<string, Exercise[]>);

  const handleCreateCustomExercise = async () => {
    if (!user || !newExerciseName.trim() || !newExerciseBodyPart) {
      toast({
        variant: 'destructive',
        title: 'Missing information',
        description: 'Please fill in all fields to create a custom exercise.',
      });
      return;
    }

    setCreating(true);

    try {
      const { data, error } = await supabase
        .from('exercises')
        .insert({
          name: newExerciseName.trim(),
          category: 'strength',
          primary_body_part_id: newExerciseBodyPart,
          is_user_defined: true,
          created_by_user_id: user.id,
        })
        .select()
        .single();

      if (error) throw error;

      toast({
        title: 'Exercise created!',
        description: `"${newExerciseName}" has been added to your exercises.`,
      });

      // Reset form and close dialog
      setNewExerciseName('');
      setNewExerciseBodyPart(selectedBodyPart || '');
      setIsDialogOpen(false);
      
      // Refresh exercises list
      onExerciseCreated();

      // Auto-select the new exercise
      onSelectExercise(data.id);

    } catch (error: any) {
      toast({
        variant: 'destructive',
        title: 'Error creating exercise',
        description: error.message,
      });
    } finally {
      setCreating(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Exercise</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <Select onValueChange={onSelectExercise}>
          <SelectTrigger>
            <SelectValue placeholder="Select an exercise..." />
          </SelectTrigger>
          <SelectContent>
            {Object.entries(exercisesByBodyPart)
              .sort(([a], [b]) => a.localeCompare(b))
              .map(([bodyPartName, bodyPartExercises]) => (
                <div key={bodyPartName}>
                  <div className="px-2 py-1.5 text-sm font-semibold text-muted-foreground capitalize">
                    {bodyPartName}
                  </div>
                  {bodyPartExercises
                    .sort((a, b) => a.name.localeCompare(b.name))
                    .map((exercise) => (
                      <SelectItem key={exercise.id} value={exercise.id}>
                        <div className="flex items-center justify-between w-full">
                          <span>{exercise.name}</span>
                          <div className="flex gap-1 ml-2">
                            {exercise.is_user_defined && (
                              <Badge variant="outline" className="text-xs">
                                Custom
                              </Badge>
                            )}
                            <Badge variant="secondary" className="text-xs">
                              {exercise.category}
                            </Badge>
                          </div>
                        </div>
                      </SelectItem>
                    ))}
                </div>
              ))}
          </SelectContent>
        </Select>

        <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
          <DialogTrigger asChild>
            <Button variant="outline" className="w-full">
              <Plus className="mr-2 h-4 w-4" />
              Add Custom Exercise
            </Button>
          </DialogTrigger>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Create Custom Exercise</DialogTitle>
              <DialogDescription>
                Add a new exercise that will be saved for future workouts.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4 py-4">
              <div>
                <Label htmlFor="exercise-name">Exercise Name</Label>
                <Input
                  id="exercise-name"
                  value={newExerciseName}
                  onChange={(e) => setNewExerciseName(e.target.value)}
                  placeholder="Enter exercise name..."
                />
              </div>
              <div>
                <Label htmlFor="body-part">Body Part</Label>
                <Select value={newExerciseBodyPart} onValueChange={setNewExerciseBodyPart}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select body part..." />
                  </SelectTrigger>
                  <SelectContent>
                    {bodyParts
                      .sort((a, b) => a.name.localeCompare(b.name))
                      .map((bodyPart) => (
                        <SelectItem key={bodyPart.id} value={bodyPart.id}>
                          <span className="capitalize">{bodyPart.name}</span>
                        </SelectItem>
                      ))}
                  </SelectContent>
                </Select>
              </div>
            </div>
            <DialogFooter>
              <Button
                variant="outline"
                onClick={() => setIsDialogOpen(false)}
                disabled={creating}
              >
                Cancel
              </Button>
              <Button
                onClick={handleCreateCustomExercise}
                disabled={creating || !newExerciseName.trim() || !newExerciseBodyPart}
              >
                {creating ? 'Creating...' : 'Create Exercise'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </CardContent>
    </Card>
  );
}