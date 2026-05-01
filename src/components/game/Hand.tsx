import type { Card } from '@/types/game';
import { cn } from '@/utils/cn';
import { CardFace } from './CardFace';

interface HandProps {
  cards: Card[];
  selectedId?: string | null;
  highlightedIds?: Set<string>;
  disabled?: boolean;
  onCardClick?: (cardId: string) => void;
  className?: string;
}

export function Hand({
  cards,
  selectedId,
  highlightedIds,
  disabled,
  onCardClick,
  className,
}: HandProps) {
  if (cards.length === 0) {
    return (
      <div className={cn('hand-row', className)}>
        <span className="ed-caption">Mano vacía.</span>
      </div>
    );
  }
  return (
    <div className={cn('hand-row', className)}>
      {cards.map((c) => (
        <CardFace
          key={c.id}
          card={c}
          size="sm"
          selected={selectedId === c.id}
          highlighted={highlightedIds?.has(c.id)}
          disabled={disabled}
          onClick={onCardClick ? () => onCardClick(c.id) : undefined}
        />
      ))}
    </div>
  );
}
