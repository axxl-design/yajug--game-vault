/**
 * Registro en memoria de salas multijugador. El servidor es un relay puro:
 * mantiene la membresía (qué socket es host, qué socket pertenece a qué
 * gameId), pero NO la lógica de juego ni la lista rica de jugadores
 * (eso vive en el lobbyStore del host del frontend, que se sincroniza
 * vía mensajes `lobby-update`).
 */

export const MAX_PLAYERS_PER_ROOM = 4;

export interface RoomPeer {
  socketId: string;
  playerId: string;
  nickname: string;
  isHost: boolean;
}

export interface Room {
  gameId: string;
  hostSocketId: string | null;
  /** Indexed by socketId, no por playerId — un socket = un peer activo. */
  peers: Map<string, RoomPeer>;
  createdAt: number;
}

export class RoomRegistry {
  private rooms = new Map<string, Room>();

  getOrCreate(gameId: string): Room {
    let r = this.rooms.get(gameId);
    if (!r) {
      r = { gameId, hostSocketId: null, peers: new Map(), createdAt: Date.now() };
      this.rooms.set(gameId, r);
    }
    return r;
  }

  get(gameId: string): Room | undefined {
    return this.rooms.get(gameId);
  }

  delete(gameId: string): void {
    this.rooms.delete(gameId);
  }

  /** Encuentra la (única) Room en la que está un socket. */
  findRoomBySocket(socketId: string): { room: Room; peer: RoomPeer } | null {
    for (const room of this.rooms.values()) {
      const peer = room.peers.get(socketId);
      if (peer) return { room, peer };
    }
    return null;
  }

  size(): number {
    return this.rooms.size;
  }

  /** Snapshot serializable para health-check / debugging. */
  snapshot(): Array<{ gameId: string; peerCount: number; hasHost: boolean; ageMs: number }> {
    const now = Date.now();
    return [...this.rooms.values()].map((r) => ({
      gameId: r.gameId,
      peerCount: r.peers.size,
      hasHost: r.hostSocketId !== null,
      ageMs: now - r.createdAt,
    }));
  }
}

export function peerSnapshot(room: Room): Array<{
  playerId: string;
  nickname: string;
  isHost: boolean;
}> {
  return [...room.peers.values()].map((p) => ({
    playerId: p.playerId,
    nickname: p.nickname,
    isHost: p.isHost,
  }));
}

export function getHostPlayerId(room: Room): string | null {
  if (!room.hostSocketId) return null;
  const peer = room.peers.get(room.hostSocketId);
  return peer?.playerId ?? null;
}
