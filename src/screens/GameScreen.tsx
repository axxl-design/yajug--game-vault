import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { Card as UICard, useToast } from '@/components/ui';
import { useGameStore, selectCurrentPlayer } from '@/stores/gameStore';
import type { ExpansionInput } from '@/types/game';
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
import GameOverScreen from './GameOverScreen';
import RoleAssignmentScreen from './RoleAssignmentScreen';

export default function GameScreen() {
  const gs = useGameStore((s) => s.gameState);
  const lastError = useGameStore((s) => s.lastError);
  const clearError = useGameStore((s) => s.clearError);
  const store = useGameStore.getState;
  const cur = useGameStore(selectCurrentPlayer);
  const navigate = useNavigate();
  const toast = useToast();

  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const [logOpen, setLogOpen] = useState(false);
  const [expansionOpen, setExpansionOpen] = useState(false);
  const [showAssignment, setShowAssignment] = useState(true);

  // Mostrar errores como toasts
  useEffect(() => {
    if (lastError) {
      toast.error(lastError);
      clearError();
    }
  }, [lastError, toast, clearError]);

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

  const me = cur; // En hot-seat, el "jugador local" es siempre el del turno actual.
  if (!me) return null;
  const others = gs.players.filter((p) => p.id !== me.id);
  const isMyTurn = true; // hot-seat, siempre se juega quien está al turno

  const selectedCard = me.hand.find((c) => c.id === selectedCardId) ?? null;
  const meBank = me.bank.reduce((sum, c) => sum + c.value, 0);

  const onHandCardClick = (cardId: string) => setSelectedCardId(cardId);

  const handleMenuChoice = (choice: Parameters<NonNullable<React.ComponentProps<typeof CardMenu>['onChoose']>>[0]) => {
    if (!selectedCard) return;
    setSelectedCardId(null);
    const card = selectedCard;
    const s = store();
    switch (choice.type) {
      case 'cancel':
        return;
      case 'money':
        s.playCardAsMoney(me.id, card.id);
        return;
      case 'property':
        s.playPropertyToSet(me.id, card.id, choice.color);
        return;
      case 'wildcard':
        s.playWildcardToSet(me.id, card.id, choice.color);
        return;
      case 'rent':
        s.playRent(me.id, card.id, choice.color, choice.targetId);
        return;
      case 'building':
        s.playBuilding(me.id, card.id, choice.color);
        return;
      case 'sobrecargo':
        s.playSobrecargo(me.id);
        return;
      case 'action_simple':
        if (card.actionName === 'movida_extra') {
          s.drawExtra(me.id, card.id);
        } else if (card.actionName === 'cuota') {
          s.collectTribute(me.id, card.id);
        }
        return;
      case 'action_target':
        if (card.actionName === 'factura') {
          s.collectDebt(me.id, card.id, choice.targetId);
        }
        return;
      case 'action_target_set':
        if (card.actionName === 'confiscacion') {
          s.confiscate(me.id, card.id, choice.targetId, choice.setColor);
        }
        return;
      case 'action_target_card':
        if (card.actionName === 'trato_sucio') {
          s.stealProperty(me.id, card.id, choice.targetId, choice.cardId);
        }
        return;
    }
  };

  const handleEndTurn = () => {
    if (me.hand.length > 7) {
      // Forced discard automático del lowest-first (default policy).
      // El brief permite que la UI ofrezca selección manual; en MVP usamos default.
    }
    store().endTurn(me.id);
  };

  const canActivateExpansion =
    me.expansionCharge >= 100 && !me.expansionUsed && gs.phase === 'playing';

  const handleActivateExpansion = (payload: ExpansionInput) => {
    setExpansionOpen(false);
    store().activateExpansion(me.id, payload);
  };

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 bg-bg/85 backdrop-blur border-b border-divider px-4 py-2 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="font-display text-14 font-bold tracking-tight">YAJUGÁ</span>
          <span className="font-mono text-11 text-text-muted">/ {gs.gameId}</span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-12 text-text-muted">
            Turno de <strong className="text-text">{me.nickname}</strong> ({me.role})
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
            onBuy={(cardId) => store().buyFromMarket(me.id, cardId)}
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
                  onCardClick={(cid) => store().moveWildcard(me.id, cid, s.color)}
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

      {gs.phase === 'defense_pending' && (
        <DefenseModal
          state={gs}
          onResolve={(choice) => {
            const def = gs.pendingDefense;
            if (!def) return;
            store().resolveDefense(def.defenderId, choice);
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
    </main>
  );
}
