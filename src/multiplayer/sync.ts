import type { Peer, DataConnection } from 'peerjs';
import {
  HEARTBEAT_INTERVAL_MS,
  HEARTBEAT_TIMEOUT_MS,
  type MultiplayerMessage,
} from './messages';
import { connectToHost, openPeer } from './peer';
import { useLobbyStore, type LobbyPlayer } from '@/stores/lobbyStore';
import { useGameStore } from '@/stores/gameStore';
import type { PlayerAction } from '@/types/game';

/**
 * Adaptador de red multijugador. Expone el state como una "sesión":
 *   - host: acepta conexiones, valida acciones, broadcastea STATE_UPDATE.
 *   - client: envía acciones al host, aplica STATE_UPDATE recibido.
 *
 * No es un store reactivo (sólo callbacks/emisiones). El estado del
 * lobby y de la partida vive en sus stores correspondientes.
 */

export type NetMode = 'host' | 'client';

interface BaseSession {
  mode: NetMode;
  peer: Peer;
  myId: string;
  myPlayerId: string;
  myNickname: string;
  close(): void;
  sendAction(action: PlayerAction): void;
}

interface HostSession extends BaseSession {
  mode: 'host';
  /** Conexiones activas indexadas por playerId (no por peerId). */
  connections: Map<string, DataConnection>;
}

interface ClientSession extends BaseSession {
  mode: 'client';
  hostConn: DataConnection;
}

export type Session = HostSession | ClientSession;

/* Singleton — una sesión por pestaña. */
let currentSession: Session | null = null;

export function getSession(): Session | null {
  return currentSession;
}

export function isOnline(): boolean {
  return currentSession !== null;
}

export async function startHostSession(opts: {
  gameId: string;
  localPlayerId: string;
  localNickname: string;
}): Promise<HostSession> {
  const { peer, myId } = await openPeer(opts.gameId);
  const connections = new Map<string, DataConnection>();
  const heartbeats = new Map<string, ReturnType<typeof setInterval>>();
  const lastPongs = new Map<string, number>();

  const session: HostSession = {
    mode: 'host',
    peer,
    myId,
    myPlayerId: opts.localPlayerId,
    myNickname: opts.localNickname,
    connections,
    sendAction(action) {
      // El host aplica directo en su gameStore (no se manda mensaje).
      useGameStore.getState().dispatch(opts.localPlayerId, action);
      broadcastStateUpdate();
    },
    close() {
      heartbeats.forEach((t) => clearInterval(t));
      connections.forEach((c) => c.close());
      peer.destroy();
      currentSession = null;
    },
  };

  function broadcastLobby() {
    const players = useLobbyStore.getState().players;
    sendToAll({ type: 'LOBBY_UPDATE', lobby: players });
  }

  function broadcastStateUpdate() {
    const gs = useGameStore.getState().gameState;
    if (!gs) return;
    sendToAll({ type: 'STATE_UPDATE', state: gs });
  }

  function sendToAll(msg: MultiplayerMessage) {
    connections.forEach((c) => {
      try {
        c.send(msg);
      } catch {
        /* swallow */
      }
    });
  }

  function dedupNickname(desired: string): string {
    const players = useLobbyStore.getState().players;
    const existing = new Set(players.map((p) => p.nickname.toLowerCase()));
    if (!existing.has(desired.toLowerCase())) return desired;
    let i = 2;
    while (existing.has(`${desired} (${i})`.toLowerCase())) i++;
    return `${desired} (${i})`;
  }

  peer.on('connection', (conn) => {
    let assignedPlayerId: string | null = null;

    conn.on('open', () => {
      // Setear heartbeat
      const interval = setInterval(() => {
        try {
          conn.send({ type: 'PING', ts: Date.now() } satisfies MultiplayerMessage);
        } catch {
          /* swallow */
        }
        const last = lastPongs.get(conn.peer) ?? Date.now();
        if (Date.now() - last > HEARTBEAT_TIMEOUT_MS && assignedPlayerId) {
          // Marcar como desconectado
          useLobbyStore.getState().setConnected(assignedPlayerId, false);
          broadcastLobby();
        }
      }, HEARTBEAT_INTERVAL_MS);
      heartbeats.set(conn.peer, interval);
    });

    conn.on('data', (raw) => {
      const msg = raw as MultiplayerMessage;
      switch (msg.type) {
        case 'JOIN_REQUEST': {
          const lobby = useLobbyStore.getState();
          const gs = useGameStore.getState().gameState;
          if (gs) {
            conn.send({
              type: 'JOIN_REJECTED',
              reason: 'La partida ya empezó.',
            } satisfies MultiplayerMessage);
            return;
          }
          if (lobby.players.length >= 4) {
            conn.send({
              type: 'JOIN_REJECTED',
              reason: 'La sala está llena.',
            } satisfies MultiplayerMessage);
            return;
          }
          const nick = dedupNickname(msg.nickname || 'Jugador');
          const player: LobbyPlayer = {
            id: msg.localPlayerId,
            nickname: nick,
            isHost: false,
            isConnected: true,
          };
          lobby.addPlayer(player);
          connections.set(msg.localPlayerId, conn);
          assignedPlayerId = msg.localPlayerId;
          conn.send({
            type: 'JOIN_ACCEPTED',
            assignedPlayerId: msg.localPlayerId,
            lobby: useLobbyStore.getState().players,
            gameState: useGameStore.getState().gameState,
          } satisfies MultiplayerMessage);
          broadcastLobby();
          return;
        }
        case 'PLAYER_ACTION': {
          // Validar y aplicar
          useGameStore.getState().dispatch(msg.playerId, msg.action);
          broadcastStateUpdate();
          return;
        }
        case 'PONG': {
          lastPongs.set(conn.peer, Date.now());
          return;
        }
        case 'PING': {
          // Algunos peers podrían pingearnos también
          conn.send({ type: 'PONG', ts: msg.ts } satisfies MultiplayerMessage);
          return;
        }
        default:
          /* ignore */
          return;
      }
    });

    conn.on('close', () => {
      const t = heartbeats.get(conn.peer);
      if (t) clearInterval(t);
      heartbeats.delete(conn.peer);
      if (assignedPlayerId) {
        connections.delete(assignedPlayerId);
        useLobbyStore.getState().setConnected(assignedPlayerId, false);
        broadcastLobby();
      }
    });

    conn.on('error', () => {
      /* swallow */
    });
  });

  // Suscribirse al gameStore: cuando el host cambia el estado (e.g. inicio
  // de partida vía LobbyScreen), broadcasteamos.
  const unsub = useGameStore.subscribe((state, prev) => {
    if (state.gameState !== prev.gameState && state.gameState) {
      sendToAll({ type: 'STATE_UPDATE', state: state.gameState });
    }
  });

  // Guardar unsub en close
  const origClose = session.close;
  session.close = () => {
    unsub();
    origClose();
  };

  currentSession = session;
  return session;
}

