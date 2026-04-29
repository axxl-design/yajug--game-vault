import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost';
type Size = 'sm' | 'md' | 'lg';

export interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: Variant;
  size?: Size;
  loading?: boolean;
  leftIcon?: LucideIcon;
  rightIcon?: LucideIcon;
  fullWidth?: boolean;
  children?: ReactNode;
}

const baseStyles = cn(
  'inline-flex items-center justify-center gap-2',
  'font-display font-medium tracking-tight whitespace-nowrap select-none',
  'rounded-6 border',
  'transition-[background-color,border-color,transform,opacity] duration-fast ease-out',
  'active:scale-95',
  'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2',
  'disabled:opacity-50 disabled:cursor-not-allowed disabled:active:scale-100',
);

const variantStyles: Record<Variant, string> = {
  primary: cn(
    'bg-coral text-bone border-ink',
    'hover:bg-coral-300 hover:enabled:border-ink',
    'active:bg-coral-700',
  ),
  secondary: cn(
    'bg-bone text-ink border-ink',
    'hover:brightness-95',
    'active:brightness-90',
  ),
  danger: cn(
    'bg-coral-700 text-bone border-ink',
    'hover:bg-coral',
    'active:bg-coral-700',
  ),
  ghost: cn(
    'bg-transparent text-text border-transparent',
    'hover:bg-bg-elev-1 hover:border-border',
    'active:bg-bg-elev-2',
  ),
};

const sizeStyles: Record<Size, string> = {
  sm: 'h-7 px-3 text-13',
  md: 'h-9 px-4 text-14',
  lg: 'h-11 px-5 text-15',
};

const iconSize: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(function Button(
  {
    variant = 'primary',
    size = 'md',
    loading = false,
    leftIcon: LeftIcon,
    rightIcon: RightIcon,
    fullWidth = false,
    disabled,
    className,
    children,
    type = 'button',
    ...rest
  },
  ref,
) {
  const isDisabled = disabled || loading;
  const iconPx = iconSize[size];

  return (
    <button
      ref={ref}
      type={type}
      disabled={isDisabled}
      aria-busy={loading || undefined}
      className={cn(
        baseStyles,
        variantStyles[variant],
        sizeStyles[size],
        fullWidth && 'w-full',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconPx} className="animate-spin" aria-hidden="true" />
      ) : (
        <>
          {LeftIcon ? <LeftIcon size={iconPx} aria-hidden="true" /> : null}
          {children ? <span>{children}</span> : null}
          {RightIcon ? <RightIcon size={iconPx} aria-hidden="true" /> : null}
        </>
      )}
    </button>
  );
});
