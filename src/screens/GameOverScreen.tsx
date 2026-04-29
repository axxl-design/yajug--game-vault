import { useNavigate } from 'react-router-dom';
import { motion } from 'framer-motion';
import { Trophy, RotateCcw, Home } from 'lucide-react';
import { Button, Card } from '@/components/ui';
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

  // Stats simples
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
    <main className="min-h-screen flex flex-col items-center justify-center bg-bg text-text p-8">
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ duration: 1, ease: [0.16, 1, 0.3, 1] }}
        className="flex flex-col items-center gap-6 max-w-md"
      >
        <Trophy size={96} className="text-amber" />
        <h1 className="font-display text-64 font-bold tracking-tight uppercase text-center">
          Fin de partida
        </h1>
        <Card variant="elevated" padding="lg" className="w-full text-center flex flex-col gap-2">
          <span className="font-display text-12 uppercase tracking-widest text-text-muted">
            Ganador
          </span>
          <span className="font-display text-40 font-bold text-coral">{winner.nickname}</span>
          <span className="font-mono text-14 text-text-muted">{winner.role}</span>
        </Card>
        <Card padding="md" className="w-full">
          <div className="grid grid-cols-3 gap-3 text-center">
            <Stat label="Turnos" value={gs.turnsPlayed} />
            <Stat label="Acciones" value={cardsPlayed} />
            <Stat label="Expansiones" value={expActivations} />
            <Stat label="Titulares" value={titularsFlipped} />
            <Stat label="Cartas mazo" value={gs.deck.length} />
            <Stat label="Descarte" value={gs.discardPile.length} />
          </div>
        </Card>
        <div className="flex gap-3">
          <Button variant="secondary" leftIcon={RotateCcw} onClick={goHome}>
            Revancha
          </Button>
          <Button leftIcon={Home} onClick={goHome}>
            Volver al inicio
          </Button>
        </div>
      </motion.div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col gap-0.5">
      <span className="font-mono text-20 font-semibold text-text">{value}</span>
      <span className="font-sans text-11 uppercase tracking-wider text-text-muted">{label}</span>
    </div>
  );
}
