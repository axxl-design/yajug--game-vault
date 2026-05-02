/**
 * Capa de sincronización multijugador. El transporte (socket.io) es un detalle
 * encapsulado en `socket.ts`. Esta capa expone la API pública usada por la UI:
 *   - `startHostSession` / `startClientSession` para abrir una sesión.
 *   - `dispatchAction(playerId, action)` que decide local vs red.
 *   - `getSession()` / `isOnline()` / `closeSession()`.
 *
 * Topología:
 *   - Host: source of truth. Suscribe a gameStore y lobbyStore; cuando cambian,
 *     emite state-update / lobby-update vía socket. El servidor retransmite a
 *     todos los clients de la sala.
 *   - Client: recibe lobby-update / state-update y los aplica a sus stores.
 *     Para acciones, emite player-action al servidor que las reenvía al host.
 */

import { type LobbyPlayer, useLobbyStore } from '@/stores/lobbyStore';
import { useGameStore } from '@/stores/gameStore';
import type { GameState, PlayerAction } from '@/types/game';
import { joinRoom, openSocket, type Socket } from './socket';

const MAX_PLAYERS_HOST_LOBBY = 4;

export type NetMode = 'host' | 'client';

interface BaseSession {
  mode: NetMode;
  socket: Socket;
  myPlayerId: string;
  myNickname: string;
  close(): void;
  sendAction(action: PlayerAction): void;
}

export interface HostSession extends BaseSession {
  mode: 'host';
}

export interface ClientSession extends BaseSession {
  mode: 'client';
}

export type Session = HostSession | ClientSession;

/* Singleton — una sesión por pestaña. */
let currentSession: Session | null = null;

/**
 * Listener global que cierra el socket cuando se cierra la pestaña /
 * navegador. Se registra una vez al primer abrir-session y se queda hasta
 * que el contexto JS muere. Dentro del SPA, el socket sobrevive a
 * navegaciones internas y a re-renders — sólo muere acá o en handleExit.
 */
let beforeUnloadInstalled = false;
function installBeforeUnloadGuard() {
  if (beforeUnloadInstalled || typeof window === 'undefined') return;
  beforeUnloadInstalled = true;
  window.addEventListener('beforeunload', () => {
    currentSession?.close();
  });
}

export function getSession(): Session | null {
  return currentSession;
}

export function isOnline(): boolean {
  return currentSession !== null;
}

/* ─────────────────────── Helpers ─────────────────────── */

function dedupNickname(desired: string): string {
  const players = useLobbyStore.getState().players;
  const existing = new Set(players.map((p) => p.nickname.toLowerCase()));
  if (!existing.has(desired.toLowerCase())) return desired;
  let i = 2;
  while (existing.has(`${desired} (${i})`.toLowerCase())) i++;
  return `${desired} (${i})`;
}

/* ─────────────────────── Host session ─────────────────────── */

