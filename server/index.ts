/**
 * YAJUGÁ : DOMINIO — relay WebSocket
 *
 * Reemplaza la capa P2P PeerJS anterior. Modelo:
 *   - Un Socket.IO server expone "rooms" indexadas por gameId.
 *   - El primer cliente que envía join-room con isHost=true se queda con el
 *     slot de host. Los siguientes son clients regulares.
 *   - El servidor NO procesa lógica de juego — sólo retransmite mensajes
 *     entre el host y los clients.
 *   - El host sigue siendo source of truth del GameState. Los clients le
 *     mandan `player-action` y reciben `state-update`.
 */

import http from 'http';
import express from 'express';
import cors from 'cors';
import { Server, type Socket } from 'socket.io';
import {
  MAX_PLAYERS_PER_ROOM,
  RoomRegistry,
  getHostPlayerId,
  peerSnapshot,
  type Room,
  type RoomPeer,
} from './rooms.js';

interface JoinPayload {
  gameId: string;
  playerId: string;
  nickname: string;
  isHost: boolean;
}

type JoinAck =
  | {
      ok: true;
      peers: Array<{ playerId: string; nickname: string; isHost: boolean }>;
      hostPlayerId: string | null;
    }
  | {
      ok: false;
      code: 'host-exists' | 'room-full' | 'invalid';
      reason: string;
    };

interface ClientToServerEvents {
  'join-room': (payload: JoinPayload, ack: (res: JoinAck) => void) => void;
  'lobby-update': (payload: { players: unknown[] }) => void;
  'state-update': (payload: { state: unknown }) => void;
  'start-game': () => void;
  'player-action': (payload: { action: unknown; playerId: string }) => void;
}

interface ServerToClientEvents {
  'lobby-update': (payload: { players: unknown[] }) => void;
  'state-update': (payload: { state: unknown }) => void;
  'start-game': () => void;
  'player-action': (payload: { action: unknown; playerId: string }) => void;
  'peer-joined': (payload: { playerId: string; nickname: string; isHost: boolean }) => void;
  'peer-disconnected': (payload: { playerId: string }) => void;
  'host-disconnected': () => void;
}

interface SocketData {
  gameId?: string;
  playerId?: string;
}

type AppSocket = Socket<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>;

/* ─────────────────────── Setup ─────────────────────── */

const allowedOrigins = (process.env.CORS_ORIGINS ?? 'http://localhost:5173,http://localhost:4173')
  .split(',')
  .map((s) => s.trim())
  .filter(Boolean);

const app = express();
app.use(cors({ origin: allowedOrigins }));

const registry = new RoomRegistry();

app.get('/', (_req, res) => {
  res.json({ ok: true, name: 'yajuga-server', rooms: registry.size() });
});

app.get('/health', (_req, res) => {
  res.json({ ok: true, rooms: registry.snapshot() });
});

const httpServer = http.createServer(app);

const io = new Server<ClientToServerEvents, ServerToClientEvents, Record<string, never>, SocketData>(
  httpServer,
  {
    cors: { origin: allowedOrigins, methods: ['GET', 'POST'] },
  },
);

/* ─────────────────────── Helpers ─────────────────────── */

function roomFromSocket(socket: AppSocket): Room | null {
  const gameId = socket.data?.gameId;
  if (typeof gameId !== 'string') return null;
  return registry.get(gameId) ?? null;
}

function logEvent(scope: string, msg: string, data?: unknown) {
  // eslint-disable-next-line no-console
  console.log(`[${scope}] ${msg}`, data ?? '');
}

/* ─────────────────────── Handlers ─────────────────────── */

io.on('connection', (socket) => {
  logEvent('socket', 'connected', { id: socket.id });

  socket.on('join-room', (payload, ack) => {
    const { gameId, playerId, nickname, isHost } = payload ?? ({} as JoinPayload);
    if (!gameId || !playerId || !nickname || typeof isHost !== 'boolean') {
      ack?.({ ok: false, code: 'invalid', reason: 'Faltan campos requeridos en join-room.' });
      return;
    }

    const room = registry.getOrCreate(gameId);

    if (isHost && room.hostSocketId !== null && room.hostSocketId !== socket.id) {
      ack?.({ ok: false, code: 'host-exists', reason: 'La sala ya tiene un anfitrión.' });
      return;
    }

    if (room.peers.size >= MAX_PLAYERS_PER_ROOM && !room.peers.has(socket.id)) {
      ack?.({ ok: false, code: 'room-full', reason: 'La sala está llena.' });
      return;
    }

    const peer: RoomPeer = { socketId: socket.id, playerId, nickname, isHost };
    room.peers.set(socket.id, peer);
    if (isHost) room.hostSocketId = socket.id;

    socket.join(gameId);
    socket.data.gameId = gameId;
    socket.data.playerId = playerId;

    logEvent('join-room', `${gameId} ← ${playerId} (${nickname}, isHost=${isHost})`, {
      peers: room.peers.size,
    });

    ack?.({
      ok: true,
      peers: peerSnapshot(room).filter((p) => p.playerId !== playerId),
      hostPlayerId: getHostPlayerId(room),
    });

    // Notificar al host que un client entró (para que lo agregue al lobbyStore).
    if (!isHost && room.hostSocketId && room.hostSocketId !== socket.id) {
      io.to(room.hostSocketId).emit('peer-joined', { playerId, nickname, isHost: false });
    }
  });

  socket.on('lobby-update', (payload) => {
    const room = roomFromSocket(socket);
    if (!room || room.hostSocketId !== socket.id) {
      logEvent('lobby-update', 'rejected (not host)', { socketId: socket.id });
      return;
    }
    socket.to(room.gameId).emit('lobby-update', payload);
  });

  socket.on('state-update', (payload) => {
    const room = roomFromSocket(socket);
    if (!room || room.hostSocketId !== socket.id) {
      logEvent('state-update', 'rejected (not host)', { socketId: socket.id });
      return;
    }
    socket.to(room.gameId).emit('state-update', payload);
  });

  socket.on('start-game', () => {
    const room = roomFromSocket(socket);
    if (!room || room.hostSocketId !== socket.id) {
      logEvent('start-game', 'rejected (not host)', { socketId: socket.id });
      return;
    }
    socket.to(room.gameId).emit('start-game');
  });

  socket.on('player-action', (payload) => {
    const room = roomFromSocket(socket);
    if (!room || !room.hostSocketId) return;
    if (room.hostSocketId === socket.id) return; // host no se manda acciones a sí mismo
    io.to(room.hostSocketId).emit('player-action', payload);
  });

  socket.on('disconnect', (reason) => {
    const found = registry.findRoomBySocket(socket.id);
    if (!found) {
      logEvent('disconnect', 'orphan socket', { id: socket.id, reason });
      return;
    }
    const { room, peer } = found;
    room.peers.delete(socket.id);
    logEvent('disconnect', `${peer.playerId} from ${room.gameId}`, { reason });

    const wasHost = room.hostSocketId === socket.id;
    if (wasHost) room.hostSocketId = null;

    if (room.peers.size === 0) {
      registry.delete(room.gameId);
      logEvent('room', `destroyed (empty): ${room.gameId}`);
      return;
    }

    if (wasHost) {
      io.to(room.gameId).emit('host-disconnected');
    } else if (room.hostSocketId) {
      io.to(room.hostSocketId).emit('peer-disconnected', { playerId: peer.playerId });
    }
  });
});

const port = Number(process.env.PORT ?? 3001);
httpServer.listen(port, () => {
  logEvent('server', `listening on :${port}`, { allowedOrigins });
});
