import { useEffect, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { ShieldAlert, Shield, Handshake, Swords, Clock } from 'lucide-react';
import type { DefenseChoice, GameState } from '@/types/game';
import { canAbogadoFreeBlock } from '@/game/role-passives';
import { motion } from 'framer-motion';

interface DefenseModalProps {
  state: GameState;
  onResolve: (choice: DefenseChoice) => void;
}

const TIMEOUT_MS = 8000;

export function DefenseModal({ state, onResolve }: DefenseModalProps) {
  const pending = state.pendingDefense;
  const [remaining, setRemaining] = useState(TIMEOUT_MS);
  const [negotiateOpen, setNegotiateOpen] = useState(false);
  const [negotiateAmount, setNegotiateAmount] = useState(0);

  useEffect(() => {
    if (!pending) return;
    setRemaining(TIMEOUT_MS);
    setNegotiateOpen(false);
    const start = Date.now();
    const tick = setInterval(() => {
      const left = Math.max(0, TIMEOUT_MS - (Date.now() - start));
      setRemaining(left);
      if (left <= 0) {
        clearInterval(tick);
        onResolve({ type: 'accept' });
      }
    }, 100);
    return () => clearInterval(tick);
  }, [pending?.attackerId, pending?.defenderId, pending?.cardPlayed.id]);

  if (!pending) return null;
  const defender = state.players.find((p) => p.id === pending.defenderId);
  const attacker = state.players.find((p) => p.id === pending.attackerId);
  if (!defender || !attacker) return null;

  const hasBloqueo = defender.hand.some((c) => c.actionName === 'bloqueo');
  const canBlock = hasBloqueo || canAbogadoFreeBlock(defender);

  const ctx = pending.context;
  const isMonetary = ctx.type === 'rent' || ctx.type === 'collect_debt' || ctx.type === 'collect_tribute';
  const monetaryAmount = isMonetary ? (ctx as { amount: number }).amount : 0;

  const description = (() => {
    switch (ctx.type) {
      case 'confiscate':
        return `${attacker.nickname} quiere CONFISCAR tu set ${ctx.setColor}.`;
      case 'steal_property':
        return `${attacker.nickname} intenta robarte una propiedad.`;
      case 'force_trade':
        return `${attacker.nickname} propone un Trueque Forzado.`;
      case 'collect_debt':
        return `${attacker.nickname} te factura ${ctx.amount}M.`;
      case 'collect_tribute':
        return `${attacker.nickname} cobra Cuota de ${ctx.amount}M.`;
      case 'rent':
        return `${attacker.nickname} cobra renta de ${ctx.amount}M (set ${ctx.targetSetColor}).`;
    }
  })();

  return (
    <Modal
      open
      onClose={() => onResolve({ type: 'accept' })}
      title=""
      size="md"
      closeOnOverlay={false}
      closeOnEsc={false}
      showClose={false}
    >
      {!negotiateOpen ? (
        <motion.div
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          transition={{ duration: 0.25, ease: [0.68, -0.55, 0.265, 1.55] }}
          className="flex flex-col gap-4"
        >
          <div className="flex items-center gap-3">
            <ShieldAlert className="text-coral" size={28} aria-hidden="true" />
            <div className="flex flex-col">
              <span className="font-display text-20 font-semibold tracking-tight">
                Defensa: {defender.nickname}
              </span>
              <span className="font-sans text-13 text-text-muted">{description}</span>
            </div>
          </div>

          <div className="flex items-center gap-2 text-text-muted">
            <Clock size={14} />
            <div className="flex-1 h-2 rounded-full bg-bg-elev-2 overflow-hidden">
              <motion.div
                className="h-full bg-coral"
                animate={{ width: `${(remaining / TIMEOUT_MS) * 100}%` }}
                transition={{ duration: 0.1, ease: 'linear' }}
              />
            </div>
            <span className="font-mono text-12">{Math.ceil(remaining / 1000)}s</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
            <Button
              size="lg"
              leftIcon={Shield}
              disabled={!canBlock}
              onClick={() => onResolve({ type: 'block' })}
              variant="secondary"
            >
              Bloquear
            </Button>
            <Button
              size="lg"
              leftIcon={Handshake}
              onClick={() => {
                setNegotiateAmount(Math.max(0, Math.floor(monetaryAmount / 2)));
                setNegotiateOpen(true);
              }}
              disabled={!isMonetary}
            >
              Negociar
            </Button>
            <Button
              size="lg"
              leftIcon={Swords}
              variant="danger"
              onClick={() => onResolve({ type: 'counter' })}
            >
              Contraatacar
            </Button>
          </div>

          <Button variant="ghost" onClick={() => onResolve({ type: 'accept' })}>
            Aceptar el ataque
          </Button>
        </motion.div>
      ) : (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.18 }}
          className="flex flex-col gap-3"
        >
          <h3 className="font-display text-18 font-semibold">Negociar pago</h3>
          <p className="font-sans text-13 text-text-muted">
            Proponé un monto alternativo (entre 0 y {monetaryAmount}M).
          </p>
          <input
            type="number"
            min={0}
            max={monetaryAmount}
            value={negotiateAmount}
            onChange={(e) => setNegotiateAmount(Math.max(0, Math.min(monetaryAmount, Number(e.target.value))))}
            className="h-10 rounded-6 border border-border bg-bg-elev-2 px-3 font-mono text-15"
          />
          <div className="flex justify-end gap-2">
            <Button variant="ghost" onClick={() => setNegotiateOpen(false)}>
              Volver
            </Button>
            <Button
              onClick={() => onResolve({ type: 'negotiate', amount: negotiateAmount })}
            >
              Pagar {negotiateAmount}M
            </Button>
          </div>
        </motion.div>
      )}
    </Modal>
  );
}
