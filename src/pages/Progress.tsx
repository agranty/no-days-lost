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
    <div className="space-y-6">
      <div className="flex items-center space-x-2">
        <TrendingUp className="h-8 w-8 text-primary" />
        <h1 className="text-3xl font-bold">Progress</h1>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="grid w-full grid-cols-5">
          <TabsTrigger value="strength" className="flex items-center gap-2">
            <Target className="h-4 w-4" />
            <span className="hidden sm:inline">Strength</span>
          </TabsTrigger>
          <TabsTrigger value="bodyparts" className="flex items-center gap-2">
            <TrendingUp className="h-4 w-4" />
            <span className="hidden sm:inline">Body Parts</span>
          </TabsTrigger>
          <TabsTrigger value="cardio" className="flex items-center gap-2">
            <Heart className="h-4 w-4" />
            <span className="hidden sm:inline">Cardio</span>
          </TabsTrigger>
          <TabsTrigger value="weight" className="flex items-center gap-2">
            <Weight className="h-4 w-4" />
            <span className="hidden sm:inline">Weight</span>
          </TabsTrigger>
          <TabsTrigger value="calendar" className="flex items-center gap-2">
            <Calendar className="h-4 w-4" />
            <span className="hidden sm:inline">Calendar</span>
          </TabsTrigger>
        </TabsList>

        <TabsContent value="strength">
          <StrengthTab />
        </TabsContent>

        <TabsContent value="bodyparts">
          <BodyPartsTab />
        </TabsContent>

        <TabsContent value="cardio">
          <CardioTab />
        </TabsContent>

        <TabsContent value="weight">
          <WeightProgressTab />
        </TabsContent>

        <TabsContent value="calendar">
          <CalendarTab />
        </TabsContent>
      </Tabs>
    </div>
  );
}