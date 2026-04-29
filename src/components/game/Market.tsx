import type { Card } from '@/types/game';
import { CardFace } from './CardFace';
import { getMarketPrice } from '@/game/market';
import { cn } from '@/utils/cn';
import { ShoppingCart } from 'lucide-react';

interface MarketProps {
  cards: Card[];
  bankAvailable: number;
  hasBoughtThisTurn: boolean;
  onBuy?: (cardId: string) => void;
  className?: string;
}

export function Market({
  cards,
  bankAvailable,
  hasBoughtThisTurn,
  onBuy,
  className,
}: MarketProps) {
  return (
    <div
      className={cn(
        'flex flex-col gap-2 rounded-8 border border-border bg-bg-elev-1 p-3',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-text-muted">
          <ShoppingCart size={14} />
          <span className="font-display text-12 uppercase tracking-wider">Mercado</span>
        </div>
        {hasBoughtThisTurn && (
          <span className="font-mono text-10 text-coral">ya compraste este turno</span>
        )}
      </div>
      <div className="flex flex-wrap gap-2">
        {cards.length === 0 && (
          <span className="font-sans text-12 text-text-subtle italic">vacío</span>
        )}
        {cards.map((c) => {
          const price = getMarketPrice(c);
          const canAfford = bankAvailable >= price;
          const disabled = !onBuy || hasBoughtThisTurn || !canAfford;
          return (
            <div key={c.id} className="flex flex-col items-center gap-1">
              <CardFace
                card={c}
                size="md"
                disabled={disabled}
                onClick={onBuy ? () => onBuy(c.id) : undefined}
              />
              <span
                className={cn(
                  'font-mono text-12',
                  canAfford ? 'text-amber' : 'text-text-subtle',
                )}
              >
                ${price}M
              </span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
