import { useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import {
  ArrowLeft,
  Check,
  Copy,
  Crown,
  Plug,
  Play,
  Plus,
  Users,
  X,
} from 'lucide-react';
import {
  Button,
  Card,
  Modal,
  NicknameInput,
  SoundToggle,
  ThemeToggle,
  useToast,
} from '@/components/ui';
import { usePrefsStore } from '@/stores/prefsStore';
import {
  selectCanStart,
  selectConnectedCount,
  useLobbyStore,
} from '@/stores/lobbyStore';
import { useGameStore } from '@/stores/gameStore';
import { isValidGameCode } from '@/utils/gameCode';
import { GAME_CONFIG } from '@/game/constants';
import { cn } from '@/utils/cn';
import GameScreen from './GameScreen';

export default function LobbyScreen() {
  const { gameId = '' } = useParams<{ gameId: string }>();
  const navigate = useNavigate();
  const toast = useToast();
  const lastNickname = usePrefsStore((s) => s.lastNickname);

  const lobby = useLobbyStore();
  const players = lobby.players;
  const canStart = selectCanStart(lobby);
  const connectedCount = selectConnectedCount(lobby);

  const gameState = useGameStore((s) => s.gameState);
  const initGame = useGameStore((s) => s.initGame);

  const [confirmExit, setConfirmExit] = useState(false);
  const [copied, setCopied] = useState(false);
  const [addOpen, setAddOpen] = useState(false);
  const [newNickname, setNewNickname] = useState('');

  const codeValid = isValidGameCode(gameId);

  // Inicializar lobby si está vacío y el código es válido.
  useEffect(() => {
    if (!codeValid) return;
    if (lobby.gameId === gameId && lobby.players.length > 0) return;
    lobby.initLobby({
      gameId,
      localPlayerId: 'self',
      localNickname: lastNickname || 'Anfitrión',
      isHost: true,
    });
    // Solo correr una vez al montar.
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId, codeValid]);

  // Si la partida ya empezó (gameState existe), renderizar GameScreen.
  if (gameState) {
    return <GameScreen />;
  }

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

  const handleAddPlayer = () => {
    const nick = newNickname.trim();
    if (!nick) {
      toast.error('El nickname no puede estar vacío.');
      return;
    }
    if (players.length >= GAME_CONFIG.MAX_PLAYERS) {
      toast.error(`Máximo ${GAME_CONFIG.MAX_PLAYERS} jugadores.`);
      return;
    }
    const id = `p-${players.length + 1}-${Date.now().toString(36)}`;
    lobby.addPlayer({ id, nickname: nick, isHost: false, isConnected: true });
    setNewNickname('');
    setAddOpen(false);
  };

  const handleStart = () => {
    if (!canStart) return;
    initGame({
      gameId,
      hostId: players.find((p) => p.isHost)?.id ?? players[0].id,
      playerSeeds: players.map((p) => ({ id: p.id, nickname: p.nickname })),
    });
    // GameScreen se renderiza automáticamente al cambiar gameState.
  };

  const handleExit = () => {
    setConfirmExit(false);
    lobby.reset();
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
          YAJUGÁ <span className="text-text-muted font-medium">/ Sala (hot-seat)</span>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
        <CodeBanner code={gameId} onCopy={handleCopy} copied={copied} />

        <section className="flex flex-col gap-4">
          <div className="flex items-baseline justify-between">
            <h2 className="font-display text-20 font-semibold tracking-tight">Jugadores</h2>
            <span className="font-mono text-13 text-text-muted">
              {connectedCount}/{GAME_CONFIG.MAX_PLAYERS}
            </span>
          </div>
          <div className="grid gap-3 sm:grid-cols-2">
            {players.map((p) => (
              <PlayerSlot
                key={p.id}
                nickname={p.nickname}
                isHost={p.isHost}
                connected={p.isConnected}
                onRemove={p.isHost ? undefined : () => lobby.removePlayer(p.id)}
              />
            ))}
            {players.length < GAME_CONFIG.MAX_PLAYERS && (
              <button
                type="button"
                onClick={() => setAddOpen(true)}
                className={cn(
                  'flex items-center gap-3 rounded-8 border border-dashed border-border bg-bg-elev-1 p-3',
                  'hover:bg-bg-elev-2 hover:border-border-strong transition-colors duration-fast ease-out',
                  'text-text-muted text-left',
                )}
              >
                <span className="flex h-10 w-10 items-center justify-center rounded-full bg-bg-elev-2 border border-dashed border-border">
                  <Plus size={16} />
                </span>
                <span className="font-sans text-14">Agregar jugador (hot-seat)</span>
              </button>
            )}
          </div>

          <p className="font-sans text-12 text-text-subtle italic">
            Modo hot-seat: todos los jugadores comparten esta pestaña. El multijugador real (PeerJS) llega en Fase 11.
          </p>
        </section>

        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
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
            Empezar partida ({connectedCount}/{GAME_CONFIG.MAX_PLAYERS})
          </Button>
        </footer>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Agregar jugador"
        size="sm"
        footer={
          <>
            <Button variant="ghost" onClick={() => setAddOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleAddPlayer} disabled={!newNickname.trim()}>
              Agregar
            </Button>
          </>
        }
      >
        <NicknameInput
          value={newNickname}
          onChange={setNewNickname}
          onSubmitValid={handleAddPlayer}
          autoFocus
          label="Nickname"
        />
      </Modal>

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
          Vas a cancelar la sala y volver al inicio.
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
        <Button variant="secondary" leftIcon={copied ? Check : Copy} onClick={onCopy}>
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
      </div>
    </Card>
  );
}

/* ----------------------------- PlayerSlot ----------------------------- */

function PlayerSlot({
  nickname,
  isHost,
  connected,
  onRemove,
}: {
  nickname: string;
  isHost: boolean;
  connected: boolean;
  onRemove?: () => void;
}) {
  const initials = nickname
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
            <span className="font-sans text-15 font-medium text-text truncate">{nickname}</span>
            {isHost && (
              <Crown size={14} className="shrink-0 text-amber" aria-label="Host" />
            )}
          </div>
          <div className="flex items-center gap-1.5 text-12">
            <span
              className={cn(
                'h-1.5 w-1.5 rounded-full',
                connected ? 'bg-amber' : 'bg-mist',
              )}
              aria-hidden="true"
            />
            <span className="text-text-muted">
              {connected ? 'Conectado' : 'Desconectado'}
            </span>
          </div>
        </div>
        {onRemove && (
          <button
            type="button"
            onClick={onRemove}
            className="text-text-muted hover:text-coral p-1 rounded-2"
            aria-label="Quitar jugador"
            title="Quitar"
          >
            <X size={14} />
          </button>
        )}
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
          El código <code className="font-mono text-text">{code || '(vacío)'}</code> no tiene el formato esperado. Volvé al inicio y probá de nuevo.
        </p>
        <Button onClick={onBack}>Volver al inicio</Button>
      </Card>
    </main>
  );
}

// Suprimir warning de unused import
void Users;
