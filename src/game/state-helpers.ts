import type {
  GameLogEntry,
  GameLogEntryType,
  GameState,
  Player,
} from '@/types/game';

/** Timestamp determinista basado en cuántas entradas hay en el log. */
export function ts(state: GameState): number {
  return state.log.length;
}

export function makeLog(
  state: GameState,
  type: GameLogEntryType,
  humanReadable: string,
  playerId?: string,
  data?: unknown,
): GameLogEntry {
  return { timestamp: ts(state), type, playerId, humanReadable, data };
}

export function appendLog(state: GameState, entry: GameLogEntry): GameState {
  return { ...state, log: [...state.log, entry] };
}

export function applyPlayerUpdate(state: GameState, updated: Player): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === updated.id ? updated : p)),
  };
}
