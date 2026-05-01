import { forwardRef, type HTMLAttributes, type ReactNode } from 'react';
import { cn } from '@/utils/cn';

type CardVariant = 'default' | 'elevated' | 'surface';
type CardPadding = 'none' | 'sm' | 'md' | 'lg';

export interface CardProps extends HTMLAttributes<HTMLDivElement> {
  variant?: CardVariant;
  padding?: CardPadding;
  children?: ReactNode;
}

const paddingClass: Record<CardPadding, string> = {
  none: '',
  sm: 'p-3',
  md: 'p-4',
  lg: 'p-6',
};

const variantClass: Record<CardVariant, string> = {
  default:  'ed-frame',
  elevated: 'ed-frame ed-frame-elevated',
  surface:  'ed-frame',
};

export const Card = forwardRef<HTMLDivElement, CardProps>(function Card(
  { variant = 'default', padding = 'md', className, children, style, ...rest },
  ref,
) {
  const cardStyle: React.CSSProperties = { ...style };
  if (variant === 'elevated') {
    cardStyle.boxShadow = 'var(--shadow-press)';
  }
  return (
    <div
      ref={ref}
      data-variant={variant}
      data-padding={padding}
      style={cardStyle}
      className={cn(variantClass[variant], paddingClass[padding], className)}
      {...rest}
    >
      {children}
    </div>
  );
});
