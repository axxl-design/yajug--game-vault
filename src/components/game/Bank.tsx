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
    <div className={cn('ed-frame', className)} style={{ padding: 'var(--s-4)' }}>
      <div className="ed-frame-title">
        <span style={{ display: 'inline-flex', alignItems: 'center', gap: 6 }}>
          <Coins size={14} aria-hidden="true" /> Banco
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'var(--fs-22)',
            color: 'var(--tomate)',
            letterSpacing: 0,
          }}
        >
          ${total}M
        </span>
      </div>
      {player.bank.length === 0 ? (
        <span className="ed-caption">Banco vacío.</span>
      ) : (
        <div className="bank-stack">
          {player.bank.map((c) => (
            <CardFace
              key={c.id}
              card={c}
              size={compact ? 'sm' : 'sm'}
              onClick={onCardClick ? () => onCardClick(c.id) : undefined}
            />
          ))}
        </div>
      )}
    </div>
  );
}
