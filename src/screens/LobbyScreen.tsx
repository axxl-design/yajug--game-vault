import { useMemo, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { motion } from 'framer-motion';
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Plug,
  Play,
  Users,
} from 'lucide-react';
import {
  Button,
  Card,
  Modal,
  SoundToggle,
  ThemeToggle,
  useToast,
} from '@/components/ui';
import { usePrefsStore } from '@/stores/prefsStore';
import { isValidGameCode } from '@/utils/gameCode';
import { cn } from '@/utils/cn';

const MAX_PLAYERS = 4;

interface LobbyPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
  connected: boolean;
}

export default function LobbyScreen() {
  const { gameId = '' } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const lastNickname = usePrefsStore((s) => s.lastNickname);

  const [confirmExit, setConfirmExit] = useState(false);
  const [copied, setCopied] = useState(false);

  // Validar el código antes de armar la sala.
  const codeValid = isValidGameCode(gameId);

  // Jugadores hardcoded para Fase 3 — Fase 4-5 los reemplaza con peerStore real.
  // Asumimos que el usuario local es siempre el host por ahora.
  const players = useMemo<LobbyPlayer[]>(
    () => [
      {
        id: 'self',
        nickname: lastNickname || 'Jugador 1',
        isHost: true,
        connected: true,
      },
      {
        id: 'mock-2',
        nickname: 'Invitado',
        isHost: false,
        connected: true,
      },
    ],
    [lastNickname],
  );

  const isHost = true; // Hardcoded — Fase 11 lo deriva de quién creó la partida.
  const canStart = players.filter((p) => p.connected).length >= 2;

  const slots: Array<LobbyPlayer | null> = [
    ...players,
    ...Array.from({ length: MAX_PLAYERS - players.length }, () => null),
  ];

  const handleCopy = async () => {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setCopied(true);
      toast.success('Link copiado al portapapeles.');
      setTimeout(() => setCopied(false), 1500);
    } catch {
      toast.error('No se pudo copiar el link. Pegalo manual.');
    }
  };

  const handleStart = () => {
    if (!canStart) return;
    toast.info('Inicio de partida queda para Fase 4-5 (lógica de juego).');
  };

  const handleExit = () => {
    setConfirmExit(false);
    navigate('/');
  };

  if (!codeValid) {
    return <InvalidCode code={gameId} onBack={() => navigate('/')} />;
  }

  return (
    <main className="relative min-h-screen bg-bg text-text">
      <header className="flex items-center justify-between gap-4 border-b border-divider px-6 py-4">
        <button
          type="button"
          onClick={() => setConfirmExit(true)}
          className={cn(
            'inline-flex items-center gap-2 text-13 text-text-muted',
            'hover:text-text transition-colors duration-fast ease-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-4 rounded-2',
          )}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Salir
        </button>
        <div className="font-display text-16 font-bold tracking-tight">
          YAJUGÁ <span className="text-text-muted font-medium">/ Sala</span>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-10 px-6 py-12">
        <CodeBanner code={gameId} onCopy={handleCopy} copied={copied} />

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-20 font-semibold tracking-tight">
              Jugadores
            </h2>
            <span className="font-mono text-13 text-text-muted">
              {players.filter((p) => p.connected).length}/{MAX_PLAYERS}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {slots.map((p, i) =>
              p ? (
                <PlayerSlot key={p.id} player={p} />
              ) : (
                <EmptySlot key={`empty-${i}`} />
              ),
            )}
          </div>
        </section>

        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          {isHost ? (
            <>
              <Button variant="ghost" onClick={() => setConfirmExit(true)}>
                Cancelar partida
              </Button>
              <Button
                size="lg"
                leftIcon={Play}
                onClick={handleStart}
                disabled={!canStart}
                className="!h-12 tracking-wide uppercase"
              >
                Empezar partida
              </Button>
            </>
          ) : (
            <>
              <span className="self-center text-14 text-text-muted">
                Esperando que el host empiece la partida…
              </span>
              <Button variant="ghost" onClick={() => setConfirmExit(true)}>
                Salir
              </Button>
            </>
          )}
        </footer>
      </div>

      <Modal
        open={confirmExit}
        onClose={() => setConfirmExit(false)}
        title="Salir de la partida"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setConfirmExit(false)}>
              Volver a la sala
            </Button>
            <Button variant="danger" onClick={handleExit}>
              Salir
            </Button>
          </>
        }
      >
        <p className="font-sans text-15 text-text leading-relaxed">
          {isHost
            ? 'Si salís, la sala se cancela y los demás jugadores conectados van a ser desconectados.'
            : 'Vas a volver a la pantalla principal y perder el lugar en esta sala.'}
        </p>
      </Modal>
    </main>
  );
}

