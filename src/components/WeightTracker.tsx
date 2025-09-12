import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Weight, TrendingUp, TrendingDown, Minus } from 'lucide-react';
import { supabase } from '@/integrations/supabase/client';
import { useAuth } from '@/hooks/useAuth';
import { format, parseISO } from 'date-fns';
import { Link } from 'react-router-dom';
import { ResponsiveDate } from '@/components/ui/responsive-date';

interface WeightData {
  current: number | null;
  previous: number | null;
  trend: 'up' | 'down' | 'same' | null;
  unit: string;
  date: string | null;
}

export default function WeightTracker() {
  const [weightData, setWeightData] = useState<WeightData>({
    current: null,
    previous: null,
    trend: null,
    unit: 'lb',
    date: null
  });
  const [loading, setLoading] = useState(true);
  const { user } = useAuth();

  useEffect(() => {
    if (user) {
      loadRecentWeight();
    }
  }, [user]);

  const loadRecentWeight = async () => {
    try {
      const { data, error } = await supabase
        .from('body_weight_logs')
        .select('date, body_weight, unit')
        .eq('user_id', user!.id)
        .order('date', { ascending: false })
        .limit(2);

      if (error) {
        console.error('Error loading weight data:', error);
        return;
      }

      if (data && data.length > 0) {
        const current = data[0];
        const previous = data.length > 1 ? data[1] : null;
        
        let trend: 'up' | 'down' | 'same' | null = null;
        if (previous) {
          if (current.body_weight > previous.body_weight) {
            trend = 'up';
          } else if (current.body_weight < previous.body_weight) {
            trend = 'down';
          } else {
            trend = 'same';
          }
        }

        setWeightData({
          current: Math.round(current.body_weight * 10) / 10,
          previous: previous ? Math.round(previous.body_weight * 10) / 10 : null,
          trend,
          unit: current.unit,
          date: current.date
        });
      }
    } catch (error) {
      console.error('Error loading weight data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getTrendIcon = () => {
    switch (weightData.trend) {
      case 'up':
        return <TrendingUp className="h-4 w-4 text-red-500" />;
      case 'down':
        return <TrendingDown className="h-4 w-4 text-green-500" />;
      case 'same':
        return <Minus className="h-4 w-4 text-muted-foreground" />;
      default:
        return null;
    }
  };

  const getTrendText = () => {
    if (!weightData.previous || !weightData.current) return '';
    
    const diff = Math.abs(weightData.current - weightData.previous);
    const direction = weightData.trend === 'up' ? '+' : weightData.trend === 'down' ? '-' : '';
    
    if (diff === 0) return 'No change';
    return `${direction}${diff.toFixed(1)} ${weightData.unit}`;
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
            <div className="rounded-full bg-primary/10 p-2">
              <Weight className="h-5 w-5 text-primary" />
            </div>
            <span className="font-semibold text-lg">Current Weight</span>
          </div>
        </div>
        
        {weightData.current ? (
          <div className="space-y-3">
            <div className="text-3xl font-bold">
              {weightData.current.toFixed(1)} {weightData.unit}
            </div>
            {weightData.date && (
              <div className="text-sm text-muted-foreground">
                <ResponsiveDate date={weightData.date} format="medium" />
              </div>
            )}
            {weightData.trend && (
              <div className="flex items-center gap-2 text-sm">
                {getTrendIcon()}
                <span className="text-muted-foreground">{getTrendText()}</span>
              </div>
            )}
            <Button asChild variant="outline" size="sm" className="w-full">
              <Link to="/weight">View Details</Link>
            </Button>
          </div>
        ) : (
          <div className="space-y-3">
            <div className="text-muted-foreground">No weight data</div>
            <Button asChild size="sm" className="w-full">
              <Link to="/weight">Add First Entry</Link>
            </Button>
          </div>
        )}
      </CardContent>
    </Card>
  );
}