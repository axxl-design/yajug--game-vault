import { useEffect, useState } from 'react';
import { Button, Modal } from '@/components/ui';
import { ShieldAlert, Shield, Handshake, Swords, Clock } from 'lucide-react';
import type { DefenseChoice, GameState } from '@/types/game';
import { canAbogadoFreeBlock } from '@/game/role-passives';

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
        <div className="flex flex-col">
          <div className="flex items-center">
            <ShieldAlert size={28} aria-hidden="true" />
            <div className="flex flex-col">
              <span>Defensa: {defender.nickname}</span>
              <span>{description}</span>
            </div>
          </div>

          <div className="flex items-center">
            <Clock size={14} />
            <div className="flex-1">
              <div style={{ width: `${(remaining / TIMEOUT_MS) * 100}%` }} />
            </div>
            <span>{Math.ceil(remaining / 1000)}s</span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-3">
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
        </div>
      ) : (
        <div className="flex flex-col">
          <h3>Negociar pago</h3>
          <p>Proponé un monto alternativo (entre 0 y {monetaryAmount}M).</p>
          <input
            type="number"
            min={0}
            max={monetaryAmount}
            value={negotiateAmount}
            onChange={(e) => setNegotiateAmount(Math.max(0, Math.min(monetaryAmount, Number(e.target.value))))}
          />
          <div className="flex justify-end">
            <Button variant="ghost" onClick={() => setNegotiateOpen(false)}>
              Volver
            </Button>
            <Button onClick={() => onResolve({ type: 'negotiate', amount: negotiateAmount })}>
              Pagar {negotiateAmount}M
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
}
