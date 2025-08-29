import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { format, parseISO } from 'date-fns';

interface WeightEntry {
  date: string;
  weight_lbs: number;
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
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadWeightData();
    }
  }, [user]);

  const loadWeightData = async () => {
    try {
      const { data, error } = await supabase
        .from('body_weight_logs')
        .select('date, body_weight, created_at')
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
            date: entry.date,
            weight_lbs: weightLbs,
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

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Weight Tracking</h1>
        <div className="text-center py-8">Loading...</div>
      </div>
    );
  }

  if (weightEntries.length === 0) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Weight Tracking</h1>
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground mb-4">No weight entries found</p>
            <p className="text-sm text-muted-foreground">Start logging your weight from the home page to see charts and statistics here.</p>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h1 className="text-3xl font-bold">Weight Tracking</h1>

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
                    <td className="text-right p-2">{stat.avg}</td>
                    <td className="text-right p-2">{stat.min}</td>
                    <td className="text-right p-2">{stat.max}</td>
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
                  formatter={(value) => [`${value} lbs`, 'Weight']}
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
    </div>
  );
}