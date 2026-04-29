import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardVariant = 'default' | 'elevated' | 'surface';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: ReactNode;
}

const variantStyles: Record<CardVariant, string> = {
  default: 'bg-bg-elev-1 border border-border',
  elevated: 'bg-bg-elev-2 border border-border-strong shadow-md',
  surface: 'bg-surface border border-border',
};

const paddingStyles: Record<CardPadding, string> = {
  none: 'p-0',
  sm: 'p-3',
  md: 'p-5',
  lg: 'p-6',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', className, children, ...rest },
  ref,
) {
  return (
    <div
      ref={ref}
      className={cn(
        'rounded-8 text-text',
        'transition-colors duration-base ease-out',
        variantStyles[variant],
        paddingStyles[padding],
        className,
      )}
      {...rest}
    >
      {children}
    </div>
  );
});
