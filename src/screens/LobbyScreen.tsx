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
  Logo,
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
import { ROLE_DEFINITIONS, ALL_ROLE_IDS } from '@/game/roles';
import type { RoleId } from '@/types/game';
import GameScreen from './GameScreen';
import {
  closeSession,
  getSession,
  startClientSession,
  startHostSession,
} from '@/multiplayer/sync';

type SessionStatus = 'idle' | 'connecting' | 'host' | 'client' | 'failed';

const ROLE_COLORS: Record<RoleId, string> = {
  abogado:       'var(--indigo)',
  corredor:      'var(--aqua)',
  estafador:     '#6B3D78',
  banquero:      'var(--mostaza)',
  coleccionista: 'var(--rosa)',
  arquitecto:    'var(--oliva)',
};

const ROLE_TAG: Record<RoleId, string> = {
  abogado:       'Reglas y trampas',
  corredor:      'Mercados y subastas',
  estafador:     'Engaño y descarte',
  banquero:      'Dinero y deuda',
  coleccionista: 'Piezas y archivos',
  arquitecto:    'Construye la ciudad',
};

const ROLE_GLYPH: Record<RoleId, string> = {
  abogado:       '§',
  corredor:      '$',
  estafador:     '?',
  banquero:      '€',
  coleccionista: '◈',
  arquitecto:    '◰',
};

/**
 * Devuelve un id único por dispositivo (estable entre reloads de la misma
 * pestaña). Persistido en sessionStorage para que un refresh accidental no
 * cree un "jugador fantasma" desde la perspectiva del host.
 */
