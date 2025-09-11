import { format } from 'date-fns';
import { useIsMobile } from '@/hooks/use-mobile';

// Hook for responsive text labels
export function useResponsiveText() {
  const isMobile = useIsMobile();
  
  return {
    workoutLog: isMobile ? 'Log' : 'Workout Log',
    generate: isMobile ? 'Gen' : 'Generate',
    repetitions: isMobile ? 'Reps' : 'Repetitions',
    personalRecord: isMobile ? 'PR' : 'Personal Record',
    workoutDuration: isMobile ? 'Duration' : 'Workout Duration',
    bodyWeight: isMobile ? 'BW' : 'Body Weight',
    estimatedOneRepMax: isMobile ? '1RM' : 'Estimated 1 Rep Max',
    isMobile
  };
}

// Hook for responsive date formatting
export function useResponsiveDate() {
  const isMobile = useIsMobile();
  
  const formatDate = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isMobile) {
      return format(dateObj, 'MM/dd/yy');
    } else {
      return format(dateObj, 'MMMM d, yyyy');
    }
  };

  const formatDateShort = (date: Date | string) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    
    if (isMobile) {
      return format(dateObj, 'M/d');
    } else {
      return format(dateObj, 'MMM d');
    }
  };

  return {
    formatDate,
    formatDateShort,
    isMobile
  };
}

// Utility functions for consistent responsive formatting
export const responsiveText = {
  workoutLog: (isMobile: boolean) => isMobile ? 'Log' : 'Workout Log',
  repetitions: (isMobile: boolean) => isMobile ? 'Reps' : 'Repetitions',
  personalRecord: (isMobile: boolean) => isMobile ? 'PR' : 'Personal Record',
  workoutDuration: (isMobile: boolean) => isMobile ? 'Duration' : 'Workout Duration',
  bodyWeight: (isMobile: boolean) => isMobile ? 'BW' : 'Body Weight',
  estimatedOneRepMax: (isMobile: boolean) => isMobile ? '1RM' : 'Estimated 1 Rep Max',
};

export const responsiveDate = {
  format: (date: Date | string, isMobile: boolean) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isMobile ? format(dateObj, 'MM/dd/yy') : format(dateObj, 'MMMM d, yyyy');
  },
  
  formatShort: (date: Date | string, isMobile: boolean) => {
    const dateObj = typeof date === 'string' ? new Date(date) : date;
    return isMobile ? format(dateObj, 'M/d') : format(dateObj, 'MMM d');
  }
};