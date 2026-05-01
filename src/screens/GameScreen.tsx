import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useToast, Logo } from '@/components/ui';
import { useGameStore, selectCurrentPlayer } from '@/stores/gameStore';
import type { ExpansionId, ExpansionInput, PlayerAction } from '@/types/game';
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
import { ExpansionDramaticOverlay } from '@/components/game/ExpansionDramaticOverlay';
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

  const dispatch = (playerId: string, action: PlayerAction) =>
    dispatchAction(playerId, action);

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [expansionOpen, setExpansionOpen] = useState(false);
  const [showAssignment, setShowAssignment] = useState(true);
  const [cinematicExpansion, setCinematicExpansion] = useState<ExpansionId | null>(null);
  const isMobile = useMobileGate();

  useEffect(() => {
    if (lastError) {
      toast.error(lastError);
      clearError();
    }
  }, [lastError, toast, clearError]);

  // Detect "expansion_activated" log entries to fire cinematic overlay
  useEffect(() => {
    if (!gs?.log?.length) return;
    const last = gs.log[gs.log.length - 1];
    if (last?.type === 'expansion_activated' && last.data && typeof last.data === 'object') {
      const data = last.data as { expansionId?: ExpansionId };
      if (data.expansionId) {
        setCinematicExpansion(data.expansionId);
      }
    }
  }, [gs?.log?.length]);

  if (isMobile) return <MobileGate />;

  if (!gs) {
    return (
      <main className="shell" style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', minHeight: '100vh' }}>
        <p className="ed-caption">No hay partida en curso.</p>
      </main>
    );
  }

  if (gs.winner && gs.phase === 'game_over') return <GameOverScreen />;
  if (showAssignment) return <RoleAssignmentScreen onContinue={() => setShowAssignment(false)} />;

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

  useKeyboardShortcuts(
    {
      t: () => isMyTurn && handleEndTurn(),
      e: () => canActivateExpansion && setExpansionOpen(true),
      h: () => navigate('/tutorial'),
      l: () => setLogOpen((o) => !o),
      escape: () => {
        if (cinematicExpansion) setCinematicExpansion(null);
        else if (expansionOpen) setExpansionOpen(false);
        else if (logOpen) setLogOpen(false);
        else if (selectedCardId) setSelectedCardId(null);
      },
    },
    !showAssignment,
  );

  return (
    <main className="shell" style={{ minHeight: '100vh', paddingBottom: 'var(--s-12)' }}>
      <header
        className="ed-topbar"
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
      >
        <div className="ed-topbar-mark">
          <Logo variant="title" height={20} ariaHidden />
          <span style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em' }}>
            / partida {gs.gameId}
          </span>
        </div>
        <div className="ed-topbar-meta" style={{ flexWrap: 'wrap' }}>
          <span role="status" aria-live="polite">
            Turno de{' '}
            <strong style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--tomate)', fontSize: 14, letterSpacing: 0, textTransform: 'none' }}>
              {gs.players[gs.currentPlayerIndex]?.nickname}
            </strong>
            {isMyTurn && session && <span> (vos)</span>}
          </span>
          <span>t={gs.turnsPlayed}</span>
          <button
            type="button"
            onClick={() => navigate('/')}
            className="ed-btn ed-btn-ghost ed-btn-sm"
          >
            Salir
          </button>
        </div>
      </header>

      <div
        style={{
          maxWidth: 1320,
          margin: '0 auto',
          padding: 'var(--s-6) var(--s-6) 0',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-5)',
        }}
      >
        <TitularBanner titular={gs.activeTitular} />
        <TiempoExtraBanner state={gs} />

        {/* Oponentes */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 'var(--s-3)',
          }}
        >
          {others.map((o) => (
            <OpponentPanel key={o.id} player={o} isCurrent={false} />
          ))}
        </section>

        {/* Mazo + Mercado */}
        <section
          style={{
            display: 'flex',
            flexWrap: 'wrap',
            gap: 'var(--s-4)',
            alignItems: 'flex-start',
          }}
        >
          <div className="ed-frame" style={{ padding: 'var(--s-4)' }}>
            <div className="ed-frame-title">Mazo · Descarte</div>
            <DeckPanel
              deckCount={gs.deck.length}
              discardTop={gs.discardPile[gs.discardPile.length - 1] ?? null}
            />
          </div>
          <Market
            cards={gs.marketCards}
            bankAvailable={meBank}
            hasBoughtThisTurn={me.hasBoughtFromMarket}
            onBuy={(cardId) => dispatch(me.id, { type: 'BUY_FROM_MARKET', cardId })}
            className="flex-1"
          />
        </section>

        {/* Mis sets + Banco */}
        <section
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 2fr) minmax(0, 1fr)',
            gap: 'var(--s-4)',
          }}
        >
          <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
            <div className="ed-kicker">
              <span className="ed-kicker-num">i</span>
              <span>Mis sets</span>
            </div>
            {me.sets.length === 0 ? (
              <p className="ed-caption">Todavía no tenés propiedades en sets.</p>
            ) : (
              <div
                style={{
                  display: 'grid',
                  gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
                  gap: 'var(--s-3)',
                }}
              >
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
            )}
          </div>
          <Bank player={me} />
        </section>

        {/* Mi mano */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-3)' }}>
          <div
            style={{
              display: 'flex',
              alignItems: 'baseline',
              justifyContent: 'space-between',
              gap: 'var(--s-3)',
              flexWrap: 'wrap',
            }}
          >
            <div className="ed-kicker">
              <span className="ed-kicker-num">ii</span>
              <span>Mi mano · {me.hand.length}</span>
            </div>
            <span
              style={{
                fontFamily: 'var(--font-mono)',
                fontSize: 11,
                letterSpacing: '0.10em',
                color: 'var(--text-mute)',
              }}
            >
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

      <ExpansionDramaticOverlay
        expansionId={cinematicExpansion}
        onComplete={() => setCinematicExpansion(null)}
      />

      <OnboardingTour />
    </main>
  );
}
