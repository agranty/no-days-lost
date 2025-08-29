import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useResponsiveText } from '@/lib/responsive-utils';
import { Dumbbell, Plus, History, TrendingUp, Weight } from 'lucide-react';
import RecentWorkouts from '@/components/RecentWorkouts';
import WeightTracker from '@/components/WeightTracker';

const Index = () => {
  const { user, loading } = useAuth();
  const responsiveText = useResponsiveText();

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-center">
          <Dumbbell className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p>Loading...</p>
        </div>
      </div>
    );
  }

  if (!user) {
    return <Navigate to="/auth" replace />;
  }

  return (
    <div className="space-y-6">
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Welcome to No Days Lost</h1>
        <p className="text-xl text-muted-foreground">Track your fitness journey, achieve your goals</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Plus className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>{responsiveText.workoutLog}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Start tracking your training session</p>
            <Button asChild className="w-full">
              <a href="/log">Start Logging</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <History className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>History</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">View your past workouts</p>
            <Button asChild variant="outline" className="w-full">
              <a href="/history">View History</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <TrendingUp className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>Progress</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Track your improvements</p>
            <Button asChild variant="outline" className="w-full">
              <a href="/progress">View Progress</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-shadow cursor-pointer">
          <CardHeader className="text-center">
            <Weight className="h-12 w-12 mx-auto text-primary mb-2" />
            <CardTitle>{responsiveText.bodyWeight}</CardTitle>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-muted-foreground mb-4">Log your body weight</p>
            <Button asChild variant="outline" className="w-full">
              <a href="/weight">Log Weight</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Quick Stats</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">Total Workouts</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">This Week</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">0</div>
              <div className="text-sm text-muted-foreground">{responsiveText.personalRecord}s Set</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-primary">-</div>
              <div className="text-sm text-muted-foreground">Last Workout</div>
            </div>
          </div>
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentWorkouts />
        <WeightTracker />
      </div>
    </div>
  );
};

export default Index;
