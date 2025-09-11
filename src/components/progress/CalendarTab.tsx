import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, TrendingUp, Clock, Target } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO, startOfMonth, endOfMonth, eachDayOfInterval, isSameDay, subWeeks, startOfWeek, endOfWeek } from 'date-fns';

interface SessionData {
  date: string;
  duration: number;
  volume: number;
  bodyParts: string[];
  exerciseCount: number;
}

interface WeeklySummary {
  week: string;
  totalVolume: number;
  totalSets: number;
  sessionCount: number;
}

export default function CalendarTab() {
  const [currentMonth, setCurrentMonth] = useState(new Date());
  const [sessionData, setSessionData] = useState<Map<string, SessionData>>(new Map());
  const [hoveredDate, setHoveredDate] = useState<string | null>(null);
  const [weeklySummaries, setWeeklySummaries] = useState<WeeklySummary[]>([]);
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCalendarData();
    }
  }, [user, currentMonth]);

  const loadCalendarData = async () => {
    try {
      // Load data for current month and last 4 weeks
      const monthStart = startOfMonth(currentMonth);
      const monthEnd = endOfMonth(currentMonth);
      const fourWeeksAgo = subWeeks(new Date(), 4);
      const earliestDate = monthStart < fourWeeksAgo ? fourWeeksAgo : monthStart;

      const { data, error } = await supabase
        .from('workout_sessions')
        .select(`
          date,
          duration_min,
          workout_exercises!inner(
            exercise_id,
            exercises!inner(
              name,
              primary_body_part_id,
              body_parts!exercises_primary_body_part_id_fkey(name)
            ),
            workout_sets(weight, reps)
          )
        `)
        .eq('user_id', user!.id)
        .gte('date', format(earliestDate, 'yyyy-MM-dd'))
        .lte('date', format(monthEnd, 'yyyy-MM-dd'));

      if (error) throw error;

      // Process session data
      const sessionMap = new Map<string, SessionData>();
      const weeklyMap = new Map<string, { volume: number; sets: number; sessions: Set<string> }>();

      data?.forEach(session => {
        const date = session.date;
        const bodyPartsSet = new Set<string>();
        let totalVolume = 0;
        let totalSets = 0;

        session.workout_exercises?.forEach(exercise => {
          if (exercise.exercises?.body_parts?.name) {
            bodyPartsSet.add(exercise.exercises.body_parts.name);
          }

          exercise.workout_sets?.forEach(set => {
            if (set.weight && set.reps) {
              totalVolume += set.weight * set.reps;
            }
            totalSets++;
          });
        });

        sessionMap.set(date, {
          date,
          duration: session.duration_min || 0,
          volume: Math.round(totalVolume),
          bodyParts: Array.from(bodyPartsSet),
          exerciseCount: session.workout_exercises?.length || 0
        });

        // Weekly data
        const sessionDate = parseISO(date);
        const weekStart = startOfWeek(sessionDate);
        const weekKey = format(weekStart, 'yyyy-MM-dd');

        if (!weeklyMap.has(weekKey)) {
          weeklyMap.set(weekKey, { volume: 0, sets: 0, sessions: new Set() });
        }

        const weekData = weeklyMap.get(weekKey)!;
        weekData.volume += totalVolume;
        weekData.sets += totalSets;
        weekData.sessions.add(date);
      });

      setSessionData(sessionMap);

      // Convert weekly data
      const weeklyData: WeeklySummary[] = Array.from(weeklyMap.entries())
        .map(([week, data]) => ({
          week: format(parseISO(week), 'MMM dd'),
          totalVolume: Math.round(data.volume),
          totalSets: data.sets,
          sessionCount: data.sessions.size
        }))
        .sort((a, b) => new Date(a.week).getTime() - new Date(b.week).getTime())
        .slice(-4); // Last 4 weeks

      setWeeklySummaries(weeklyData);

    } catch (error) {
      console.error('Error loading calendar data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getIntensityLevel = (volume: number, maxVolume: number): number => {
    if (maxVolume === 0) return 0;
    const ratio = volume / maxVolume;
    if (ratio >= 0.8) return 4;
    if (ratio >= 0.6) return 3;
    if (ratio >= 0.4) return 2;
    if (ratio >= 0.2) return 1;
    return 0;
  };

  const getIntensityColor = (level: number): string => {
    switch (level) {
      case 4: return 'bg-primary';
      case 3: return 'bg-primary/75';
      case 2: return 'bg-primary/50';
      case 1: return 'bg-primary/25';
      default: return 'bg-muted';
    }
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading calendar data...</div>
      </div>
    );
  }

  const monthStart = startOfMonth(currentMonth);
  const monthEnd = endOfMonth(currentMonth);
  const monthDays = eachDayOfInterval({ start: monthStart, end: monthEnd });
  
  // Calculate max volume for intensity scaling
  const allVolumes = Array.from(sessionData.values()).map(s => s.volume);
  const maxVolume = Math.max(...allVolumes, 1);

  const totalSessions = sessionData.size;
  const totalVolume = Array.from(sessionData.values()).reduce((sum, s) => sum + s.volume, 0);
  const avgDuration = totalSessions > 0 
    ? Array.from(sessionData.values()).reduce((sum, s) => sum + s.duration, 0) / totalSessions 
    : 0;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Calendar className="h-4 w-4 text-primary" />
              <span className="text-sm font-medium">Sessions This Month</span>
            </div>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Volume</div>
            <div className="text-2xl font-bold">{totalVolume.toLocaleString()} lb</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Avg Duration</div>
            <div className="text-2xl font-bold">{Math.round(avgDuration)}min</div>
          </CardContent>
        </Card>
      </div>

      {/* Calendar Heat Map */}
      <Card>
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="flex items-center gap-2">
            <Calendar className="h-5 w-5" />
            Training Calendar - {format(currentMonth, 'MMMM yyyy')}
          </CardTitle>
          <div className="flex gap-2">
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() - 1))}
              className="px-3 py-1 text-sm border rounded hover:bg-muted"
            >
              Previous
            </button>
            <button
              onClick={() => setCurrentMonth(prev => new Date(prev.getFullYear(), prev.getMonth() + 1))}
              className="px-3 py-1 text-sm border rounded hover:bg-muted"
            >
              Next
            </button>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {/* Calendar Grid */}
            <div className="grid grid-cols-7 gap-1">
              {/* Day headers */}
              {['Sun', 'Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat'].map(day => (
                <div key={day} className="p-2 text-xs font-medium text-center text-muted-foreground">
                  {day}
                </div>
              ))}
              
              {/* Empty cells for month start offset */}
              {Array.from({ length: monthStart.getDay() }, (_, i) => (
                <div key={`empty-${i}`} className="p-2" />
              ))}
              
              {/* Month days */}
              {monthDays.map(day => {
                const dateStr = format(day, 'yyyy-MM-dd');
                const session = sessionData.get(dateStr);
                const intensity = session ? getIntensityLevel(session.volume, maxVolume) : 0;
                const isToday = isSameDay(day, new Date());
                
                return (
                  <div
                    key={dateStr}
                    className={`
                      relative p-2 h-12 border rounded cursor-pointer transition-all
                      ${getIntensityColor(intensity)}
                      ${isToday ? 'ring-2 ring-primary' : ''}
                      hover:ring-1 hover:ring-primary/50
                    `}
                    onMouseEnter={() => setHoveredDate(dateStr)}
                    onMouseLeave={() => setHoveredDate(null)}
                  >
                    <div className={`text-xs font-medium ${session ? 'text-white' : 'text-foreground'}`}>
                      {format(day, 'd')}
                    </div>
                    {session && (
                      <div className="absolute bottom-0.5 left-0.5 w-1 h-1 bg-white rounded-full" />
                    )}
                  </div>
                );
              })}
            </div>

            {/* Intensity Legend */}
            <div className="flex items-center justify-between text-xs text-muted-foreground">
              <span>Less</span>
              <div className="flex gap-1">
                {[0, 1, 2, 3, 4].map(level => (
                  <div
                    key={level}
                    className={`w-3 h-3 rounded ${getIntensityColor(level)}`}
                  />
                ))}
              </div>
              <span>More</span>
            </div>

            {/* Hovered Date Details */}
            {hoveredDate && sessionData.has(hoveredDate) && (
              <Card className="bg-muted/50">
                <CardContent className="p-3">
                  <div className="space-y-1">
                    <div className="font-medium">
                      {format(parseISO(hoveredDate), 'MMMM dd, yyyy')}
                    </div>
                    <div className="text-sm text-muted-foreground">
                      {sessionData.get(hoveredDate)!.bodyParts.join(', ')} • 
                      {sessionData.get(hoveredDate)!.duration}min • 
                      {sessionData.get(hoveredDate)!.volume.toLocaleString()}lb volume
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Weekly Summaries */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Weekly Summary (Last 4 Weeks)
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-4">
            {weeklySummaries.map((week, index) => (
              <div key={index} className="flex items-center justify-between p-3 border rounded-lg">
                <div className="flex items-center gap-4">
                  <div className="font-medium">Week of {week.week}</div>
                  <div className="flex items-center gap-4 text-sm text-muted-foreground">
                    <div className="flex items-center gap-1">
                      <Calendar className="h-3 w-3" />
                      {week.sessionCount} sessions
                    </div>
                    <div className="flex items-center gap-1">
                      <Target className="h-3 w-3" />
                      {week.totalSets} sets
                    </div>
                    <div className="flex items-center gap-1">
                      <TrendingUp className="h-3 w-3" />
                      {week.totalVolume.toLocaleString()}lb
                    </div>
                  </div>
                </div>
                <Badge variant="outline">
                  {(week.totalVolume / week.sessionCount).toFixed(0)}lb/session
                </Badge>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}