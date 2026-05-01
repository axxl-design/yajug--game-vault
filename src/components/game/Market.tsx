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
    <div className={cn('ed-frame', className)} style={{ padding: 'var(--s-4)' }}>
      <div className="ed-frame-title">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <ShoppingCart size={14} aria-hidden="true" /> Mercado
        </span>
        {hasBoughtThisTurn && (
          <span className="ed-badge ed-badge-outline">ya compraste</span>
        )}
      </div>
      <div className="hand-row">
        {cards.length === 0 ? (
          <span className="ed-caption">Mercado vacío.</span>
        ) : (
          cards.map((c) => {
            const price = getMarketPrice(c);
            const canAfford = bankAvailable >= price;
            const disabled = !onBuy || hasBoughtThisTurn || !canAfford;
            return (
              <div
                key={c.id}
                style={{
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: 6,
                }}
              >
                <CardFace
                  card={c}
                  size="sm"
                  disabled={disabled}
                  onClick={onBuy ? () => onBuy(c.id) : undefined}
                />
                <span
                  data-affordable={canAfford || undefined}
                  className="ed-badge"
                  style={{
                    background: canAfford ? 'var(--mostaza)' : 'var(--ink)',
                    color: canAfford ? 'var(--ink)' : 'var(--paper)',
                  }}
                >
                  ${price}M
                </span>
              </div>
            );
          })
        )}
      </div>
    </div>
  );
}
