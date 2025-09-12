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
          <h1 className="text-4xl font-bold tracking-tight">Dashboard</h1>
          <p className="text-muted-foreground text-lg">Consistency Creates Progress</p>
        </div>
        <Button variant="outline" size="sm" className="h-10 px-4">
          View All
        </Button>
      </div>

      {/* Main Progress Card */}
      <Card className="p-8 shadow-sm border-0">
        <div className="text-center mb-8">
          <h2 className="text-2xl font-bold mb-3">Weekly Progress</h2>
          <p className="text-muted-foreground">Track your weekly fitness goals</p>
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
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm hover:scale-[1.02]">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-accent/10 p-3 w-fit mx-auto mb-4">
              <Plus className="h-6 w-6 text-accent" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Start Workout</h3>
            <p className="text-sm text-muted-foreground mb-4">Begin your training session</p>
            <Button asChild size="sm" className="w-full h-10">
              <a href="/log">Get Started</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm hover:scale-[1.02]">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-4">
              <History className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">View History</h3>
            <p className="text-sm text-muted-foreground mb-4">Review past workouts</p>
            <Button asChild variant="outline" size="sm" className="w-full h-10">
              <a href="/history">Browse</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm hover:scale-[1.02]">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-success/10 p-3 w-fit mx-auto mb-4">
              <TrendingUp className="h-6 w-6 text-success" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Track Progress</h3>
            <p className="text-sm text-muted-foreground mb-4">Monitor improvements</p>
            <Button asChild variant="outline" size="sm" className="w-full h-10">
              <a href="/progress">Analyze</a>
            </Button>
          </CardContent>
        </Card>

        <Card className="group hover:shadow-md transition-all duration-200 cursor-pointer border-0 shadow-sm hover:scale-[1.02]">
          <CardContent className="p-6 text-center">
            <div className="rounded-full bg-primary/10 p-3 w-fit mx-auto mb-4">
              <Weight className="h-6 w-6 text-primary" />
            </div>
            <h3 className="font-semibold text-lg mb-2">Log Weight</h3>
            <p className="text-sm text-muted-foreground mb-4">Track body weight</p>
            <Button asChild variant="outline" size="sm" className="w-full h-10">
              <a href="/weight">Record</a>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Activity Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-accent/10 p-2">
                  <Footprints className="h-5 w-5 text-accent" />
                </div>
                <span className="font-semibold text-lg">Daily Steps</span>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold">0</div>
              <div className="text-sm text-muted-foreground">Goal: 10,000 steps</div>
              <div className="w-full bg-muted rounded-full h-2">
                <div className="bg-accent h-2 rounded-full w-0 transition-all duration-300"></div>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-success/10 p-2">
                  <Dumbbell className="h-5 w-5 text-success" />
                </div>
                <span className="font-semibold text-lg">Weekly Exercise</span>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="text-3xl font-bold">0 <span className="text-base text-muted-foreground">min</span></div>
              <div className="text-sm text-muted-foreground">This week</div>
            </div>
          </CardContent>
        </Card>

        <Card className="md:col-span-2 lg:col-span-1 border-0 shadow-sm">
          <CardContent className="p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="rounded-full bg-primary/10 p-2">
                  <Weight className="h-5 w-5 text-primary" />
                </div>
                <span className="font-semibold text-lg">Weight Trend</span>
              </div>
              <Plus className="h-4 w-4 text-muted-foreground cursor-pointer hover:text-primary transition-colors" />
            </div>
            <div className="space-y-3">
              <div className="text-sm text-muted-foreground">Last 30 days</div>
              <div className="h-16 flex items-end justify-between gap-1">
                <div className="w-2 bg-muted rounded-full h-10"></div>
                <div className="w-2 bg-muted rounded-full h-8"></div>
                <div className="w-2 bg-muted rounded-full h-12"></div>
                <div className="w-2 bg-muted rounded-full h-6"></div>
                <div className="w-2 bg-muted rounded-full h-9"></div>
                <div className="w-2 bg-muted rounded-full h-11"></div>
                <div className="w-2 bg-primary rounded-full h-16"></div>
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
