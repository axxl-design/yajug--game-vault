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
    <div
      className={cn(className)}
      style={{ display: 'flex', alignItems: 'flex-start', gap: 'var(--s-4)' }}
    >
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        <CardFace
          card={{
            id: 'deck',
            type: 'event',
            name: 'Mazo',
            value: 0,
            imageKey: '',
          }}
          faceDown
          size="sm"
        />
        <span
          className="ed-badge ed-badge-outline"
          style={{ fontSize: 9, letterSpacing: '0.14em' }}
        >
          {deckCount} mazo
        </span>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: 6 }}>
        {discardTop ? (
          <CardFace card={discardTop} size="sm" />
        ) : (
          <div
            className="ed-pixel-slot"
            style={{ width: 137, height: 198, fontSize: 9 }}
          >
            <strong>Descarte</strong>
            <span>vacío</span>
          </div>
        )}
        <span
          className="ed-badge ed-badge-outline"
          style={{ fontSize: 9, letterSpacing: '0.14em' }}
        >
          descarte
        </span>
      </div>
    </div>
  );
}
