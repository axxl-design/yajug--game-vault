import type { GameState } from '@/types/game';
import { Trophy, Clock } from 'lucide-react';

interface TiempoExtraBannerProps {
  state: GameState;
}

export function TiempoExtraBanner({ state }: TiempoExtraBannerProps) {
  const tie = state.tiempoExtraState;
  const isActive = state.phase === 'tiempo_extra' && !!tie;
  if (!isActive) return null;
  return (
    <div className="flex items-center" role="alert" aria-live="assertive">
      <Trophy size={20} />
      <div className="flex flex-col">
        <span>Tiempo Extra</span>
        <span className="inline-flex items-center">
          <Clock size={12} />
          {tie!.triggeringPlayerId} a punto de ganar — quedan {tie!.turnsRemaining} turno(s) para evitarlo.
        </span>
      </div>
    </div>
  );
}
