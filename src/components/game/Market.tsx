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
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <ShoppingCart size={14} />
          <span>Mercado</span>
        </div>
        {hasBoughtThisTurn && <span>ya compraste este turno</span>}
      </div>
      <div className="flex flex-wrap">
        {cards.length === 0 && <span>vacío</span>}
        {cards.map((c) => {
          const price = getMarketPrice(c);
          const canAfford = bankAvailable >= price;
          const disabled = !onBuy || hasBoughtThisTurn || !canAfford;
          return (
            <div key={c.id} className="flex flex-col items-center">
              <CardFace
                card={c}
                size="md"
                disabled={disabled}
                onClick={onBuy ? () => onBuy(c.id) : undefined}
              />
              <span data-affordable={canAfford || undefined}>${price}M</span>
            </div>
          );
        })}
      </div>
    </div>
  );
}
