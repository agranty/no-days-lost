import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { TrendingUp, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface WeeklyVolumeData {
  week: string;
  chest: number;
  back: number;
  legs: number;
  arms: number;
  shoulders: number;
  core: number;
}

interface BodyPartDistribution {
  name: string;
  value: number;
  color: string;
}

export default function BodyPartsTab() {
  const [weeklyData, setWeeklyData] = useState<WeeklyVolumeData[]>([]);
  const [distributionData, setDistributionData] = useState<BodyPartDistribution[]>([]);
  const [insights, setInsights] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  const bodyPartColors = {
    chest: '#FF6B6B',
    back: '#4ECDC4',
    legs: '#45B7D1',
    arms: '#FFA07A',
    shoulders: '#98D8C8',
    core: '#F7DC6F'
  };

  useEffect(() => {
    if (user) {
      loadBodyPartData();
    }
  }, [user]);

  const loadBodyPartData = async () => {
    try {
      // Get data from last 8 weeks for trending
      const eightWeeksAgo = subWeeks(new Date(), 8);
      
      const { data, error } = await supabase
        .from('workout_sets')
        .select(`
          weight,
          reps,
          workout_exercises!inner(
            exercises!inner(
              primary_body_part_id,
              body_parts!exercises_primary_body_part_id_fkey(name)
            ),
            workout_sessions!inner(date, user_id)
          )
        `)
        .eq('workout_exercises.workout_sessions.user_id', user!.id)
        .gte('workout_exercises.workout_sessions.date', format(eightWeeksAgo, 'yyyy-MM-dd'))
        .not('weight', 'is', null)
        .not('reps', 'is', null);

      if (error) throw error;

      // Process data by week and body part
      const weeklyVolumeMap = new Map<string, { [key: string]: number }>();
      const totalVolumeByBodyPart: { [key: string]: number } = {};

      data?.forEach(set => {
        const session = set.workout_exercises?.workout_sessions;
        const bodyPart = set.workout_exercises?.exercises?.body_parts?.name?.toLowerCase();
        
        if (session && bodyPart && set.weight && set.reps) {
          const date = parseISO(session.date);
          const weekStart = startOfWeek(date);
          const weekKey = format(weekStart, 'yyyy-MM-dd');
          const volume = set.weight * set.reps;

          // Weekly data
          if (!weeklyVolumeMap.has(weekKey)) {
            weeklyVolumeMap.set(weekKey, {
              chest: 0, back: 0, legs: 0, arms: 0, shoulders: 0, core: 0
            });
          }
          
          const bodyPartKey = normalizeBodyPart(bodyPart);
          const weekData = weeklyVolumeMap.get(weekKey)!;
          weekData[bodyPartKey] = (weekData[bodyPartKey] || 0) + volume;

          // Total volume for distribution (last 4 weeks)
          const fourWeeksAgo = subWeeks(new Date(), 4);
          if (date >= fourWeeksAgo) {
            totalVolumeByBodyPart[bodyPartKey] = (totalVolumeByBodyPart[bodyPartKey] || 0) + volume;
          }
        }
      });

      // Convert to chart data
      const weeklyChartData: WeeklyVolumeData[] = Array.from(weeklyVolumeMap.entries())
        .map(([week, volumes]) => ({
          week: format(parseISO(week), 'MMM dd'),
          chest: Math.round(volumes.chest || 0),
          back: Math.round(volumes.back || 0),
          legs: Math.round(volumes.legs || 0),
          arms: Math.round(volumes.arms || 0),
          shoulders: Math.round(volumes.shoulders || 0),
          core: Math.round(volumes.core || 0)
        }))
        .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime());

      setWeeklyData(weeklyChartData);

      // Create distribution data
      const totalVolume = Object.values(totalVolumeByBodyPart).reduce((sum, vol) => sum + vol, 0);
      const distribution: BodyPartDistribution[] = Object.entries(totalVolumeByBodyPart)
        .map(([bodyPart, volume]) => ({
          name: bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1),
          value: Math.round((volume / totalVolume) * 100),
          color: bodyPartColors[bodyPart as keyof typeof bodyPartColors] || '#8884d8'
        }))
        .filter(item => item.value > 0)
        .sort((a, b) => b.value - a.value);

      setDistributionData(distribution);

      // Generate insights
      generateInsights(weeklyChartData, distribution);

    } catch (error) {
      console.error('Error loading body part data:', error);
    } finally {
      setLoading(false);
    }
  };

  const normalizeBodyPart = (bodyPart: string): string => {
    const normalized = bodyPart.toLowerCase();
    // Map various body part names to our standard categories
    if (normalized.includes('chest') || normalized.includes('pec')) return 'chest';
    if (normalized.includes('back') || normalized.includes('lat')) return 'back';
    if (normalized.includes('leg') || normalized.includes('quad') || normalized.includes('hamstring') || normalized.includes('glute')) return 'legs';
    if (normalized.includes('arm') || normalized.includes('bicep') || normalized.includes('tricep')) return 'arms';
    if (normalized.includes('shoulder') || normalized.includes('delt')) return 'shoulders';
    if (normalized.includes('core') || normalized.includes('ab')) return 'core';
    return 'arms'; // default fallback
  };

  const generateInsights = (weeklyData: WeeklyVolumeData[], distribution: BodyPartDistribution[]) => {
    const insights: string[] = [];

    if (weeklyData.length >= 2) {
      const recent = weeklyData[weeklyData.length - 1];
      const previous = weeklyData[weeklyData.length - 2];

      // Find biggest volume changes
      Object.keys(bodyPartColors).forEach(bodyPart => {
        const recentVol = recent[bodyPart as keyof WeeklyVolumeData] as number;
        const previousVol = previous[bodyPart as keyof WeeklyVolumeData] as number;
        
        if (previousVol > 0) {
          const change = ((recentVol - previousVol) / previousVol) * 100;
          if (Math.abs(change) >= 20) {
            const direction = change > 0 ? 'increased' : 'decreased';
            insights.push(`${bodyPart.charAt(0).toUpperCase() + bodyPart.slice(1)} volume ${direction} ${Math.abs(change).toFixed(0)}% this week`);
          }
        }
      });
    }

    // Distribution insights
    if (distribution.length > 0) {
      const dominant = distribution[0];
      if (dominant.value >= 35) {
        insights.push(`${dominant.name} training is dominant at ${dominant.value}% of total volume`);
      }
      
      const balanced = distribution.filter(d => d.value >= 15).length >= 4;
      if (balanced) {
        insights.push('Training appears well-balanced across body parts');
      }
    }

    if (insights.length === 0) {
      insights.push('Keep up the consistent training!');
    }

    setInsights(insights);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading body part analysis...</div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Insights Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {insights.map((insight, index) => (
          <Card key={index}>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Target className="h-4 w-4 text-primary" />
                <span className="text-sm">{insight}</span>
              </div>
            </CardContent>
          </Card>
        ))}
      </div>

      {/* Weekly Volume Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Volume by Body Part
          </CardTitle>
        </CardHeader>
        <CardContent>
          {weeklyData.length > 0 ? (
            <div className="h-80">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={weeklyData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="week" />
                  <YAxis label={{ value: 'Volume (kg)', angle: -90, position: 'insideLeft' }} />
                  <Tooltip formatter={(value) => [`${value} kg`, '']} />
                  <Bar dataKey="chest" stackId="volume" fill={bodyPartColors.chest} name="Chest" />
                  <Bar dataKey="back" stackId="volume" fill={bodyPartColors.back} name="Back" />
                  <Bar dataKey="legs" stackId="volume" fill={bodyPartColors.legs} name="Legs" />
                  <Bar dataKey="arms" stackId="volume" fill={bodyPartColors.arms} name="Arms" />
                  <Bar dataKey="shoulders" stackId="volume" fill={bodyPartColors.shoulders} name="Shoulders" />
                  <Bar dataKey="core" stackId="volume" fill={bodyPartColors.core} name="Core" />
                </BarChart>
              </ResponsiveContainer>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No training data found for the past 8 weeks
            </div>
          )}
        </CardContent>
      </Card>

      {/* Body Part Distribution */}
      <Card>
        <CardHeader>
          <CardTitle>Training Balance (Last 4 Weeks)</CardTitle>
        </CardHeader>
        <CardContent>
          {distributionData.length > 0 ? (
            <div className="flex flex-col md:flex-row items-center gap-6">
              <div className="h-64 w-64">
                <ResponsiveContainer width="100%" height="100%">
                  <PieChart>
                    <Pie
                      data={distributionData}
                      cx="50%"
                      cy="50%"
                      outerRadius={80}
                      dataKey="value"
                      label={({ name, value }) => `${name}: ${value}%`}
                    >
                      {distributionData.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip formatter={(value) => [`${value}%`, 'Volume']} />
                  </PieChart>
                </ResponsiveContainer>
              </div>
              <div className="space-y-2 flex-1">
                {distributionData.map((item, index) => (
                  <div key={index} className="flex items-center justify-between p-2 rounded">
                    <div className="flex items-center gap-2">
                      <div 
                        className="w-4 h-4 rounded" 
                        style={{ backgroundColor: item.color }}
                      />
                      <span className="font-medium">{item.name}</span>
                    </div>
                    <span className="text-muted-foreground">{item.value}%</span>
                  </div>
                ))}
              </div>
            </div>
          ) : (
            <div className="text-center py-8 text-muted-foreground">
              No training data found for the past 4 weeks
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}