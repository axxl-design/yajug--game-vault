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
  return (
    <div className={cn('flex flex-wrap gap-2', className)}>
      {cards.length === 0 && <span>Mano vacía.</span>}
      {cards.map((c) => (
        <CardFace
          key={c.id}
          card={c}
          size="md"
          selected={selectedId === c.id}
          highlighted={highlightedIds?.has(c.id)}
          disabled={disabled}
          onClick={onCardClick ? () => onCardClick(c.id) : undefined}
        />
      ))}
    </div>
  );
}
