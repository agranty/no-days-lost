import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Users, CreditCard, BarChart3, Shield } from 'lucide-react';
import { Link } from 'react-router-dom';
import { Button } from '@/components/ui/button';

interface AdminStats {
  totalUsers: number;
  activeProUsers: number;
  newSignupsLast7Days: number;
  adminUsers: number;
}

export default function Admin() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<AdminStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadStats();
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

  const loadStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        const totalUsers = profiles.length;
        const activeProUsers = profiles.filter(p => p.plan === 'pro' && p.subscription_status === 'active').length;
        const adminUsers = profiles.filter(p => p.role === 'admin').length;
        
        // Calculate new signups in last 7 days
        const sevenDaysAgo = new Date();
        sevenDaysAgo.setDate(sevenDaysAgo.getDate() - 7);
        const newSignupsLast7Days = profiles.filter(p => 
          new Date(p.created_at) > sevenDaysAgo
        ).length;

        setStats({
          totalUsers,
          activeProUsers,
          newSignupsLast7Days,
          adminUsers
        });
      }
    } catch (error) {
      console.error('Error loading stats:', error);
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
      {/* Admin Banner */}
      <div className="bg-gradient-to-r from-red-500/10 to-orange-500/10 border border-red-200 rounded-lg p-4">
        <div className="flex items-center gap-2">
          <Shield className="h-5 w-5 text-red-600" />
          <span className="font-medium text-red-800">Admin Mode</span>
          <Badge variant="destructive">Elevated Access</Badge>
        </div>
      </div>

      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Admin Dashboard</h1>
          <p className="text-muted-foreground">Manage users, billing, and system metrics</p>
        </div>
      </div>

      {/* Quick Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Users</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pro Users</CardTitle>
              <CreditCard className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeProUsers}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">New Signups (7d)</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.newSignupsLast7Days}</div>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Admins</CardTitle>
              <Shield className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.adminUsers}</div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Admin Tools */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Users className="h-5 w-5" />
              User Management
            </CardTitle>
            <CardDescription>
              View and manage user accounts, roles, and subscriptions
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/admin/users">Manage Users</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <CreditCard className="h-5 w-5" />
              Billing & Plans
            </CardTitle>
            <CardDescription>
              Monitor subscriptions, payments, and plan usage
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/admin/billing">View Billing</Link>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow">
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5" />
              Analytics
            </CardTitle>
            <CardDescription>
              View metrics, growth, and user engagement data
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Button asChild className="w-full">
              <Link to="/admin/metrics">View Metrics</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}