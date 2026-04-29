import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card as UICard, useToast } from '@/components/ui';
import { useGameStore, selectCurrentPlayer } from '@/stores/gameStore';
import type { ExpansionInput, PlayerAction } from '@/types/game';
import { dispatchAction, getSession } from '@/multiplayer/sync';
import { Hand } from '@/components/game/Hand';
import { Bank } from '@/components/game/Bank';
import { PropertySetView } from '@/components/game/PropertySetView';
import { OpponentPanel } from '@/components/game/OpponentPanel';
import { Market } from '@/components/game/Market';
import { DeckPanel } from '@/components/game/DeckPanel';
import { CardMenu } from '@/components/game/CardMenu';
import { ActionBar } from '@/components/game/ActionBar';
import { DefenseModal } from '@/components/game/DefenseModal';
import { TitularBanner } from '@/components/game/TitularBanner';
import { TiempoExtraBanner } from '@/components/game/TiempoExtraBanner';
import { LogPanel } from '@/components/game/LogPanel';
import { ExpansionActivationModal } from '@/components/game/ExpansionActivationModal';
import { OnboardingTour } from '@/components/game/OnboardingTour';
import { MobileGate } from '@/components/game/MobileGate';
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import { useMobileGate } from '@/hooks/useMobileGate';
import GameOverScreen from './GameOverScreen';
import RoleAssignmentScreen from './RoleAssignmentScreen';

