import React, { useEffect, useRef } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Dumbbell, TrendingUp, Weight, Wand2, BarChart3, Zap, Star, Clock, Target, Users, ArrowRight } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Marketing() {
  const observerRef = useRef<IntersectionObserver | null>(null);

  useEffect(() => {
    // Set up intersection observer for scroll animations
    observerRef.current = new IntersectionObserver(
      (entries) => {
        entries.forEach((entry) => {
          if (entry.isIntersecting) {
            entry.target.classList.add('animate-in');
          }
        });
      },
      { threshold: 0.1 }
    );

    // Observe all sections
    const sections = document.querySelectorAll('.fade-in-section');
    sections.forEach((section) => observerRef.current?.observe(section));

    return () => observerRef.current?.disconnect();
  }, []);

  const proFeatures = [
    {
      icon: <Clock className="h-5 w-5" />,
      title: "Unlimited Workout History",
      description: "Access your complete training history with no time limits"
    },
    {
      icon: <Wand2 className="h-5 w-5" />,
      title: "AI-Powered Workouts",
      description: "Generate personalized workouts tailored to your goals"
    },
    {
      icon: <BarChart3 className="h-5 w-5" />,
      title: "Advanced Progress Analytics",
      description: "Detailed charts and trends for all your metrics"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "AI Daily Summaries",
      description: "Get personalized insights and recommendations"
    },
    {
      icon: <Target className="h-5 w-5" />,
      title: "Export Data",
      description: "Download your complete training data anytime"
    },
    {
      icon: <Users className="h-5 w-5" />,
      title: "Priority Support",
      description: "Get help when you need it most"
    }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="fade-in-section min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container relative z-10 text-center space-y-8">
          <div className="space-y-4">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Zap className="mr-2 h-4 w-4" />
              Fitness Tracking Reimagined
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              No Days Lost
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Build Strength, Track Progress, Never Miss a Day
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link to="/auth">Get Started Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
              <Link to="/upgrade">
                <Crown className="mr-2 h-5 w-5" />
                View Pro Features
              </Link>
            </Button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
            <img 
              src="/lovable-uploads/810109da-95f8-4bd2-8e44-0c79a9cfa2a2.png" 
              alt="No Days Lost Dashboard" 
              className="mx-auto max-w-4xl w-full rounded-lg shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* Workout Logging Section */}
      <section className="fade-in-section py-24 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-accent/10 p-4 w-fit mx-auto">
              <Dumbbell className="h-8 w-8 text-accent" />
            </div>
            <h2 className="text-4xl font-bold">Smart Workout Logging</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Log your workouts with precision. Track sets, reps, weights, and RPE with an intuitive interface designed for the gym floor.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Drag & Drop Organization</h3>
                    <p className="text-muted-foreground">Easily reorder exercises with intuitive drag and drop</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Auto-Duplicate Sets</h3>
                    <p className="text-muted-foreground">Automatically copy previous set values to speed up logging</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Mindset Tracking</h3>
                    <p className="text-muted-foreground">Monitor your mental state and focus during workouts</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <h4 className="font-semibold">Bench Press</h4>
                  <Badge>Strength</Badge>
                </div>
                <div className="space-y-2">
                  <div className="grid grid-cols-4 gap-2 text-sm text-muted-foreground">
                    <span>Set</span>
                    <span>Weight</span>
                    <span>Reps</span>
                    <span>RPE</span>
                  </div>
                  {[1, 2, 3].map((set) => (
                    <div key={set} className="grid grid-cols-4 gap-2 p-2 bg-muted rounded">
                      <span className="font-medium">{set}</span>
                      <span>185 lb</span>
                      <span>8</span>
                      <span>7.5</span>
                    </div>
                  ))}
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Weight Tracking Section */}
      <section className="fade-in-section py-24">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto">
              <Weight className="h-8 w-8 text-primary" />
            </div>
            <h2 className="text-4xl font-bold">Body Weight Tracking</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Monitor your body weight trends with beautiful charts and insights. Track your journey with precision.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 shadow-lg">
              <div className="space-y-4">
                <h4 className="font-semibold">Weight Trend (30 Days)</h4>
                <div className="h-32 flex items-end justify-between gap-1">
                  {Array.from({ length: 15 }).map((_, i) => (
                    <div 
                      key={i} 
                      className="bg-primary rounded-t flex-1"
                      style={{ height: `${Math.random() * 80 + 20}%` }}
                    ></div>
                  ))}
                </div>
                <div className="flex justify-between text-sm text-muted-foreground">
                  <span>175 lb</span>
                  <span>Current: 178 lb</span>
                  <span>180 lb</span>
                </div>
              </div>
            </Card>
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Visual Trends</h3>
                    <p className="text-muted-foreground">See your progress with intuitive charts and graphs</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Daily Logging</h3>
                    <p className="text-muted-foreground">Quick and easy daily weight entry</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Goal Tracking</h3>
                    <p className="text-muted-foreground">Set targets and monitor your progress toward them</p>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* AI Workouts Section */}
      <section className="fade-in-section py-24 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-gradient-to-br from-primary to-accent p-4 w-fit mx-auto">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold">AI-Powered Workouts</h2>
            <Badge variant="outline" className="px-4 py-2">
              <Crown className="mr-2 h-4 w-4" />
              Pro Feature
            </Badge>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Let AI create personalized workouts based on your goals, equipment, and training history. Never run out of ideas.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized Plans</h3>
                    <p className="text-muted-foreground">Workouts tailored to your equipment and preferences</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Progressive Overload</h3>
                    <p className="text-muted-foreground">AI adapts based on your training history and progress</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Variety & Balance</h3>
                    <p className="text-muted-foreground">Avoid repetition with intelligent exercise selection</p>
                  </div>
                </div>
              </div>
            </div>
            <Card className="p-8 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">AI Generated Workout</h4>
                </div>
                <div className="space-y-3">
                  <div className="p-3 bg-background rounded border">
                    <div className="font-medium">Upper Body Push</div>
                    <div className="text-sm text-muted-foreground">45 minutes • 6 exercises</div>
                  </div>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span>1. Bench Press</span>
                      <span>4 sets x 8-10 reps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>2. Overhead Press</span>
                      <span>3 sets x 10-12 reps</span>
                    </div>
                    <div className="flex justify-between">
                      <span>3. Dips</span>
                      <span>3 sets x 12-15 reps</span>
                    </div>
                    <div className="text-center text-muted-foreground">+ 3 more exercises</div>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Progress Tracking Section */}
      <section className="fade-in-section py-24">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-success/10 p-4 w-fit mx-auto">
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-4xl font-bold">Advanced Progress Tracking</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Visualize your fitness journey with comprehensive analytics, streak tracking, and detailed insights.
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-500/10 p-2">
                    <Target className="h-5 w-5 text-orange-500" />
                  </div>
                  <h4 className="font-semibold">Streak Counter</h4>
                </div>
                <div className="text-center space-y-2">
                  <div className="text-3xl font-bold text-orange-500">7</div>
                  <div className="text-sm text-muted-foreground">Days in a row</div>
                  <div className="text-xs text-muted-foreground">Best: 14 days</div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-primary/10 p-2">
                    <BarChart3 className="h-5 w-5 text-primary" />
                  </div>
                  <h4 className="font-semibold">Strength Progress</h4>
                </div>
                <div className="space-y-2">
                  <div className="flex justify-between text-sm">
                    <span>Bench Press</span>
                    <span className="text-green-500">+15 lb</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Squat</span>
                    <span className="text-green-500">+25 lb</span>
                  </div>
                  <div className="flex justify-between text-sm">
                    <span>Deadlift</span>
                    <span className="text-green-500">+30 lb</span>
                  </div>
                </div>
              </div>
            </Card>

            <Card className="p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-accent/10 p-2">
                    <Clock className="h-5 w-5 text-accent" />
                  </div>
                  <h4 className="font-semibold">Weekly Stats</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Workouts</span>
                    <span className="font-medium">4/3</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total Time</span>
                    <span className="font-medium">3h 15m</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Avg. RPE</span>
                    <span className="font-medium">7.2</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* Pricing Section */}
      <section className="fade-in-section py-24 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Choose Your Plan</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready to unlock your full potential
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            {/* Free Plan */}
            <Card className="p-8 shadow-lg">
              <div className="space-y-6">
                <div>
                  <h3 className="text-2xl font-bold">Free</h3>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$0</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Basic workout logging</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>2 days of history</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Weight tracking</span>
                  </li>
                  <li className="flex items-center gap-2">
                    <Check className="h-4 w-4 text-green-500" />
                    <span>Basic progress tracking</span>
                  </li>
                </ul>

                <Button asChild variant="outline" className="w-full">
                  <Link to="/auth">Get Started Free</Link>
                </Button>
              </div>
            </Card>

            {/* Pro Plan */}
            <Card className="p-8 shadow-lg border-2 border-primary/50 relative">
              <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
                  MOST POPULAR
                </Badge>
              </div>
              
              <div className="space-y-6">
                <div>
                  <div className="flex items-center gap-2">
                    <Crown className="h-6 w-6 text-accent" />
                    <h3 className="text-2xl font-bold">Pro</h3>
                  </div>
                  <div className="mt-2">
                    <span className="text-4xl font-bold">$9.99</span>
                    <span className="text-muted-foreground">/month</span>
                  </div>
                </div>
                
                <ul className="space-y-3">
                  {proFeatures.map((feature, index) => (
                    <li key={index} className="flex items-start gap-3">
                      <div className="text-accent mt-0.5">
                        {feature.icon}
                      </div>
                      <div>
                        <div className="font-medium text-sm">{feature.title}</div>
                        <div className="text-xs text-muted-foreground">{feature.description}</div>
                      </div>
                    </li>
                  ))}
                </ul>

                <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg">
                  <Link to="/upgrade">
                    Upgrade to Pro
                    <ArrowRight className="ml-2 h-4 w-4" />
                  </Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="fade-in-section py-24">
        <div className="container text-center space-y-8">
          <div className="space-y-4">
            <h2 className="text-4xl font-bold">Ready to Start Your Journey?</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Join thousands of users who have transformed their fitness with No Days Lost
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link to="/auth">Start Free Today</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
              <Link to="/upgrade">
                <Crown className="mr-2 h-5 w-5" />
                Go Pro
              </Link>
            </Button>
          </div>
        </div>
      </section>
    </div>
  );
}