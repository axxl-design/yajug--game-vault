import { cn } from '@/utils/cn';

export type LogoVariant = 'full' | 'title' | 'tagline' | 'mark';

const SRC: Record<LogoVariant, string> = {
  full:    '/logo/yajuga-dominio-full.svg',
  title:   '/logo/yajuga-title.svg',
  tagline: '/logo/yajuga-with-tagline.svg',
  mark:    '/logo/yajuga-favicon.svg',
};

const ALT: Record<LogoVariant, string> = {
  full:    'YAJUGÁ : DOMINIO',
  title:   'YAJUGÁ',
  tagline: 'YAJUGÁ — Cada calle tiene dueño',
  mark:    'YAJUGÁ',
};

export interface LogoProps {
  variant?: LogoVariant;
  /** Width in px, %, em, etc. */
  width?: number | string;
  /** Height. Defaults to "auto" so the SVG keeps its native aspect ratio. */
  height?: number | string;
  className?: string;
  ariaHidden?: boolean;
}

export function Logo({
  variant = 'full',
  width,
  height,
  className,
  ariaHidden = false,
}: LogoProps) {
  return (
    <span className={cn('ed-logo', className)} aria-hidden={ariaHidden || undefined}>
      <img
        src={SRC[variant]}
        alt={ariaHidden ? '' : ALT[variant]}
        width={width}
        height={height}
        style={{
          width: width ?? undefined,
          height: height ?? 'auto',
          maxWidth: '100%',
        }}
        draggable={false}
      />
    </span>
  );
}
