import { useEffect, useState } from 'react';
import { Navigate } from 'react-router-dom';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Badge } from '@/components/ui/badge';
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { AlertDialog, AlertDialogAction, AlertDialogCancel, AlertDialogContent, AlertDialogDescription, AlertDialogFooter, AlertDialogHeader, AlertDialogTitle } from '@/components/ui/alert-dialog';
import { useToast } from '@/hooks/use-toast';
import { Search, Shield, CreditCard, ChevronLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { logAuditAction } from '@/lib/auth';

interface User {
  id: string;
  email: string;
  role: 'user' | 'admin';
  plan: string;
  subscription_status: string;
  current_period_end?: string;
  last_login_at?: string;
  created_at: string;
}

export default function AdminUsers() {
  const { user, loading } = useAuth();
  const { toast } = useToast();
  const [profile, setProfile] = useState<any>(null);
  const [users, setUsers] = useState<User[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<User[]>([]);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('all');
  const [planFilter, setPlanFilter] = useState<string>('all');
  const [profileLoading, setProfileLoading] = useState(true);
  const [usersLoading, setUsersLoading] = useState(true);
  const [actionDialog, setActionDialog] = useState<{
    open: boolean;
    user?: User;
    action: 'make-admin' | 'remove-admin' | 'grant-pro' | 'downgrade';
    title: string;
    description: string;
  }>({ open: false, action: 'make-admin', title: '', description: '' });

  useEffect(() => {
    if (user) {
      loadProfile();
      loadUsers();
    }
  }, [user]);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, roleFilter, planFilter]);

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

  const loadUsers = async () => {
    try {
      const { data } = await supabase
        .from('profiles')
        .select('*')
        .order('created_at', { ascending: false });
      
      setUsers((data || []) as User[]);
    } catch (error) {
      console.error('Error loading users:', error);
      toast({
        title: "Error",
        description: "Failed to load users",
        variant: "destructive"
      });
    } finally {
      setUsersLoading(false);
    }
  };

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(user => 
        user.email.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (roleFilter !== 'all') {
      filtered = filtered.filter(user => user.role === roleFilter);
    }

    if (planFilter !== 'all') {
      filtered = filtered.filter(user => user.plan === planFilter);
    }

    setFilteredUsers(filtered);
  };

  const handleRoleChange = async (targetUser: User, newRole: 'user' | 'admin') => {
    try {
      const { error } = await supabase.functions.invoke('admin-api', {
        body: {
          action: 'set-role',
          userId: targetUser.id,
          role: newRole
        }
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User ${newRole === 'admin' ? 'promoted to admin' : 'demoted to user'}`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating role:', error);
      toast({
        title: "Error",
        description: "Failed to update user role",
        variant: "destructive"
      });
    }
  };

  const handlePlanChange = async (targetUser: User, newPlan: string) => {
    try {
      const action = newPlan === 'pro' ? 'grant-pro' : 'downgrade';
      const body = {
        action,
        userId: targetUser.id,
        ...(newPlan === 'pro' ? { months: 12 } : {})
      };

      const { error } = await supabase.functions.invoke('admin-api', {
        body
      });

      if (error) throw error;

      toast({
        title: "Success",
        description: `User plan updated to ${newPlan}`,
      });

      loadUsers();
    } catch (error) {
      console.error('Error updating plan:', error);
      toast({
        title: "Error",
        description: "Failed to update user plan",
        variant: "destructive"
      });
    }
  };

  const openActionDialog = (user: User, action: typeof actionDialog.action) => {
    const dialogs = {
      'make-admin': {
        title: 'Make Admin',
        description: `Are you sure you want to promote ${user.email} to admin? They will have full system access.`
      },
      'remove-admin': {
        title: 'Remove Admin',
        description: `Are you sure you want to remove admin privileges from ${user.email}?`
      },
      'grant-pro': {
        title: 'Grant Pro Plan',
        description: `Grant Pro plan to ${user.email} for 12 months?`
      },
      'downgrade': {
        title: 'Downgrade to Free',
        description: `Downgrade ${user.email} to the free plan? This will remove Pro features immediately.`
      }
    };

    setActionDialog({
      open: true,
      user,
      action,
      ...dialogs[action]
    });
  };

  const executeAction = async () => {
    if (!actionDialog.user) return;

    switch (actionDialog.action) {
      case 'make-admin':
        await handleRoleChange(actionDialog.user, 'admin');
        break;
      case 'remove-admin':
        await handleRoleChange(actionDialog.user, 'user');
        break;
      case 'grant-pro':
        await handlePlanChange(actionDialog.user, 'pro');
        break;
      case 'downgrade':
        await handlePlanChange(actionDialog.user, 'free');
        break;
    }

    setActionDialog({ open: false, action: 'make-admin', title: '', description: '' });
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
          <h1 className="text-3xl font-bold">User Management</h1>
          <p className="text-muted-foreground">Manage user accounts, roles, and subscriptions</p>
        </div>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Filters</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex flex-col md:flex-row gap-4">
            <div className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Search by email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-9"
                />
              </div>
            </div>
            <Select value={roleFilter} onValueChange={setRoleFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Role" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Roles</SelectItem>
                <SelectItem value="user">User</SelectItem>
                <SelectItem value="admin">Admin</SelectItem>
              </SelectContent>
            </Select>
            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger className="w-[140px]">
                <SelectValue placeholder="Plan" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">All Plans</SelectItem>
                <SelectItem value="free">Free</SelectItem>
                <SelectItem value="pro">Pro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Users ({filteredUsers.length})</CardTitle>
        </CardHeader>
        <CardContent>
          {usersLoading ? (
            <div className="flex justify-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Email</TableHead>
                  <TableHead>Role</TableHead>
                  <TableHead>Plan</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Last Login</TableHead>
                  <TableHead>Created</TableHead>
                  <TableHead>Actions</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredUsers.map((user) => (
                  <TableRow key={user.id}>
                    <TableCell className="font-medium">{user.email}</TableCell>
                    <TableCell>
                      <Badge variant={user.role === 'admin' ? 'destructive' : 'secondary'}>
                        {user.role === 'admin' && <Shield className="h-3 w-3 mr-1" />}
                        {user.role}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.plan === 'pro' ? 'default' : 'outline'}>
                        {user.plan === 'pro' && <CreditCard className="h-3 w-3 mr-1" />}
                        {user.plan}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      <Badge variant={user.subscription_status === 'active' ? 'default' : 'outline'}>
                        {user.subscription_status}
                      </Badge>
                    </TableCell>
                    <TableCell>
                      {user.last_login_at ? new Date(user.last_login_at).toLocaleDateString() : 'Never'}
                    </TableCell>
                    <TableCell>{new Date(user.created_at).toLocaleDateString()}</TableCell>
                    <TableCell>
                      <div className="flex gap-2">
                        {user.role === 'user' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(user, 'make-admin')}
                          >
                            Make Admin
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(user, 'remove-admin')}
                            disabled={user.id === profile?.id}
                          >
                            Remove Admin
                          </Button>
                        )}
                        {user.plan === 'free' ? (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(user, 'grant-pro')}
                          >
                            Grant Pro
                          </Button>
                        ) : (
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => openActionDialog(user, 'downgrade')}
                          >
                            Downgrade
                          </Button>
                        )}
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>

      <AlertDialog open={actionDialog.open} onOpenChange={(open) => setActionDialog({...actionDialog, open})}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>{actionDialog.title}</AlertDialogTitle>
            <AlertDialogDescription>{actionDialog.description}</AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancel</AlertDialogCancel>
            <AlertDialogAction onClick={executeAction}>Confirm</AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}