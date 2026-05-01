import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react';
import { Loader2, type LucideIcon } from 'lucide-react';
import { cn } from '@/utils/cn';

type Variant = 'primary' | 'secondary' | 'danger' | 'ghost' | 'mostaza';
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

const iconSize: Record<Size, number> = { sm: 14, md: 16, lg: 18 };

const variantClass: Record<Variant, string> = {
  primary:   'ed-btn-primary',
  secondary: 'ed-btn-secondary',
  danger:    'ed-btn-danger',
  ghost:     'ed-btn-ghost',
  mostaza:   'ed-btn-mostaza',
};

const sizeClass: Record<Size, string> = {
  sm: 'ed-btn-sm',
  md: '',
  lg: 'ed-btn-lg',
};

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
      data-variant={variant}
      data-size={size}
      className={cn(
        'ed-btn',
        variantClass[variant],
        sizeClass[size],
        fullWidth && 'ed-btn-block',
        className,
      )}
      {...rest}
    >
      {loading ? (
        <Loader2 size={iconPx} aria-hidden="true" className="animate-spin" />
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
