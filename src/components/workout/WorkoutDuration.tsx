import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Clock } from 'lucide-react';

interface WorkoutDurationProps {
  duration?: number;
  onDurationChange: (duration: number | undefined) => void;
}

export default function WorkoutDuration({ duration, onDurationChange }: WorkoutDurationProps) {
  const handleDurationChange = (value: string) => {
    const numValue = value === '' ? undefined : parseInt(value, 10);
    if (numValue === undefined || (numValue >= 0 && numValue <= 999)) {
      onDurationChange(numValue);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Clock className="h-4 w-4" />
          Workout Duration
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-2">
          <Label htmlFor="duration">Duration (minutes)</Label>
          <Input
            id="duration"
            type="number"
            min="0"
            max="999"
            value={duration || ''}
            onChange={(e) => handleDurationChange(e.target.value)}
            placeholder="e.g., 45"
          />
        </div>
      </CardContent>
    </Card>
  );
}