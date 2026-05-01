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
  const charge = Math.min(100, player.expansionCharge);

  return (
    <div
      onClick={onClick}
      data-current={isCurrent || undefined}
      className={cn('ed-frame', onClick && 'cursor-pointer', className)}
      style={{
        padding: 'var(--s-3)',
        ...(isCurrent && {
          borderColor: 'var(--tomate)',
          boxShadow: '4px 4px 0 var(--tomate)',
        }),
      }}
    >
      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-3)',
          paddingBottom: 8,
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span className="ed-avatar ed-avatar-sm" aria-hidden="true">
          {initials}
        </span>
        <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
          <span
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              fontSize: 'var(--fs-18)',
              lineHeight: 1.05,
              color: 'var(--text)',
            }}
          >
            {player.nickname}
          </span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 9,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
            }}
          >
            {player.role}
          </span>
        </div>
        {isCurrent && <span className="ed-badge ed-badge-tomate">Turno</span>}
      </div>

      <div
        style={{
          display: 'flex',
          gap: 'var(--s-3)',
          flexWrap: 'wrap',
          padding: '8px 0',
          fontFamily: 'var(--font-mono)',
          fontSize: 11,
          letterSpacing: '0.10em',
          textTransform: 'uppercase',
          color: 'var(--text-mute)',
          borderBottom: '1px solid var(--border)',
        }}
      >
        <span>
          <em
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--tomate)',
              fontSize: 'var(--fs-14)',
              letterSpacing: 0,
              textTransform: 'none',
              marginRight: 4,
            }}
          >
            ${totalBank}M
          </em>
          banco
        </span>
        <span>
          <em
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--text)',
              fontSize: 'var(--fs-14)',
              letterSpacing: 0,
              textTransform: 'none',
              marginRight: 4,
            }}
          >
            {player.hand.length}
          </em>
          mano
        </span>
        <span>
          <em
            style={{
              fontFamily: 'var(--font-serif)',
              fontStyle: 'italic',
              color: 'var(--text)',
              fontSize: 'var(--fs-14)',
              letterSpacing: 0,
              textTransform: 'none',
              marginRight: 4,
            }}
          >
            {player.sets.filter((s) => s.isComplete).length}
          </em>
          sets
        </span>
        {isImmune && <span className="ed-badge ed-badge-aqua">inmune</span>}
        {handPublic && <span className="ed-badge ed-badge-mostaza">mano pública</span>}
      </div>

      <div
        style={{
          display: 'flex',
          alignItems: 'center',
          gap: 'var(--s-2)',
          padding: '8px 0',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 9,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
          }}
        >
          EXP
        </span>
        <div
          style={{
            flex: 1,
            height: 6,
            background: 'var(--border)',
            border: '1px solid var(--rule)',
            borderRadius: 999,
            overflow: 'hidden',
          }}
        >
          <div
            style={{
              width: `${charge}%`,
              height: '100%',
              background: charge >= 100 ? 'var(--violet)' : 'var(--tomate)',
              transition: 'width 240ms var(--ease)',
            }}
          />
        </div>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.10em',
            color: charge >= 100 ? 'var(--violet)' : 'var(--text)',
          }}
        >
          {charge}%
        </span>
      </div>

      {player.sets.length > 0 && (
        <div
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 6,
            paddingTop: 4,
          }}
        >
          {player.sets.map((s, i) => (
            <span
              key={i}
              data-complete={s.isComplete || undefined}
              data-monument={s.isMonument || undefined}
              className="ed-badge ed-badge-outline"
              style={{ background: `var(--set-${s.color})`, color: 'var(--paper)', borderColor: 'var(--ink)' }}
            >
              {s.color} {s.properties.length}/{s.requiredCount}
            </span>
          ))}
        </div>
      )}

      {!player.isConnected && (
        <span
          className="ed-caption"
          style={{ marginTop: 6, display: 'inline-flex', gap: 6 }}
        >
          <User size={11} aria-hidden="true" /> desconectado
        </span>
      )}
      {player.bankerDebt > 0 && (
        <span className="ed-badge ed-badge-tomate" style={{ marginTop: 6 }}>
          debe ${player.bankerDebt}M
        </span>
      )}
    </div>
  );
}
