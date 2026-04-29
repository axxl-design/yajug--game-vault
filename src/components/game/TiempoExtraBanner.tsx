import type { GameState } from '@/types/game';
import { motion, AnimatePresence } from 'framer-motion';
import { Trophy, Clock } from 'lucide-react';

interface TiempoExtraBannerProps {
  state: GameState;
}

export function TiempoExtraBanner({ state }: TiempoExtraBannerProps) {
  const tie = state.tiempoExtraState;
  const isActive = state.phase === 'tiempo_extra' && !!tie;

  return (
    <AnimatePresence>
      {isActive && (
        <motion.div
          initial={{ y: -32, scale: 0.94, opacity: 0 }}
          animate={{ y: 0, scale: 1, opacity: 1 }}
          exit={{ y: -32, opacity: 0 }}
          transition={{ duration: 0.8, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="rounded-8 border-2 border-violet bg-violet/15 px-4 py-3 flex items-center gap-3 text-violet"
          role="alert"
          aria-live="assertive"
        >
          <Trophy size={20} className="text-violet-light" />
          <div className="flex flex-col">
            <span className="font-display text-18 font-bold uppercase tracking-widest">
              Tiempo Extra
            </span>
            <span className="font-sans text-12 text-violet-light/90 flex items-center gap-2">
              <Clock size={12} />
              {tie!.triggeringPlayerId} a punto de ganar — quedan {tie!.turnsRemaining} turno(s) para evitarlo.
            </span>
          </div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
