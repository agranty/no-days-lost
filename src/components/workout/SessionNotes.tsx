import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';

interface SessionNotesProps {
  notes: string;
  onNotesChange: (notes: string) => void;
  perceivedExertion: number;
  onPerceivedExertionChange: (exertion: number) => void;
}

export default function SessionNotes({
  notes,
  onNotesChange,
  perceivedExertion,
  onPerceivedExertionChange,
}: SessionNotesProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle>Session Notes</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div>
          <Label htmlFor="perceived-exertion">Perceived Exertion (1-10)</Label>
          <Select
            value={perceivedExertion.toString()}
            onValueChange={(value) => onPerceivedExertionChange(parseInt(value))}
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
            onChange={(e) => onNotesChange(e.target.value)}
            placeholder="How did the workout feel? Any observations..."
          />
        </div>
      </CardContent>
    </Card>
  );
}