export async function startHostSession(opts: {
  gameId: string;
  localPlayerId: string;
  localNickname: string;
}): Promise<HostSession> {
  installBeforeUnloadGuard();
  // Idempotencia: si ya hay una host session activa para este mismo
  // playerId, la reusamos en lugar de abrir un socket nuevo. Esto previene
  // que llamadas repetidas (StrictMode dev, race conditions, refactors)
  // destruyan una conexión sana y causen "host se desconectó" en clients.
  if (
    currentSession &&
    currentSession.mode === 'host' &&
    currentSession.myPlayerId === opts.localPlayerId &&
    currentSession.socket.connected
  ) {
    // eslint-disable-next-line no-console
    console.info('[sync host] reusing existing host session', { playerId: opts.localPlayerId });
    return currentSession;
  }
  // Si hay una session de un jugador distinto (rara), la cerramos antes.
  if (currentSession && currentSession.myPlayerId !== opts.localPlayerId) {
    // eslint-disable-next-line no-console
    console.info('[sync host] closing stale session before opening new');
    currentSession.close();
  }
  // eslint-disable-next-line no-console
  console.info('[sync host] starting', opts);
  const socket = openSocket();

  const ack = await joinRoom(socket, {
    gameId: opts.gameId,
    playerId: opts.localPlayerId,
    nickname: opts.localNickname,
    isHost: true,
  });

  if (!ack.ok) {
    socket.disconnect();
    // 'host-exists' se traduce a 'unavailable-id' para mantener el contrato
    // que LobbyScreen ya conoce (fallback automático a startClientSession).
    throw new Error(ack.code === 'host-exists' ? 'unavailable-id' : ack.code);
  }

  // eslint-disable-next-line no-console
  console.info('[sync host] joined room', { peers: ack.peers.length });

  // Si ya había clientes en la sala (caso raro: host se cae y vuelve, o llegó
  // tarde), agregalos al lobbyStore del host.
  for (const remote of ack.peers) {
    const lobby = useLobbyStore.getState();
    if (lobby.players.some((p) => p.id === remote.playerId)) continue;
    if (lobby.players.length >= MAX_PLAYERS_HOST_LOBBY) break;
    lobby.addPlayer({
      id: remote.playerId,
      nickname: remote.nickname,
      isHost: false,
      isConnected: true,
    });
  }

  const session: HostSession = {
    mode: 'host',
    socket,
    myPlayerId: opts.localPlayerId,
    myNickname: opts.localNickname,
    sendAction(action) {
      // El host aplica directo en su gameStore; el subscribe broadcastea.
      useGameStore.getState().dispatch(opts.localPlayerId, action);
    },
    close() {
      // eslint-disable-next-line no-console
      console.info('[sync host] closing');
      unsubLobby();
      unsubGame();
      socket.disconnect();
      currentSession = null;
    },
  };

  /* ── Listeners ── */

  socket.on('peer-joined', (msg: { playerId: string; nickname: string; isHost: boolean }) => {
    // eslint-disable-next-line no-console
    console.info('[sync host] peer-joined', msg);
    if (msg.isHost) return;
    const lobby = useLobbyStore.getState();
    if (lobby.players.some((p) => p.id === msg.playerId)) {
      lobby.setConnected(msg.playerId, true);
      return;
    }
    if (lobby.players.length >= MAX_PLAYERS_HOST_LOBBY) {
      // eslint-disable-next-line no-console
      console.warn('[sync host] peer-joined ignored: lobby full');
      return;
    }
    const nick = dedupNickname(msg.nickname || 'Jugador');
    lobby.addPlayer({ id: msg.playerId, nickname: nick, isHost: false, isConnected: true });
  });

  socket.on('peer-disconnected', (msg: { playerId: string }) => {
    // eslint-disable-next-line no-console
    console.info('[sync host] peer-disconnected', msg);
    useLobbyStore.getState().setConnected(msg.playerId, false);
  });

  socket.on('player-action', (msg: { action: PlayerAction; playerId: string }) => {
    // eslint-disable-next-line no-console
    console.info('[sync host] player-action', { from: msg.playerId, type: msg.action.type });
    useGameStore.getState().dispatch(msg.playerId, msg.action);
    // El subscribe a gameStore se encarga del broadcast state-update.
  });

  socket.on('disconnect', (reason: string) => {
    // eslint-disable-next-line no-console
    console.warn('[sync host] socket disconnected', { reason });
  });

  /* ── Subscribes (host = source of truth) ── */

  // Cualquier cambio al lobby del host se broadcastea a los clients.
  const unsubLobby = useLobbyStore.subscribe((state, prev) => {
    if (state.players === prev.players) return;
    // eslint-disable-next-line no-console
    console.info('[sync host] lobby changed → emit lobby-update', { count: state.players.length });
    socket.emit('lobby-update', { players: state.players });
  });

  // Cuando el host cambia el GameState (initGame, dispatch, etc.), broadcast.
  const unsubGame = useGameStore.subscribe((state, prev) => {
    if (state.gameState !== prev.gameState && state.gameState) {
      // eslint-disable-next-line no-console
      console.info('[sync host] gameState changed → emit state-update', {
        phase: state.gameState.phase,
      });
      socket.emit('state-update', { state: state.gameState });
    }
  });

  // Empujamos un primer lobby-update inmediato para que cualquier client que
  // haya entrado entre `peer-joined` y la asignación del subscribe reciba la
  // foto actual del host.
  socket.emit('lobby-update', { players: useLobbyStore.getState().players });

  currentSession = session;
  return session;
}

/* ─────────────────────── Client session ─────────────────────── */