/* ----------------------------- CodeBanner ----------------------------- */

function CodeBanner({
  code,
  onCopy,
  copied,
}: {
  code: string;
  onCopy: () => void;
  copied: boolean;
}) {
  return (
    <Card variant="elevated" padding="lg">
      <div className="flex flex-col items-start gap-4 sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col gap-1">
          <span className="font-sans text-12 uppercase tracking-widest text-text-muted">
            Código de partida
          </span>
          <span className="font-mono text-48 font-semibold tracking-[0.22em] text-text leading-none">
            {code}
          </span>
        </div>
        <Button
          variant="secondary"
          leftIcon={copied ? Check : Copy}
          onClick={onCopy}
        >
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
      </div>
    </Card>
  );
}

/* ----------------------------- PlayerSlot ----------------------------- */

function PlayerSlot({ player }: { player: LobbyPlayer }) {
  const initials = player.nickname
    .trim()
    .split(/\s+/)
    .map((w) => w[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

  return (
    <Card padding="md">
      <div className="flex items-center gap-3">
        <div
          className={cn(
            'flex h-10 w-10 items-center justify-center rounded-full',
            'bg-surface border border-border-strong',
            'font-display text-14 font-semibold text-text',
          )}
          aria-hidden="true"
        >
          {initials || '?'}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center gap-2 min-w-0">
            <span className="font-sans text-15 font-medium text-text truncate">
              {player.nickname}
            </span>
            {player.isHost && (
              <Crown
                size={14}
                className="shrink-0 text-amber"
                aria-label="Host"
              />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-12">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                player.connected ? 'bg-amber' : 'bg-mist',
              )}
              aria-hidden="true"
            />
            <span className="text-text-muted">
              {player.connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
      </div>
    </Card>
  );
}

/* ------------------------------ EmptySlot ----------------------------- */

function EmptySlot() {
  return (
    <Card padding="md" className="border-dashed">
      <div className="flex items-center gap-3 text-text-muted">
        <motion.div
          className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elev-2 border border-dashed border-border"
          animate={{ opacity: [0.5, 1, 0.5] }}
          transition={{ duration: 1.8, repeat: Infinity, ease: 'easeInOut' }}
          aria-hidden="true"
        >
          <Users size={16} />
        </motion.div>
        <span className="font-sans text-14">Esperando jugador…</span>
      </div>
    </Card>
  );
}

/* ----------------------------- InvalidCode ---------------------------- */

function InvalidCode({ code, onBack }: { code: string; onBack: () => void }) {
  return (
    <main className="flex min-h-screen items-center justify-center bg-bg text-text">
      <Card variant="elevated" padding="lg" className="max-w-md text-center flex flex-col gap-4">
        <Plug size={28} className="mx-auto text-coral" aria-hidden="true" />
        <h1 className="font-display text-24 font-semibold tracking-tight">
          Código no válido
        </h1>
        <p className="font-sans text-14 text-text-muted">
          El código <code className="font-mono text-text">{code || '(vacío)'}</code> no
          tiene el formato esperado. Volvé al inicio y probá de nuevo.
        </p>
        <Button onClick={onBack}>Volver al inicio</Button>
      </Card>
    </main>
  );
}
