import React from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Check, X, Crown, Zap, Star } from 'lucide-react';
import { Link } from 'react-router-dom';

export default function Compare() {
  const features = [
    {
      category: "Workout Logging",
      items: [
        { feature: "Basic workout logging", free: true, pro: true },
        { feature: "Exercise library access", free: true, pro: true },
        { feature: "Set tracking (weight, reps, RPE)", free: true, pro: true },
        { feature: "Auto-duplicate sets", free: true, pro: true },
        { feature: "Mindset tracking", free: true, pro: true },
        { feature: "Drag & drop exercise ordering", free: true, pro: true },
      ]
    },
    {
      category: "History & Analytics",
      items: [
        { feature: "Workout history", free: "2 days", pro: "Unlimited" },
        { feature: "Progress charts", free: "Basic", pro: "Advanced" },
        { feature: "Body part analytics", free: false, pro: true },
        { feature: "Strength progression tracking", free: false, pro: true },
        { feature: "Cardio analytics", free: false, pro: true },
        { feature: "Calendar view", free: false, pro: true },
        { feature: "Export data", free: false, pro: true },
      ]
    },
    {
      category: "AI Features",
      items: [
        { feature: "AI workout generation", free: false, pro: true },
        { feature: "Personalized workout recommendations", free: false, pro: true },
        { feature: "AI daily summaries", free: false, pro: true },
        { feature: "Progress insights", free: false, pro: true },
        { feature: "Workout adaptation based on history", free: false, pro: true },
      ]
    },
    {
      category: "Tracking & Goals",
      items: [
        { feature: "Body weight tracking", free: true, pro: true },
        { feature: "Streak counter", free: true, pro: true },
        { feature: "Personal records", free: "Basic", pro: "Advanced" },
        { feature: "Goal setting", free: "Basic", pro: "Advanced" },
        { feature: "Progress photos", free: false, pro: true },
      ]
    },
    {
      category: "Support & Extras",
      items: [
        { feature: "Community support", free: true, pro: true },
        { feature: "Priority support", free: false, pro: true },
        { feature: "Beta feature access", free: false, pro: true },
        { feature: "Custom themes", free: false, pro: true },
      ]
    }
  ];

  const renderFeatureValue = (value: boolean | string) => {
    if (typeof value === 'boolean') {
      return value ? (
        <Check className="h-5 w-5 text-green-500" />
      ) : (
        <X className="h-5 w-5 text-muted-foreground" />
      );
    }
    return <span className="text-sm">{value}</span>;
  };

  return (
    <div className="max-w-6xl mx-auto space-y-8">
      {/* Header */}
      <div className="text-center space-y-4">
        <h1 className="text-4xl font-bold">Free vs Pro Comparison</h1>
        <p className="text-xl text-muted-foreground max-w-2xl mx-auto">
          See exactly what's included in each plan and choose what works best for your fitness journey.
        </p>
      </div>

      {/* Quick Comparison Cards */}
      <div className="grid md:grid-cols-2 gap-8 mb-12">
        {/* Free Plan */}
        <Card className="relative">
          <CardHeader>
            <CardTitle className="flex items-center justify-between">
              <span>Free</span>
              <Badge variant="outline">Current Plan</Badge>
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
                <span className="text-sm">Essential workout logging</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">2 days of workout history</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Basic weight tracking</span>
              </li>
              <li className="flex items-center gap-2">
                <Check className="h-4 w-4 text-green-500" />
                <span className="text-sm">Streak counter</span>
              </li>
            </ul>

            <Button asChild variant="outline" className="w-full">
              <Link to="/auth">Get Started Free</Link>
            </Button>
          </CardContent>
        </Card>

        {/* Pro Plan */}
        <Card className="relative border-2 border-primary/50 shadow-xl">
          <div className="absolute -top-3 left-1/2 transform -translate-x-1/2">
            <Badge className="bg-gradient-to-r from-primary to-accent text-white px-4 py-1">
              RECOMMENDED
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
              <li className="flex items-center gap-2">
                <Star className="h-4 w-4 text-accent" />
                <span className="text-sm">Everything in Free</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm">Unlimited workout history</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm">AI workout generation</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm">Advanced analytics & insights</span>
              </li>
              <li className="flex items-center gap-2">
                <Zap className="h-4 w-4 text-accent" />
                <span className="text-sm">Priority support</span>
              </li>
            </ul>

            <Button asChild className="w-full bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white font-semibold shadow-lg">
              <Link to="/upgrade">Upgrade to Pro</Link>
            </Button>
          </CardContent>
        </Card>
      </div>

      {/* Detailed Feature Comparison */}
      <Card>
        <CardHeader>
          <CardTitle>Detailed Feature Comparison</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead>
                <tr className="border-b">
                  <th className="text-left py-4 px-2 font-semibold">Feature Category</th>
                  <th className="text-center py-4 px-4 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      Free
                      <Badge variant="outline" className="text-xs">$0</Badge>
                    </div>
                  </th>
                  <th className="text-center py-4 px-4 font-semibold">
                    <div className="flex items-center justify-center gap-2">
                      <Crown className="h-4 w-4 text-accent" />
                      Pro
                      <Badge className="bg-gradient-to-r from-primary to-accent text-white text-xs">$9.99</Badge>
                    </div>
                  </th>
                </tr>
              </thead>
              <tbody>
                {features.map((category, categoryIndex) => (
                  <React.Fragment key={categoryIndex}>
                    <tr className="border-b bg-muted/30">
                      <td colSpan={3} className="py-3 px-2 font-semibold text-sm">
                        {category.category}
                      </td>
                    </tr>
                    {category.items.map((item, itemIndex) => (
                      <tr key={itemIndex} className="border-b last:border-b-0">
                        <td className="py-3 px-2 text-sm">{item.feature}</td>
                        <td className="py-3 px-4 text-center">
                          {renderFeatureValue(item.free)}
                        </td>
                        <td className="py-3 px-4 text-center">
                          {renderFeatureValue(item.pro)}
                        </td>
                      </tr>
                    ))}
                  </React.Fragment>
                ))}
              </tbody>
            </table>
          </div>
        </CardContent>
      </Card>

      {/* Bottom CTA */}
      <div className="text-center space-y-6 py-8">
        <h2 className="text-2xl font-bold">Ready to unlock your full potential?</h2>
        <div className="flex flex-col sm:flex-row gap-4 justify-center">
          <Button asChild size="lg">
            <Link to="/auth">Start Free</Link>
          </Button>
          <Button asChild size="lg" className="bg-gradient-to-r from-primary to-accent hover:from-primary/90 hover:to-accent/90 text-white">
            <Link to="/upgrade">
              <Crown className="mr-2 h-4 w-4" />
              Upgrade to Pro
            </Link>
          </Button>
        </div>
      </div>
    </div>
  );
}