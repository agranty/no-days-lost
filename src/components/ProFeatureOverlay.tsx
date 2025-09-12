import React, { useState, useEffect } from 'react';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Link } from 'react-router-dom';
import { Lock, Zap, TrendingUp, Target, Crown } from 'lucide-react';
import { cn } from '@/lib/utils';

interface ProFeatureOverlayProps {
  children: React.ReactNode;
  feature: string;
  className?: string;
  blurIntensity?: 'light' | 'medium' | 'heavy';
}

const motivationalTaglines = [
  "Consistency Creates Progress.",
  "Strength Built Daily.",
  "Effort Becomes Results.",
  "Momentum Creates Progress.",
  "Every Rep Counts.",
  "Stronger Every Session.",
  "Progress Unlocked Daily.",
  "Your Journey Awaits.",
  "Elevate Your Training.",
  "Unleash Your Potential."
];

const getRandomTagline = () => {
  return motivationalTaglines[Math.floor(Math.random() * motivationalTaglines.length)];
};

export function ProFeatureOverlay({ 
  children, 
  feature, 
  className,
  blurIntensity = 'medium'
}: ProFeatureOverlayProps) {
  const [tagline, setTagline] = useState('');

  useEffect(() => {
    setTagline(getRandomTagline());
  }, []);

  const blurClass = {
    light: 'backdrop-blur-sm',
    medium: 'backdrop-blur-md', 
    heavy: 'backdrop-blur-lg'
  }[blurIntensity];

  return (
    <div className={cn("relative", className)}>
      {/* Blurred Content */}
      <div className={cn("transition-all duration-300", blurClass)}>
        {children}
      </div>
      
      {/* Overlay */}
      <div className="absolute inset-0 bg-background/80 backdrop-blur-sm flex items-center justify-center p-4">
        <Card className="w-full max-w-md shadow-xl border-2 border-primary/20 bg-card/95 backdrop-blur-sm">
          <CardContent className="p-8 text-center space-y-6">
            {/* Lock Icon with Crown */}
            <div className="relative mx-auto w-fit">
              <div className="rounded-full bg-gradient-to-r from-primary to-accent p-4">
                <Lock className="h-8 w-8 text-white" />
              </div>
              <Crown className="absolute -top-2 -right-2 h-6 w-6 text-accent drop-shadow-lg" />
            </div>

            {/* Pro Badge */}
            <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1.5 text-sm font-semibold">
              PRO FEATURE
            </Badge>

            {/* Motivational Tagline */}
            <div className="space-y-2">
              <div className="flex items-center justify-center gap-2">
                <Zap className="h-5 w-5 text-accent animate-pulse" />
                <p className="text-xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
                  {tagline}
                </p>
                <Zap className="h-5 w-5 text-accent animate-pulse" />
              </div>
            </div>

            {/* Feature Description */}
            <div className="space-y-2">
              <p className="text-muted-foreground text-sm">
                Pro feature — unlock now to continue your journey.
              </p>
              <p className="text-xs text-muted-foreground">
                {feature}
              </p>
            </div>

            {/* Upgrade CTA */}
            <Button asChild size="lg" className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg">
              <Link to="/upgrade" className="gap-2">
                <Crown className="h-5 w-5" />
                Upgrade to Pro
              </Link>
            </Button>

            {/* Features Hint */}
            <div className="pt-2 text-xs text-muted-foreground">
              <div className="flex items-center justify-center gap-4">
                <div className="flex items-center gap-1">
                  <TrendingUp className="h-3 w-3" />
                  <span>Full History</span>
                </div>
                <div className="flex items-center gap-1">
                  <Target className="h-3 w-3" />
                  <span>AI Insights</span>
                </div>
                <div className="flex items-center gap-1">
                  <Zap className="h-3 w-3" />
                  <span>Export Data</span>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}

// Hook to check if user has pro access
export function useProAccess() {
  // TODO: Replace with actual subscription check
  // For now, simulate based on user plan
  const hasProAccess = false; // This would check user.plan === 'pro' or subscription status
  
  return { hasProAccess };
}