export async function startClientSession(opts: {
  gameId: string;
  localPlayerId: string;
  localNickname: string;
}): Promise<ClientSession> {
  const { peer, myId } = await openPeer(undefined, 8000);
  const hostConn = await connectToHost(peer, opts.gameId, 8000);
  const lastPongs: { last: number } = { last: Date.now() };
  let pingInterval: ReturnType<typeof setInterval> | null = null;

  const session: ClientSession = {
    mode: 'client',
    peer,
    myId,
    myPlayerId: opts.localPlayerId,
    myNickname: opts.localNickname,
    hostConn,
    sendAction(action) {
      try {
        hostConn.send({
          type: 'PLAYER_ACTION',
          action,
          playerId: opts.localPlayerId,
        } satisfies MultiplayerMessage);
      } catch {
        useGameStore.getState().clearError();
      }
    },
    close() {
      if (pingInterval) clearInterval(pingInterval);
      hostConn.close();
      peer.destroy();
      currentSession = null;
    },
  };

  hostConn.on('data', (raw) => {
    const msg = raw as MultiplayerMessage;
    switch (msg.type) {
      case 'JOIN_ACCEPTED': {
        // Sincronizar lobby completo
        const lobby = useLobbyStore.getState();
        lobby.reset();
        lobby.initLobby({
          gameId: opts.gameId,
          localPlayerId: opts.localPlayerId,
          localNickname: opts.localNickname,
          isHost: false,
        });
        // Reemplazar players con lo que mandó el host
        const p = useLobbyStore.getState().players;
        for (const sp of msg.lobby) {
          if (!p.some((x) => x.id === sp.id)) {
            useLobbyStore.getState().addPlayer(sp);
          }
        }
        if (msg.gameState) {
          useGameStore.getState().setGameState(msg.gameState);
        }
        return;
      }
      case 'JOIN_REJECTED': {
        useGameStore.getState().clearError();
        // Mostrar error vía gameStore.lastError (lo lee la UI)
        useGameStore.setState({ lastError: `Conexión rechazada: ${msg.reason}` });
        session.close();
        return;
      }
      case 'LOBBY_UPDATE': {
        // Reemplazar lista de jugadores manteniendo localPlayerId
        const lobby = useLobbyStore.getState();
        lobby.reset();
        lobby.initLobby({
          gameId: opts.gameId,
          localPlayerId: opts.localPlayerId,
          localNickname: opts.localNickname,
          isHost: false,
        });
        // Reemplazar
        useLobbyStore.setState({ players: msg.lobby });
        return;
      }
      case 'STATE_UPDATE': {
        useGameStore.getState().setGameState(msg.state);
        return;
      }
      case 'PING': {
        try {
          hostConn.send({ type: 'PONG', ts: msg.ts } satisfies MultiplayerMessage);
        } catch {
          /* swallow */
        }
        return;
      }
      case 'PONG': {
        lastPongs.last = Date.now();
        return;
      }
      default:
        return;
    }
  });

  hostConn.on('close', () => {
    useGameStore.setState({ lastError: 'El host se desconectó.' });
  });

  // JOIN
  hostConn.send({
    type: 'JOIN_REQUEST',
    nickname: opts.localNickname,
    localPlayerId: opts.localPlayerId,
  } satisfies MultiplayerMessage);

  // Heartbeat
  pingInterval = setInterval(() => {
    try {
      hostConn.send({ type: 'PING', ts: Date.now() } satisfies MultiplayerMessage);
    } catch {
      /* swallow */
    }
  }, HEARTBEAT_INTERVAL_MS);

  currentSession = session;
  return session;
}

/** Helper para LobbyScreen / GameScreen: dispatchea respetando el modo. */
export function dispatchAction(playerId: string, action: PlayerAction): void {
  const session = currentSession;
  if (!session) {
    // Hot-seat: aplicar local
    useGameStore.getState().dispatch(playerId, action);
    return;
  }
  if (session.mode === 'host') {
    useGameStore.getState().dispatch(playerId, action);
    // El subscribe al gameStore se encarga del broadcast.
    return;
  }
  // client: enviar al host
  session.sendAction(action);
}

export function closeSession(): void {
  currentSession?.close();
  currentSession = null;
}
