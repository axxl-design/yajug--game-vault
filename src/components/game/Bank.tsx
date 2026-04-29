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
    <div
      className={cn(
        'flex flex-col gap-2 rounded-8 border border-border bg-bg-elev-1 p-3',
        className,
      )}
    >
      <div className="flex items-center justify-between gap-2">
        <div className="flex items-center gap-2 text-text-muted">
          <Coins size={14} aria-hidden="true" />
          <span className="font-display text-12 uppercase tracking-wider">Banco</span>
        </div>
        <span className="font-mono text-15 font-semibold text-amber">${total}M</span>
      </div>
      <div className="flex flex-wrap gap-1">
        {player.bank.length === 0 ? (
          <span className="font-sans text-12 text-text-subtle italic">vacío</span>
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
