import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';
import { useResponsiveDateFormat } from '@/lib/responsive-text';

interface ResponsiveDateProps {
  date: Date | string;
  className?: string;
  showTooltip?: boolean;
  format?: 'auto' | 'short' | 'medium' | 'long';
}

export function ResponsiveDate({ 
  date, 
  className = "", 
  showTooltip = true,
  format = 'auto'
}: ResponsiveDateProps) {
  const { formatDate } = useResponsiveDateFormat();
  const formats = formatDate(date);

  if (format !== 'auto') {
    const displayText = formats[format];
    
    if (!showTooltip) {
      return <span className={className}>{displayText}</span>;
    }

    return (
      <TooltipProvider>
        <Tooltip>
          <TooltipTrigger asChild>
            <span className={cn("cursor-help", className)}>{displayText}</span>
          </TooltipTrigger>
          <TooltipContent>
            <p>{formats.full}</p>
          </TooltipContent>
        </Tooltip>
      </TooltipProvider>
    );
  }

  // Auto-responsive behavior
  const content = (
    <>
      <span className={cn("inline sm:hidden", className)}>{formats.short}</span>
      <span className={cn("hidden sm:inline lg:hidden", className)}>{formats.medium}</span>
      <span className={cn("hidden lg:inline", className)}>{formats.long}</span>
    </>
  );

  if (!showTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <span className={cn("cursor-help", className)}>
            {content}
          </span>
        </TooltipTrigger>
        <TooltipContent>
          <p>{formats.full}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}