import { format, parseISO } from 'date-fns';

interface DateFormats {
  short: string;
  medium: string;
  long: string;
  full: string;
}

/**
 * Responsive date formatting utility
 */
export const useResponsiveDateFormat = () => {
  const formatDate = (date: Date | string): DateFormats => {
    const dateObj = typeof date === 'string' ? parseISO(date) : date;
    
    return {
      short: format(dateObj, 'M/d/yy'),
      medium: format(dateObj, 'MMM d, yyyy'),
      long: format(dateObj, 'MMMM do, yyyy'),
      full: format(dateObj, 'EEEE, MMMM do, yyyy')
    };
  };

  const formatDateResponsive = (date: Date | string, containerSize?: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): string => {
    const formats = formatDate(date);
    
    switch (containerSize) {
      case 'xs':
      case 'sm':
        return formats.short;
      case 'md':
        return formats.medium;
      case 'lg':
      case 'xl':
      default:
        return formats.long;
    }
  };

  return { formatDate, formatDateResponsive };
};

/**
 * CSS classes for responsive date display
 */
export const responsiveDateClasses = {
  // Hide long format on small screens, show short
  responsive: "block sm:hidden", // Short format
  desktop: "hidden sm:block md:hidden", // Medium format  
  large: "hidden md:block", // Long format
};

/**
 * Utility to get appropriate date format based on available width
 */
export const getDateFormatForWidth = (width: number): 'short' | 'medium' | 'long' => {
  if (width < 200) return 'short';
  if (width < 350) return 'medium';
  return 'long';
};

/**
 * Truncate text utility with character limits
 */
export const truncateText = (text: string, maxLength: number = 30): string => {
  if (text.length <= maxLength) return text;
  return text.slice(0, maxLength - 3) + '...';
};

/**
 * Responsive text truncation based on container size
 */
export const getTextLimitForSize = (size: 'xs' | 'sm' | 'md' | 'lg' | 'xl'): number => {
  switch (size) {
    case 'xs': return 10;
    case 'sm': return 20;
    case 'md': return 30;
    case 'lg': return 50;
    case 'xl': return 80;
    default: return 30;
  }
};