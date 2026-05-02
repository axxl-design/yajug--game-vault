/**
 * Capa de transporte WebSocket. Reemplaza al `peer.ts` (PeerJS) anterior.
 *
 * Razón del cambio: P2P WebRTC vía PeerJS demostró ser inestable en NAT
 * traversal y firewalls. Un servidor centralizado (`/server`) que retransmite
 * mensajes es radicalmente más confiable. Toda la lógica de juego sigue
 * viviendo en el host del frontend; el servidor es un dumb relay.
 *
 * Variable de entorno: `VITE_WS_URL` apunta al servidor. Default
 * `http://localhost:3001` para dev local.
 */

import { io, type Socket } from 'socket.io-client';

const WS_URL = (import.meta.env.VITE_WS_URL as string | undefined) || 'http://localhost:3001';

export interface JoinPayload {
  gameId: string;
  playerId: string;
  nickname: string;
  isHost: boolean;
}

export interface JoinAckOk {
  ok: true;
  peers: Array<{ playerId: string; nickname: string; isHost: boolean }>;
  hostPlayerId: string | null;
}

export interface JoinAckError {
  ok: false;
  code: 'host-exists' | 'room-full' | 'invalid' | 'unknown';
  reason: string;
}

export type JoinAck = JoinAckOk | JoinAckError;

/**
 * Abre una conexión socket.io al servidor de relay. Reintentos automáticos
 * habilitados (5 intentos) para tolerar reconexiones puntuales sin romper
 * la sesión.
 */
export function openSocket(): Socket {
  // eslint-disable-next-line no-console
  console.info('[socket] connecting to', WS_URL);
  return io(WS_URL, {
    transports: ['websocket', 'polling'],
    reconnection: true,
    reconnectionAttempts: 5,
    reconnectionDelay: 500,
    timeout: 8000,
  });
}

/**
 * Emite `join-room` y espera el ack del servidor. Si el servidor no responde
 * en `timeoutMs` ms, resuelve con `code: 'unknown'`. Nunca rechaza — la UI
 * es la que decide qué hacer con el resultado.
 */
export function joinRoom(socket: Socket, payload: JoinPayload, timeoutMs = 8000): Promise<JoinAck> {
  return new Promise((resolve) => {
    let settled = false;
    const t = setTimeout(() => {
      if (settled) return;
      settled = true;
      // eslint-disable-next-line no-console
      console.warn('[socket] join-room timeout', { gameId: payload.gameId });
      resolve({ ok: false, code: 'unknown', reason: 'Tiempo de espera agotado.' });
    }, timeoutMs);

    socket.emit('join-room', payload, (ack: JoinAck) => {
      if (settled) return;
      settled = true;
      clearTimeout(t);
      // eslint-disable-next-line no-console
      console.info('[socket] join-room ack', ack);
      resolve(ack);
    });
  });
}

export type { Socket };
