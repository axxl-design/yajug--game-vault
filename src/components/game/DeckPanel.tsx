import type { Card } from '@/types/game';
import { CardFace } from './CardFace';
import { cn } from '@/utils/cn';

interface DeckPanelProps {
  deckCount: number;
  discardTop: Card | null;
  className?: string;
}

export function DeckPanel({ deckCount, discardTop, className }: DeckPanelProps) {
  return (
    <div className={cn('flex items-center gap-3', className)}>
      <div className="flex flex-col items-center gap-1">
        <CardFace card={{ id: 'deck', type: 'event', name: 'Mazo', value: 0, imageKey: '' }} faceDown size="sm" />
        <span className="font-mono text-11 text-text-muted">{deckCount} mazo</span>
      </div>
      <div className="flex flex-col items-center gap-1">
        {discardTop ? (
          <CardFace card={discardTop} size="sm" />
        ) : (
          <div className="w-12 h-16 rounded-card border-2 border-dashed border-border flex items-center justify-center text-text-subtle text-10">
            vacío
          </div>
        )}
        <span className="font-mono text-11 text-text-muted">descarte</span>
      </div>
    </div>
  );
}