export default function GameScreen() {
  const gs = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const clearError = useGameStore((s) => s.clearError);
  const cur = useGameStore(selectCurrentPlayer);
  const navigate = useNavigate();
  const toast = useToast();
  const session = getSession();

  /** Helper: dispatch routeado a host si estamos en cliente; local si no. */
  const dispatch = (playerId: string, action: PlayerAction) =>
    dispatchAction(playerId, action);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [expansionOpen, setExpansionOpen] = useState(false);
  const [showAssignment, setShowAssignment] = useState(true);
  const isMobile = useMobileGate();

  // Mostrar errores como toasts
  useEffect(() => {
    if (lastError) {
      toast.error(lastError);
      clearError();
    }
  }, [lastError, toast, clearError]);

  if (isMobile) return <MobileGate />;

  if (!gs) {
    return (
      <main className="min-h-screen flex items-center justify-center bg-bg text-text">
        <p className="text-text-muted">No hay partida en curso.</p>
      </main>
    );
  }

  if (gs.winner && gs.phase === 'game_over') {
    return <GameOverScreen />;
  }

  if (showAssignment) {
    return <RoleAssignmentScreen onContinue={() => setShowAssignment(false)} />;
  }

  // En multiplayer real, "yo" es el jugador con id = session.myPlayerId.
  // En hot-seat, "yo" es siempre el jugador del turno actual.
  const me = session
    ? gs.players.find((p) => p.id === session.myPlayerId) ?? cur
    : cur;
  if (!me) return null;
  const others = gs.players.filter((p) => p.id !== me.id);
  const isMyTurn = session ? gs.players[gs.currentPlayerIndex]?.id === me.id : true;

  const selectedCard = me.hand.find((c) => c.id === selectedCardId) ?? null;
  const meBank = me.bank.reduce((sum, c) => sum + c.value, 0);

  const onHandCardClick = (cardId: string) => setSelectedCardId(cardId);

  const handleMenuChoice = (choice: Parameters<NonNullable<React.ComponentProps<typeof CardMenu>['onChoose']>>[0]) => {
    if (!selectedCard) return;
    setSelectedCardId(null);
    const card = selectedCard;
    switch (choice.type) {
      case 'cancel':
        return;
      case 'money':
        dispatch(me.id, { type: 'PLAY_CARD_AS_MONEY', cardId: card.id });
        return;
      case 'property':
        dispatch(me.id, { type: 'PLAY_PROPERTY_TO_SET', cardId: card.id, setColor: choice.color });
        return;
      case 'wildcard':
        dispatch(me.id, { type: 'PLAY_WILDCARD_TO_SET', cardId: card.id, chosenColor: choice.color });
        return;
      case 'rent':
        dispatch(me.id, {
          type: 'PLAY_RENT',
          rentCardId: card.id,
          targetSetColor: choice.color,
          targetPlayerId: choice.targetId,
        });
        return;
      case 'building':
        dispatch(me.id, { type: 'PLAY_BUILDING', buildingCardId: card.id, targetSetColor: choice.color });
        return;
      case 'sobrecargo':
        dispatch(me.id, { type: 'PLAY_SOBRECARGO' });
        return;
      case 'action_simple':
        if (card.actionName === 'movida_extra') {
          dispatch(me.id, { type: 'DRAW_EXTRA', actionCardId: card.id });
        } else if (card.actionName === 'cuota') {
          dispatch(me.id, { type: 'COLLECT_TRIBUTE', actionCardId: card.id });
        }
        return;
      case 'action_target':
        if (card.actionName === 'factura') {
          dispatch(me.id, { type: 'COLLECT_DEBT', actionCardId: card.id, targetPlayerId: choice.targetId });
        }
        return;
      case 'action_target_set':
        if (card.actionName === 'confiscacion') {
          dispatch(me.id, {
            type: 'CONFISCATE',
            actionCardId: card.id,
            targetPlayerId: choice.targetId,
            setColor: choice.setColor,
          });
        }
        return;
      case 'action_target_card':
        if (card.actionName === 'trato_sucio') {
          dispatch(me.id, {
            type: 'STEAL_PROPERTY',
            actionCardId: card.id,
            targetPlayerId: choice.targetId,
            cardId: choice.cardId,
          });
        }
        return;
    }
  };

  const handleEndTurn = () => {
    dispatch(me.id, { type: 'END_TURN' });
  };

  const canActivateExpansion =
    me.expansionCharge >= 100 && !me.expansionUsed && gs.phase === 'playing' && isMyTurn;

  const handleActivateExpansion = (payload: ExpansionInput) => {
    setExpansionOpen(false);
    dispatch(me.id, { type: 'ACTIVATE_EXPANSION', payload });
  };

  // Keyboard shortcuts: T (terminar), E (expansión), L (log), H (ayuda), Esc (cerrar).
  useKeyboardShortcuts(
    {
      t: () => isMyTurn && handleEndTurn(),
      e: () => canActivateExpansion && setExpansionOpen(true),
      h: () => navigate('/tutorial'),
      l: () => setLogOpen((o) => !o),
      escape: () => {
        if (expansionOpen) setExpansionOpen(false);
        else if (logOpen) setLogOpen(false);
        else if (selectedCardId) setSelectedCardId(null);
      },
    },
    !showAssignment,
  );

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 bg-bg/85 backdrop-blur border-b border-divider px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-14 font-bold tracking-tight">YAJUGÁ</span>
          <span className="font-mono text-11 text-text-muted">/ {gs.gameId}</span>
        </div>
        <div className="flex items-center gap-3">
          <span
            className="font-sans text-12 text-text-muted"
            role="status"
            aria-live="polite"
          >
            Turno de <strong className="text-text">{gs.players[gs.currentPlayerIndex]?.nickname}</strong>
            {isMyTurn && session && <span className="text-coral ml-1">(vos)</span>}
          </span>
          <span className="font-mono text-11 text-text-muted">t={gs.turnsPlayed}</span>
        </div>
        <button
          type="button"
          onClick={() => navigate('/')}
          className="font-mono text-11 text-text-muted hover:text-coral underline-offset-4 hover:underline"
        >
          salir
        </button>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-4 flex flex-col gap-4">
        <TitularBanner titular={gs.activeTitular} />
        <TiempoExtraBanner state={gs} />

        {/* Oponentes */}
        <section className="grid gap-2 sm:grid-cols-2 lg:grid-cols-3">
          {others.map((o) => (
            <OpponentPanel
              key={o.id}
              player={o}
              isCurrent={false}
            />
          ))}
        </section>

        {/* Mazo + Descarte + Mercado */}
        <section className="flex flex-wrap items-start gap-4">
          <UICard padding="md" className="flex flex-col gap-2">
            <span className="font-display text-12 uppercase tracking-wider text-text-muted">
              Mazo / Descarte
            </span>
            <DeckPanel
              deckCount={gs.deck.length}
              discardTop={gs.discardPile[gs.discardPile.length - 1] ?? null}
            />
          </UICard>
          <Market
            cards={gs.marketCards}
            bankAvailable={meBank}
            hasBoughtThisTurn={me.hasBoughtFromMarket}
            onBuy={(cardId) =>
              dispatch(me.id, { type: 'BUY_FROM_MARKET', cardId })
            }
            className="flex-1 min-w-[280px]"
          />
        </section>

        {/* Mi zona: sets + banco */}
        <section className="grid gap-3 lg:grid-cols-3">
          <div className="lg:col-span-2 flex flex-col gap-2">
            <h2 className="font-display text-14 uppercase tracking-wider text-text-muted">
              Mis sets
            </h2>
            <div className="grid sm:grid-cols-2 gap-2">
              {me.sets.length === 0 && (
                <p className="font-sans text-12 text-text-subtle italic">
                  Todavía no tenés propiedades en sets.
                </p>
              )}
              {me.sets.map((s, i) => (
                <PropertySetView
                  key={`${s.color}-${i}`}
                  set={s}
                  onCardClick={(cid) =>
                    dispatch(me.id, { type: 'MOVE_WILDCARD', cardId: cid, toColor: s.color })
                  }
                />
              ))}
            </div>
          </div>
          <Bank player={me} />
        </section>

        {/* Mi mano */}
        <section className="flex flex-col gap-2">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-14 uppercase tracking-wider text-text-muted">
              Mi mano · {me.hand.length}
            </h2>
            <span className="font-mono text-11 text-text-muted">
              {me.hasPlayedCardsThisTurn}/3 cartas jugadas
            </span>
          </div>
          <Hand
            cards={me.hand}
            selectedId={selectedCardId}
            onCardClick={onHandCardClick}
          />
        </section>

        <ActionBar
          isMyTurn={isMyTurn}
          canActivateExpansion={canActivateExpansion}
          onEndTurn={handleEndTurn}
          onActivateExpansion={() => setExpansionOpen(true)}
          onToggleLog={() => setLogOpen(true)}
          onHelp={() => navigate('/tutorial')}
        />
      </div>

      <CardMenu
        open={selectedCard !== null}
        card={selectedCard}
        state={gs}
        player={me}
        onChoose={handleMenuChoice}
        onClose={() => setSelectedCardId(null)}
      />

      {gs.phase === 'defense_pending' && gs.pendingDefense && gs.pendingDefense.defenderId === me.id && (
        <DefenseModal
          state={gs}
          onResolve={(choice) => {
            const def = gs.pendingDefense;
            if (!def) return;
            dispatch(def.defenderId, { type: 'RESOLVE_DEFENSE', choice });
          }}
        />
      )}

      <LogPanel open={logOpen} onClose={() => setLogOpen(false)} log={gs.log} />

      <ExpansionActivationModal
        open={expansionOpen}
        state={gs}
        player={me}
        onActivate={handleActivateExpansion}
        onClose={() => setExpansionOpen(false)}
      />

      <OnboardingTour />
    </main>
  );
}
