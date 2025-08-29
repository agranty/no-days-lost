import { useState } from 'react';
import { format } from 'date-fns';
import { CalendarIcon } from 'lucide-react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

interface BodyPart {
  id: string;
  name: string;
}

interface WorkoutHeaderProps {
  date: Date;
  onDateChange: (date: Date | undefined) => void;
  workoutType: string;
  onWorkoutTypeChange: (type: string) => void;
  selectedBodyParts: string[];
  onBodyPartsChange: (bodyParts: string[]) => void;
  bodyParts: BodyPart[];
}

export default function WorkoutHeader({
  date,
  onDateChange,
  workoutType,
  onWorkoutTypeChange,
  selectedBodyParts,
  onBodyPartsChange,
  bodyParts,
}: WorkoutHeaderProps) {
  const toggleBodyPart = (bodyPartId: string) => {
    if (selectedBodyParts.includes(bodyPartId)) {
      onBodyPartsChange(selectedBodyParts.filter(id => id !== bodyPartId));
    } else {
      onBodyPartsChange([...selectedBodyParts, bodyPartId]);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Workout Details</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Date Picker */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Date</label>
          <Popover>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className={cn(
                  "w-full justify-start text-left font-normal",
                  !date && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {date ? format(date, "PPP") : <span>Pick a date</span>}
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-auto p-0" align="start">
              <Calendar
                mode="single"
                selected={date}
                onSelect={onDateChange}
                initialFocus
                className={cn("p-3 pointer-events-auto")}
              />
            </PopoverContent>
          </Popover>
        </div>

        {/* Workout Type */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Workout Type</label>
          <Select value={workoutType} onValueChange={onWorkoutTypeChange}>
            <SelectTrigger>
              <SelectValue placeholder="Select workout type..." />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="strength">Strength Training</SelectItem>
              <SelectItem value="cardio">Cardio</SelectItem>
              <SelectItem value="mixed">Mixed</SelectItem>
            </SelectContent>
          </Select>
        </div>

        {/* Body Parts Selection */}
        <div className="space-y-2">
          <label className="text-sm font-medium">Target Body Parts</label>
          <div className="grid grid-cols-2 gap-2">
            {bodyParts.map((bodyPart) => (
              <div key={bodyPart.id} className="flex items-center space-x-2">
                <Checkbox
                  id={bodyPart.id}
                  checked={selectedBodyParts.includes(bodyPart.id)}
                  onCheckedChange={() => toggleBodyPart(bodyPart.id)}
                />
                <label
                  htmlFor={bodyPart.id}
                  className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 capitalize"
                >
                  {bodyPart.name}
                </label>
              </div>
            ))}
          </div>
        </div>
      </CardContent>
    </Card>
  );
}