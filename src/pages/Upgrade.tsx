import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, Crown, Zap, Star } from 'lucide-react';

export default function Upgrade() {
  const proFeatures = [
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Unlimited Workout History",
      description: "Access your complete training history with no time limits"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "AI-Powered Daily Summaries",
      description: "Get personalized insights and recommendations"
    },
    {
      icon: <Check className="h-5 w-5" />,
      title: "Advanced Progress Analytics",
      description: "Detailed charts and trends for all your metrics"
    },
    {
      icon: <Crown className="h-5 w-5" />,
      title: "Export to Google Sheets",
      description: "Download your complete training data anytime"
    },
    {
      icon: <Zap className="h-5 w-5" />,
      title: "Unlimited AI Workouts",
      description: "Generate personalized workouts without limits"
    },
    {
      icon: <Star className="h-5 w-5" />,
      title: "Priority Support",
      description: "Get help when you need it most"
    }
  ];

  return (
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <div className="flex items-center justify-center gap-2">
          <Crown className="h-8 w-8 text-accent" />
          <h1 className="text-4xl font-bold bg-gradient-to-r from-primary to-accent bg-clip-text text-transparent">
            Upgrade to Pro
          </h1>
        </div>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          Unlock your full potential with advanced features designed to accelerate your fitness journey
        </p>
      </div>

      {/* Pricing Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free</span>
              <Badge variant="outline">Current</Badge>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <span className="text-3xl font-bold">$0</span>
              <span className="text-muted-foreground">/month</span>
            </div>
            
            <ul className="space-y-3">
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic workout logging</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">2 days of history</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">1 AI workout per week</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic progress tracking</span>
              </li>
            </ul>

            <Button variant="outline" disabled className="w-full">
              Current Plan
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-2 border-primary/50 shadow-xl">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
              MOST POPULAR
            </Badge>
          </div>
          
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Crown className="h-5 w-5 text-accent" />
              <span>Pro</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div>
              <span className="text-3xl font-bold">$9.99</span>
              <span className="text-muted-foreground">/month</span>
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

            <Button className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg">
              Upgrade Now
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Testimonial Section */}
      <Card className="bg-gradient-to-r from-primary/5 to-accent/5 border-primary/20">
        <CardContent className="p-8 text-center">
          <div className="max-w-2xl mx-auto space-y-4">
            <div className="flex justify-center">
              {[...Array(5)].map((_, i) => (
                <Star key={i} className="h-5 w-5 text-accent fill-current" />
              ))}
            </div>
            <blockquote className="text-lg italic">
              "Upgrading to Pro transformed my fitness journey. The AI insights and unlimited history 
              helped me break through plateaus and stay consistent like never before."
            </blockquote>
            <p className="text-muted-foreground">— Sarah K., Pro Member</p>
          </div>
        </CardContent>
      </Card>

      {/* FAQ Section */}
      <div className="text-center space-y-4">
        <h3 className="text-xl font-semibold">Questions?</h3>
        <p className="text-muted-foreground">
          Contact our support team at{' '}
          <a href="mailto:support@nodayslost.com" className="text-primary hover:underline">
            support@nodayslost.com
          </a>
        </p>
      </div>
    </div>
  );
}