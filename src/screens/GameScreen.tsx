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
import { useKeyboardShortcuts } from '@/hooks/useKeyboardShortcuts';
import GameOverScreen from './GameOverScreen';
import RoleAssignmentScreen from './RoleAssignmentScreen';

function LoadingShell({ message }: { message: string }) {
  return (
    <main
      className="shell"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        flexDirection: 'column',
        gap: 'var(--s-4)',
        padding: 'var(--s-6)',
        textAlign: 'center',
      }}
    >
      <div
        style={{
          height: 32,
          width: 32,
          borderRadius: 999,
          border: '2px solid var(--tomate)',
          borderTopColor: 'transparent',
          animation: 'spin 1s linear infinite',
        }}
        aria-label="Cargando"
      />
      <p className="ed-caption">{message}</p>
    </main>
  );
}

export default function GameScreen() {
  /* ──────────────────────────────────────────────────────────────
     Rules of Hooks: TODOS los hooks (useState, useEffect, custom
     hooks) tienen que estar acá ARRIBA, antes de cualquier `return`
     condicional. La versión anterior llamaba `useKeyboardShortcuts`
     después de los early returns, lo cual cambiaba la cantidad de
     hooks entre renders → React error #310 ("Rendered more hooks
     than during the previous render").

     Pattern: declaramos todos los derivados (me, isMyTurn, etc.)
     como `null`/default seguros cuando el state aún no está listo,
     y los early returns van al final del bloque de hooks.
     ────────────────────────────────────────────────────────────── */

  const gs = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const clearError = useGameStore((s) => s.clearError);
  const cur = useGameStore(selectCurrentPlayer);
  const navigate = useNavigate();
  const toast = useToast();
  const session = getSession();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [expansionOpen, setExpansionOpen] = useState(false);
  const [showAssignment, setShowAssignment] = useState(true);
  const [opponentsCollapsed, setOpponentsCollapsed] = useState(false);
  const [cinematicExpansion, setCinematicExpansion] = useState<ExpansionId | null>(null);

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

  // Sincronización de la transición RoleAssignment → GameScreen.
  // Cuando el host clickea "Empezar partida" en RoleAssignmentScreen, emite
  // 'start-game' al socket. Los clients escuchan acá y dismissan su propio
  // showAssignment para entrar a la GameScreen junto con el host.
  useEffect(() => {
    if (!session || session.mode !== 'client') return;
    const onStart = () => {
      // eslint-disable-next-line no-console
      console.info('[gamescreen] received start-game → dismissing assignment');
      setShowAssignment(false);
    };
    session.socket.on('start-game', onStart);
    return () => {
      session.socket.off('start-game', onStart);
    };
  }, [session]);

  /* ── Derivados null-safe (calculados aún cuando gs/me son null) ── */

  const players = gs?.players;
  const hasPlayers = Array.isArray(players) && players.length > 0;
  const meById =
    session && hasPlayers ? players.find((p) => p.id === session.myPlayerId) ?? null : null;
  const me = meById ?? cur ?? (hasPlayers ? players[0] : null);
  const isMyTurn = !!me && (session && hasPlayers ? players[gs!.currentPlayerIndex]?.id === me.id : true);
  const canActivateExpansion =
    !!me && me.expansionCharge >= 100 && !me.expansionUsed && gs?.phase === 'playing' && isMyTurn;

  const handleEndTurn = () => {
    if (!me) return;
    dispatchAction(me.id, { type: 'END_TURN' });
  };

  // `useKeyboardShortcuts` debe estar al mismo nivel que el resto de los
  // hooks — antes de los early returns. El parámetro `enabled` controla
  // cuándo el listener está activo, basado en si estamos en gameplay.
  const isPlayingPhase =
    !!gs &&
    hasPlayers &&
    !showAssignment &&
    !(gs.winner && gs.phase === 'game_over');

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
    isPlayingPhase,
  );

  /* ──────────────────────── Early returns ──────────────────────── */

  if (!gs) {
    return <LoadingShell message="Esperando datos de la partida…" />;
  }

  // Defensive: gameState could arrive over the network mid-shape (corrupt JSON,
  // partial sync, etc.). Guard before rendering anything that touches players.
  if (!hasPlayers) {
    return <LoadingShell message="Sincronizando jugadores…" />;
  }

  if (gs.winner && gs.phase === 'game_over') return <GameOverScreen />;
  if (showAssignment) return <RoleAssignmentScreen onContinue={() => setShowAssignment(false)} />;

  if (!me) {
    return <LoadingShell message="No encontramos tu jugador en la partida." />;
  }

  /* ───────────────────── Render principal ───────────────────── */

  const dispatch = (playerId: string, action: PlayerAction) =>
    dispatchAction(playerId, action);

  const others = players.filter((p) => p.id !== me.id);
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

  const handleActivateExpansion = (payload: ExpansionInput) => {
    setExpansionOpen(false);
    dispatch(me.id, { type: 'ACTIVATE_EXPANSION', payload });
  };

  const currentPlayer = players[gs.currentPlayerIndex];
  const currentPlayerNickname = currentPlayer?.nickname ?? '—';

  return (
    <main className="shell game-shell">
      <header
        className="ed-topbar game-topbar"
        style={{ position: 'sticky', top: 0, zIndex: 20 }}
      >
        <div className="ed-topbar-mark">
          <Logo variant="title" height={20} ariaHidden />
          <span style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em' }}>
            / partida {gs.gameId}
          </span>
        </div>
        <div className="ed-topbar-meta game-topbar-meta">
          <span role="status" aria-live="polite">
            Turno de{' '}
            <strong style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--tomate)', fontSize: 14, letterSpacing: 0, textTransform: 'none' }}>
              {currentPlayerNickname}
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

      <div className="game-stack">
        <TitularBanner titular={gs.activeTitular} />
        <TiempoExtraBanner state={gs} />

        {/* Oponentes — colapsable en mobile */}
        <section className="game-opponents">
          <button
            type="button"
            className="game-opponents-toggle"
            onClick={() => setOpponentsCollapsed((c) => !c)}
            aria-expanded={!opponentsCollapsed}
          >
            <span>Oponentes · {others.length}</span>
            <span aria-hidden="true">{opponentsCollapsed ? '▾' : '▴'}</span>
          </button>
          {!opponentsCollapsed && (
            <div className="game-opponents-grid">
              {others.map((o) => (
                <OpponentPanel
                  key={o.id}
                  player={o}
                  isCurrent={players[gs.currentPlayerIndex]?.id === o.id}
                />
              ))}
            </div>
          )}
        </section>

        {/* Mazo + Mercado */}
        <section className="game-deck-market">
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
            className="game-market"
          />
        </section>

        {/* Mis sets + Banco */}
        <section className="game-sets-bank">
          <div className="game-sets-block">
            <div className="ed-kicker">
              <span className="ed-kicker-num">i</span>
              <span>Mis sets</span>
            </div>
            {me.sets.length === 0 ? (
              <p className="ed-caption">Todavía no tenés propiedades en sets.</p>
            ) : (
              <div className="game-sets-grid">
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
        <section className="game-hand">
          <div className="game-hand-head">
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
          <div className="game-hand-scroll">
            <Hand
              cards={me.hand}
              selectedId={selectedCardId}
              onCardClick={onHandCardClick}
            />
          </div>
        </section>

        <ActionBar
          isMyTurn={isMyTurn}
          canActivateExpansion={canActivateExpansion}
          onEndTurn={handleEndTurn}
          onActivateExpansion={() => setExpansionOpen(true)}
          onToggleLog={() => setLogOpen(true)}
          onHelp={() => navigate('/tutorial')}
          className="game-actionbar"
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
