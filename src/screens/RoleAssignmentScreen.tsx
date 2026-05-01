import { useEffect, useState } from 'react';
import { Button, Card } from '@/components/ui';
import { useGameStore } from '@/stores/gameStore';
import { ROLE_DEFINITIONS } from '@/game/roles';
import { EXPANSION_DEFINITIONS } from '@/game/expansions';
import { Sparkles } from 'lucide-react';

interface Props {
  onContinue: () => void;
}

export default function RoleAssignmentScreen({ onContinue }: Props) {
  const players = useGameStore((s) => s.gameState?.players ?? []);
  const [revealed, setRevealed] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setRevealed(true), 2000);
    return () => clearTimeout(t);
  }, []);

  return (
    <main className="flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
      <h1>Asignación de Roles</h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 w-full">
        {players.map((p, i) => {
          const role = ROLE_DEFINITIONS[p.role];
          const exp = EXPANSION_DEFINITIONS[p.expansion];
          return (
            <Card key={p.id} variant="elevated" padding="md" className="flex flex-col">
              <div className="flex items-center justify-between">
                <span>{p.nickname}</span>
                <span>jugador {i + 1}</span>
              </div>
              {!revealed ? (
                <div className="self-center">cargando…</div>
              ) : (
                <div className="flex flex-col">
                  <span>{role.name}</span>
                  <span>{role.passiveAbility}</span>
                  <div className="flex items-start">
                    <Sparkles size={12} />
                    <div className="flex flex-col">
                      <span>{exp.name}</span>
                      <span>{exp.description}</span>
                    </div>
                  </div>
                </div>
              )}
            </Card>
          );
        })}
      </div>

      {revealed && (
        <Button size="lg" onClick={onContinue}>
          Empezar partida
        </Button>
      )}
    </main>
  );
}
