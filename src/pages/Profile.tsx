import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { User, Calendar, Target } from 'lucide-react';

interface ProfileData {
  display_name: string;
  birthday_month: number | null;
  birthday_day: number | null;
  goal: string;
}

export default function Profile() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [formData, setFormData] = useState<ProfileData>({
    display_name: '',
    birthday_month: null,
    birthday_day: null,
    goal: ''
  });
  const [otherGoal, setOtherGoal] = useState('');

  const months = [
    { value: 1, label: 'January' },
    { value: 2, label: 'February' },
    { value: 3, label: 'March' },
    { value: 4, label: 'April' },
    { value: 5, label: 'May' },
    { value: 6, label: 'June' },
    { value: 7, label: 'July' },
    { value: 8, label: 'August' },
    { value: 9, label: 'September' },
    { value: 10, label: 'October' },
    { value: 11, label: 'November' },
    { value: 12, label: 'December' }
  ];

  const goalOptions = [
    'Track my progress',
    'Get stronger',
    'Build consistency',
    'Improve cardio',
    'General fitness / health',
    'Other'
  ];

  // Generate days based on selected month
  const getDaysInMonth = (month: number | null) => {
    if (!month) return Array.from({ length: 31 }, (_, i) => i + 1);
    
    const daysInMonth = new Date(2024, month, 0).getDate(); // 2024 is not a leap year for Feb
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  useEffect(() => {
    if (user) {
      loadProfile();
    }
  }, [user]);

  const loadProfile = async () => {
    if (!user) return;
    
    setLoading(true);
    try {
      const { data, error } = await supabase
        .from('profiles')
        .select('display_name, birthday_month, birthday_day, goal')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        setFormData({
          display_name: data.display_name || '',
          birthday_month: data.birthday_month,
          birthday_day: data.birthday_day,
          goal: data.goal || ''
        });

        // If goal is not in predefined options, set it as "Other"
        if (data.goal && !goalOptions.slice(0, -1).includes(data.goal)) {
          setOtherGoal(data.goal);
          setFormData(prev => ({ ...prev, goal: 'Other' }));
        }
      }
    } catch (error) {
      console.error('Error loading profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error loading profile',
        description: 'Failed to load your profile data.'
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSave = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!user) return;

    // Validation
    if (formData.display_name && formData.display_name.length > 50) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Display name must be 50 characters or less.'
      });
      return;
    }

    if ((formData.birthday_month && !formData.birthday_day) || 
        (!formData.birthday_month && formData.birthday_day)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide both month and day for your birthday.'
      });
      return;
    }

    if (!formData.goal) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please select a goal.'
      });
      return;
    }

    setSaving(true);
    try {
      const goalValue = formData.goal === 'Other' ? otherGoal : formData.goal;

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: formData.display_name || null,
          birthday_month: formData.birthday_month,
          birthday_day: formData.birthday_day,
          goal: goalValue,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      toast({
        title: 'Profile updated successfully!',
        description: 'Your changes have been saved.'
      });
    } catch (error) {
      console.error('Error saving profile:', error);
      toast({
        variant: 'destructive',
        title: 'Error saving profile',
        description: 'Failed to save your profile changes.'
      });
    } finally {
      setSaving(false);
    }
  };

  const handleCancel = () => {
    navigate('/');
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <div className="text-center">
          <User className="h-12 w-12 mx-auto mb-4 text-primary animate-pulse" />
          <p>Loading profile...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="max-w-2xl mx-auto space-y-8">
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          Manage your personal information and training goals
        </p>
      </div>

      <form onSubmit={handleSave} className="space-y-8">
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <User className="h-5 w-5" />
              Personal Information
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            {/* Display Name */}
            <div className="space-y-2">
              <Label htmlFor="display_name">Name</Label>
              <Input
                id="display_name"
                type="text"
                value={formData.display_name}
                onChange={(e) => setFormData(prev => ({ ...prev, display_name: e.target.value }))}
                placeholder="Enter your display name"
                maxLength={50}
              />
              <p className="text-xs text-muted-foreground">
                Optional • {formData.display_name.length}/50 characters
              </p>
            </div>

            {/* Birthday */}
            <div className="space-y-4">
              <Label className="flex items-center gap-2">
                <Calendar className="h-4 w-4" />
                Birthday (Month / Day)
              </Label>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Select
                    value={formData.birthday_month?.toString() || ''}
                    onValueChange={(value) => {
                      const month = parseInt(value);
                      setFormData(prev => ({ 
                        ...prev, 
                        birthday_month: month,
                        // Reset day if it's invalid for the new month
                        birthday_day: prev.birthday_day && prev.birthday_day <= getDaysInMonth(month).length 
                          ? prev.birthday_day 
                          : null
                      }));
                    }}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select month" />
                    </SelectTrigger>
                    <SelectContent>
                      {months.map((month) => (
                        <SelectItem key={month.value} value={month.value.toString()}>
                          {month.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Select
                    value={formData.birthday_day?.toString() || ''}
                    onValueChange={(value) => 
                      setFormData(prev => ({ ...prev, birthday_day: parseInt(value) }))
                    }
                    disabled={!formData.birthday_month}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDaysInMonth(formData.birthday_month).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>
              <p className="text-xs text-muted-foreground">
                We use this to show you birthday celebrations • Year is not stored for privacy
              </p>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Target className="h-5 w-5" />
              Training Goals
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-6">
            <div className="space-y-4">
              <Label>What do you want from this app?</Label>
              <RadioGroup
                value={formData.goal}
                onValueChange={(value) => setFormData(prev => ({ ...prev, goal: value }))}
                className="space-y-3"
              >
                {goalOptions.map((option) => (
                  <div key={option} className="flex items-center space-x-2">
                    <RadioGroupItem value={option} id={option} />
                    <Label 
                      htmlFor={option}
                      className="text-sm font-normal cursor-pointer flex-1"
                    >
                      {option}
                    </Label>
                  </div>
                ))}
              </RadioGroup>

              {/* Other goal text input */}
              {formData.goal === 'Other' && (
                <div className="mt-4 ml-6">
                  <Textarea
                    value={otherGoal}
                    onChange={(e) => setOtherGoal(e.target.value)}
                    placeholder="Describe your specific goal..."
                    className="resize-none"
                    rows={3}
                  />
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Action Buttons */}
        <div className="flex gap-4">
          <Button type="submit" disabled={saving} className="flex-1">
            {saving ? 'Saving...' : 'Save Profile'}
          </Button>
          <Button type="button" variant="outline" onClick={handleCancel}>
            Cancel
          </Button>
        </div>
      </form>
    </div>
  );
}
