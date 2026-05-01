import { cn } from '@/utils/cn';

interface PixelPlaceholderProps {
  kind: 'role' | 'titular' | 'district' | 'action' | 'card';
  id?: string;
  size?: number;
  className?: string;
}

export function PixelPlaceholder({ kind, id, size = 48, className }: PixelPlaceholderProps) {
  return (
    <div
      style={{ width: size, height: size }}
      data-kind={kind}
      className={cn('inline-flex items-center justify-center', className)}
    >
      <span>{(id ?? kind).slice(0, 8)}</span>
    </div>
  );
}
