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
  Wifi,
  WifiOff,
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
import {
  closeSession,
  getSession,
  startClientSession,
  startHostSession,
} from '@/multiplayer/sync';

type SessionStatus = 'idle' | 'connecting' | 'host' | 'client' | 'failed';

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
  const [status, setStatus] = useState<SessionStatus>('idle');
  const [statusMsg, setStatusMsg] = useState<string>('');

  const codeValid = isValidGameCode(gameId);

  // Inicializar sesión multiplayer (host o client) según sessionStorage.
  useEffect(() => {
    if (!codeValid) return;
    let cancelled = false;
    const role = sessionStorage.getItem(`mp_role_${gameId}`) ?? 'host';
    const localPlayerId = `self-${gameId}`;
    const localNickname = lastNickname || (role === 'host' ? 'Anfitrión' : 'Invitado');

    setStatus('connecting');
    setStatusMsg(role === 'host' ? 'Abriendo sala…' : 'Conectándome al host…');

    if (role === 'host') {
      // Inicializar lobby local
      lobby.initLobby({
        gameId,
        localPlayerId,
        localNickname,
        isHost: true,
      });
      startHostSession({ gameId, localPlayerId, localNickname })
        .then(() => {
          if (cancelled) return;
          setStatus('host');
          setStatusMsg('Sala abierta. Compartí el link.');
        })
        .catch(async (err) => {
          if (cancelled) return;
          const code = (err as Error).message ?? 'unknown';
          // Si la id está tomada, otro ya es host → caer a cliente automático.
          if (code === 'unavailable-id') {
            try {
              await startClientSession({ gameId, localPlayerId, localNickname });
              if (cancelled) return;
              setStatus('client');
              setStatusMsg('Te uniste a la sala como cliente.');
              return;
            } catch {
              if (cancelled) return;
              setStatus('failed');
              setStatusMsg('No se pudo conectar al host. Modo hot-seat activo.');
              return;
            }
          }
          setStatus('failed');
          setStatusMsg('Sin red — modo hot-seat (todos en la misma pestaña).');
        });
    } else {
      startClientSession({ gameId, localPlayerId, localNickname })
        .then(() => {
          if (cancelled) return;
          setStatus('client');
          setStatusMsg('Conectado al host.');
        })
        .catch((err) => {
          if (cancelled) return;
          setStatus('failed');
          const code = (err as Error).message ?? 'unknown';
          setStatusMsg(
            code === 'connect-timeout'
              ? 'No se encontró la sala. Verificá el código.'
              : 'No se pudo conectar al host.',
          );
        });
    }

    return () => {
      cancelled = true;
      closeSession();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [gameId]);

  if (gameState) {
    return <GameScreen />;
  }

  const session = getSession();
  const isHost = !session || session.mode === 'host'; // hot-seat fallback = treat as host

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
  };

  const handleExit = () => {
    setConfirmExit(false);
    closeSession();
    lobby.reset();
    sessionStorage.removeItem(`mp_role_${gameId}`);
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

      <div className="mx-auto flex max-w-3xl flex-col gap-8 px-6 py-10">
        <CodeBanner code={gameId} onCopy={handleCopy} copied={copied} />

        <SessionStatusBanner status={status} message={statusMsg} />

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
                onRemove={
                  isHost && !p.isHost && status === 'failed'
                    ? () => lobby.removePlayer(p.id)
                    : undefined
                }
              />
            ))}
            {/* Hot-seat: agregar jugadores adicionales si la sesión multiplayer falló */}
            {status === 'failed' &&
              isHost &&
              players.length < GAME_CONFIG.MAX_PLAYERS && (
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
                  <span className="font-sans text-14">Agregar jugador hot-seat</span>
                </button>
              )}
          </div>

          {status === 'failed' && (
            <p className="font-sans text-12 text-text-subtle italic">
              Modo hot-seat: todos los jugadores comparten esta pestaña.
            </p>
          )}
          {status === 'host' && (
            <p className="font-sans text-12 text-text-subtle italic">
              Sos el host. Compartí el link para que se sumen jugadores.
            </p>
          )}
          {status === 'client' && (
            <p className="font-sans text-12 text-text-subtle italic">
              Conectado al host. Esperá que empiece la partida.
            </p>
          )}
        </section>

        <footer className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirmExit(true)}>
            {isHost ? 'Cancelar partida' : 'Salir'}
          </Button>
          {isHost && (
            <Button
              size="lg"
              leftIcon={Play}
              onClick={handleStart}
              disabled={!canStart}
              className="!h-12 tracking-wide uppercase"
            >
              Empezar partida ({connectedCount}/{GAME_CONFIG.MAX_PLAYERS})
            </Button>
          )}
        </footer>
      </div>

      <Modal
        open={addOpen}
        onClose={() => setAddOpen(false)}
        title="Agregar jugador (hot-seat)"
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
          Vas a cerrar la sala y volver al inicio.
        </p>
      </Modal>
    </main>
  );
}

/* --------------------------- SessionStatus --------------------------- */

function SessionStatusBanner({ status, message }: { status: SessionStatus; message: string }) {
  const icon =
    status === 'host' || status === 'client' ? <Wifi size={14} className="text-amber" /> : <WifiOff size={14} className="text-coral" />;
  return (
    <div className="flex items-center gap-2 rounded-8 border border-border bg-bg-elev-1 px-3 py-2">
      {icon}
      <span className="font-mono text-12 text-text-muted uppercase tracking-wider">
        {status}
      </span>
      <span className="font-sans text-12 text-text">{message}</span>
    </div>
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
