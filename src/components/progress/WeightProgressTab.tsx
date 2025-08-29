import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Switch } from '@/components/ui/switch';
import { Label } from '@/components/ui/label';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Weight, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { useResponsiveText, useResponsiveDate } from '@/lib/responsive-utils';
import { format, parseISO, subDays } from 'date-fns';

interface WeightDataPoint {
  date: string;
  weight: number;
  rollingAverage: number;
  squat1RM?: number;
}

interface WeightEntry {
  id: string;
  date: string;
  weight_lbs: number;
  notes?: string;
}

export default function WeightProgressTab() {
  const [weightData, setWeightData] = useState<WeightDataPoint[]>([]);
  const [recentEntries, setRecentEntries] = useState<WeightEntry[]>([]);
  const [showStrengthOverlay, setShowStrengthOverlay] = useState(false);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();
  const responsiveText = useResponsiveText();
  const { formatDate, formatDateShort } = useResponsiveDate();

  useEffect(() => {
    if (user) {
      loadWeightProgressData();
    }
  }, [user]);

  const loadWeightProgressData = async () => {
    try {
      // Load body weight data
      const { data: weightData, error: weightError } = await supabase
        .from('body_weight_logs')
        .select('id, date, body_weight, notes, created_at')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (weightError) throw weightError;

      // Load squat 1RM data for overlay
      const { data: squatData, error: squatError } = await supabase
        .from('workout_sets')
        .select(`
          estimated_1rm,
          workout_exercises!inner(
            exercises!inner(name),
            workout_sessions!inner(date, user_id)
          )
        `)
        .eq('workout_exercises.workout_sessions.user_id', user!.id)
        .ilike('workout_exercises.exercises.name', '%squat%')
        .not('estimated_1rm', 'is', null)
        .order('workout_exercises.workout_sessions.date', { ascending: true });

      if (squatError) console.warn('Error loading squat data:', squatError);

      // Process weight data with deduplication
      const weightMap = new Map<string, { weight: number; notes?: string; id: string; created_at: string }>();
      
      weightData?.forEach(entry => {
        const weightLbs = entry.body_weight * 2.20462; // kg to lbs
        const existing = weightMap.get(entry.date);
        
        if (!existing || new Date(entry.created_at) > new Date(existing.created_at)) {
          weightMap.set(entry.date, {
            weight: Math.round(weightLbs * 10) / 10,
            notes: entry.notes,
            id: entry.id,
            created_at: entry.created_at
          });
        }
      });

      // Create chart data with rolling average
      const sortedWeightEntries = Array.from(weightMap.entries())
        .map(([date, data]) => ({ date, ...data }))
        .sort((a, b) => new Date(a.date).getTime() - new Date(b.date).getTime());

      const chartData: WeightDataPoint[] = [];
      
      sortedWeightEntries.forEach((entry, index) => {
        // Calculate 7-day rolling average
        const startIndex = Math.max(0, index - 6);
        const recentWeights = sortedWeightEntries
          .slice(startIndex, index + 1)
          .map(e => e.weight);
        const rollingAverage = recentWeights.reduce((sum, w) => sum + w, 0) / recentWeights.length;

        const dataPoint: WeightDataPoint = {
          date: entry.date,
          weight: entry.weight,
          rollingAverage: Math.round(rollingAverage * 10) / 10
        };

        // Add squat 1RM if available for this date
        const squatEntry = squatData?.find(s => 
          s.workout_exercises?.workout_sessions?.date === entry.date
        );
        if (squatEntry?.estimated_1rm) {
          dataPoint.squat1RM = Math.round(squatEntry.estimated_1rm * 2.20462 * 10) / 10; // kg to lbs
        }

        chartData.push(dataPoint);
      });

      setWeightData(chartData);

      // Set recent entries for table
      const recentWeightEntries: WeightEntry[] = sortedWeightEntries
        .slice(-5)
        .reverse()
        .map(entry => ({
          id: entry.id,
          date: entry.date,
          weight_lbs: entry.weight,
          notes: entry.notes
        }));

      setRecentEntries(recentWeightEntries);

    } catch (error) {
      console.error('Error loading weight progress data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading weight progress...</div>
      </div>
    );
  }

  if (weightData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Weight className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground mb-4">No weight data found</p>
          <Button onClick={() => window.location.href = '/weight'}>
            Start Tracking Weight
          </Button>
        </CardContent>
      </Card>
    );
  }

  const currentWeight = weightData[weightData.length - 1]?.weight || 0;
  const firstWeight = weightData[0]?.weight || 0;
  const weightChange = currentWeight - firstWeight;
  const hasSquatData = weightData.some(d => d.squat1RM);

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Current Weight</div>
            <div className="text-2xl font-bold">{currentWeight.toFixed(1)} lbs</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Change</div>
            <div className={`text-2xl font-bold ${weightChange >= 0 ? 'text-green-600' : 'text-red-600'}`}>
              {weightChange >= 0 ? '+' : ''}{weightChange.toFixed(1)} lbs
            </div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Data Points</div>
            <div className="text-2xl font-bold">{weightData.length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Chart Controls */}
      {hasSquatData && (
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center space-x-2">
              <Switch
                id="strength-overlay"
                checked={showStrengthOverlay}
                onCheckedChange={setShowStrengthOverlay}
              />
              <Label htmlFor="strength-overlay">Show Squat 1RM Overlay</Label>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Weight Progress Chart */}
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <TrendingUp className="h-5 w-5" />
          {responsiveText.bodyWeight} Progress
        </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={weightData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => formatDateShort(parseISO(date))}
                />
                <YAxis 
                  yAxisId="weight"
                  label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
                />
                {showStrengthOverlay && hasSquatData && (
                  <YAxis 
                    yAxisId="strength"
                    orientation="right"
                    label={{ value: 'Squat 1RM (lbs)', angle: 90, position: 'insideRight' }}
                  />
                )}
                <Tooltip 
                  labelFormatter={(date) => formatDate(parseISO(date))}
                  formatter={(value, name) => {
                    if (name === 'weight') return [`${Number(value).toFixed(1)} lbs`, 'Weight'];
                    if (name === 'rollingAverage') return [`${Number(value).toFixed(1)} lbs`, '7-day Average'];
                    if (name === 'squat1RM') return [`${Number(value).toFixed(1)} lbs`, 'Squat 1RM'];
                    return [value, name];
                  }}
                />
                
                {/* Weight line */}
                <Line 
                  yAxisId="weight"
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={1}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 1, r: 2 }}
                  name="weight"
                />
                
                {/* Rolling average line */}
                <Line 
                  yAxisId="weight"
                  type="monotone" 
                  dataKey="rollingAverage" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={3}
                  dot={false}
                  name="rollingAverage"
                />

                {/* Squat 1RM overlay */}
                {showStrengthOverlay && hasSquatData && (
                  <Line 
                    yAxisId="strength"
                    type="monotone" 
                    dataKey="squat1RM" 
                    stroke="#ef4444" 
                    strokeWidth={2}
                    dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                    connectNulls={false}
                    name="squat1RM"
                  />
                )}
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Recent Entries Table */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Weight Entries</CardTitle>
        </CardHeader>
        <CardContent>
          {recentEntries.length > 0 ? (
            <div className="space-y-2">
              {recentEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div>
                    <div className="font-medium">
                      {formatDate(parseISO(entry.date))}
                    </div>
                    <div className="text-lg font-semibold text-primary">
                      {entry.weight_lbs.toFixed(1)} lbs
                    </div>
                    {entry.notes && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="text-center py-4 text-muted-foreground">
              No recent entries found
            </div>
          )}
          
          <div className="mt-4 pt-4 border-t">
            <Button onClick={() => window.location.href = '/weight'} className="w-full">
              View Full Weight Tracking
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}