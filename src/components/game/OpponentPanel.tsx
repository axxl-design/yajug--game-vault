import type { Player } from '@/types/game';
import { User } from 'lucide-react';
import { cn } from '@/utils/cn';
import { hasEffect } from '@/game/effects';

interface OpponentPanelProps {
  player: Player;
  isCurrent: boolean;
  onClick?: () => void;
  className?: string;
}

export function OpponentPanel({ player, isCurrent, onClick, className }: OpponentPanelProps) {
  const totalBank = player.bank.reduce((sum, c) => sum + c.value, 0);
  const initials = player.nickname.slice(0, 2).toUpperCase();
  const isImmune = hasEffect(player, 'inmunidad');
  const handPublic = hasEffect(player, 'mano_publica') || hasEffect(player, 'truco_mano_publica');

  return (
    <div
      onClick={onClick}
      className={cn(
        'flex flex-col gap-2 rounded-8 border bg-bg-elev-1 p-3',
        'transition-colors duration-fast ease-out',
        isCurrent ? 'border-coral' : 'border-border',
        onClick && 'cursor-pointer hover:bg-bg-elev-2',
        className,
      )}
    >
      <div className="flex items-center gap-2">
        <div
          className={cn(
            'flex h-8 w-8 items-center justify-center rounded-full',
            'bg-surface border border-border-strong',
            'font-display text-12 font-semibold',
            isCurrent && 'border-coral text-coral',
          )}
        >
          {initials}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span className="font-sans text-13 font-medium truncate">{player.nickname}</span>
          <span className="font-mono text-10 text-text-muted">{player.role}</span>
        </div>
        {isCurrent && <span className="font-mono text-10 text-coral uppercase">turno</span>}
      </div>

      <div className="flex flex-wrap gap-1 text-12">
        <span className="rounded-2 bg-bg-elev-2 px-2 py-0.5 font-mono">
          ${totalBank}M
        </span>
        <span className="rounded-2 bg-bg-elev-2 px-2 py-0.5 font-mono">
          {player.hand.length} <span className="text-text-muted">cartas</span>
        </span>
        <span className="rounded-2 bg-bg-elev-2 px-2 py-0.5 font-mono">
          {player.sets.filter((s) => s.isComplete).length} sets
        </span>
        {isImmune && (
          <span className="rounded-2 bg-amber/20 px-2 py-0.5 text-amber font-mono">
            inmune
          </span>
        )}
        {handPublic && (
          <span className="rounded-2 bg-coral/20 px-2 py-0.5 text-coral font-mono">
            mano pública
          </span>
        )}
      </div>

      {/* Mini progreso del medidor */}
      <div className="flex items-center gap-2">
        <span className="font-mono text-10 text-text-muted">EXP</span>
        <div className="flex-1 h-1.5 rounded-full bg-bg-elev-2 overflow-hidden">
          <div
            className={cn(
              'h-full rounded-full transition-all duration-base',
              player.expansionCharge >= 100 && !player.expansionUsed
                ? 'bg-violet'
                : 'bg-coral',
            )}
            style={{ width: `${Math.min(100, player.expansionCharge)}%` }}
          />
        </div>
        <span className="font-mono text-10 text-text-muted w-8 text-right">
          {player.expansionCharge}%
        </span>
      </div>

      {/* Sets resumidos */}
      {player.sets.length > 0 && (
        <div className="flex flex-wrap gap-1">
          {player.sets.map((s, i) => (
            <span
              key={i}
              className={cn(
                'rounded-2 px-1.5 py-0.5 font-mono text-10 text-bone',
                s.isComplete ? 'bg-amber text-ink' : 'bg-set-graphite',
                s.isMonument && 'ring-1 ring-violet',
              )}
            >
              {s.color} {s.properties.length}/{s.requiredCount}
            </span>
          ))}
        </div>
      )}

      {/* Si tenés mano pública por audit, los oponentes te ven la mano */}
      {handPublic && (
        <div className="flex flex-wrap gap-0.5 mt-1">
          {player.hand.slice(0, 8).map((c) => (
            <span
              key={c.id}
              className="rounded-1 bg-coral/10 px-1 py-0.5 font-mono text-9 text-coral"
              title={c.name}
            >
              {c.type[0].toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {!isCurrent && !player.isConnected && (
        <span className="font-sans text-10 text-text-subtle italic flex items-center gap-1">
          <User size={10} /> desconectado
        </span>
      )}
      {player.bankerDebt > 0 && (
        <span className="rounded-2 bg-amber/20 px-2 py-0.5 font-mono text-10 text-amber">
          debe ${player.bankerDebt}M al banquero
        </span>
      )}
    </div>
  );
}
