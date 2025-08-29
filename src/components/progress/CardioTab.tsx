import React, { useEffect, useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Heart, Trophy, TrendingUp } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';

interface CardioSession {
  date: string;
  distance: number;
  duration: number;
  pace: number;
  isPR: boolean;
  prType?: string;
}

export default function CardioTab() {
  const [cardioData, setCardioData] = useState<CardioSession[]>([]);
  const [prRecords, setPrRecords] = useState<{
    fastestMile: CardioSession | null;
    fastest5K: CardioSession | null;
    longestDistance: CardioSession | null;
  }>({
    fastestMile: null,
    fastest5K: null,
    longestDistance: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadCardioData();
    }
  }, [user]);

  const loadCardioData = async () => {
    try {
      const { data, error } = await supabase
        .from('workout_sets')
        .select(`
          distance_m,
          duration_sec,
          pace_sec_per_km,
          workout_exercises!inner(
            workout_sessions!inner(date, user_id)
          )
        `)
        .eq('workout_exercises.workout_sessions.user_id', user!.id)
        .not('distance_m', 'is', null)
        .not('duration_sec', 'is', null)
        .order('workout_exercises.workout_sessions.date', { ascending: true });

      if (error) throw error;

      if (!data || data.length === 0) {
        setLoading(false);
        return;
      }

      // Process cardio sessions
      const sessions: CardioSession[] = [];
      let fastestMile: CardioSession | null = null;
      let fastest5K: CardioSession | null = null;
      let longestDistance: CardioSession | null = null;

      data.forEach(set => {
        const session = set.workout_exercises?.workout_sessions;
        if (session && set.distance_m && set.duration_sec) {
          const distanceKm = set.distance_m / 1000;
          const durationMin = set.duration_sec / 60;
          const pace = set.pace_sec_per_km || (set.duration_sec / (set.distance_m / 1000));

          const cardioSession: CardioSession = {
            date: session.date,
            distance: Math.round(distanceKm * 100) / 100,
            duration: Math.round(durationMin * 10) / 10,
            pace: Math.round(pace),
            isPR: false
          };

          // Check for PRs
          let isPR = false;
          let prType = '';

          // Fastest mile (if distance >= 1.6km)
          if (distanceKm >= 1.6) {
            const milePace = pace;
            if (!fastestMile || milePace < fastestMile.pace) {
              if (fastestMile) {
                fastestMile.isPR = false;
              }
              fastestMile = { ...cardioSession, isPR: true, prType: 'Fastest Mile' };
              isPR = true;
              prType = 'Fastest Mile';
            }
          }

          // Fastest 5K (if distance >= 5km)
          if (distanceKm >= 5) {
            if (!fastest5K || pace < fastest5K.pace) {
              if (fastest5K) {
                fastest5K.isPR = false;
              }
              fastest5K = { ...cardioSession, isPR: true, prType: 'Fastest 5K' };
              isPR = true;
              prType = 'Fastest 5K';
            }
          }

          // Longest distance
          if (!longestDistance || distanceKm > longestDistance.distance) {
            if (longestDistance) {
              longestDistance.isPR = false;
            }
            longestDistance = { ...cardioSession, isPR: true, prType: 'Longest Distance' };
            isPR = true;
            prType = 'Longest Distance';
          }

          if (isPR) {
            cardioSession.isPR = true;
            cardioSession.prType = prType;
          }

          sessions.push(cardioSession);
        }
      });

      setCardioData(sessions);
      setPrRecords({ fastestMile, fastest5K, longestDistance });

    } catch (error) {
      console.error('Error loading cardio data:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatPace = (paceSeconds: number) => {
    const minutes = Math.floor(paceSeconds / 60);
    const seconds = paceSeconds % 60;
    return `${minutes}:${seconds.toString().padStart(2, '0')}/km`;
  };

  const formatDuration = (durationMin: number) => {
    const hours = Math.floor(durationMin / 60);
    const minutes = Math.floor(durationMin % 60);
    if (hours > 0) {
      return `${hours}h ${minutes}m`;
    }
    return `${minutes}m`;
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="text-center py-8">Loading cardio analysis...</div>
      </div>
    );
  }

  if (cardioData.length === 0) {
    return (
      <Card>
        <CardContent className="text-center py-8">
          <Heart className="h-12 w-12 mx-auto mb-4 text-muted-foreground" />
          <p className="text-muted-foreground">No cardio sessions found. Start logging runs or rides to see your progress!</p>
        </CardContent>
      </Card>
    );
  }

  const totalSessions = cardioData.length;
  const totalDistance = cardioData.reduce((sum, session) => sum + session.distance, 0);
  const averagePace = cardioData.reduce((sum, session) => sum + session.pace, 0) / cardioData.length;

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Heart className="h-4 w-4 text-red-500" />
              <span className="text-sm font-medium">Total Sessions</span>
            </div>
            <div className="text-2xl font-bold">{totalSessions}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Total Distance</div>
            <div className="text-2xl font-bold">{totalDistance.toFixed(1)} km</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="text-sm font-medium text-muted-foreground">Average Pace</div>
            <div className="text-2xl font-bold">{formatPace(Math.round(averagePace))}</div>
          </CardContent>
        </Card>
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Trophy className="h-4 w-4 text-yellow-500" />
              <span className="text-sm font-medium">PRs Set</span>
            </div>
            <div className="text-2xl font-bold">{cardioData.filter(s => s.isPR).length}</div>
          </CardContent>
        </Card>
      </div>

      {/* Distance Progress Chart */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TrendingUp className="h-5 w-5" />
            Distance Progression
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-80">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cardioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                />
                <YAxis 
                  label={{ value: 'Distance (km)', angle: -90, position: 'insideLeft' }}
                />
                <Tooltip 
                  labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                  formatter={(value, name) => [
                    name === 'distance' ? `${Number(value).toFixed(1)} km` : value,
                    name === 'distance' ? 'Distance' : name
                  ]}
                />
                <Line 
                  type="monotone" 
                  dataKey="distance" 
                  stroke="hsl(var(--primary))" 
                  strokeWidth={2}
                  dot={(props) => {
                    const { cx, cy, payload } = props;
                    return payload?.isPR ? (
                      <Trophy 
                        x={cx - 6} 
                        y={cy - 6} 
                        className="h-3 w-3 fill-yellow-500 stroke-yellow-600" 
                      />
                    ) : (
                      <circle cx={cx} cy={cy} r={3} fill="hsl(var(--primary))" />
                    );
                  }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* Pace Trend Chart */}
      <Card>
        <CardHeader>
          <CardTitle>Pace Improvement</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="h-64">
            <ResponsiveContainer width="100%" height="100%">
              <LineChart data={cardioData}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis 
                  dataKey="date"
                  tickFormatter={(date) => format(parseISO(date), 'MMM dd')}
                />
                <YAxis 
                  label={{ value: 'Pace (sec/km)', angle: -90, position: 'insideLeft' }}
                  tickFormatter={formatPace}
                />
                <Tooltip 
                  labelFormatter={(date) => format(parseISO(date), 'MMM dd, yyyy')}
                  formatter={(value) => [formatPace(Number(value)), 'Pace']}
                />
                <Line 
                  type="monotone" 
                  dataKey="pace" 
                  stroke="#ef4444" 
                  strokeWidth={2}
                  dot={{ fill: '#ef4444', strokeWidth: 2, r: 4 }}
                />
              </LineChart>
            </ResponsiveContainer>
          </div>
        </CardContent>
      </Card>

      {/* PR Records */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
        {prRecords.fastestMile && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Fastest Mile Pace
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatPace(prRecords.fastestMile.pace)}</div>
                <div className="text-sm text-muted-foreground">
                  {format(parseISO(prRecords.fastestMile.date), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm">
                  {prRecords.fastestMile.distance.toFixed(1)} km in {formatDuration(prRecords.fastestMile.duration)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {prRecords.fastest5K && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Fastest 5K
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{formatDuration(prRecords.fastest5K.duration)}</div>
                <div className="text-sm text-muted-foreground">
                  {format(parseISO(prRecords.fastest5K.date), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm">
                  {formatPace(prRecords.fastest5K.pace)} pace
                </div>
              </div>
            </CardContent>
          </Card>
        )}

        {prRecords.longestDistance && (
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2 text-base">
                <Trophy className="h-4 w-4 text-yellow-500" />
                Longest Distance
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="text-2xl font-bold">{prRecords.longestDistance.distance.toFixed(1)} km</div>
                <div className="text-sm text-muted-foreground">
                  {format(parseISO(prRecords.longestDistance.date), 'MMM dd, yyyy')}
                </div>
                <div className="text-sm">
                  {formatDuration(prRecords.longestDistance.duration)} • {formatPace(prRecords.longestDistance.pace)}
                </div>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Recent PRs */}
      {cardioData.filter(s => s.isPR).length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Trophy className="h-5 w-5 text-yellow-500" />
              Recent PRs
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {cardioData
                .filter(s => s.isPR)
                .slice(-5)
                .map((pr, index) => (
                  <div key={index} className="flex items-center justify-between p-3 bg-muted/50 rounded-lg">
                    <div>
                      <div className="font-medium">
                        {format(parseISO(pr.date), 'MMM dd, yyyy')}
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {pr.distance.toFixed(1)} km • {formatDuration(pr.duration)} • {formatPace(pr.pace)}
                      </div>
                    </div>
                    <Badge variant="secondary" className="text-yellow-600">
                      <Trophy className="h-3 w-3 mr-1" />
                      {pr.prType}
                    </Badge>
                  </div>
                ))}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}