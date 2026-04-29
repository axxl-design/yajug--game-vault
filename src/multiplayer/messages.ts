import type { GameState, PlayerAction } from '@/types/game';
import type { LobbyPlayer } from '@/stores/lobbyStore';

/**
 * Tipos de mensajes que viajan por la conexión PeerJS. El host es la
 * fuente de verdad: peers le mandan PLAYER_ACTION; el host valida, computa
 * y broadcastea STATE_UPDATE a todos los peers.
 */

export type MultiplayerMessage =
  | { type: 'JOIN_REQUEST'; nickname: string; localPlayerId: string }
  | { type: 'JOIN_ACCEPTED'; assignedPlayerId: string; lobby: LobbyPlayer[]; gameState: GameState | null }
  | { type: 'JOIN_REJECTED'; reason: string }
  | { type: 'LOBBY_UPDATE'; lobby: LobbyPlayer[] }
  | { type: 'PLAYER_ACTION'; action: PlayerAction; playerId: string }
  | { type: 'STATE_UPDATE'; state: GameState }
  | { type: 'PLAYER_DISCONNECTED'; playerId: string }
  | { type: 'HOST_STARTED'; gameState: GameState }
  | { type: 'PING'; ts: number }
  | { type: 'PONG'; ts: number };

export const HEARTBEAT_INTERVAL_MS = 5000;
export const HEARTBEAT_TIMEOUT_MS = 10000;
export const PEER_RECONNECT_TIMEOUT_MS = 30000;
export const HOST_DISCONNECT_GRACE_MS = 60000;
