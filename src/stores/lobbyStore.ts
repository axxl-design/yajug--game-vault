import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import { GAME_CONFIG } from '@/game/constants';

/**
 * Estado pre-partida (sala): jugadores conectados, host, código.
 * Cuando el host arranca la partida, gameStore.initGame() consume
 * `players` para construir el `GameState` real. Después de eso, el
 * lobby puede resetearse o quedar como referencia hasta que termine
 * la partida.
 */

export interface LobbyPlayer {
  id: string;
  nickname: string;
  isHost: boolean;
  isConnected: boolean;
}

export interface InitLobbyOptions {
  gameId: string;
  localPlayerId: string;
  localNickname: string;
  isHost: boolean;
}

export interface LobbyStoreState {
  gameId: string | null;
  localPlayerId: string | null;
  players: LobbyPlayer[];

  /* Mutations */
  initLobby: (opts: InitLobbyOptions) => void;
  addPlayer: (player: LobbyPlayer) => void;
  removePlayer: (id: string) => void;
  setConnected: (id: string, isConnected: boolean) => void;
  setNickname: (id: string, nickname: string) => void;
  reset: () => void;
}

export const useLobbyStore = create<LobbyStoreState>()(
  immer((set) => ({
    gameId: null,
    localPlayerId: null,
    players: [],

    initLobby: ({ gameId, localPlayerId, localNickname, isHost }) =>
      set((draft) => {
        draft.gameId = gameId;
        draft.localPlayerId = localPlayerId;
        draft.players = [
          {
            id: localPlayerId,
            nickname: localNickname,
            isHost,
            isConnected: true,
          },
        ];
      }),

    addPlayer: (player) =>
      set((draft) => {
        if (draft.players.some((p) => p.id === player.id)) return;
        if (draft.players.length >= GAME_CONFIG.MAX_PLAYERS) return;
        draft.players.push(player);
      }),

    removePlayer: (id) =>
      set((draft) => {
        draft.players = draft.players.filter((p) => p.id !== id);
      }),

    setConnected: (id, isConnected) =>
      set((draft) => {
        const p = draft.players.find((x) => x.id === id);
        if (p) p.isConnected = isConnected;
      }),

    setNickname: (id, nickname) =>
      set((draft) => {
        const p = draft.players.find((x) => x.id === id);
        if (p) p.nickname = nickname;
      }),

    reset: () =>
      set((draft) => {
        draft.gameId = null;
        draft.localPlayerId = null;
        draft.players = [];
      }),
  })),
);

/* --------------------------- Selectors --------------------------- */

export const selectLobbyHost = (s: LobbyStoreState): LobbyPlayer | null =>
  s.players.find((p) => p.isHost) ?? null;

export const selectIsLocalHost = (s: LobbyStoreState): boolean => {
  const host = selectLobbyHost(s);
  return host !== null && host.id === s.localPlayerId;
};

export const selectConnectedCount = (s: LobbyStoreState): number =>
  s.players.filter((p) => p.isConnected).length;

export const selectCanStart = (s: LobbyStoreState): boolean => {
  const connected = selectConnectedCount(s);
  return (
    connected >= GAME_CONFIG.MIN_PLAYERS &&
    connected <= GAME_CONFIG.MAX_PLAYERS
  );
};
