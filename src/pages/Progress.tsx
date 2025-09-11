import React, { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { TrendingUp, Target, Heart, Weight, Calendar } from 'lucide-react';
import StrengthTab from '@/components/progress/StrengthTab';
import BodyPartsTab from '@/components/progress/BodyPartsTab';
import CardioTab from '@/components/progress/CardioTab';
import WeightProgressTab from '@/components/progress/WeightProgressTab';
import CalendarTab from '@/components/progress/CalendarTab';

export default function Progress() {
  const [activeTab, setActiveTab] = useState('strength');

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-4xl font-bold tracking-tight">Progress Analytics</h1>
        <p className="text-muted-foreground text-lg">Track your improvements across different areas</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-8">
        <Card className="border-0 shadow-sm">
          <CardContent className="p-6">
            <TabsList className="grid w-full grid-cols-5 h-14 p-1">
              <TabsTrigger value="strength" className="flex items-center gap-2 h-12 text-sm font-medium">
                <Target className="h-4 w-4" />
                <span className="hidden sm:inline">Strength</span>
              </TabsTrigger>
              <TabsTrigger value="bodyparts" className="flex items-center gap-2 h-12 text-sm font-medium">
                <TrendingUp className="h-4 w-4" />
                <span className="hidden sm:inline">Body Parts</span>
              </TabsTrigger>
              <TabsTrigger value="cardio" className="flex items-center gap-2 h-12 text-sm font-medium">
                <Heart className="h-4 w-4" />
                <span className="hidden sm:inline">Cardio</span>
              </TabsTrigger>
              <TabsTrigger value="weight" className="flex items-center gap-2 h-12 text-sm font-medium">
                <Weight className="h-4 w-4" />
                <span className="hidden sm:inline">Weight</span>
              </TabsTrigger>
              <TabsTrigger value="calendar" className="flex items-center gap-2 h-12 text-sm font-medium">
                <Calendar className="h-4 w-4" />
                <span className="hidden sm:inline">Calendar</span>
              </TabsTrigger>
            </TabsList>
          </CardContent>
        </Card>

        <TabsContent value="strength" className="space-y-0">
          <StrengthTab />
        </TabsContent>

        <TabsContent value="bodyparts" className="space-y-0">
          <BodyPartsTab />
        </TabsContent>

        <TabsContent value="cardio" className="space-y-0">
          <CardioTab />
        </TabsContent>

        <TabsContent value="weight" className="space-y-0">
          <WeightProgressTab />
        </TabsContent>

        <TabsContent value="calendar" className="space-y-0">
          <CalendarTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}
