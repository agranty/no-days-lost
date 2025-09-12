import React, { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Checkbox } from '@/components/ui/checkbox';
import { Avatar, AvatarFallback } from '@/components/ui/avatar';
import { Badge } from '@/components/ui/badge';
import { useAuth } from '@/hooks/useAuth';
import { supabase } from '@/integrations/supabase/client';
import { useToast } from '@/hooks/use-toast';
import { 
  User, 
  Calendar, 
  Target, 
  Edit3, 
  Save, 
  X,
  Gift,
  Plus
} from 'lucide-react';
import { format } from 'date-fns';

interface ProfileData {
  display_name: string;
  email: string;
  birthday_month: number | null;
  birthday_day: number | null;
  goals: string[];
}

export default function Profile() {
  const { user } = useAuth();
  const { toast } = useToast();
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [profileData, setProfileData] = useState<ProfileData>({
    display_name: '',
    email: '',
    birthday_month: null,
    birthday_day: null,
    goals: []
  });
  const [editData, setEditData] = useState<ProfileData>({
    display_name: '',
    email: '',
    birthday_month: null,
    birthday_day: null,
    goals: []
  });
  const [otherGoal, setOtherGoal] = useState('');

  const months = [
    { value: 1, label: 'January', short: 'Jan' },
    { value: 2, label: 'February', short: 'Feb' },
    { value: 3, label: 'March', short: 'Mar' },
    { value: 4, label: 'April', short: 'Apr' },
    { value: 5, label: 'May', short: 'May' },
    { value: 6, label: 'June', short: 'Jun' },
    { value: 7, label: 'July', short: 'Jul' },
    { value: 8, label: 'August', short: 'Aug' },
    { value: 9, label: 'September', short: 'Sep' },
    { value: 10, label: 'October', short: 'Oct' },
    { value: 11, label: 'November', short: 'Nov' },
    { value: 12, label: 'December', short: 'Dec' }
  ];

  const goalOptions = [
    'Track my progress',
    'Get stronger',
    'Build consistency',
    'Improve cardio',
    'General fitness / health',
    'Other'
  ];

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
        .select('display_name, email, birthday_month, birthday_day, goal')
        .eq('id', user.id)
        .single();

      if (error) throw error;

      if (data) {
        // Parse goals from stored format
        let goals: string[] = [];
        if (data.goal) {
          try {
            goals = JSON.parse(data.goal);
          } catch {
            goals = [data.goal];
          }
        }

        const profile = {
          display_name: data.display_name || '',
          email: data.email || user.email || '',
          birthday_month: data.birthday_month,
          birthday_day: data.birthday_day,
          goals: goals
        };

        setProfileData(profile);
        setEditData(profile);

        // Handle "Other" goals
        const unknownGoals = goals.filter(goal => !goalOptions.slice(0, -1).includes(goal));
        if (unknownGoals.length > 0) {
          setOtherGoal(unknownGoals.join(', '));
          setEditData(prev => ({ 
            ...prev, 
            goals: [...goals.filter(goal => goalOptions.slice(0, -1).includes(goal)), 'Other']
          }));
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

  const handleEdit = () => {
    setEditData({ ...profileData });
    setEditMode(true);
  };

  const handleCancel = () => {
    setEditData({ ...profileData });
    setOtherGoal('');
    setEditMode(false);
  };

  const handleSave = async () => {
    if (!user) return;

    // Validation
    if (editData.display_name && editData.display_name.length > 50) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Display name must be 50 characters or less.'
      });
      return;
    }

    if ((editData.birthday_month && !editData.birthday_day) || 
        (!editData.birthday_month && editData.birthday_day)) {
      toast({
        variant: 'destructive',
        title: 'Validation Error',
        description: 'Please provide both month and day for your birthday.'
      });
      return;
    }

    setSaving(true);
    try {
      // Prepare goals for storage
      let goalValue = editData.goals.filter(goal => goal !== 'Other');
      if (editData.goals.includes('Other') && otherGoal.trim()) {
        goalValue.push(otherGoal.trim());
      }
      
      // Default to "Track my progress" if no goals selected
      if (goalValue.length === 0) {
        goalValue = ['Track my progress'];
      }
      
      const goalString = JSON.stringify(goalValue);

      const { error } = await supabase
        .from('profiles')
        .update({
          display_name: editData.display_name || null,
          birthday_month: editData.birthday_month,
          birthday_day: editData.birthday_day,
          goal: goalString,
          updated_at: new Date().toISOString()
        })
        .eq('id', user.id);

      if (error) throw error;

      // Update local state
      const updatedProfile = { ...editData, goals: goalValue };
      setProfileData(updatedProfile);
      setEditMode(false);

      toast({
        title: 'Profile updated!',
        description: 'Your changes have been saved successfully.'
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

  const getDaysInMonth = (month: number | null) => {
    if (!month) return Array.from({ length: 31 }, (_, i) => i + 1);
    const daysInMonth = new Date(2024, month, 0).getDate();
    return Array.from({ length: daysInMonth }, (_, i) => i + 1);
  };

  const formatBirthday = (month: number | null, day: number | null) => {
    if (!month || !day) return null;
    const monthName = months.find(m => m.value === month)?.short || '';
    return `${monthName} ${day}`;
  };

  const getInitials = (name: string) => {
    if (!name) return user?.email?.charAt(0).toUpperCase() || 'U';
    return name.split(' ').map(n => n.charAt(0)).join('').substring(0, 2).toUpperCase();
  };

  const isBirthday = () => {
    if (!profileData.birthday_month || !profileData.birthday_day) return false;
    const today = new Date();
    return today.getMonth() + 1 === profileData.birthday_month && 
           today.getDate() === profileData.birthday_day;
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
    <div className="max-w-4xl mx-auto space-y-8">
      {/* Header */}
      <div className="space-y-2">
        <h1 className="text-4xl font-bold tracking-tight">Your Profile</h1>
        <p className="text-muted-foreground">
          {editMode ? 'Edit your personal information' : 'Manage your account and preferences'}
        </p>
      </div>

      {/* Birthday Banner */}
      {isBirthday() && (
        <Card className="border-accent bg-accent/5">
          <CardContent className="p-6">
            <div className="flex items-center gap-3">
              <Gift className="h-6 w-6 text-accent" />
              <div>
                <h3 className="font-semibold text-accent">🎉 Happy Birthday!</h3>
                <p className="text-sm text-muted-foreground">No Days Lost - celebrating you today!</p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Profile Card */}
      <Card className="shadow-lg border-0 rounded-xl overflow-hidden">
        <CardHeader className="pb-6">
          <div className="flex items-start justify-between">
            <div className="flex items-center gap-6">
              <Avatar className="h-20 w-20 border-4 border-background shadow-lg">
                <AvatarFallback className="text-xl font-bold bg-primary text-primary-foreground">
                  {getInitials(profileData.display_name)}
                </AvatarFallback>
              </Avatar>
              <div>
                <h2 className="text-3xl font-bold">
                  {profileData.display_name || 'Your Profile'}
                </h2>
                <p className="text-muted-foreground text-lg">{profileData.email}</p>
              </div>
            </div>
            
            {!editMode && (
              <Button onClick={handleEdit} size="sm" className="gap-2">
                <Edit3 className="h-4 w-4" />
                Edit Profile
              </Button>
            )}
          </div>
        </CardHeader>

        <CardContent className="space-y-8">
          {!editMode ? (
            /* Display Mode */
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Birthday */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Calendar className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">Birthday</Label>
                </div>
                {profileData.birthday_month && profileData.birthday_day ? (
                  <p className="text-xl">{formatBirthday(profileData.birthday_month, profileData.birthday_day)}</p>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Add birthday
                  </Button>
                )}
              </div>

              {/* Goals */}
              <div className="space-y-3">
                <div className="flex items-center gap-2">
                  <Target className="h-5 w-5 text-primary" />
                  <Label className="text-base font-medium">Goals</Label>
                </div>
                {profileData.goals.length > 0 ? (
                  <div className="flex flex-wrap gap-2">
                    {profileData.goals.map((goal, index) => (
                      <Badge key={index} variant="secondary" className="text-sm">
                        {goal}
                      </Badge>
                    ))}
                  </div>
                ) : (
                  <Button variant="outline" size="sm" onClick={handleEdit} className="gap-2">
                    <Plus className="h-4 w-4" />
                    Choose your goals
                  </Button>
                )}
              </div>
            </div>
          ) : (
            /* Edit Mode */
            <div className="space-y-8">
              {/* Name */}
              <div className="space-y-2">
                <Label htmlFor="display_name">Name</Label>
                <Input
                  id="display_name"
                  type="text"
                  value={editData.display_name}
                  onChange={(e) => setEditData(prev => ({ ...prev, display_name: e.target.value }))}
                  placeholder="Enter your display name"
                  maxLength={50}
                />
                <p className="text-xs text-muted-foreground">
                  Optional • {editData.display_name.length}/50 characters
                </p>
              </div>

              {/* Birthday */}
              <div className="space-y-4">
                <Label>Birthday (Month / Day)</Label>
                <div className="grid grid-cols-2 gap-4">
                  <Select
                    value={editData.birthday_month?.toString() || ''}
                    onValueChange={(value) => {
                      const month = parseInt(value);
                      setEditData(prev => ({ 
                        ...prev, 
                        birthday_month: month,
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
                  
                  <Select
                    value={editData.birthday_day?.toString() || ''}
                    onValueChange={(value) => 
                      setEditData(prev => ({ ...prev, birthday_day: parseInt(value) }))
                    }
                    disabled={!editData.birthday_month}
                  >
                    <SelectTrigger>
                      <SelectValue placeholder="Select day" />
                    </SelectTrigger>
                    <SelectContent>
                      {getDaysInMonth(editData.birthday_month).map((day) => (
                        <SelectItem key={day} value={day.toString()}>
                          {day}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {/* Goals */}
              <div className="space-y-4">
                <Label>Goals (Select all that apply)</Label>
                <div className="space-y-3">
                  {goalOptions.map((option) => (
                    <div key={option} className="flex items-center space-x-2">
                      <Checkbox
                        id={option}
                        checked={editData.goals.includes(option)}
                        onCheckedChange={(checked) => {
                          if (checked) {
                            setEditData(prev => ({
                              ...prev,
                              goals: [...prev.goals, option]
                            }));
                          } else {
                            setEditData(prev => ({
                              ...prev,
                              goals: prev.goals.filter(goal => goal !== option)
                            }));
                          }
                        }}
                      />
                      <Label 
                        htmlFor={option}
                        className="text-sm font-normal cursor-pointer flex-1"
                      >
                        {option}
                      </Label>
                    </div>
                  ))}
                </div>

                {editData.goals.includes('Other') && (
                  <div className="mt-4 ml-6">
                    <Textarea
                      value={otherGoal}
                      onChange={(e) => setOtherGoal(e.target.value)}
                      placeholder="Describe your specific goals..."
                      className="resize-none"
                      rows={3}
                    />
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="flex gap-3 pt-4">
                <Button onClick={handleSave} disabled={saving} className="gap-2">
                  <Save className="h-4 w-4" />
                  {saving ? 'Saving...' : 'Save Changes'}
                </Button>
                <Button variant="outline" onClick={handleCancel} className="gap-2">
                  <X className="h-4 w-4" />
                  Cancel
                </Button>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}