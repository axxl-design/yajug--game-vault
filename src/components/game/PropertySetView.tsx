import type { PropertySet } from '@/types/game';
import { CardFace } from './CardFace';
import { Crown, Building2 } from 'lucide-react';
import { cn } from '@/utils/cn';

interface PropertySetViewProps {
  set: PropertySet;
  compact?: boolean;
  highlighted?: boolean;
  onClick?: () => void;
  onCardClick?: (cardId: string) => void;
  className?: string;
}

export function PropertySetView({
  set,
  compact,
  highlighted,
  onClick,
  onCardClick,
  className,
}: PropertySetViewProps) {
  const size = compact ? 'sm' : 'md';
  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col gap-1 rounded-8 border border-border bg-bg-elev-1 p-2',
        'transition-colors duration-fast ease-out',
        set.isComplete && 'border-amber/60',
        set.isMonument && 'border-violet ring-2 ring-violet/40',
        highlighted && 'ring-2 ring-violet',
        onClick && 'cursor-pointer hover:bg-bg-elev-2',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2 px-1">
        <span className="font-display text-12 uppercase tracking-wider text-text-muted">
          {set.color}
        </span>
        <div className="flex items-center gap-1 font-mono text-12 text-text-muted">
          {set.isMonument && <Crown size={12} className="text-violet" aria-label="Monumento" />}
          {set.buildings.length > 0 && <Building2 size={12} aria-label="Edificios" />}
          <span>
            {set.properties.length}/{set.requiredCount}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap gap-1">
        {set.properties.map((c) => (
          <CardFace
            key={c.id}
            card={c}
            size={size}
            onClick={onCardClick ? () => onCardClick(c.id) : undefined}
          />
        ))}
      </div>
    </div>
  );
}