function getOrCreateLocalPlayerId(gameId: string): string {
  const key = `mp_pid_${gameId}`;
  let id: string | null = null;
  try {
    id = sessionStorage.getItem(key);
  } catch {
    /* sessionStorage puede fallar en SSR / privacy modes */
  }
  if (id) return id;
  const rand =
    typeof crypto !== 'undefined' && typeof crypto.randomUUID === 'function'
      ? crypto.randomUUID().slice(0, 8)
      : Math.random().toString(36).slice(2, 10);
  id = `p-${rand}`;
  try {
    sessionStorage.setItem(key, id);
  } catch {
    /* swallow */
  }
  return id;
}

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
  const [previewRole, setPreviewRole] = useState<RoleId | null>(null);

  const codeValid = isValidGameCode(gameId);

  useEffect(() => {
    if (!codeValid) return;
    let cancelled = false;
    // Default to 'client' when no explicit role is set: opening a shared link
    // without going through "Crear/Unirme" should attempt to join, not host.
    const role = sessionStorage.getItem(`mp_role_${gameId}`) ?? 'client';
    const localPlayerId = getOrCreateLocalPlayerId(gameId);
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

  if (gameState) return <GameScreen />;

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
    sessionStorage.removeItem(`mp_pid_${gameId}`);
    navigate('/');
  };

  if (!codeValid) {
    return <InvalidCode code={gameId} onBack={() => navigate('/')} />;
  }

  const now = new Date();
  const day = now.toLocaleDateString('es', { weekday: 'long' });
  const dayCap = day.charAt(0).toUpperCase() + day.slice(1);
  const time = now.toLocaleTimeString('es', { hour: '2-digit', minute: '2-digit' });

  return (
    <main className="lobby">
      {/* Topbar */}
      <header className="lb-top" style={{ height: 64 }}>
        <div className="lb-top-left">
          <button
            type="button"
            onClick={() => setConfirmExit(true)}
            className="ed-btn ed-btn-ghost ed-btn-sm"
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Salir
          </button>
          <span className="lb-top-mark">
            <Logo variant="title" height={22} ariaHidden />
            <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--tomate)', fontSize: 13 }}>
              · Sala
            </span>
          </span>
        </div>
        <div className="lb-top-right">
          <span className="lb-online">{connectedCount} en sala · {dayCap} {time}</span>
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      {/* Izquierda — sala / jugadores */}
      <aside className="lb-left">
        <div>
          <span className="lb-bio-col">la mesa</span>
          <h1 className="lb-bio-name">
            Sala <em>abierta</em>
          </h1>
          <span className="lb-bio-tag">
            {connectedCount}/{GAME_CONFIG.MAX_PLAYERS} jugadores · {status}
          </span>
        </div>

        <div className="lb-stats">
          <div className="lb-stat">
            <span className="lb-stat-label">conectados</span>
            <span className="lb-stat-val">{connectedCount}</span>
          </div>
          <div className="lb-stat">
            <span className="lb-stat-label">máximo</span>
            <span className="lb-stat-val">{GAME_CONFIG.MAX_PLAYERS}</span>
          </div>
          <div className="lb-stat">
            <span className="lb-stat-label">modo</span>
            <span
              className="lb-stat-val"
              style={{ fontSize: 'var(--fs-18)' }}
            >
              {status === 'host' ? 'host' : status === 'client' ? 'cliente' : status === 'failed' ? 'hot-seat' : '—'}
            </span>
          </div>
          <div className="lb-stat">
            <span className="lb-stat-label">red</span>
            <span
              className="lb-stat-val"
              style={{ fontSize: 'var(--fs-18)' }}
            >
              {status === 'host' || status === 'client' ? 'online' : status === 'failed' ? 'local' : '…'}
            </span>
          </div>
        </div>

        <div>
          <div className="lb-section-head">
            <span className="lb-section-h">Jugadores</span>
            <span className="lb-online" style={{ fontSize: 9 }}>
              {connectedCount}/{GAME_CONFIG.MAX_PLAYERS}
            </span>
          </div>
          <div className="lb-slot-list">
            {players.map((p) => {
              const initials = p.nickname
                .trim()
                .split(/\s+/)
                .map((w) => w[0])
                .slice(0, 2)
                .join('')
                .toUpperCase();
              const canRemove = isHost && !p.isHost && status === 'failed';
              return (
                <div
                  key={p.id}
                  className="lb-slot"
                  data-host={p.isHost || undefined}
                  data-disconnected={!p.isConnected || undefined}
                >
                  <span className="ed-avatar ed-avatar-sm" aria-hidden="true">
                    {initials || '?'}
                  </span>
                  <div className="lb-slot-meta">
                    <span className="lb-slot-name">
                      {p.nickname}
                      {p.isHost && <Crown size={12} aria-label="Host" />}
                    </span>
                    <span
                      className="lb-slot-status"
                      data-tone={p.isConnected ? 'online' : 'offline'}
                    >
                      {p.isConnected ? <Wifi size={10} /> : <WifiOff size={10} />}
                      {p.isConnected ? 'Conectado' : 'Desconectado'}
                    </span>
                  </div>
                  {canRemove && (
                    <button
                      type="button"
                      onClick={() => lobby.removePlayer(p.id)}
                      aria-label="Quitar jugador"
                      title="Quitar"
                      className="ed-icon-btn"
                      style={{ width: 28, height: 28 }}
                    >
                      <X size={12} />
                    </button>
                  )}
                </div>
              );
            })}
            {status === 'failed' &&
              isHost &&
              players.length < GAME_CONFIG.MAX_PLAYERS && (
                <button
                  type="button"
                  onClick={() => setAddOpen(true)}
                  className="ed-btn ed-btn-secondary ed-btn-sm ed-btn-block"
                >
                  <Plus size={14} aria-hidden="true" />
                  Agregar hot-seat
                </button>
              )}
          </div>
        </div>

        <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
          <Button variant="ghost" size="sm" onClick={() => setConfirmExit(true)} fullWidth>
            {isHost ? 'Cancelar partida' : 'Salir'}
          </Button>
        </div>
      </aside>

      {/* Centro — la mesa */}
      <main className="lb-center">
        <div className="lb-masthead">
          <span className="lb-masthead-l">Vol. 1 · Sala №{gameId}</span>
          <span className="lb-masthead-c">Edición lobby · {dayCap}</span>
          <span className="lb-masthead-r">Sunhaven · {time}</span>
        </div>

        {/* Code banner */}
        <div className="lb-code-banner">
          <div>
            <span className="lb-code-label">Código de partida</span>
            <span className="lb-code-value">{gameId}</span>
            <p
              style={{
                margin: '6px 0 0',
                fontFamily: 'var(--font-text)',
                fontStyle: 'italic',
                fontSize: 13,
                color: 'var(--text-soft)',
              }}
            >
              {statusMsg || 'Compartí este código con tus jugadores.'}
            </p>
          </div>
          <Button
            variant={copied ? 'mostaza' : 'secondary'}
            leftIcon={copied ? Check : Copy}
            onClick={handleCopy}
            size="lg"
          >
            {copied ? 'Copiado' : 'Copiar link'}
          </Button>
        </div>

        {/* Hero */}
        <section className="lb-hero">
          <div className="lb-hero-text">
            <span className="lb-hero-kicker">Mesa preparada</span>
            <h2 className="lb-hero-title">
              Volvé a la <em>mesa</em>.
            </h2>
            <p className="lb-hero-lede">
              Compartí el código, esperá que se sumen tus jugadores y arrancá la
              partida cuando todos estén listos. La banca te observa.
            </p>
            <div className="lb-hero-cta">
              {isHost && (
                <Button
                  variant="primary"
                  size="lg"
                  leftIcon={Play}
                  onClick={handleStart}
                  disabled={!canStart}
                >
                  Empezar partida ({connectedCount}/{GAME_CONFIG.MAX_PLAYERS})
                </Button>
              )}
              <Button variant="secondary" size="lg" onClick={handleCopy} leftIcon={copied ? Check : Copy}>
                {copied ? 'Link copiado' : 'Compartir link'}
              </Button>
            </div>
          </div>
          <div className="lb-hero-fan" aria-hidden="true">
            {/* Reverso de cartas con el LOGO custom */}
            {[0, 1, 2, 3].map((i) => (
              <div key={i} className="lb-hero-fan-card">
                <div className="card-back card-sm">
                  <div className="card-back-frame">
                    <div className="card-back-center">
                      <img
                        src="/logo/yajuga-dominio-full.svg"
                        alt=""
                        aria-hidden="true"
                        className="card-back-logo"
                      />
                      <div className="card-back-deco" />
                      <span className="card-back-meta">Volumen Uno</span>
                    </div>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </section>

        {/* Personajes — usando los 6 ROLES REALES del juego */}
        <section className="lb-roles-block">
          <div className="lb-roles-head">
            <h3>Personajes · El sorteo decide quién sos</h3>
            <span className="lb-roles-head-meta">6 roles disponibles</span>
          </div>
          <div className="lb-roles-grid">
            {ALL_ROLE_IDS.map((roleId) => {
              const role = ROLE_DEFINITIONS[roleId];
              const isSelected = previewRole === roleId;
              return (
                <button
                  key={roleId}
                  type="button"
                  className="lb-role-thumb"
                  data-selected={isSelected || undefined}
                  style={{ ['--role-color' as string]: ROLE_COLORS[roleId] }}
                  onClick={() => setPreviewRole(isSelected ? null : roleId)}
                >
                  <span className="lb-role-thumb-rarity" aria-hidden="true" />
                  <div className="lb-role-thumb-portrait">
                    <span className="lb-role-thumb-portrait-glyph" aria-hidden="true">
                      {ROLE_GLYPH[roleId]}
                    </span>
                  </div>
                  <span className="lb-role-thumb-name">El {role.name}</span>
                  <span className="lb-role-thumb-tag">{ROLE_TAG[roleId]}</span>
                </button>
              );
            })}
          </div>
          {previewRole && (
            <div
              style={{
                padding: 'var(--s-4)',
                borderTop: '1.5px solid var(--rule)',
                background: 'var(--surface)',
                display: 'flex',
                flexDirection: 'column',
                gap: 'var(--s-2)',
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.20em',
                  textTransform: 'uppercase',
                  color: ROLE_COLORS[previewRole],
                }}
              >
                Habilidad pasiva — El {ROLE_DEFINITIONS[previewRole].name}
              </span>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-serif)',
                  fontStyle: 'italic',
                  fontSize: 'var(--fs-18)',
                  lineHeight: 1.3,
                  color: 'var(--text)',
                }}
              >
                {ROLE_DEFINITIONS[previewRole].description}
              </p>
              <p
                style={{
                  margin: 0,
                  fontFamily: 'var(--font-text)',
                  fontSize: 13,
                  color: 'var(--text-soft)',
                }}
              >
                {ROLE_DEFINITIONS[previewRole].passiveAbility}
              </p>
            </div>
          )}
        </section>

        {/* Quick info */}
        <div className="lb-quickplay">
          <article className="lb-mode" tabIndex={-1}>
            <span className="lb-mode-num">i</span>
            <span className="lb-mode-kicker">2–{GAME_CONFIG.MAX_PLAYERS} jugadores</span>
            <h3 className="lb-mode-title">Roles aleatorios</h3>
            <p className="lb-mode-desc">
              Cada jugador recibe un rol con habilidad pasiva y dos Expansiones de
              Dominio cargables.
            </p>
          </article>
          <article className="lb-mode" tabIndex={-1}>
            <span className="lb-mode-num">ii</span>
            <span className="lb-mode-kicker">objetivo</span>
            <h3 className="lb-mode-title">Tres sets completos</h3>
            <p className="lb-mode-desc">
              Gana quien primero termina el turno con tres sets cerrados — o
              dos + suelta si sos Coleccionista.
            </p>
          </article>
          <article className="lb-mode" tabIndex={-1}>
            <span className="lb-mode-num">iii</span>
            <span className="lb-mode-kicker">defensa</span>
            <h3 className="lb-mode-title">8 segundos para responder</h3>
            <p className="lb-mode-desc">
              Si te atacan, podés bloquear, negociar, contraatacar o aceptar.
              Si dudás, el ataque corre.
            </p>
          </article>
        </div>
      </main>

      {/* Derecha — feed editorial */}
      <aside className="lb-right">
        <div>
          <div className="lb-section-head">
            <span className="lb-section-h">Estado de la sesión</span>
          </div>
          <div
            className="ed-banner"
            data-tone={
              status === 'host' || status === 'client'
                ? 'success'
                : status === 'failed'
                  ? 'warning'
                  : 'info'
            }
            style={{ width: '100%', justifyContent: 'flex-start' }}
          >
            {status === 'host' || status === 'client' ? <Wifi size={12} /> : <WifiOff size={12} />}
            <span>{status}</span>
          </div>
          <p
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 13,
              color: 'var(--text-soft)',
              marginTop: 8,
              lineHeight: 1.45,
            }}
          >
            {statusMsg}
          </p>
        </div>

        <div className="lb-pull">
          «La épica viene del contraste — y del que aguanta una mano más.»
          <div className="lb-pull-attr">— Reglamento, página 12</div>
        </div>

        <div>
          <div className="lb-section-head">
            <span className="lb-section-h">Cómo arrancar</span>
          </div>
          <ol
            style={{
              listStyle: 'none',
              padding: 0,
              margin: 0,
              display: 'flex',
              flexDirection: 'column',
              gap: 'var(--s-2)',
              fontFamily: 'var(--font-text)',
              fontSize: 13,
              color: 'var(--text-soft)',
              lineHeight: 1.45,
            }}
          >
            {[
              'Compartí el código con tus jugadores.',
              'Esperá que se conecten y aparezcan en la lista.',
              'Cuando estén todos, presioná "Empezar partida".',
              'Cada uno recibe rol y Expansión al azar.',
            ].map((step, i) => (
              <li
                key={i}
                style={{ display: 'grid', gridTemplateColumns: '24px 1fr', gap: 8 }}
              >
                <span
                  style={{
                    fontFamily: 'var(--font-serif)',
                    fontStyle: 'italic',
                    color: 'var(--tomate)',
                    fontSize: 'var(--fs-18)',
                    lineHeight: 1,
                  }}
                >
                  {String(i + 1)}.
                </span>
                <span>{step}</span>
              </li>
            ))}
          </ol>
        </div>
      </aside>

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

function InvalidCode({ code, onBack }: { code: string; onBack: () => void }) {
  return (
    <main
      className="shell"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--s-6)',
      }}
    >
      <div
        className="ed-frame"
        style={{
          maxWidth: 480,
          width: '100%',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-4)',
          padding: 'var(--s-6)',
        }}
      >
        <Plug size={28} aria-hidden="true" />
        <h1 className="ed-section-title" style={{ fontSize: 'var(--fs-32)' }}>
          Código no <em>válido</em>
        </h1>
        <p style={{ fontFamily: 'var(--font-text)', color: 'var(--text-soft)', margin: 0 }}>
          El código <code>{code || '(vacío)'}</code> no tiene el formato esperado.
          Volvé al inicio y probá de nuevo.
        </p>
        <Button onClick={onBack}>Volver al inicio</Button>
      </div>
    </main>
  );
}
