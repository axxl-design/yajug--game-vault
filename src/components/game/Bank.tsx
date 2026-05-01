import type { Player } from '@/types/game';
import { Coins } from 'lucide-react';
import { cn } from '@/utils/cn';
import { CardFace } from './CardFace';

interface BankProps {
  player: Player;
  onCardClick?: (cardId: string) => void;
  compact?: boolean;
  className?: string;
}

export function Bank({ player, onCardClick, compact, className }: BankProps) {
  const total = player.bank.reduce((sum, c) => sum + c.value, 0);
  return (
    <div className={cn('flex flex-col', className)}>
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <Coins size={14} aria-hidden="true" />
          <span>Banco</span>
        </div>
        <span>${total}M</span>
      </div>
      <div className="flex flex-wrap">
        {player.bank.length === 0 ? (
          <span>vacío</span>
        ) : (
          player.bank.map((c) => (
            <CardFace
              key={c.id}
              card={c}
              size={compact ? 'sm' : 'md'}
              onClick={onCardClick ? () => onCardClick(c.id) : undefined}
            />
          ))
        )}
      </div>
    </div>
  );
}
