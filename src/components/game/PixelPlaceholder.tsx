import { cn } from '@/utils/cn';

interface PixelPlaceholderProps {
  kind: 'role' | 'titular' | 'district' | 'action' | 'card';
  id?: string;
  size?: number;
  className?: string;
}

const KIND_BG: Record<PixelPlaceholderProps['kind'], string> = {
  role: 'bg-set-graphite',
  titular: 'bg-amber',
  district: 'bg-set-vermil',
  action: 'bg-coral',
  card: 'bg-bg-elev-2',
};

export function PixelPlaceholder({ kind, id, size = 48, className }: PixelPlaceholderProps) {
  return (
    <div
      style={{ width: size, height: size }}
      className={cn(
        'flex items-center justify-center rounded-2 border border-ink/40',
        'font-mono text-10 text-ink/70 select-none pixel-art',
        KIND_BG[kind],
        className,
      )}
    >
      <span className="truncate px-1 leading-none text-[8px]">
        {(id ?? kind).slice(0, 8)}
      </span>
    </div>
  );
}
