import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { ChevronLeft, TrendingUp, Users, Calendar, Target } from 'lucide-react';
import { Link } from 'react-router-dom';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, BarChart, Bar } from 'recharts';

interface MetricsData {
  signupTrend: Array<{ date: string; signups: number }>;
  conversionRate: number;
  dailyActiveUsers: number;
  weeklyActiveUsers: number;
  churnRate: number;
}

export default function AdminMetrics() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [metrics, setMetrics] = useState<MetricsData | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [metricsLoading, setMetricsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadMetrics();
    }
  }, [user]);

  const loadProfile = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .eq('id', user?.id)
        .single();
      setProfile(data);
    } catch (error) {
      console.error('Error loading profile:', error);
    } finally {
      setProfileLoading(false);
    }
  };

  const loadMetrics = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        // Generate signup trend for last 30 days
        const signupTrend = [];
        for (let i = 29; i >= 0; i--) {
          const date = new Date();
          date.setDate(date.getDate() - i);
          const dateStr = date.toISOString().split('T')[0];
          
          const signupsOnDate = profiles.filter(p => 
            p.created_at.split('T')[0] === dateStr
          ).length;
          
          signupTrend.push({
            date: date.toLocaleDateString('en-US', { month: 'short', day: 'numeric' }),
            signups: signupsOnDate
          });
        }

        // Calculate conversion rate (free to pro)
        const totalUsers = profiles.length;
        const proUsers = profiles.filter(p => p.plan === 'pro').length;
        const conversionRate = totalUsers > 0 ? (proUsers / totalUsers) * 100 : 0;

        // Calculate active users (users with recent login)
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const oneDayAgo = new Date();
        oneDayAgo.setDate(oneDayAgo.getDate() - 1);

        const weeklyActiveUsers = profiles.filter(p => 
          p.last_login_at && new Date(p.last_login_at) > sevenDaysAgo
        ).length;

        const dailyActiveUsers = profiles.filter(p => 
          p.last_login_at && new Date(p.last_login_at) > oneDayAgo
        ).length;

        // Estimate churn rate
        const thirtyDaysAgo = new Date();
        thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
        const inactiveUsers = profiles.filter(p => 
          !p.last_login_at || new Date(p.last_login_at) < thirtyDaysAgo
        ).length;
        const churnRate = totalUsers > 0 ? (inactiveUsers / totalUsers) * 100 : 0;

        setMetrics({
          signupTrend,
          conversionRate,
          dailyActiveUsers,
          weeklyActiveUsers,
          churnRate
        });
      }
    } catch (error) {
      console.error('Error loading metrics:', error);
    } finally {
      setMetricsLoading(false);
    }
  };

  if (loading || profileLoading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    );
  }

  if (!user || profile?.role !== 'admin') {
    return <Navigate to="/" replace />;
  }

  return (
    <div className="container mx-auto p-6 space-y-6">
      <div className="flex items-center gap-4">
        <Button variant="outline" size="sm" asChild>
          <Link to="/admin">
            <ChevronLeft className="h-4 w-4 mr-2" />
            Back to Admin
          </Link>
        </Button>
        <div>
          <h1 className="text-3xl font-bold">Analytics & Metrics</h1>
          <p className="text-muted-foreground">Track user engagement and business metrics</p>
        </div>
      </div>

      {/* Key Metrics Cards */}
      {metrics && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Daily Active Users</CardTitle>
              <Users className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{metrics.dailyActiveUsers}</div>
              <p className="text-xs text-muted-foreground">Last 24 hours</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Weekly Active Users</CardTitle>
              <Calendar className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{metrics.weeklyActiveUsers}</div>
              <p className="text-xs text-muted-foreground">Last 7 days</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Conversion Rate</CardTitle>
              <Target className="h-4 w-4 text-purple-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-purple-600">{metrics.conversionRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">Free to Pro</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Churn Rate</CardTitle>
              <TrendingUp className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{metrics.churnRate.toFixed(1)}%</div>
              <p className="text-xs text-muted-foreground">30-day inactive</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Charts */}
      {metrics && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Daily Signups (Last 30 Days)</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={metrics.signupTrend}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis 
                    dataKey="date" 
                    fontSize={12}
                    tick={{ fontSize: 12 }}
                  />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Line 
                    type="monotone" 
                    dataKey="signups" 
                    stroke="#3b82f6" 
                    strokeWidth={2}
                    dot={{ fill: '#3b82f6' }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>User Activity Overview</CardTitle>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart 
                  data={[
                    { name: 'Daily Active', value: metrics.dailyActiveUsers, fill: '#3b82f6' },
                    { name: 'Weekly Active', value: metrics.weeklyActiveUsers, fill: '#10b981' },
                  ]}
                >
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" fontSize={12} />
                  <YAxis fontSize={12} />
                  <Tooltip />
                  <Bar dataKey="value" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Additional Insights */}
      <Card>
        <CardHeader>
          <CardTitle>Insights & Recommendations</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {metrics && (
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-green-600">✓ Conversion Performance</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {metrics.conversionRate > 5 ? 
                    `Strong conversion rate of ${metrics.conversionRate.toFixed(1)}% indicates good product-market fit.` :
                    `Conversion rate of ${metrics.conversionRate.toFixed(1)}% could be improved with better onboarding.`
                  }
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-blue-600">📈 Growth Opportunity</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {metrics.weeklyActiveUsers > metrics.dailyActiveUsers * 3 ?
                    "Good weekly retention. Focus on increasing daily engagement." :
                    "Consider implementing daily habits or notifications to increase DAU."
                  }
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-orange-600">⚠️ Churn Analysis</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  {metrics.churnRate > 20 ?
                    "High churn rate indicates need for better user retention strategies." :
                    "Churn rate is healthy. Continue monitoring user satisfaction."
                  }
                </p>
              </div>
              
              <div className="border rounded-lg p-4">
                <h4 className="font-medium text-purple-600">🎯 Next Steps</h4>
                <p className="text-sm text-muted-foreground mt-1">
                  Consider implementing user feedback surveys and A/B testing key features to improve retention.
                </p>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}