import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  Dumbbell, 
  Sparkles, 
  TrendingUp, 
  History, 
  ArrowRight,
  Zap
} from 'lucide-react';

const motivationalHeadlines = [
  "How will you get the most out of today?",
  "No Days Lost. Today starts here.",
  "Strong habits. Stronger you.",
  "Consistency creates progress.",
];

const motivationalPrompts = [
  "Every rep, every run, every set builds your journey. Let's start strong.",
  "What's your next move?",
  "Today's effort shapes tomorrow's strength.",
  "Your journey continues here.",
];

export default function Welcome() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [currentHeadline] = useState(() => {
    const today = new Date().getDate();
    return motivationalHeadlines[today % motivationalHeadlines.length];
  });
  const [currentPrompt] = useState(() => {
    const today = new Date().getDate();
    return motivationalPrompts[today % motivationalPrompts.length];
  });

  useEffect(() => {
    // Mark that user has seen welcome page today
    if (user) {
      updateWelcomeSeenAt();
    }
  }, [user]);

  const updateWelcomeSeenAt = async () => {
    try {
      await supabase
        .from('profiles')
        .update({ last_welcome_seen_at: new Date().toISOString() })
        .eq('id', user?.id);
    } catch (error) {
      console.error('Error updating welcome seen timestamp:', error);
    }
  };

  const navigationOptions = [
    {
      title: "Log Today's Workout",
      description: "Start your training session",
      href: "/log",
      icon: Dumbbell,
      gradient: "from-primary to-primary/80",
      hoverColor: "hover:from-primary/90 hover:to-primary/70"
    },
    {
      title: "Generate a Workout",
      description: "AI-powered workout creation",
      href: "/generate",
      icon: Sparkles,
      gradient: "from-accent to-accent/80",
      hoverColor: "hover:from-accent/90 hover:to-accent/70"
    },
    {
      title: "View Progress",
      description: "Track your improvements",
      href: "/progress",
      icon: TrendingUp,
      gradient: "from-success to-success/80",
      hoverColor: "hover:from-success/90 hover:to-success/70"
    },
    {
      title: "Check History",
      description: "Review past workouts",
      href: "/history",
      icon: History,
      gradient: "from-muted-foreground to-muted-foreground/80",
      hoverColor: "hover:from-muted-foreground/90 hover:to-muted-foreground/70"
    }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-background to-accent/5 flex items-center justify-center p-4">
      <div className="w-full max-w-4xl mx-auto space-y-12">
        
        {/* Hero Section */}
        <div className="text-center space-y-6 animate-fade-in">
          <div className="space-y-4">
            <h1 className="text-4xl md:text-6xl font-bold tracking-tight bg-gradient-to-r from-foreground to-muted-foreground bg-clip-text text-transparent">
              {currentHeadline}
            </h1>
            <p className="text-lg md:text-xl text-muted-foreground max-w-2xl mx-auto leading-relaxed">
              {currentPrompt}
            </p>
          </div>
          
          {/* Energy indicator */}
          <div className="flex items-center justify-center gap-2 text-accent animate-pulse">
            <Zap className="h-5 w-5" />
            <span className="text-sm font-medium tracking-wide">READY TO DOMINATE</span>
            <Zap className="h-5 w-5" />
          </div>
        </div>

        {/* Navigation Options */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 animate-fade-in" style={{ animationDelay: '0.2s' }}>
          {navigationOptions.map((option, index) => (
            <Link key={option.href} to={option.href} className="group">
              <Card className={`h-full border-0 shadow-lg transition-all duration-300 hover:shadow-xl hover:scale-[1.02] bg-gradient-to-br ${option.gradient} ${option.hoverColor} text-white overflow-hidden relative`}>
                <CardContent className="p-8 h-full flex flex-col justify-between relative z-10">
                  <div className="space-y-4">
                    <div className="flex items-center gap-4">
                      <div className="rounded-full bg-white/20 p-3 group-hover:bg-white/30 transition-colors">
                        <option.icon className="h-8 w-8" />
                      </div>
                      <div className="flex-1">
                        <h3 className="text-xl font-bold mb-2">{option.title}</h3>
                        <p className="text-white/80 text-sm">{option.description}</p>
                      </div>
                    </div>
                  </div>
                  
                  <div className="flex items-center justify-between mt-6">
                    <div className="flex items-center gap-2 text-white/80 group-hover:text-white transition-colors">
                      <span className="text-sm font-medium">Let's go</span>
                      <ArrowRight className="h-4 w-4 transform group-hover:translate-x-1 transition-transform" />
                    </div>
                  </div>
                </CardContent>
                
                {/* Subtle pattern overlay */}
                <div className="absolute inset-0 bg-gradient-to-r from-transparent via-white/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
              </Card>
            </Link>
          ))}
        </div>

        {/* Skip to Dashboard */}
        <div className="text-center space-y-4 animate-fade-in" style={{ animationDelay: '0.4s' }}>
          <Button 
            variant="ghost" 
            size="sm"
            onClick={() => navigate('/')}
            className="text-muted-foreground hover:text-foreground transition-colors"
          >
            Skip to Dashboard
          </Button>
          <p className="text-xs text-muted-foreground">
            You'll see this welcome page once per day
          </p>
        </div>
      </div>
    </div>
  );
}
