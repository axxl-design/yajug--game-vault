import type { GameState } from '@/types/game';
import { Trophy, Clock } from 'lucide-react';

interface TiempoExtraBannerProps {
  state: GameState;
}

export function TiempoExtraBanner({ state }: TiempoExtraBannerProps) {
  const tie = state.tiempoExtraState;
  const isActive = state.phase === 'tiempo_extra' && !!tie;
  if (!isActive) return null;
  const triggering = state.players.find((p) => p.id === tie!.triggeringPlayerId);
  return (
    <div
      role="alert"
      aria-live="assertive"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--s-4)',
        alignItems: 'center',
        padding: 'var(--s-4) var(--s-5)',
        background: 'var(--violet)',
        color: 'var(--paper)',
        border: '2px solid var(--ink)',
        borderRadius: 'var(--r-card)',
        boxShadow: '5px 5px 0 var(--ink)',
        textShadow: '1px 1px 0 var(--ink)',
      }}
    >
      <Trophy size={28} aria-hidden="true" />
      <div style={{ display: 'flex', flexDirection: 'column' }}>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-22)',
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
          }}
        >
          Tiempo Extra
        </span>
        <span
          style={{
            fontFamily: 'var(--font-text)',
            fontSize: 13,
            display: 'inline-flex',
            alignItems: 'center',
            gap: 6,
          }}
        >
          <Clock size={12} aria-hidden="true" />
          {triggering?.nickname ?? tie!.triggeringPlayerId} a punto de ganar — quedan{' '}
          {tie!.turnsRemaining} turno(s) para evitarlo.
        </span>
      </div>
    </div>
  );
}
