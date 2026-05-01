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

  useEffect(() => {
    if (!codeValid) return;
    let cancelled = false;
    const role = sessionStorage.getItem(`mp_role_${gameId}`) ?? 'host';
    const localPlayerId = `self-${gameId}`;
    const localNickname = lastNickname || (role === 'host' ? 'Anfitrión' : 'Invitado');

    setStatus('connecting');
    setStatusMsg(role === 'host' ? 'Abriendo sala…' : 'Conectándome al host…');

    if (role === 'host') {
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
  const isHost = !session || session.mode === 'host';

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
    <main className="relative" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between">
        <button type="button" onClick={() => setConfirmExit(true)} className="inline-flex items-center">
          <ArrowLeft size={16} aria-hidden="true" />
          Salir
        </button>
        <div>
          YAJUGÁ <span>/ Sala</span>
        </div>
        <div className="flex items-center">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex flex-col">
        <CodeBanner code={gameId} onCopy={handleCopy} copied={copied} />

        <SessionStatusBanner status={status} message={statusMsg} />

        <section className="flex flex-col">
          <div className="flex items-baseline justify-between">
            <h2>Jugadores</h2>
            <span>
              {connectedCount}/{GAME_CONFIG.MAX_PLAYERS}
            </span>
          </div>
          <div className="grid sm:grid-cols-2">
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
            {status === 'failed' &&
              isHost &&
              players.length < GAME_CONFIG.MAX_PLAYERS && (
                <button type="button" onClick={() => setAddOpen(true)} className="flex items-center text-left">
                  <span className="inline-flex items-center justify-center">
                    <Plus size={16} />
                  </span>
                  <span>Agregar jugador hot-seat</span>
                </button>
              )}
          </div>

          {status === 'failed' && (
            <p>Modo hot-seat: todos los jugadores comparten esta pestaña.</p>
          )}
          {status === 'host' && (
            <p>Sos el host. Compartí el link para que se sumen jugadores.</p>
          )}
          {status === 'client' && <p>Conectado al host. Esperá que empiece la partida.</p>}
        </section>

        <footer className="flex flex-col-reverse sm:flex-row sm:justify-end">
          <Button variant="ghost" onClick={() => setConfirmExit(true)}>
            {isHost ? 'Cancelar partida' : 'Salir'}
          </Button>
          {isHost && (
            <Button size="lg" leftIcon={Play} onClick={handleStart} disabled={!canStart}>
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
        <p>Vas a cerrar la sala y volver al inicio.</p>
      </Modal>
    </main>
  );
}

function SessionStatusBanner({ status, message }: { status: SessionStatus; message: string }) {
  const icon =
    status === 'host' || status === 'client' ? <Wifi size={14} /> : <WifiOff size={14} />;
  return (
    <div className="flex items-center" data-status={status}>
      {icon}
      <span>{status}</span>
      <span>{message}</span>
    </div>
  );
}

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
      <div className="flex flex-col items-start sm:flex-row sm:items-center sm:justify-between">
        <div className="flex flex-col">
          <span>Código de partida</span>
          <span>{code}</span>
        </div>
        <Button variant="secondary" leftIcon={copied ? Check : Copy} onClick={onCopy}>
          {copied ? 'Copiado' : 'Copiar link'}
        </Button>
      </div>
    </Card>
  );
}

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
      <div className="flex items-center">
        <div className="inline-flex items-center justify-center" aria-hidden="true">
          {initials || '?'}
        </div>
        <div className="flex min-w-0 flex-1 flex-col">
          <div className="flex items-center min-w-0">
            <span>{nickname}</span>
            {isHost && <Crown size={14} aria-label="Host" />}
          </div>
          <div className="flex items-center">
            <span data-connected={connected || undefined} aria-hidden="true" />
            <span>{connected ? 'Conectado' : 'Desconectado'}</span>
          </div>
        </div>
        {onRemove && (
          <button type="button" onClick={onRemove} aria-label="Quitar jugador" title="Quitar">
            <X size={14} />
          </button>
        )}
      </div>
    </Card>
  );
}

function InvalidCode({ code, onBack }: { code: string; onBack: () => void }) {
  return (
    <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <Card variant="elevated" padding="lg" className="flex flex-col">
        <Plug size={28} aria-hidden="true" />
        <h1>Código no válido</h1>
        <p>
          El código <code>{code || '(vacío)'}</code> no tiene el formato esperado. Volvé al inicio y probá de nuevo.
        </p>
        <Button onClick={onBack}>Volver al inicio</Button>
      </Card>
    </main>
  );
}