export async function startClientSession(opts: {
  gameId: string;
  localPlayerId: string;
  localNickname: string;
}): Promise<ClientSession> {
  installBeforeUnloadGuard();
  // Idempotencia: si ya hay una client session activa para este mismo
  // playerId, la reusamos. Mismo razonamiento que startHostSession.
  if (
    currentSession &&
    currentSession.mode === 'client' &&
    currentSession.myPlayerId === opts.localPlayerId &&
    currentSession.socket.connected
  ) {
    // eslint-disable-next-line no-console
    console.info('[sync client] reusing existing client session', { playerId: opts.localPlayerId });
    return currentSession;
  }
  if (currentSession && currentSession.myPlayerId !== opts.localPlayerId) {
    // eslint-disable-next-line no-console
    console.info('[sync client] closing stale session before opening new');
    currentSession.close();
  }
  // eslint-disable-next-line no-console
  console.info('[sync client] starting', opts);
  const socket = openSocket();

  const ack = await joinRoom(socket, {
    gameId: opts.gameId,
    playerId: opts.localPlayerId,
    nickname: opts.localNickname,
    isHost: false,
  });

  if (!ack.ok) {
    socket.disconnect();
    // Mapeo de códigos a strings que LobbyScreen ya entiende.
    const message =
      ack.code === 'unknown' ? 'connect-timeout' : ack.code === 'room-full' ? 'room-full' : ack.code;
    throw new Error(message);
  }

  // eslint-disable-next-line no-console
  console.info('[sync client] joined room', { peers: ack.peers.length, hostPlayerId: ack.hostPlayerId });

  // Seed lobbyStore con lo que sabemos del servidor (yo + peers actuales).
  // Eventualmente el host nos va a mandar lobby-update con la foto canónica.
  const lobby = useLobbyStore.getState();
  lobby.reset();
  lobby.initLobby({
    gameId: opts.gameId,
    localPlayerId: opts.localPlayerId,
    localNickname: opts.localNickname,
    isHost: false,
  });
  for (const remote of ack.peers) {
    if (lobby.players.some((p) => p.id === remote.playerId)) continue;
    if (lobby.players.length >= MAX_PLAYERS_HOST_LOBBY) break;
    useLobbyStore.getState().addPlayer({
      id: remote.playerId,
      nickname: remote.nickname,
      isHost: remote.isHost,
      isConnected: true,
    });
  }

  const session: ClientSession = {
    mode: 'client',
    socket,
    myPlayerId: opts.localPlayerId,
    myNickname: opts.localNickname,
    sendAction(action) {
      // eslint-disable-next-line no-console
      console.info('[sync client] emit player-action', { type: action.type });
      socket.emit('player-action', { action, playerId: opts.localPlayerId });
    },
    close() {
      // eslint-disable-next-line no-console
      console.info('[sync client] closing');
      socket.disconnect();
      currentSession = null;
    },
  };

  /* ── Listeners ── */

  socket.on('lobby-update', (msg: { players: LobbyPlayer[] }) => {
    // eslint-disable-next-line no-console
    console.info('[sync client] lobby-update', { count: msg.players.length });
    useLobbyStore.setState({ players: msg.players });
  });

  socket.on('state-update', (msg: { state: GameState }) => {
    // eslint-disable-next-line no-console
    console.info('[sync client] state-update', {
      phase: msg.state.phase,
      players: msg.state.players.map((p) => p.id),
    });
    useGameStore.getState().setGameState(msg.state);
  });

  socket.on('start-game', () => {
    // eslint-disable-next-line no-console
    console.info('[sync client] start-game received');
    // El gameState llega vía state-update; este evento es informativo.
  });

  socket.on('host-disconnected', () => {
    // eslint-disable-next-line no-console
    console.warn('[sync client] host disconnected');
    useGameStore.setState({ lastError: 'El host se desconectó.' });
  });

  socket.on('disconnect', (reason: string) => {
    // eslint-disable-next-line no-console
    console.warn('[sync client] socket disconnected', { reason });
  });

  currentSession = session;
  return session;
}

/* ─────────────────────── Public dispatch ─────────────────────── */

/**
 * Helper para LobbyScreen / GameScreen: dispatchea respetando el modo.
 *   - Sin sesión (hot-seat): aplica local.
 *   - Host: aplica local; el subscribe broadcastea state-update.
 *   - Client: emite player-action al servidor para que llegue al host.
 */
export function dispatchAction(playerId: string, action: PlayerAction): void {
  const session = currentSession;
  if (!session) {
    useGameStore.getState().dispatch(playerId, action);
    return;
  }
  if (session.mode === 'host') {
    useGameStore.getState().dispatch(playerId, action);
    return;
  }
  session.sendAction(action);
}

export function closeSession(): void {
  currentSession?.close();
  currentSession = null;
}
