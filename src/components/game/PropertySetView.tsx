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
  const size = compact ? 'sm' : 'sm';
  return (
    <div
      onClick={onClick}
      data-complete={set.isComplete || undefined}
      data-monument={set.isMonument || undefined}
      data-highlighted={highlighted || undefined}
      style={{ ['--set-color' as string]: `var(--set-${set.color})` }}
      className={cn('set-view', onClick && 'cursor-pointer', className)}
    >
      <div className="set-view-head">
        <span style={{ display: 'inline-flex', alignItems: 'center' }}>
          <span className="set-view-pip" aria-hidden="true" />
          {set.color}
        </span>
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          {set.isMonument && <Crown size={12} aria-label="Monumento" />}
          {set.buildings.length > 0 && <Building2 size={12} aria-label="Edificios" />}
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 'var(--fs-11)',
              letterSpacing: '0.10em',
              color: 'var(--text-mute)',
            }}
          >
            {set.properties.length}/{set.requiredCount}
          </span>
        </span>
      </div>
      <div className="set-view-cards">
        {set.properties.map((c) => (
          <CardFace
            key={c.id}
            card={c}
            size={size}
            onClick={onCardClick ? () => onCardClick(c.id) : undefined}
          />
        ))}
        {set.properties.length === 0 && (
          <span className="ed-caption">Set vacío.</span>
        )}
      </div>
    </div>
  );
}
