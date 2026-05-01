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
      data-current={isCurrent || undefined}
      className={cn('flex flex-col', onClick && 'cursor-pointer', className)}
    >
      <div className="flex items-center">
        <div className="inline-flex items-center justify-center">{initials}</div>
        <div className="flex min-w-0 flex-1 flex-col">
          <span>{player.nickname}</span>
          <span>{player.role}</span>
        </div>
        {isCurrent && <span>turno</span>}
      </div>

      <div className="flex flex-wrap">
        <span>${totalBank}M</span>
        <span>
          {player.hand.length} <span>cartas</span>
        </span>
        <span>{player.sets.filter((s) => s.isComplete).length} sets</span>
        {isImmune && <span>inmune</span>}
        {handPublic && <span>mano pública</span>}
      </div>

      <div className="flex items-center">
        <span>EXP</span>
        <div className="flex-1">
          <div style={{ width: `${Math.min(100, player.expansionCharge)}%` }} />
        </div>
        <span>{player.expansionCharge}%</span>
      </div>

      {player.sets.length > 0 && (
        <div className="flex flex-wrap">
          {player.sets.map((s, i) => (
            <span key={i} data-complete={s.isComplete || undefined} data-monument={s.isMonument || undefined}>
              {s.color} {s.properties.length}/{s.requiredCount}
            </span>
          ))}
        </div>
      )}

      {handPublic && (
        <div className="flex flex-wrap">
          {player.hand.slice(0, 8).map((c) => (
            <span key={c.id} title={c.name}>
              {c.type[0].toUpperCase()}
            </span>
          ))}
        </div>
      )}

      {!isCurrent && !player.isConnected && (
        <span className="inline-flex items-center">
          <User size={10} /> desconectado
        </span>
      )}
      {player.bankerDebt > 0 && <span>debe ${player.bankerDebt}M al banquero</span>}
    </div>
  );
}
