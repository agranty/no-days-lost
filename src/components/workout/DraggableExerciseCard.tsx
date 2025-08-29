import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Trash2, Plus, GripVertical } from 'lucide-react';

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

interface DraggableExerciseCardProps {
  workoutExercise: WorkoutExercise;
  exerciseIndex: number;
  onRemoveExercise: (exerciseIndex: number) => void;
  onAddSet: (exerciseIndex: number) => void;
  onRemoveSet: (exerciseIndex: number, setIndex: number) => void;
  onUpdateSet: (exerciseIndex: number, setIndex: number, field: string, value: any) => void;
}

export default function DraggableExerciseCard({
  workoutExercise,
  exerciseIndex,
  onRemoveExercise,
  onAddSet,
  onRemoveSet,
  onUpdateSet,
}: DraggableExerciseCardProps) {
  const {
    attributes,
    listeners,
    setNodeRef,
    transform,
    transition,
    isDragging,
  } = useSortable({
    id: `exercise-${exerciseIndex}`,
  });

  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.5 : 1,
  };

  return (
    <Card ref={setNodeRef} style={style} className={isDragging ? 'z-50' : ''}>
      <CardHeader>
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Button
              variant="ghost"
              size="sm"
              {...attributes}
              {...listeners}
              className="cursor-grab active:cursor-grabbing p-1"
            >
              <GripVertical className="h-4 w-4" />
            </Button>
            <CardTitle className="flex items-center gap-2">
              {workoutExercise.exercise?.name}
              <Badge variant="outline">
                {workoutExercise.exercise?.category}
              </Badge>
            </CardTitle>
          </div>
          <Button
            variant="destructive"
            size="sm"
            onClick={() => onRemoveExercise(exerciseIndex)}
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
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'weight', parseFloat(e.target.value) || undefined)}
                            className="w-20"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={set.reps || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'reps', parseInt(e.target.value) || undefined)}
                            className="w-20"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={set.rir || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'rir', parseInt(e.target.value) || undefined)}
                            className="w-20"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            value={set.tempo || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'tempo', e.target.value)}
                            className="w-24"
                            placeholder="3-1-2-0"
                          />
                        </td>
                        {workoutExercise.exercise?.is_machine_based && (
                          <td className="p-2">
                            <Input
                              value={set.machine_setting || ''}
                              onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'machine_setting', e.target.value)}
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
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'distance_m', parseFloat(e.target.value) || undefined)}
                            className="w-24"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={set.duration_sec || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'duration_sec', parseInt(e.target.value) || undefined)}
                            className="w-24"
                          />
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={set.avg_hr_bpm || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'avg_hr_bpm', parseInt(e.target.value) || undefined)}
                            className="w-20"
                          />
                        </td>
                      </>
                    )}
                    <td className="p-2">
                      <Button
                        variant="destructive"
                        size="sm"
                        onClick={() => onRemoveSet(exerciseIndex, setIndex)}
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          
          <Button onClick={() => onAddSet(exerciseIndex)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}