import { Navigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { useResponsiveText } from '@/lib/responsive-utils';
import { Dumbbell, Plus, History, TrendingUp, Weight, Target, Footprints, Clock } from 'lucide-react';
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
      {/* Header Section */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Today</h1>
          <p className="text-muted-foreground">Track your progress</p>
        </div>
        <Button variant="outline" size="sm">
          Edit
        </Button>
      </div>

      {/* Main Progress Card */}
      <Card className="p-6">
        <div className="text-center mb-6">
          <h2 className="text-xl font-semibold mb-2">Workout Progress</h2>
          <p className="text-sm text-muted-foreground">Today's Targets</p>
        </div>
        
        <div className="flex flex-col lg:flex-row items-center justify-between gap-8">
          {/* Circular Progress */}
          <div className="relative flex items-center justify-center">
            <div className="relative w-48 h-48">
              <svg className="w-full h-full transform -rotate-90" viewBox="0 0 100 100">
                {/* Background Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--muted))"
                  strokeWidth="8"
                />
                {/* Progress Circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--primary))"
                  strokeWidth="8"
                  strokeDasharray={`${65} ${35}`}
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
                {/* Orange accent circle */}
                <circle
                  cx="50"
                  cy="50"
                  r="40"
                  fill="none"
                  stroke="hsl(var(--accent))"
                  strokeWidth="8"
                  strokeDasharray={`${20} ${80}`}
                  strokeDashoffset="-65"
                  strokeLinecap="round"
                  className="transition-all duration-300"
                />
              </svg>
              <div className="absolute inset-0 flex flex-col items-center justify-center">
                <div className="text-4xl font-bold">0</div>
                <div className="text-sm text-muted-foreground">Workouts</div>
              </div>
            </div>
          </div>
          
          {/* Stats */}
          <div className="space-y-4 flex-1 max-w-xs">
            <div className="flex items-center gap-3">
              <Target className="h-5 w-5 text-muted-foreground" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">Week Goal</span>
                  <span className="text-sm font-bold">3</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <Dumbbell className="h-5 w-5 text-accent" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">This Week</span>
                  <span className="text-sm font-bold">0</span>
                </div>
              </div>
            </div>
            
            <div className="flex items-center gap-3">
              <TrendingUp className="h-5 w-5 text-success" />
              <div className="flex-1">
                <div className="flex justify-between">
                  <span className="text-sm font-medium">PRs Set</span>
                  <span className="text-sm font-bold">0</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </Card>

      {/* Quick Actions Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <Plus className="h-8 w-8 mx-auto text-accent mb-2" />
            <h3 className="font-semibold mb-1">Start Workout</h3>
            <p className="text-xs text-muted-foreground mb-3">Begin training</p>
            <Button asChild size="sm" className="w-full">
              <a href="/log">Start</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <History className="h-8 w-8 mx-auto text-primary mb-2" />
            <h3 className="font-semibold mb-1">History</h3>
            <p className="text-xs text-muted-foreground mb-3">Past workouts</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/history">View</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <TrendingUp className="h-8 w-8 mx-auto text-success mb-2" />
            <h3 className="font-semibold mb-1">Progress</h3>
            <p className="text-xs text-muted-foreground mb-3">Track gains</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/progress">View</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="hover:shadow-lg transition-all cursor-pointer hover:scale-105">
          <CardContent className="p-4 text-center">
            <Weight className="h-8 w-8 mx-auto text-muted-foreground mb-2" />
            <h3 className="font-semibold mb-1">Weight</h3>
            <p className="text-xs text-muted-foreground mb-3">Body tracking</p>
            <Button asChild variant="outline" size="sm" className="w-full">
              <a href="/weight">Log</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Footprints className="h-5 w-5 text-accent" />
                <span className="font-semibold">Steps</span>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">0</div>
              <div className="text-xs text-muted-foreground">Goal: 10,000 steps</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full w-0"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Dumbbell className="h-5 w-5 text-success" />
                <span className="font-semibold">Exercise</span>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-2xl font-bold">0 min</div>
              <div className="text-xs text-muted-foreground">This week</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1">
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-2">
              <div className="flex items-center gap-2">
                <Weight className="h-5 w-5 text-primary" />
                <span className="font-semibold">Weight</span>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground" />
            </div>
            <div className="space-y-1">
              <div className="text-xs text-muted-foreground">Last 30 days</div>
              <div className="h-12 flex items-end justify-between">
                <div className="w-1 bg-muted rounded-full h-8"></div>
                <div className="w-1 bg-muted rounded-full h-6"></div>
                <div className="w-1 bg-muted rounded-full h-10"></div>
                <div className="w-1 bg-muted rounded-full h-4"></div>
                <div className="w-1 bg-muted rounded-full h-7"></div>
                <div className="w-1 bg-muted rounded-full h-9"></div>
                <div className="w-1 bg-primary rounded-full h-12"></div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Recent Activity */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <RecentWorkouts />
        <WeightTracker />
      </div>
    </div>
  );
};

export default Index;
