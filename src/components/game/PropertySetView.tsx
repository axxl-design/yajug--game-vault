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
      data-complete={set.isComplete || undefined}
      data-monument={set.isMonument || undefined}
      data-highlighted={highlighted || undefined}
      className={cn('flex flex-col', onClick && 'cursor-pointer', className)}
    >
      <div className="flex items-center justify-between">
        <span>{set.color}</span>
        <div className="flex items-center">
          {set.isMonument && <Crown size={12} aria-label="Monumento" />}
          {set.buildings.length > 0 && <Building2 size={12} aria-label="Edificios" />}
          <span>
            {set.properties.length}/{set.requiredCount}
          </span>
        </div>
      </div>
      <div className="flex flex-wrap">
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
