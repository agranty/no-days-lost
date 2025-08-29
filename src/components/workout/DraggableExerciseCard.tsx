import { useSortable } from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Trash2, Plus, GripVertical } from 'lucide-react';

// Helper function to calculate exercise summary
const calculateExerciseSummary = (sets: WorkoutSet[]) => {
  const validSets = sets.filter(set => set.reps && set.reps > 0);
  if (validSets.length === 0) return null;

  const totalSets = validSets.length;
  const topSet = validSets.reduce((max, set) => {
    const currentVolume = (set.weight || 0) * (set.reps || 0);
    const maxVolume = (max.weight || 0) * (max.reps || 0);
    return currentVolume > maxVolume ? set : max;
  });
  
  const totalVolume = validSets.reduce((sum, set) => 
    sum + ((set.weight || 0) * (set.reps || 0)), 0
  );
  
  const avgRpe = validSets.filter(set => set.rpe).length > 0 
    ? validSets.reduce((sum, set) => sum + (set.rpe || 0), 0) / validSets.filter(set => set.rpe).length
    : null;
  
  const avgRest = validSets.filter(set => set.rest_sec).length > 0
    ? validSets.reduce((sum, set) => sum + (set.rest_sec || 0), 0) / validSets.filter(set => set.rest_sec).length
    : null;
  
  const bestOneRM = validSets.reduce((max, set) => {
    if (!set.weight || !set.reps) return max;
    const oneRM = set.weight * (1 + set.reps / 30);
    return oneRM > max ? oneRM : max;
  }, 0);

  return {
    totalSets,
    topSet,
    totalVolume,
    avgRpe,
    avgRest,
    bestOneRM: bestOneRM || null
  };
};

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
                      <th className="text-left p-2">Unit</th>
                      <th className="text-left p-2">Reps</th>
                      <th className="text-left p-2">RPE</th>
                      <th className="text-left p-2">Rest (sec)</th>
                      {workoutExercise.exercise?.is_machine_based && (
                        <>
                          <th className="text-left p-2">Machine</th>
                          <th className="text-left p-2">Setting</th>
                        </>
                      )}
                    </>
                  ) : (
                    <>
                      <th className="text-left p-2">Distance (m)</th>
                      <th className="text-left p-2">Duration (sec)</th>
                      <th className="text-left p-2">Avg HR</th>
                      <th className="text-left p-2">RPE</th>
                      <th className="text-left p-2">Rest (sec)</th>
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
                          <Select
                            value={set.unit || 'kg'}
                            onValueChange={(value) => onUpdateSet(exerciseIndex, setIndex, 'unit', value)}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="kg">kg</SelectItem>
                              <SelectItem value="lb">lb</SelectItem>
                            </SelectContent>
                          </Select>
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
                          <Select
                            value={set.rpe?.toString() || ''}
                            onValueChange={(value) => onUpdateSet(exerciseIndex, setIndex, 'rpe', value ? parseFloat(value) : undefined)}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue placeholder="RPE" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 19 }, (_, i) => (i + 2) / 2).map(rpe => (
                                <SelectItem key={rpe} value={rpe.toString()}>
                                  {rpe}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={set.rest_sec || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'rest_sec', parseInt(e.target.value) || undefined)}
                            className="w-20"
                            placeholder="sec"
                          />
                        </td>
                        {workoutExercise.exercise?.is_machine_based && (
                          <>
                            <td className="p-2">
                              <Input
                                value={set.machine_setting || ''}
                                onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'machine_setting', e.target.value)}
                                className="w-24"
                                placeholder="Machine"
                              />
                            </td>
                            <td className="p-2">
                              <Input
                                value={set.machine_setting || ''}
                                onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'machine_setting', e.target.value)}
                                className="w-24"
                                placeholder="Setting"
                              />
                            </td>
                          </>
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
                        <td className="p-2">
                          <Select
                            value={set.rpe?.toString() || ''}
                            onValueChange={(value) => onUpdateSet(exerciseIndex, setIndex, 'rpe', value ? parseFloat(value) : undefined)}
                          >
                            <SelectTrigger className="w-16">
                              <SelectValue placeholder="RPE" />
                            </SelectTrigger>
                            <SelectContent>
                              {Array.from({ length: 19 }, (_, i) => (i + 2) / 2).map(rpe => (
                                <SelectItem key={rpe} value={rpe.toString()}>
                                  {rpe}
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                        </td>
                        <td className="p-2">
                          <Input
                            type="number"
                            value={set.rest_sec || ''}
                            onChange={(e) => onUpdateSet(exerciseIndex, setIndex, 'rest_sec', parseInt(e.target.value) || undefined)}
                            className="w-20"
                            placeholder="sec"
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
          
          {/* Exercise Summary */}
          {(() => {
            const summary = calculateExerciseSummary(workoutExercise.sets);
            if (!summary) return null;
            
            return (
              <div className="text-sm text-muted-foreground bg-muted/50 p-3 rounded">
                <span className="font-medium">{summary.totalSets} sets</span>
                {summary.topSet && (
                  <span>, Top set {summary.topSet.weight}×{summary.topSet.reps}</span>
                )}
                {summary.totalVolume > 0 && (
                  <span>, Total volume {summary.totalVolume.toLocaleString()} {summary.topSet?.unit || 'kg'}</span>
                )}
                {summary.avgRpe && (
                  <span>, Avg RPE {summary.avgRpe.toFixed(1)}</span>
                )}
                {summary.avgRest && (
                  <span>, Avg Rest {Math.round(summary.avgRest)}s</span>
                )}
                {summary.bestOneRM && (
                  <span>, Best est. 1RM {Math.round(summary.bestOneRM)} {summary.topSet?.unit || 'kg'}</span>
                )}
              </div>
            );
          })()}

          <Button onClick={() => onAddSet(exerciseIndex)} variant="outline" size="sm">
            <Plus className="mr-2 h-4 w-4" />
            Add Set
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}