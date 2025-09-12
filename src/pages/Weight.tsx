import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Calendar } from '@/components/ui/calendar';
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Textarea } from '@/components/ui/textarea';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle, AlertDialogTrigger } from '@/components/ui/alert-dialog';
import { CalendarIcon, Weight as WeightIcon, Edit, Save, X, Trash2 } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO, isSameDay } from 'date-fns';
import { cn } from '@/lib/utils';
import { useToast } from '@/hooks/use-toast';
import { useIsMobile } from '@/hooks/use-mobile';
import { ResponsiveDate } from '@/components/ui/responsive-date';
import { ResponsiveLabel } from '@/components/ui/responsive-label';

interface WeightEntry {
  id: string;
  date: string;
  body_weight: number;
  unit: 'lb' | 'kg';
  notes?: string;
  created_at: string;
}

interface UserPreferences {
  default_unit: 'lb' | 'kg';
}

interface ChartData {
  date: string;
  weight: number;
  formattedDate: string;
}

const WEIGHT_LIMITS = {
  lb: { min: 60, max: 700 },
  kg: { min: 30, max: 320 }
};

export default function Weight() {
  const [weightEntries, setWeightEntries] = useState<WeightEntry[]>([]);
  const [chartData, setChartData] = useState<ChartData[]>([]);
  const [userPreferences, setUserPreferences] = useState<UserPreferences>({ default_unit: 'lb' });
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  
  // Quick entry form state
  const [quickEntryDate, setQuickEntryDate] = useState<Date>(new Date());
  const [quickEntryWeight, setQuickEntryWeight] = useState('');
  const [quickEntryUnit, setQuickEntryUnit] = useState<'lb' | 'kg'>('lb');
  const [quickEntryNotes, setQuickEntryNotes] = useState('');
  const [duplicateEntry, setDuplicateEntry] = useState<WeightEntry | null>(null);
  
  // Edit form state
  const [editWeight, setEditWeight] = useState('');
  const [editNotes, setEditNotes] = useState('');
  const [editUnit, setEditUnit] = useState<'lb' | 'kg'>('lb');
  
  // Validation state
  const [weightError, setWeightError] = useState('');
  
  const { user } = useAuth();
  const { toast } = useToast();
  const isMobile = useIsMobile();

  useEffect(() => {
    if (user) {
      loadUserPreferences();
      loadWeightData();
    }
  }, [user]);

  const loadUserPreferences = async () => {
    try {
      const { data } = await supabase
        .from('user_preferences')
        .select('default_unit')
        .eq('user_id', user!.id)
        .maybeSingle();
      
      if (data?.default_unit) {
        setUserPreferences({ default_unit: data.default_unit });
        setQuickEntryUnit(data.default_unit);
      }
    } catch (error) {
      console.error('Error loading user preferences:', error);
    }
  };

  const loadWeightData = async () => {
    try {
      const { data, error } = await supabase
        .from('body_weight_logs')
        .select('id, date, body_weight, unit, notes, created_at')
        .eq('user_id', user!.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error loading weight data:', error);
        return;
      }

      const entries = data?.map(entry => ({
        ...entry,
        body_weight: Math.round(entry.body_weight * 10) / 10 // Ensure 1 decimal precision
      })) || [];

      setWeightEntries(entries);

      // Prepare chart data (convert to consistent unit for chart)
      const chartEntries: ChartData[] = entries
        .reverse() // Reverse to show chronological order in chart
        .map(entry => {
          // Convert weight to lb for consistent charting
          const weightInLb = entry.unit === 'kg' 
            ? Math.round(entry.body_weight * 2.20462 * 10) / 10
            : entry.body_weight;
          
          return {
            date: entry.date,
            weight: weightInLb,
            formattedDate: format(parseISO(entry.date), 'MMM dd')
          };
        });
      
      setChartData(chartEntries);
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const validateWeight = (weight: string, unit: 'lb' | 'kg'): string => {
    const weightNum = parseFloat(weight);
    
    if (!weight || isNaN(weightNum)) {
      return 'Weight is required';
    }
    
    if (weightNum <= 0) {
      return 'Weight must be greater than 0';
    }
    
    const limits = WEIGHT_LIMITS[unit];
    if (weightNum < limits.min || weightNum > limits.max) {
      return `Weight must be between ${limits.min} and ${limits.max} ${unit}`;
    }
    
    return '';
  };

  const checkForDuplicateDate = (date: Date): WeightEntry | null => {
    return weightEntries.find(entry => 
      isSameDay(parseISO(entry.date), date)
    ) || null;
  };

  const formatWeight = (weight: number): string => {
    return weight.toFixed(1);
  };

  const formatDateDisplay = (dateString: string): string => {
    // This is now handled by ResponsiveDate component
    return dateString;
  };

  const handleQuickSave = async (overwrite: boolean = false) => {
    if (!quickEntryWeight || !user) return;

    const error = validateWeight(quickEntryWeight, quickEntryUnit);
    if (error) {
      setWeightError(error);
      return;
    }
    setWeightError('');

    // Check for duplicate date unless we're overwriting
    if (!overwrite) {
      const duplicate = checkForDuplicateDate(quickEntryDate);
      if (duplicate) {
        setDuplicateEntry(duplicate);
        return;
      }
    }

    setSaving(true);
    try {
      const weightValue = Math.round(parseFloat(quickEntryWeight) * 10) / 10;
      
      if (overwrite && duplicateEntry) {
        // Update existing entry
        const { error } = await supabase
          .from('body_weight_logs')
          .update({
            body_weight: weightValue,
            unit: quickEntryUnit,
            notes: quickEntryNotes || null
          })
          .eq('id', duplicateEntry.id);

        if (error) throw error;
      } else {
        // Insert new entry
        const { error } = await supabase
          .from('body_weight_logs')
          .insert({
            user_id: user.id,
            date: format(quickEntryDate, 'yyyy-MM-dd'),
            body_weight: weightValue,
            unit: quickEntryUnit,
            notes: quickEntryNotes || null
          });

        if (error) throw error;
      }

      toast({
        title: 'Weight saved',
        description: `${formatWeight(weightValue)} ${quickEntryUnit} logged for ${format(quickEntryDate, 'MMM d, yyyy')}`
      });

      // Reset form
      clearQuickEntryForm();
      setDuplicateEntry(null);
      
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

  const clearQuickEntryForm = () => {
    setQuickEntryWeight('');
    setQuickEntryNotes('');
    setQuickEntryDate(new Date());
    setQuickEntryUnit(userPreferences.default_unit);
    setWeightError('');
    setDuplicateEntry(null);
  };

  const startEdit = (entry: WeightEntry) => {
    setEditingId(entry.id);
    setEditWeight(formatWeight(entry.body_weight));
    setEditNotes(entry.notes || '');
    setEditUnit(entry.unit);
  };

  const cancelEdit = () => {
    setEditingId(null);
    setEditWeight('');
    setEditNotes('');
    setEditUnit('lb');
  };

  const saveEdit = async (id: string) => {
    if (!editWeight || !user) return;

    const error = validateWeight(editWeight, editUnit);
    if (error) {
      toast({
        title: 'Validation Error',
        description: error,
        variant: 'destructive'
      });
      return;
    }

    setSaving(true);
    try {
      const weightValue = Math.round(parseFloat(editWeight) * 10) / 10;
      
      const { error } = await supabase
        .from('body_weight_logs')
        .update({
          body_weight: weightValue,
          unit: editUnit,
          notes: editNotes || null
        })
        .eq('id', id)
        .eq('user_id', user.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Weight updated',
        description: `Weight updated to ${formatWeight(weightValue)} ${editUnit}`
      });

      cancelEdit();
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

  const deleteEntry = async (id: string) => {
    setSaving(true);
    try {
      const { error } = await supabase
        .from('body_weight_logs')
        .delete()
        .eq('id', id)
        .eq('user_id', user!.id);

      if (error) {
        throw error;
      }

      toast({
        title: 'Entry deleted',
        description: 'Weight entry has been removed'
      });

      loadWeightData();
    } catch (error) {
      console.error('Error deleting entry:', error);
      toast({
        title: 'Error',
        description: 'Failed to delete entry. Please try again.',
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
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
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
              <Label htmlFor="quick-weight">Weight</Label>
              <div className="flex gap-2">
                <Input
                  id="quick-weight"
                  type="number"
                  step="0.1"
                  placeholder="e.g., 180.0"
                  value={quickEntryWeight}
                  onChange={(e) => {
                    setQuickEntryWeight(e.target.value);
                    setWeightError('');
                  }}
                  className={cn("flex-1", weightError && "border-destructive")}
                />
                <Select value={quickEntryUnit} onValueChange={(value: 'lb' | 'kg') => setQuickEntryUnit(value)}>
                  <SelectTrigger className="w-20">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="lb">lb</SelectItem>
                    <SelectItem value="kg">kg</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              {weightError && (
                <p className="text-sm text-destructive">{weightError}</p>
              )}
            </div>

            <div className="space-y-2 md:col-span-2">
              <Label htmlFor="quick-notes">Notes (optional)</Label>
              <Input
                id="quick-notes"
                placeholder="e.g., morning weight"
                value={quickEntryNotes}
                onChange={(e) => setQuickEntryNotes(e.target.value)}
              />
            </div>
          </div>

          <div className="flex gap-2">
            <Button 
              onClick={() => handleQuickSave(false)} 
              disabled={!quickEntryWeight || saving || !!weightError}
              className="flex-1"
            >
              {saving ? 'Saving...' : 'Save'}
            </Button>
            <Button 
              variant="outline"
              onClick={clearQuickEntryForm}
              disabled={saving}
            >
              Clear
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Duplicate Entry Dialog */}
      <AlertDialog open={!!duplicateEntry} onOpenChange={() => setDuplicateEntry(null)}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Entry Already Exists</AlertDialogTitle>
            <AlertDialogDescription>
              You already have a weight entry for <ResponsiveDate date={duplicateEntry.date} format="medium" showTooltip={false} />. 
              Would you like to overwrite it?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setDuplicateEntry(null)}>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={() => handleQuickSave(true)}>
              Overwrite Entry
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Weight Chart */}
      {chartData.length > 1 && (
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
                    label={{ value: 'Weight (lb)', angle: -90, position: 'insideLeft' }}
                  />
                  <Tooltip 
                    labelFormatter={(label, payload) => {
                      if (payload && payload[0]) {
                        return format(parseISO(payload[0].payload.date), 'MMM dd, yyyy');
                      }
                      return label;
                    }}
                    formatter={(value) => [`${Number(value).toFixed(1)} lb`, 'Weight']}
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
      )}

      {/* Weight History */}
      <Card>
        <CardHeader>
          <CardTitle>Weight History</CardTitle>
        </CardHeader>
        <CardContent>
          {weightEntries.length === 0 ? (
            <div className="text-center py-8">
              <WeightIcon className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
              <p className="text-muted-foreground">No weight entries yet</p>
              <p className="text-sm text-muted-foreground">Add your first entry above to start tracking</p>
            </div>
          ) : (
            <div className="space-y-2">
              {weightEntries.map((entry) => (
                <div key={entry.id} className="flex items-center justify-between p-4 border rounded-lg hover:bg-muted/30 transition-colors">
                  <div className="flex-1 min-w-0"> {/* min-w-0 allows flex child to shrink */}
                    <div className="font-medium">
                      <ResponsiveDate date={entry.date} />
                    </div>
                    {editingId === entry.id ? (
                      <div className="mt-2 space-y-2">
                        <div className="flex gap-2">
                          <Input
                            type="number"
                            step="0.1"
                            value={editWeight}
                            onChange={(e) => setEditWeight(e.target.value)}
                            placeholder="Weight"
                            className="w-24"
                          />
                          <Select value={editUnit} onValueChange={(value: 'lb' | 'kg') => setEditUnit(value)}>
                            <SelectTrigger className="w-20">
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="lb">lb</SelectItem>
                              <SelectItem value="kg">kg</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <Input
                          value={editNotes}
                          onChange={(e) => setEditNotes(e.target.value)}
                          placeholder="Notes (optional)"
                        />
                      </div>
                    ) : (
                      <>
                        <div className="text-lg font-semibold text-primary">
                          {formatWeight(entry.body_weight)} {entry.unit}
                        </div>
                        {entry.notes && (
                          <div className="text-sm text-muted-foreground mt-1">
                            <ResponsiveLabel 
                              text={entry.notes} 
                              maxLength={{ sm: 20, md: 40, lg: 60 }}
                            />
                          </div>
                        )}
                      </>
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
                      <>
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => startEdit(entry)}
                        >
                          <Edit className="h-4 w-4" />
                        </Button>
                        <AlertDialog>
                          <AlertDialogTrigger asChild>
                            <Button
                              size="sm"
                              variant="outline"
                              className="text-destructive hover:text-destructive"
                            >
                              <Trash2 className="h-4 w-4" />
                            </Button>
                          </AlertDialogTrigger>
                          <AlertDialogContent>
                            <AlertDialogHeader>
                              <AlertDialogTitle>Delete Entry</AlertDialogTitle>
                            <AlertDialogDescription>
                              Are you sure you want to delete this weight entry from <ResponsiveDate date={entry.date} format="medium" showTooltip={false} />?
                              This action cannot be undone.
                            </AlertDialogDescription>
                            </AlertDialogHeader>
                            <AlertDialogFooter>
                              <AlertDialogCancel>Cancel</AlertDialogCancel>
                              <AlertDialogAction 
                                onClick={() => deleteEntry(entry.id)}
                                className="bg-destructive text-destructive-foreground hover:bg-destructive/90"
                              >
                                Delete
                              </AlertDialogAction>
                            </AlertDialogFooter>
                          </AlertDialogContent>
                        </AlertDialog>
                      </>
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