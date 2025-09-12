import { useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';
import { useAuth } from './useAuth';
import { supabase } from '@/integrations/supabase/client';

export function useWelcomeRedirect() {
  const { user } = useAuth();
  const navigate = useNavigate();
  const location = useLocation();

  useEffect(() => {
    if (!user || location.pathname === '/welcome' || location.pathname === '/auth') {
      return;
    }

    checkShouldShowWelcome();
  }, [user, location.pathname]);

  const checkShouldShowWelcome = async () => {
    if (!user) return;

    try {
      const { data: profile } = await supabase
        .from('profiles')
        .select('last_welcome_seen_at')
        .eq('id', user.id)
        .single();

      if (!profile) return;

      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastWelcomeSeen = profile.last_welcome_seen_at 
        ? new Date(profile.last_welcome_seen_at) 
        : null;

      // If user hasn't seen welcome today, redirect to welcome page
      if (!lastWelcomeSeen || lastWelcomeSeen < today) {
        // Only redirect from dashboard, not from specific pages
        if (location.pathname === '/') {
          navigate('/welcome');
        }
      }
    } catch (error) {
      console.error('Error checking welcome redirect:', error);
    }
  };
}