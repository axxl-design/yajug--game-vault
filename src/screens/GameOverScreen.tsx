import { useNavigate } from 'react-router-dom';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Button, Logo } from '@/components/ui';
import { useGameStore } from '@/stores/gameStore';
import { useLobbyStore } from '@/stores/lobbyStore';

export default function GameOverScreen() {
  const navigate = useNavigate();
  const gs = useGameStore((s) => s.gameState);
  const reset = useGameStore((s) => s.reset);
  const lobbyReset = useLobbyStore((s) => s.reset);

  if (!gs || !gs.winner) return null;
  const winner = gs.players.find((p) => p.id === gs.winner);
  if (!winner) return null;

  const goHome = () => {
    reset();
    lobbyReset();
    navigate('/');
  };

  const cardsPlayed = gs.log.filter((l) =>
    [
      'card_played_money',
      'card_played_property',
      'wildcard_placed',
      'building_played',
      'rent_collected',
      'set_confiscated',
      'property_stolen',
      'property_traded',
      'debt_collected',
      'tribute_collected',
    ].includes(l.type),
  ).length;

  const expActivations = gs.log.filter((l) => l.type === 'expansion_activated').length;
  const titularsFlipped = gs.log.filter((l) => l.type === 'titular_flipped').length;

  return (
    <main
      className="shell"
      style={{
        minHeight: '100vh',
        display: 'flex',
        flexDirection: 'column',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 'var(--s-8) var(--s-6)',
        gap: 'var(--s-6)',
      }}
    >
      <div className="ed-kicker">
        <span className="ed-kicker-num">★</span>
        <span>Edición especial</span>
      </div>

      <Trophy size={72} color="var(--mostaza)" aria-hidden="true" />

      <div style={{ textAlign: 'center', maxWidth: 720 }}>
        <h1
          className="ed-section-title"
          style={{ fontSize: 'var(--fs-96)', lineHeight: 0.92, margin: 0 }}
        >
          Fin de <em>partida</em>.
        </h1>
        <Logo
          variant="full"
          width="min(360px, 60vw)"
          ariaHidden
          className="mt-4"
        />
      </div>

      <div
        className="ed-frame"
        style={{
          maxWidth: 560,
          width: '100%',
          padding: 'var(--s-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-3)',
          textAlign: 'center',
          background: 'var(--ink)',
          color: 'var(--paper)',
          borderColor: 'var(--ink)',
          boxShadow: '6px 6px 0 var(--tomate)',
        }}
      >
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 11,
            letterSpacing: '0.30em',
            color: 'var(--mostaza)',
            textTransform: 'uppercase',
          }}
        >
          Ganador
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'var(--fs-56)',
            lineHeight: 1,
            color: 'var(--paper)',
          }}
        >
          {winner.nickname}
        </span>
        <span
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 13,
            letterSpacing: '0.18em',
            textTransform: 'uppercase',
            color: 'var(--tomate)',
          }}
        >
          El {winner.role}
        </span>
      </div>

      <div
        className="ed-frame"
        style={{
          maxWidth: 720,
          width: '100%',
          padding: 'var(--s-5)',
        }}
      >
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(3, 1fr)',
            gap: 0,
          }}
        >
          <Stat label="Turnos" value={gs.turnsPlayed} />
          <Stat label="Acciones" value={cardsPlayed} />
          <Stat label="Expansiones" value={expActivations} />
          <Stat label="Titulares" value={titularsFlipped} />
          <Stat label="Cartas mazo" value={gs.deck.length} />
          <Stat label="Descarte" value={gs.discardPile.length} />
        </div>
      </div>

      <div style={{ display: 'flex', gap: 'var(--s-3)', flexWrap: 'wrap', justifyContent: 'center' }}>
        <Button variant="secondary" leftIcon={RotateCcw} onClick={goHome} size="lg">
          Revancha
        </Button>
        <Button leftIcon={Home} onClick={goHome} size="lg">
          Volver al inicio
        </Button>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div
      style={{
        padding: 'var(--s-3)',
        borderRight: '1px solid var(--border)',
        borderBottom: '1px solid var(--border)',
        display: 'flex',
        flexDirection: 'column',
        gap: 4,
        alignItems: 'flex-start',
      }}
    >
      <span
        style={{
          fontFamily: 'var(--font-serif)',
          fontStyle: 'italic',
          fontSize: 'var(--fs-32)',
          color: 'var(--text)',
          lineHeight: 1,
        }}
      >
        {value}
      </span>
      <span
        style={{
          fontFamily: 'var(--font-mono)',
          fontSize: 9,
          letterSpacing: '0.18em',
          color: 'var(--text-mute)',
          textTransform: 'uppercase',
        }}
      >
        {label}
      </span>
    </div>
  );
}
