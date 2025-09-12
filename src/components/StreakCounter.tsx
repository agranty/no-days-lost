import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calendar, Flame, Award } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';

interface StreakStats {
  currentDailyStreak: number;
  currentWeeklyStreak: number;
  bestDailyStreak: number;
  bestWeeklyStreak: number;
}

export function StreakCounter() {
  const { user } = useAuth();
  const [streakStats, setStreakStats] = useState<StreakStats>({
    currentDailyStreak: 0,
    currentWeeklyStreak: 0,
    bestDailyStreak: 0,
    bestWeeklyStreak: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (user) {
      calculateStreaks();
    }
  }, [user]);

  const calculateStreaks = async () => {
    if (!user) return;

    try {
      // Get all workout sessions ordered by date
      const { data: workouts, error } = await supabase
        .from('workout_sessions')
        .select('date')
        .eq('user_id', user.id)
        .order('date', { ascending: false });

      if (error) {
        console.error('Error fetching workouts:', error);
        return;
      }

      if (!workouts || workouts.length === 0) {
        setLoading(false);
        return;
      }

      // Calculate daily streaks
      const uniqueDates = [...new Set(workouts.map(w => w.date))].sort().reverse();
      const { currentDaily, bestDaily } = calculateDailyStreaks(uniqueDates);

      // Calculate weekly streaks
      const { currentWeekly, bestWeekly } = calculateWeeklyStreaks(uniqueDates);

      setStreakStats({
        currentDailyStreak: currentDaily,
        currentWeeklyStreak: currentWeekly,
        bestDailyStreak: bestDaily,
        bestWeeklyStreak: bestWeekly,
      });
    } catch (error) {
      console.error('Error calculating streaks:', error);
    } finally {
      setLoading(false);
    }
  };

  const calculateDailyStreaks = (dates: string[]) => {
    if (dates.length === 0) return { currentDaily: 0, bestDaily: 0 };

    let currentDaily = 0;
    let bestDaily = 0;
    let tempStreak = 0;
    const today = new Date().toISOString().split('T')[0];
    
    // Check if there's a workout today or yesterday for current streak
    const mostRecentDate = dates[0];
    const yesterday = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString().split('T')[0];
    
    if (mostRecentDate === today || mostRecentDate === yesterday) {
      currentDaily = 1;
      
      // Continue checking backwards for consecutive days
      for (let i = 1; i < dates.length; i++) {
        const currentDate = new Date(dates[i-1]);
        const previousDate = new Date(dates[i]);
        const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
        
        if (dayDiff === 1) {
          currentDaily++;
        } else {
          break;
        }
      }
    }

    // Calculate best daily streak
    tempStreak = 1;
    for (let i = 1; i < dates.length; i++) {
      const currentDate = new Date(dates[i-1]);
      const previousDate = new Date(dates[i]);
      const dayDiff = Math.floor((currentDate.getTime() - previousDate.getTime()) / (1000 * 60 * 60 * 24));
      
      if (dayDiff === 1) {
        tempStreak++;
      } else {
        bestDaily = Math.max(bestDaily, tempStreak);
        tempStreak = 1;
      }
    }
    bestDaily = Math.max(bestDaily, tempStreak, currentDaily);

    return { currentDaily, bestDaily };
  };

  const calculateWeeklyStreaks = (dates: string[]) => {
    if (dates.length === 0) return { currentWeekly: 0, bestWeekly: 0 };

    // Group dates by week
    const weekGroups = new Map<string, string[]>();
    
    dates.forEach(date => {
      const d = new Date(date);
      const startOfWeek = new Date(d);
      startOfWeek.setDate(d.getDate() - d.getDay()); // Start of week (Sunday)
      const weekKey = startOfWeek.toISOString().split('T')[0];
      
      if (!weekGroups.has(weekKey)) {
        weekGroups.set(weekKey, []);
      }
      weekGroups.get(weekKey)!.push(date);
    });

    const weeks = Array.from(weekGroups.keys()).sort().reverse();
    
    let currentWeekly = 0;
    let bestWeekly = 0;
    let tempStreak = 0;

    // Check current week for current streak
    const today = new Date();
    const currentWeekStart = new Date(today);
    currentWeekStart.setDate(today.getDate() - today.getDay());
    const currentWeekKey = currentWeekStart.toISOString().split('T')[0];

    if (weeks.includes(currentWeekKey)) {
      currentWeekly = 1;
      
      // Continue checking backwards for consecutive weeks
      for (let i = 1; i < weeks.length; i++) {
        const currentWeek = new Date(weeks[i-1]);
        const previousWeek = new Date(weeks[i]);
        const weekDiff = Math.floor((currentWeek.getTime() - previousWeek.getTime()) / (1000 * 60 * 60 * 24 * 7));
        
        if (weekDiff === 1) {
          currentWeekly++;
        } else {
          break;
        }
      }
    }

    // Calculate best weekly streak
    tempStreak = 1;
    for (let i = 1; i < weeks.length; i++) {
      const currentWeek = new Date(weeks[i-1]);
      const previousWeek = new Date(weeks[i]);
      const weekDiff = Math.floor((currentWeek.getTime() - previousWeek.getTime()) / (1000 * 60 * 60 * 24 * 7));
      
      if (weekDiff === 1) {
        tempStreak++;
      } else {
        bestWeekly = Math.max(bestWeekly, tempStreak);
        tempStreak = 1;
      }
    }
    bestWeekly = Math.max(bestWeekly, tempStreak, currentWeekly);

    return { currentWeekly, bestWeekly };
  };

  if (loading) {
    return (
      <Card className="border-0 shadow-sm">
        <CardContent className="p-6">
          <div className="animate-pulse">
            <div className="h-4 bg-muted rounded w-24 mb-2"></div>
            <div className="h-8 bg-muted rounded w-16"></div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card className="border-0 shadow-sm">
      <CardContent className="p-6">
        <div className="flex items-center justify-between mb-4">
          <div className="flex items-center gap-3">
            <div className="rounded-full bg-orange-500/10 p-2">
              <Flame className="h-5 w-5 text-orange-500" />
            </div>
            <span className="font-semibold text-lg">Streak Tracker</span>
          </div>
        </div>
        
        <div className="space-y-4">
          {/* Current Streaks */}
          <div className="grid grid-cols-2 gap-3">
            <div className="text-center p-3 rounded-lg bg-accent/10">
              <div className="text-2xl font-bold text-accent">{streakStats.currentDailyStreak}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Day{streakStats.currentDailyStreak !== 1 ? 's' : ''}
              </div>
            </div>
            
            <div className="text-center p-3 rounded-lg bg-primary/10">
              <div className="text-2xl font-bold text-primary">{streakStats.currentWeeklyStreak}</div>
              <div className="text-sm text-muted-foreground flex items-center justify-center gap-1">
                <Calendar className="h-3 w-3" />
                Week{streakStats.currentWeeklyStreak !== 1 ? 's' : ''}
              </div>
            </div>
          </div>

          {/* Best Streaks */}
          {(streakStats.bestDailyStreak > streakStats.currentDailyStreak || 
            streakStats.bestWeeklyStreak > streakStats.currentWeeklyStreak) && (
            <div className="pt-2 border-t border-muted/50">
              <div className="flex items-center gap-2 mb-2">
                <Award className="h-4 w-4 text-yellow-500" />
                <span className="text-sm font-medium">Personal Bests</span>
              </div>
              <div className="flex gap-4 text-sm text-muted-foreground">
                <div>Best daily: <span className="font-medium">{streakStats.bestDailyStreak}</span></div>
                <div>Best weekly: <span className="font-medium">{streakStats.bestWeeklyStreak}</span></div>
              </div>
            </div>
          )}
        </div>
      </CardContent>
    </Card>
  );
}