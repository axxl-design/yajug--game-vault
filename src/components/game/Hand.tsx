import type { Card } from '@/types/game';
import { motion } from 'framer-motion';
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
      {cards.length === 0 && (
        <span className="font-sans text-13 text-text-subtle italic px-3 py-2">
          Mano vacía.
        </span>
      )}
      {cards.map((c, i) => (
        <motion.div
          key={c.id}
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.25, ease: [0.16, 1, 0.3, 1], delay: i * 0.02 }}
        >
          <CardFace
            card={c}
            size="md"
            selected={selectedId === c.id}
            highlighted={highlightedIds?.has(c.id)}
            disabled={disabled}
            onClick={onCardClick ? () => onCardClick(c.id) : undefined}
          />
        </motion.div>
      ))}
    </div>
  );
}
