import type { Card, CardColor, GameState, Player } from '@/types/game';
import { Modal, Button } from '@/components/ui';
import { isAction, isBuilding, isMoney, isProperty, isRent, isWildcard, wildcardAcceptsColor } from '@/game/cards';
import { ALL_COLORS } from './ALL_COLORS';

type Choice =
  | { type: 'money' }
  | { type: 'property'; color: CardColor }
  | { type: 'wildcard'; color: CardColor }
  | { type: 'rent'; color: CardColor; targetId: string }
  | { type: 'building'; color: CardColor }
  | { type: 'action_simple' }
  | { type: 'action_target'; targetId: string }
  | { type: 'action_target_set'; targetId: string; setColor: CardColor }
  | { type: 'action_target_card'; targetId: string; cardId: string }
  | { type: 'sobrecargo' }
  | { type: 'cancel' };

export interface CardMenuProps {
  open: boolean;
  card: Card | null;
  state: GameState;
  player: Player;
  onChoose: (c: Choice) => void;
  onClose: () => void;
}

export function CardMenu({ open, card, state, player, onChoose, onClose }: CardMenuProps) {
  if (!card) return null;
  const others = state.players.filter((p) => p.id !== player.id && p.isConnected);

  return (
    <Modal open={open} onClose={onClose} title={card.name} size="md">
      <div className="flex flex-col">
        {isMoney(card) && (
          <Button onClick={() => onChoose({ type: 'money' })}>Al banco (${card.value}M)</Button>
        )}

        {isProperty(card) && card.color && (
          <>
            <Button onClick={() => onChoose({ type: 'property', color: card.color! })}>
              A set {card.color}
            </Button>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isWildcard(card) && (
          <>
            <p>Elegí color:</p>
            <div className="flex flex-wrap">
              {ALL_COLORS.filter((col) => col !== 'comodin' && wildcardAcceptsColor(card, col)).map(
                (col) => (
                  <Button
                    key={col}
                    size="sm"
                    onClick={() => onChoose({ type: 'wildcard', color: col })}
                  >
                    {col}
                  </Button>
                ),
              )}
            </div>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isRent(card) && (
          <>
            <p>Cobrar de qué color:</p>
            <div className="flex flex-wrap">
              {(card.colors && card.colors.length > 0
                ? card.colors
                : ALL_COLORS.filter((c) => c !== 'comodin')
              ).map((col) =>
                player.sets.some((s) => s.color === col && s.properties.length > 0) ? (
                  <div key={col} className="flex flex-col">
                    <span>{col}</span>
                    <div className="flex flex-wrap">
                      {others.map((o) => (
                        <Button
                          key={o.id}
                          size="sm"
                          onClick={() => onChoose({ type: 'rent', color: col, targetId: o.id })}
                        >
                          a {o.nickname}
                        </Button>
                      ))}
                    </div>
                  </div>
                ) : null,
              )}
            </div>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isBuilding(card) && (
          <>
            <p>Mejorar set completo:</p>
            <div className="flex flex-wrap">
              {player.sets
                .filter((s) => s.isComplete)
                .map((s) => (
                  <Button
                    key={s.color}
                    size="sm"
                    onClick={() => onChoose({ type: 'building', color: s.color })}
                  >
                    {card.actionName} en {s.color}
                  </Button>
                ))}
            </div>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'movida_extra' && (
          <>
            <Button onClick={() => onChoose({ type: 'action_simple' })}>
              Robar 2 cartas
            </Button>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'sobrecargo' && (
          <>
            <Button
              onClick={() => onChoose({ type: 'sobrecargo' })}
              disabled={!player.lastRentInTurn}
            >
              Duplicar última renta
            </Button>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'cuota' && (
          <>
            <Button onClick={() => onChoose({ type: 'action_simple' })}>
              Cobrar 2M a cada uno
            </Button>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'factura' && (
          <>
            <p>A quién facturás 5M:</p>
            <div className="flex flex-wrap">
              {others.map((o) => (
                <Button
                  key={o.id}
                  size="sm"
                  onClick={() => onChoose({ type: 'action_target', targetId: o.id })}
                >
                  {o.nickname}
                </Button>
              ))}
            </div>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'confiscacion' && (
          <>
            <p>Confiscar set completo:</p>
            <div className="flex flex-col">
              {others.flatMap((o) =>
                o.sets
                  .filter((s) => s.isComplete && !s.isMonument)
                  .map((s) => (
                    <Button
                      key={`${o.id}-${s.color}`}
                      size="sm"
                      onClick={() =>
                        onChoose({ type: 'action_target_set', targetId: o.id, setColor: s.color })
                      }
                    >
                      {o.nickname} · {s.color}
                    </Button>
                  )),
              )}
            </div>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'trato_sucio' && (
          <>
            <p>Robar propiedad suelta:</p>
            <div className="flex flex-col">
              {others.flatMap((o) =>
                o.sets
                  .filter((s) => !s.isComplete && s.properties.length > 0)
                  .flatMap((s) =>
                    s.properties.map((p) => (
                      <Button
                        key={`${o.id}-${p.id}`}
                        size="sm"
                        onClick={() =>
                          onChoose({ type: 'action_target_card', targetId: o.id, cardId: p.id })
                        }
                      >
                        {o.nickname} · {p.name}
                      </Button>
                    )),
                  ),
              )}
            </div>
            <Button variant="secondary" onClick={() => onChoose({ type: 'money' })}>
              Al banco (${card.value}M)
            </Button>
          </>
        )}

        {isAction(card) && card.actionName === 'trueque_forzado' && (
          <p>
            Trueque desde menú: usa el botón Acción de la barra inferior (UI completa pendiente).
            Por ahora podés jugarla al banco.
          </p>
        )}

        {isAction(card) && card.actionName === 'bloqueo' && (
          <p>Bloqueo se usa automáticamente cuando te atacan.</p>
        )}

        <Button variant="ghost" onClick={() => onChoose({ type: 'cancel' })}>
          Cancelar
        </Button>
      </div>
    </Modal>
  );
}
