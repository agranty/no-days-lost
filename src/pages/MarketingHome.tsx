import React, { useEffect, useState } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { 
  Check, 
  Crown, 
  Dumbbell, 
  TrendingUp, 
  Weight, 
  Wand2, 
  BarChart3, 
  Zap, 
  Star, 
  Clock, 
  Target, 
  Users, 
  ArrowRight,
  Menu,
  X,
  History,
  Activity
} from 'lucide-react';
import { Link } from 'react-router-dom';

export default function MarketingHome() {
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  useEffect(() => {
    // Smooth scroll for anchor links
    const handleClick = (e: Event) => {
      const target = e.target as HTMLAnchorElement;
      if (target.getAttribute('href')?.startsWith('#')) {
        e.preventDefault();
        const id = target.getAttribute('href')?.slice(1);
        const element = document.getElementById(id);
        if (element) {
          element.scrollIntoView({ behavior: 'smooth' });
          setIsMenuOpen(false);
        }
      }
    };

    document.addEventListener('click', handleClick);
    return () => document.removeEventListener('click', handleClick);
  }, []);

  const features = [
    {
      icon: <Dumbbell className="h-8 w-8" />,
      title: "Workout Logging",
      description: "Track sets, reps, RPE, and custom exercises with intuitive drag-and-drop interface"
    },
    {
      icon: <Weight className="h-8 w-8" />,
      title: "Weight Tracking", 
      description: "Quick daily entries with one-decimal precision and beautiful trend visualizations"
    },
    {
      icon: <Wand2 className="h-8 w-8" />,
      title: "Generative AI Workouts",
      description: "Personalized workout plans from your goals, equipment, and training history"
    },
    {
      icon: <TrendingUp className="h-8 w-8" />,
      title: "Progress Tracking",
      description: "PRs, 1RM trends, body-part volume analysis, and calendar heatmaps"
    }
  ];

  const comparisonFeatures = [
    { feature: "Workout logging", free: true, pro: true },
    { feature: "Weight tracking", free: true, pro: true },
    { feature: "Basic progress charts", free: true, pro: true },
    { feature: "Workout history", free: "Last 2 days", pro: "Unlimited" },
    { feature: "AI daily summaries", free: false, pro: true },
    { feature: "AI workout generator", free: false, pro: true },
    { feature: "Export to Google Sheets/CSV", free: false, pro: true },
    { feature: "Advanced analytics", free: false, pro: true },
    { feature: "Body-part balance charts", free: false, pro: true },
    { feature: "Calendar heatmap", free: false, pro: true },
    { feature: "Exercise comparisons", free: false, pro: true }
  ];

  return (
    <div className="min-h-screen bg-background">
      {/* Header */}
      <header className="sticky top-0 z-50 w-full border-b bg-background/95 backdrop-blur supports-[backdrop-filter]:bg-background/60">
        <div className="container flex h-16 items-center justify-between">
          <Link to="/" className="flex items-center space-x-2">
            <Dumbbell className="h-6 w-6 text-primary" />
            <span className="font-bold text-xl">No Days Lost</span>
          </Link>

          {/* Desktop Navigation */}
          <nav className="hidden md:flex items-center space-x-6">
            <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
            <a href="#ai" className="text-sm font-medium hover:text-primary transition-colors">AI Workouts</a>
            <a href="#progress" className="text-sm font-medium hover:text-primary transition-colors">Progress</a>
            <a href="#plans" className="text-sm font-medium hover:text-primary transition-colors">Free vs Pro</a>
            <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About Us</a>
          </nav>

          {/* Desktop Actions */}
          <div className="hidden md:flex items-center space-x-4">
            <Button asChild variant="ghost">
              <Link to="/auth">Login</Link>
            </Button>
            <Button asChild>
              <Link to="/auth">Sign Up</Link>
            </Button>
          </div>

          {/* Mobile Menu Button */}
          <button
            className="md:hidden"
            onClick={() => setIsMenuOpen(!isMenuOpen)}
          >
            {isMenuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
          </button>
        </div>

        {/* Mobile Menu */}
        {isMenuOpen && (
          <div className="md:hidden border-t bg-background">
            <div className="container py-4 space-y-4">
              <nav className="flex flex-col space-y-3">
                <a href="#features" className="text-sm font-medium hover:text-primary transition-colors">Features</a>
                <a href="#ai" className="text-sm font-medium hover:text-primary transition-colors">AI Workouts</a>
                <a href="#progress" className="text-sm font-medium hover:text-primary transition-colors">Progress</a>
                <a href="#plans" className="text-sm font-medium hover:text-primary transition-colors">Free vs Pro</a>
                <a href="#about" className="text-sm font-medium hover:text-primary transition-colors">About Us</a>
              </nav>
              <div className="flex flex-col space-y-2 pt-4 border-t">
                <Button asChild variant="ghost" className="justify-start">
                  <Link to="/auth">Login</Link>
                </Button>
                <Button asChild className="justify-start">
                  <Link to="/auth">Sign Up</Link>
                </Button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Hero Section */}
      <section className="min-h-screen flex items-center justify-center relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-background to-accent/10"></div>
        <div className="container relative z-10 text-center space-y-8 py-24">
          <div className="space-y-6">
            <Badge variant="outline" className="px-4 py-2 text-sm font-medium">
              <Zap className="mr-2 h-4 w-4" />
              Fitness Tracking Reimagined
            </Badge>
            <h1 className="text-5xl md:text-7xl font-bold tracking-tight">
              No Days Lost
            </h1>
            <p className="text-xl md:text-2xl text-muted-foreground max-w-3xl mx-auto">
              Track every rep. See real progress. Build consistency.
            </p>
          </div>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Button asChild size="lg" className="h-12 px-8 text-lg">
              <Link to="/auth">Get Started — Free</Link>
            </Button>
            <Button asChild variant="outline" size="lg" className="h-12 px-8 text-lg">
              <a href="#features">See Features</a>
            </Button>
          </div>

          <div className="mt-16 relative">
            <div className="absolute inset-0 bg-gradient-to-t from-background via-transparent to-transparent z-10"></div>
            <img 
              src="/lovable-uploads/810109da-95f8-4bd2-8e44-0c79a9cfa2a2.png" 
              alt="No Days Lost Dashboard Preview" 
              className="mx-auto max-w-4xl w-full rounded-lg shadow-2xl border"
            />
          </div>
        </div>
      </section>

      {/* Features Overview */}
      <section id="features" className="py-24 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Everything you need to track progress</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive fitness tracking tools designed for real people with real goals
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8">
            {features.map((feature, index) => (
              <Card key={index} className="p-6 text-center hover:shadow-lg transition-shadow">
                <CardContent className="space-y-4">
                  <div className="rounded-full bg-primary/10 p-4 w-fit mx-auto text-primary">
                    {feature.icon}
                  </div>
                  <h3 className="font-semibold text-lg">{feature.title}</h3>
                  <p className="text-muted-foreground text-sm">{feature.description}</p>
                </CardContent>
              </Card>
            ))}
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/auth">Start Free</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* AI Workouts */}
      <section id="ai" className="py-24">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-gradient-to-br from-primary to-accent p-4 w-fit mx-auto">
              <Wand2 className="h-8 w-8 text-white" />
            </div>
            <h2 className="text-4xl font-bold">AI that plans your next session</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Uses body parts, time, equipment, and intensity preferences. Adapts to your recent training to avoid repetition.
            </p>
          </div>
          
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <Card className="p-8 shadow-lg bg-gradient-to-br from-primary/5 to-accent/5">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <Wand2 className="h-5 w-5 text-primary" />
                  <h4 className="font-semibold">AI Generated Workout</h4>
                  <Badge variant="outline" className="text-xs">
                    <Crown className="mr-1 h-3 w-3" />
                    Pro
                  </Badge>
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
            <div className="space-y-6">
              <div className="space-y-4">
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Personalized Plans</h3>
                    <p className="text-muted-foreground">Tailored to your equipment, goals, and available time</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Smart Progression</h3>
                    <p className="text-muted-foreground">Adapts based on your training history and recent sessions</p>
                  </div>
                </div>
                <div className="flex items-start gap-4">
                  <div className="rounded-full bg-primary/10 p-2 mt-1">
                    <Check className="h-4 w-4 text-primary" />
                  </div>
                  <div>
                    <h3 className="font-semibold">Variety & Balance</h3>
                    <p className="text-muted-foreground">Intelligent exercise selection prevents repetitive routines</p>
                  </div>
                </div>
              </div>
              <div className="flex gap-4">
                <Button asChild>
                  <Link to="/auth">Try AI Workouts</Link>
                </Button>
                <Button asChild variant="outline">
                  <a href="#plans">See Pro Pricing</a>
                </Button>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Progress Tracking */}
      <section id="progress" className="py-24 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <div className="rounded-full bg-success/10 p-4 w-fit mx-auto">
              <TrendingUp className="h-8 w-8 text-success" />
            </div>
            <h2 className="text-4xl font-bold">See your progress, clearly</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Comprehensive analytics that help you understand your fitness journey
            </p>
          </div>
          
          <div className="grid lg:grid-cols-3 gap-8">
            <Card className="p-6 shadow-lg">
              <div className="space-y-4">
                <div className="flex items-center gap-2">
                  <div className="rounded-full bg-orange-500/10 p-2">
                    <Target className="h-5 w-5 text-orange-500" />
                  </div>
                  <h4 className="font-semibold">Streak Tracking</h4>
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
                  <h4 className="font-semibold">1RM & Volume Trends</h4>
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
                    <Weight className="h-5 w-5 text-accent" />
                  </div>
                  <h4 className="font-semibold">Weight Overlay</h4>
                </div>
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Current</span>
                    <span className="font-medium">175.2 lb</span>
                  </div>
                  <div className="flex justify-between">
                    <span>30-day change</span>
                    <span className="font-medium text-green-500">-2.1 lb</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Trend</span>
                    <span className="font-medium">Decreasing</span>
                  </div>
                </div>
              </div>
            </Card>
          </div>

          <div className="text-center">
            <Button asChild size="lg">
              <Link to="/auth">Start Tracking</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* Free vs Pro Comparison */}
      <section id="plans" className="py-24">
        <div className="container space-y-12">
          <div className="text-center space-y-4">
            <h2 className="text-4xl font-bold">Free vs Pro</h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Start free and upgrade when you're ready for advanced features
            </p>
          </div>

          {/* Comparison Table */}
          <div className="max-w-4xl mx-auto overflow-x-auto">
            <table className="w-full border-collapse bg-background rounded-lg shadow-lg overflow-hidden">
              <thead>
                <tr className="bg-muted/50">
                  <th className="text-left p-4 font-semibold">Feature</th>
                  <th className="text-center p-4 font-semibold">Free</th>
                  <th className="text-center p-4 font-semibold bg-primary/5">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4 text-primary" />
                      Pro
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {comparisonFeatures.map((item, index) => (
                  <tr key={index} className="border-t">
                    <td className="p-4 font-medium">{item.feature}</td>
                    <td className="p-4 text-center">
                      {typeof item.free === 'boolean' ? (
                        item.free ? (
                          <Check className="h-5 w-5 text-green-500 mx-auto" />
                        ) : (
                          <X className="h-5 w-5 text-muted-foreground mx-auto" />
                        )
                      ) : (
                        <span className="text-sm text-muted-foreground">{item.free}</span>
                      )}
                    </td>
                    <td className="p-4 text-center bg-primary/5">
                      {typeof item.pro === 'boolean' ? (
                        <Check className="h-5 w-5 text-green-500 mx-auto" />
                      ) : (
                        <span className="text-sm font-medium">{item.pro}</span>
                      )}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>

          {/* Pricing Cards */}
          <div className="grid md:grid-cols-2 gap-8 max-w-4xl mx-auto">
            <Card className="p-8 text-center shadow-lg">
              <div className="space-y-4">
                <h3 className="text-2xl font-bold">Free</h3>
                <div className="text-4xl font-bold">$0</div>
                <p className="text-muted-foreground">Get started in minutes</p>
                <Button asChild className="w-full" size="lg">
                  <Link to="/auth">Start Free</Link>
                </Button>
              </div>
            </Card>

            <Card className="p-8 text-center shadow-lg border-primary relative">
              <Badge className="absolute -top-3 left-1/2 transform -translate-x-1/2">
                Most Popular
              </Badge>
              <div className="space-y-4">
                <div className="flex items-center justify-center gap-2">
                  <Crown className="h-5 w-5 text-primary" />
                  <h3 className="text-2xl font-bold">Pro</h3>
                </div>
                <div className="space-y-1">
                  <div className="text-4xl font-bold">$9.99</div>
                  <div className="text-sm text-muted-foreground">per month</div>
                  <div className="text-xs text-muted-foreground">Annual: $99.99 (save 17%)</div>
                </div>
                <p className="text-muted-foreground">Unlock AI workouts and unlimited history</p>
                <Button asChild className="w-full" size="lg">
                  <Link to="/upgrade">Upgrade to Pro</Link>
                </Button>
              </div>
            </Card>
          </div>
        </div>
      </section>

      {/* About Us */}
      <section id="about" className="py-24 bg-muted/30">
        <div className="container space-y-12">
          <div className="text-center space-y-6 max-w-3xl mx-auto">
            <h2 className="text-4xl font-bold">Built by everyday lifters</h2>
            <div className="text-lg text-muted-foreground space-y-4">
              <p>
                We're average people who prioritize health, efficiency, and growth tracking. 
                We couldn't find anything that made it easy to create customized workouts, 
                track progress, and do it simply.
              </p>
              <p>
                So we built No Days Lost—where nothing gets lost and every day builds toward your goals.
              </p>
            </div>
            <Button asChild size="lg">
              <Link to="/auth">Join Us</Link>
            </Button>
          </div>
        </div>
      </section>

      {/* FAQ Section */}
      <section className="py-24 bg-muted/30">
        <div className="container">
          <div className="text-center mb-16">
            <h2 className="text-3xl font-bold tracking-tight mb-4">
              Frequently Asked Questions
            </h2>
            <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
              Quick answers to help you get started
            </p>
          </div>

          <div className="max-w-4xl mx-auto space-y-8">
            {/* FAQ 1 */}
            <div className="bg-background rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">What's included in the Free plan?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Free users can log workouts, track weight, and see the last 2 days of history. 
                This lets you try the core features before upgrading.
              </p>
            </div>

            {/* FAQ 2 */}
            <div className="bg-background rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">What extra features come with Pro?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Pro unlocks unlimited history, AI-generated workouts, daily AI summaries, 
                exports to Google Sheets, and advanced charts to give you deeper insight into your progress.
              </p>
            </div>

            {/* FAQ 3 */}
            <div className="bg-background rounded-lg p-8 shadow-sm">
              <h3 className="text-xl font-semibold mb-4">Do I need to be a serious athlete to use the app?</h3>
              <p className="text-muted-foreground leading-relaxed">
                Not at all! No Days Lost is built for everyday people who want to build consistency, 
                track progress, and make workouts easier—whether you're new to the gym or experienced.
              </p>
            </div>
          </div>

          {/* CTA Block */}
          <div className="max-w-2xl mx-auto mt-16 text-center">
            <div className="bg-background rounded-lg p-8 shadow-sm">
              <p className="text-lg text-muted-foreground mb-6">
                Still have questions? Contact us at{' '}
                <a 
                  href="mailto:support@nodayslost.app" 
                  className="text-primary font-medium hover:underline"
                >
                  support@nodayslost.app
                </a>
              </p>
              <Button size="lg" asChild>
                <Link to="/auth">Sign Up Free</Link>
              </Button>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="border-t bg-muted/30">
        <div className="container py-12">
          <div className="grid md:grid-cols-4 gap-8">
            <div className="space-y-4">
              <div className="flex items-center space-x-2">
                <Dumbbell className="h-6 w-6 text-primary" />
                <span className="font-bold text-xl">No Days Lost</span>
              </div>
              <p className="text-sm text-muted-foreground">
                Consistency Creates Progress
              </p>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Product</h4>
              <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <a href="#features" className="hover:text-primary transition-colors">Features</a>
                <a href="#plans" className="hover:text-primary transition-colors">Free vs Pro</a>
                <Link to="/compare" className="hover:text-primary transition-colors">Compare Plans</Link>
              </nav>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Company</h4>
              <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <a href="#about" className="hover:text-primary transition-colors">About</a>
                <Link to="/faq" className="hover:text-primary transition-colors">FAQ</Link>
                <a href="mailto:support@nodayslost.app" className="hover:text-primary transition-colors">Support</a>
              </nav>
            </div>
            
            <div className="space-y-4">
              <h4 className="font-semibold">Legal</h4>
              <nav className="flex flex-col space-y-2 text-sm text-muted-foreground">
                <a href="/privacy" className="hover:text-primary transition-colors">Privacy</a>
                <a href="/terms" className="hover:text-primary transition-colors">Terms</a>
              </nav>
            </div>
          </div>
          
          <div className="border-t mt-8 pt-8 text-center text-sm text-muted-foreground">
            <p>&copy; 2024 No Days Lost. All rights reserved.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}