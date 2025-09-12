import React from 'react';
import { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger } from '@/components/ui/tooltip';
import { cn } from '@/lib/utils';

interface ResponsiveLabelProps {
  text: string;
  className?: string;
  maxLength?: {
    sm?: number;
    md?: number;
    lg?: number;
  };
  showTooltip?: boolean;
  as?: 'span' | 'div' | 'p';
}

export function ResponsiveLabel({ 
  text, 
  className = "",
  maxLength = { sm: 15, md: 25, lg: 40 },
  showTooltip = true,
  as: Component = 'span'
}: ResponsiveLabelProps) {
  const truncateText = (str: string, max: number) => {
    if (str.length <= max) return str;
    return str.slice(0, max - 3) + '...';
  };

  const shortText = truncateText(text, maxLength.sm || 15);
  const mediumText = truncateText(text, maxLength.md || 25);
  const longText = truncateText(text, maxLength.lg || 40);

  // Check if any truncation occurred
  const needsTooltip = showTooltip && (
    shortText !== text || 
    mediumText !== text || 
    longText !== text
  );

  const content = (
    <Component className={cn("transition-all", className)}>
      <span className="inline sm:hidden">{shortText}</span>
      <span className="hidden sm:inline lg:hidden">{mediumText}</span>
      <span className="hidden lg:inline">{longText}</span>
    </Component>
  );

  if (!needsTooltip) {
    return content;
  }

  return (
    <TooltipProvider>
      <Tooltip>
        <TooltipTrigger asChild>
          <Component className={cn("cursor-help transition-all", className)}>
            <span className="inline sm:hidden">{shortText}</span>
            <span className="hidden sm:inline lg:hidden">{mediumText}</span>
            <span className="hidden lg:inline">{longText}</span>
          </Component>
        </TooltipTrigger>
        <TooltipContent>
          <p className="max-w-xs break-words">{text}</p>
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
}