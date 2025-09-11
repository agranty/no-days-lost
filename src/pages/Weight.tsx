import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { CalendarIcon, Weight as WeightIcon, Edit, Save, X } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';

interface WeightEntry {
  id: string;
  date: string;
  weight_lbs: number;
  notes?: string;
  created_at: string;
}

interface MonthlyStats {
  month: string;
  avg: number;
  min: number;
  max: number;
}

interface ChartData {
  date: string;
  weight: number;
  formattedDate: string;
}

export default function Weight() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [monthlyStats, setMonthlyStats] = useState<MonthlyStats[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Quick entry form state
  const [quickEntryDate, setQuickEntryDate] = useState<Date>(new Date());
  const [quickEntryWeight, setQuickEntryWeight] = useState('');
  const [quickEntryNotes, setQuickEntryNotes] = useState('');
  
  // Edit form state
  const [editWeight, setEditWeight] = useState('');
  const [editNotes, setEditNotes] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();

  useEffect(() => {
    if (user) {
      loadWeightData();
    }
  }, [user]);

  const loadWeightData = async () => {
    try {
      const { data, error } = await supabase
        .from('body_weight_logs')
        .select('id, date, body_weight, notes, created_at')
        .eq('user_id', user!.id)
        .order('date', { ascending: true });

      if (error) {
        console.error('Error loading weight data:', error);
        return;
      }

      // Convert kg to lbs and deduplicate by date (most recent entry per date)
      const weightMap = new Map<string, WeightEntry>();
      
      data?.forEach(entry => {
        const weightLbs = entry.body_weight * 2.20462; // kg to lbs
        const existing = weightMap.get(entry.date);
        
        if (!existing || new Date(entry.created_at) > new Date(existing.created_at)) {
          weightMap.set(entry.date, {
            id: entry.id,
            date: entry.date,
            weight_lbs: Math.round(weightLbs * 10) / 10, // Ensure 1 decimal precision
            notes: entry.notes,
            created_at: entry.created_at
          });
        }
      });

      const deduplicatedEntries = Array.from(weightMap.values()).sort(
        (a, b) => new Date(a.date).getTime() - new Date(b.date).getTime()
      );

      setWeightEntries(deduplicatedEntries);

      // Prepare chart data
      const chartEntries: ChartData[] = deduplicatedEntries.map(entry => ({
        date: entry.date,
        weight: Math.round(entry.weight_lbs * 10) / 10,
        formattedDate: format(parseISO(entry.date), 'MMM dd')
      }));
      setChartData(chartEntries);

      // Calculate monthly stats
      const monthlyMap = new Map<string, number[]>();
      
      deduplicatedEntries.forEach(entry => {
        const month = format(parseISO(entry.date), 'yyyy-MM');
        if (!monthlyMap.has(month)) {
          monthlyMap.set(month, []);
        }
        monthlyMap.get(month)!.push(entry.weight_lbs);
      });

      const monthlyStatsArray: MonthlyStats[] = Array.from(monthlyMap.entries()).map(([month, weights]) => ({
        month: format(parseISO(month + '-01'), 'MMM yyyy'),
        avg: Math.round((weights.reduce((sum, w) => sum + w, 0) / weights.length) * 10) / 10,
        min: Math.round(Math.min(...weights) * 10) / 10,
        max: Math.round(Math.max(...weights) * 10) / 10
      })).sort((a, b) => b.month.localeCompare(a.month));

      setMonthlyStats(monthlyStatsArray);
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleQuickSave = async () => {
    if (!quickEntryWeight || !user) return;

    setSaving(true);
    try {
      // Convert lbs to kg for storage, ensuring 1 decimal precision
      const weightKg = Math.round(parseFloat(quickEntryWeight) * 0.453592 * 10) / 10;
      
      const { error } = await supabase
        .from('body_weight_logs')
        .insert({
          user_id: user.id,
          date: format(quickEntryDate, 'yyyy-MM-dd'),
          body_weight: weightKg,
          unit: 'kg',
          notes: quickEntryNotes || null
        });

      if (error) {
        throw error;
      }

      toast({
        title: 'Weight saved successfully',
        description: `${parseFloat(quickEntryWeight).toFixed(1)} lbs logged for ${format(quickEntryDate, 'MMM dd, yyyy')}`
      });

      // Reset form
      setQuickEntryWeight('');
      setQuickEntryNotes('');
      setQuickEntryDate(new Date());
      
      // Reload data
      loadWeightData();
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

  const startEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setEditWeight(entry.weight_lbs.toFixed(1));
    setEditNotes(entry.notes || '');
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeight('');
    setEditNotes('');
  };

  const saveEdit = async (id: string) => {
    if (!editWeight || !user) return;

    setSaving(true);
    try {
      // Convert lbs to kg for storage, ensuring 1 decimal precision
      const weightKg = Math.round(parseFloat(editWeight) * 0.453592 * 10) / 10;
      
      const { error } = await supabase
        .from('body_weight_logs')
        .update({
          body_weight: weightKg,
          notes: editNotes || null
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Weight updated successfully',
        description: `Weight updated to ${parseFloat(editWeight).toFixed(1)} lbs`
      });

      setEditingId(null);
      setEditWeight('');
      setEditNotes('');
      
      // Reload data
      loadWeightData();
    } catch (error) {
      console.error('Error updating weight:', error);
      toast({
        title: 'Error',
        description: 'Failed to update weight. Please try again.',
        variant: 'destructive'
      });
    } finally {
      setSaving(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Weight Tracking</h1>
          <p className="text-muted-foreground text-lg">Monitor your body weight progress</p>
        </div>
        <Card className="p-12 border-0 shadow-sm">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-6"></div>
            <p className="text-muted-foreground text-lg">Loading your weight data...</p>
          </div>
        </Card>
      </div>
    );
  }

  if (weightEntries.length === 0) {
    return (
      <div className="space-y-8">
        <div>
          <h1 className="text-4xl font-bold tracking-tight">Weight Tracking</h1>
          <p className="text-muted-foreground text-lg">Monitor your body weight progress</p>
        </div>
        <Card className="p-12 border-0 shadow-sm">
          <div className="text-center space-y-6">
            <div className="rounded-full bg-muted/30 p-6 w-fit mx-auto">
              <WeightIcon className="h-16 w-16 text-muted-foreground" />
            </div>
            <div>
              <p className="text-muted-foreground text-lg mb-2">No weight entries found</p>
              <p className="text-muted-foreground">Start logging your weight from the home page to see charts and statistics here.</p>
            </div>
          </div>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Weight Tracking</h1>
        <p className="text-muted-foreground text-lg">Monitor your body weight progress</p>
      </div>

      {/* Quick Entry Form */}
      <Card>
        <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <WeightIcon className="h-5 w-5" />
          Log Body Weight
        </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="space-y-2">
              <Label>Date</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className={cn(
                      "w-full justify-start text-left font-normal",
                      !quickEntryDate && "text-muted-foreground"
                    )}
                  >
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {quickEntryDate ? format(quickEntryDate, "PPP") : <span>Pick a date</span>}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={quickEntryDate}
                    onSelect={(newDate) => newDate && setQuickEntryDate(newDate)}
                    initialFocus
                    className={cn("p-3 pointer-events-auto")}
                  />
                </PopoverContent>
              </Popover>
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-weight">Weight (lbs)</Label>
              <Input
                id="quick-weight"
                type="number"
                step="0.1"
                placeholder="e.g., 180.5"
                value={quickEntryWeight}
                onChange={(e) => setQuickEntryWeight(e.target.value)}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="quick-notes">Notes (optional)</Label>
              <Input
                id="quick-notes"
                placeholder="e.g., morning weight"
                value={quickEntryNotes}
                onChange={(e) => setQuickEntryNotes(e.target.value)}
              />
            </div>
          </div>

          <Button 
            onClick={handleQuickSave} 
            disabled={!quickEntryWeight || saving}
            className="w-full"
          >
            {saving ? 'Saving...' : 'Save Weight'}
          </Button>
        </CardContent>
      </Card>

      {/* Monthly Summary Table */}
      <Card>
        <CardHeader>
          <CardTitle>Monthly Summary</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full border-collapse">
              <thead>
                <tr className="border-b">
                  <th className="text-left p-2">Month</th>
                  <th className="text-right p-2">Average (lbs)</th>
                  <th className="text-right p-2">Min (lbs)</th>
                  <th className="text-right p-2">Max (lbs)</th>
                </tr>
              </thead>
              <tbody>
                {monthlyStats.map((stat) => (
                  <tr key={stat.month} className="border-b">
                    <td className="p-2">{stat.month}</td>
                    <td className="text-right p-2">{stat.avg.toFixed(1)}</td>
                    <td className="text-right p-2">{stat.min.toFixed(1)}</td>
                    <td className="text-right p-2">{stat.max.toFixed(1)}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Weight Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Weight Trend</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={chartData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="formattedDate"
                  tick={{ fontSize: 12 }}
                />
                <YAxis 
                  domain={['dataMin - 2', 'dataMax + 2']}
                  tick={{ fontSize: 12 }}
                  label={{ value: 'Weight (lbs)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(label, payload) => {
                    if (payload && payload[0]) {
                      return format(parseISO(payload[0].payload.date), 'MMM dd, yyyy');
                    }
                    return label;
                  }}
                  formatter={(value) => [`${Number(value).toFixed(1)} lbs`, 'Weight']}
                />
                <Line 
                  type="monotone" 
                  dataKey="weight" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={{ fill: 'hsl(var(--primary))', strokeWidth: 2, r: 4 }}
                  activeDot={{ r: 6, stroke: 'hsl(var(--primary))', strokeWidth: 2 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {weightEntries.length === 0 ? (
            <p className="text-center text-muted-foreground py-4">No weight entries yet</p>
          ) : (
            <div className="space-y-2">
              {weightEntries.slice().reverse().map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-3 border rounded-lg">
                  <div className="flex-1">
                    <div className="font-medium">
                      {format(parseISO(entry.date), 'MMM dd, yyyy')}
                    </div>
                    {editingId === entry.id ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            placeholder="Weight (lbs)"
                            className="w-32"
                          />
                          <span className="self-center text-sm text-muted-foreground">lbs</span>
                        </div>
                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notes (optional)"
                        />
                      </div>
                    ) : (
                      <div className="text-lg font-semibold text-primary">
                        {entry.weight_lbs.toFixed(1)} lbs
                      </div>
                    )}
                    {entry.notes && editingId !== entry.id && (
                      <div className="text-sm text-muted-foreground mt-1">
                        {entry.notes}
                      </div>
                    )}
                  </div>
                  <div className="flex gap-2">
                    {editingId === entry.id ? (
                      <>
                        <Button
                          size="sm"
                          onClick={() => saveEdit(entry.id)}
                          disabled={saving || !editWeight}
                        >
                          <Save className="h-4 w-4" />
                        </Button>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={cancelEdit}
                          disabled={saving}
                        >
                          <X className="h-4 w-4" />
                        </Button>
                      </>
                    ) : (
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => startEdit(entry)}
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                    )}
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}