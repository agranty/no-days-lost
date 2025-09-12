import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Brain, Zap, Meh, Frown } from 'lucide-react';

interface MindsetTrackerProps {
  mindset: number;
  onMindsetChange: (mindset: number) => void;
}

const mindsetOptions = [
  {
    value: 1,
    label: "Distracted",
    description: "Not focused",
    icon: Frown,
    color: "text-red-500"
  },
  {
    value: 2,
    label: "Neutral",
    description: "Average mindset",
    icon: Meh,
    color: "text-yellow-500"
  },
  {
    value: 3,
    label: "Great",
    description: "I feel great",
    icon: Zap,
    color: "text-green-500"
  }
];

export function MindsetTracker({ mindset, onMindsetChange }: MindsetTrackerProps) {
  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Brain className="h-5 w-5" />
          Mindset Tracker
        </CardTitle>
      </CardHeader>
      <CardContent>
        <RadioGroup 
          value={mindset.toString()} 
          onValueChange={(value) => onMindsetChange(parseInt(value))}
          className="grid grid-cols-3 gap-4"
        >
          {mindsetOptions.map((option) => (
            <div key={option.value} className="flex items-center space-x-2">
              <RadioGroupItem 
                value={option.value.toString()} 
                id={`mindset-${option.value}`}
                className="peer sr-only"
              />
              <Label
                htmlFor={`mindset-${option.value}`}
                className="flex flex-col items-center justify-center p-4 rounded-lg border-2 border-muted bg-background hover:bg-accent/50 hover:text-accent-foreground peer-data-[state=checked]:border-primary peer-data-[state=checked]:text-primary cursor-pointer transition-all"
              >
                <option.icon className={`h-6 w-6 mb-2 ${option.color}`} />
                <span className="font-medium text-sm">{option.label}</span>
                <span className="text-xs text-muted-foreground text-center">{option.description}</span>
              </Label>
            </div>
          ))}
        </RadioGroup>
      </CardContent>
    </Card>
  );
}