import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Badge } from '@/components/ui/badge';

interface Exercise {
  id: string;
  name: string;
  category: string;
  primary_body_part_id: string;
}

interface ExerciseSelectorProps {
  exercises: Exercise[];
  onSelectExercise: (exerciseId: string) => void;
}

export default function ExerciseSelector({ exercises, onSelectExercise }: ExerciseSelectorProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Add Exercise</CardTitle>
      </CardHeader>
      <CardContent>
        <Select onValueChange={onSelectExercise}>
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
  );
}