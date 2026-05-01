import { useNavigate } from 'react-router-dom';
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
    <main className="flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
      <div className="flex flex-col items-center">
        <Trophy size={96} />
        <h1>Fin de partida</h1>
        <Card variant="elevated" padding="lg" className="w-full flex flex-col">
          <span>Ganador</span>
          <span>{winner.nickname}</span>
          <span>{winner.role}</span>
        </Card>
        <Card padding="md" className="w-full">
          <div className="grid grid-cols-3">
            <Stat label="Turnos" value={gs.turnsPlayed} />
            <Stat label="Acciones" value={cardsPlayed} />
            <Stat label="Expansiones" value={expActivations} />
            <Stat label="Titulares" value={titularsFlipped} />
            <Stat label="Cartas mazo" value={gs.deck.length} />
            <Stat label="Descarte" value={gs.discardPile.length} />
          </div>
        </Card>
        <div className="flex">
          <Button variant="secondary" leftIcon={RotateCcw} onClick={goHome}>
            Revancha
          </Button>
          <Button leftIcon={Home} onClick={goHome}>
            Volver al inicio
          </Button>
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div className="flex flex-col">
      <span>{value}</span>
      <span>{label}</span>
    </div>
  );
}
