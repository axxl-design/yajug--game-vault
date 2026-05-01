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
    <div className={cn('flex items-center', className)}>
      <div className="flex flex-col items-center">
        <CardFace card={{ id: 'deck', type: 'event', name: 'Mazo', value: 0, imageKey: '' }} faceDown size="sm" />
        <span>{deckCount} mazo</span>
      </div>
      <div className="flex flex-col items-center">
        {discardTop ? (
          <CardFace card={discardTop} size="sm" />
        ) : (
          <div className="w-12 h-16 inline-flex items-center justify-center">vacío</div>
        )}
        <span>descarte</span>
      </div>
    </div>
  );
}
