import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
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
    <main className="min-h-screen bg-bg text-text flex flex-col items-center justify-center p-6 gap-6">
      <motion.h1
        initial={{ opacity: 0, y: -8 }}
        animate={{ opacity: 1, y: 0 }}
        className="font-display text-40 font-bold tracking-tight"
      >
        Asignación de Roles
      </motion.h1>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 max-w-3xl w-full">
        {players.map((p, i) => {
          const role = ROLE_DEFINITIONS[p.role];
          const exp = EXPANSION_DEFINITIONS[p.expansion];
          return (
            <motion.div
              key={p.id}
              initial={{ opacity: 0, scale: 0.9 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ duration: 0.4, delay: 0.2 + i * 0.15 }}
            >
              <Card variant="elevated" padding="md" className="flex flex-col gap-2">
                <div className="flex items-center justify-between">
                  <span className="font-display text-15 font-semibold">{p.nickname}</span>
                  <span className="font-mono text-11 text-text-muted">jugador {i + 1}</span>
                </div>
                {!revealed ? (
                  <RouletteSpin />
                ) : (
                  <motion.div
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="flex flex-col gap-1"
                  >
                    <span className="font-display text-24 font-bold text-coral capitalize">
                      {role.name}
                    </span>
                    <span className="font-sans text-12 text-text-muted">
                      {role.passiveAbility}
                    </span>
                    <div className="rounded-6 bg-violet/15 border border-violet/40 p-2 mt-1 flex items-start gap-2">
                      <Sparkles size={12} className="text-violet shrink-0 mt-0.5" />
                      <div className="flex flex-col">
                        <span className="font-display text-12 font-semibold text-violet">
                          {exp.name}
                        </span>
                        <span className="font-sans text-11 text-violet-light/80">
                          {exp.description}
                        </span>
                      </div>
                    </div>
                  </motion.div>
                )}
              </Card>
            </motion.div>
          );
        })}
      </div>

      {revealed && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.4 }}
        >
          <Button size="lg" onClick={onContinue}>
            Empezar partida
          </Button>
        </motion.div>
      )}
    </main>
  );
}

function RouletteSpin() {
  return (
    <motion.div
      animate={{ rotate: 360 }}
      transition={{ duration: 1.6, repeat: Infinity, ease: 'linear' }}
      className="self-center my-4 w-12 h-12 rounded-full border-4 border-coral border-t-transparent"
    />
  );
}
