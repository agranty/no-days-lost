import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { ExternalLink, CreditCard, ChevronLeft, AlertCircle } from 'lucide-react';
import { Link } from 'react-router-dom';

interface BillingStats {
  activeProUsers: number;
  trialingUsers: number;
  pastDueUsers: number;
  totalRevenue: number;
}

export default function AdminBilling() {
  const { user, loading } = useAuth();
  const [profile, setProfile] = useState<any>(null);
  const [stats, setStats] = useState<BillingStats | null>(null);
  const [profileLoading, setProfileLoading] = useState(true);
  const [statsLoading, setStatsLoading] = useState(true);

  useEffect(() => {
    if (user) {
      loadProfile();
      loadBillingStats();
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

  const loadBillingStats = async () => {
    try {
      const { data: profiles } = await supabase
        .from('profiles')
        .select('*');

      if (profiles) {
        const activeProUsers = profiles.filter(p => 
          p.plan === 'pro' && p.subscription_status === 'active'
        ).length;
        
        const trialingUsers = profiles.filter(p => 
          p.subscription_status === 'trialing'
        ).length;
        
        const pastDueUsers = profiles.filter(p => 
          p.subscription_status === 'past_due'
        ).length;
        
        // Estimate revenue (would need actual Stripe data for real numbers)
        const totalRevenue = activeProUsers * 29; // Assuming $29/month

        setStats({
          activeProUsers,
          trialingUsers,
          pastDueUsers,
          totalRevenue
        });
      }
    } catch (error) {
      console.error('Error loading billing stats:', error);
    } finally {
      setStatsLoading(false);
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
          <h1 className="text-3xl font-bold">Billing & Subscriptions</h1>
          <p className="text-muted-foreground">Monitor subscription metrics and billing status</p>
        </div>
      </div>

      {/* Billing Stats */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Active Pro Users</CardTitle>
              <CreditCard className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeProUsers}</div>
              <p className="text-xs text-muted-foreground">Paying subscribers</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Trial Users</CardTitle>
              <CreditCard className="h-4 w-4 text-blue-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.trialingUsers}</div>
              <p className="text-xs text-muted-foreground">On trial</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Past Due</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.pastDueUsers}</div>
              <p className="text-xs text-muted-foreground">Payment issues</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Est. MRR</CardTitle>
              <CreditCard className="h-4 w-4 text-primary" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">${stats.totalRevenue}</div>
              <p className="text-xs text-muted-foreground">Monthly recurring revenue</p>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Stripe Integration Status */}
      <Card>
        <CardHeader>
          <CardTitle>Stripe Integration</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="flex items-center justify-between">
            <div className="space-y-1">
              <p className="font-medium">Stripe Dashboard</p>
              <p className="text-sm text-muted-foreground">
                View detailed billing information, transactions, and customer data
              </p>
            </div>
            <Button variant="outline" asChild>
              <a 
                href="https://dashboard.stripe.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="flex items-center gap-2"
              >
                Open Dashboard
                <ExternalLink className="h-4 w-4" />
              </a>
            </Button>
          </div>
          
          <div className="flex items-center gap-2">
            <Badge variant="default">Connected</Badge>
            <span className="text-sm text-muted-foreground">
              Stripe is configured and processing payments
            </span>
          </div>
        </CardContent>
      </Card>

      {/* Quick Actions */}
      <Card>
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <h4 className="font-medium">Subscription Management</h4>
              <p className="text-sm text-muted-foreground">
                Manage user subscriptions directly from the Users page
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/users">Manage Users</Link>
              </Button>
            </div>
            
            <div className="space-y-2">
              <h4 className="font-medium">Revenue Analytics</h4>
              <p className="text-sm text-muted-foreground">
                View detailed revenue and growth metrics
              </p>
              <Button variant="outline" asChild>
                <Link to="/admin/metrics">View Metrics</Link>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Payment Methods Info */}
      <Card>
        <CardHeader>
          <CardTitle>Subscription Plans</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="border rounded-lg p-4">
              <h4 className="font-medium">Free Plan</h4>
              <p className="text-2xl font-bold">$0</p>
              <p className="text-sm text-muted-foreground">Basic features</p>
            </div>
            
            <div className="border rounded-lg p-4">
              <h4 className="font-medium">Pro Plan</h4>
              <p className="text-2xl font-bold">$29</p>
              <p className="text-sm text-muted-foreground">Full features + premium support</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}