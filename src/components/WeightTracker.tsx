import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Weight } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format } from 'date-fns';
import { useResponsiveText, useResponsiveDate } from '@/lib/responsive-utils';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

export default function WeightTracker() {
  const [date, setDate] = useState<Date>(new Date());
  const [weight, setWeight] = useState('');
  const [saving, setSaving] = useState(false);
  const { user } = useAuth();
  const { toast } = useToast();
  const responsiveText = useResponsiveText();
  const { formatDate } = useResponsiveDate();

  const handleSave = async () => {
    if (!weight || !user) return;

    setSaving(true);
    try {
      // Convert lbs to kg for storage, ensuring 1 decimal precision
      const weightKg = Math.round(parseFloat(weight) * 0.453592 * 10) / 10;
      
      const { error } = await supabase
        .from('body_weight_logs')
        .insert({
          user_id: user.id,
          date: format(date, 'yyyy-MM-dd'),
          body_weight: weightKg,
          unit: 'kg',
          notes: 'Entered via weight tracker'
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Weight saved successfully',
        description: `${parseFloat(weight).toFixed(1)} lbs logged for ${formatDate(date)}`
      });

      setWeight('');
    } catch (error) {
      console.error('Error saving weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to save weight. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Weight className="h-5 w-5" />
          Log {responsiveText.bodyWeight}
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="grid grid-cols-2 gap-4">
          <div className="space-y-2">
            <Label>Date</Label>
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
                  {date ? formatDate(date) : <span>Pick a date</span>}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0" align="start">
                <Calendar
                  mode="single"
                  selected={date}
                  onSelect={(newDate) => newDate && setDate(newDate)}
                  initialFocus
                  className={cn("p-3 pointer-events-auto")}
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <Label htmlFor="weight">Weight (lbs)</Label>
            <Input
              id="weight"
              type="number"
              step="0.1"
              placeholder="e.g., 180.5"
              value={weight}
              onChange={(e) => setWeight(e.target.value)}
            />
          </div>
        </div>

        <Button 
          onClick={handleSave} 
          disabled={!weight || saving}
          className="w-full"
        >
          {saving ? 'Saving...' : 'Save Weight'}
        </Button>
      </CardContent>
    </Card>
  );
}