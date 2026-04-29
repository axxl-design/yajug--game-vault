import type {
  ActiveEffect,
  ActiveEffectType,
  GameState,
  Player,
} from '@/types/game';

/** Helpers de manipulación de ActiveEffect (globales y per-player). */

let counter = 0;
function nextEffectId(): string {
  return `eff-${++counter}`;
}

export function makeEffect(
  type: ActiveEffectType,
  sourcePlayerId: string,
  expiresAtTurn: number,
  data?: unknown,
): ActiveEffect {
  return {
    id: nextEffectId(),
    type,
    sourcePlayerId,
    expiresAtTurn,
    durationRounds: expiresAtTurn === -1 ? -1 : 1,
    data,
  };
}

/** Lee efectos globales: los que viven en `players[0].effects` por convención
 * con `sourcePlayerId === '__global__'`, pero acá iteramos sobre todos por simpleza. */
export function findGlobalEffect(
  state: GameState,
  type: ActiveEffectType,
): ActiveEffect | null {
  for (const p of state.players) {
    for (const e of p.effects) {
      if (e.type === type) return e;
    }
  }
  return null;
}

export function hasEffect(player: Player, type: ActiveEffectType): boolean {
  return player.effects.some((e) => e.type === type);
}

export function findEffectOn(player: Player, type: ActiveEffectType): ActiveEffect | null {
  return player.effects.find((e) => e.type === type) ?? null;
}

export function addEffectToPlayer(
  state: GameState,
  playerId: string,
  effect: ActiveEffect,
): GameState {
  return {
    ...state,
    players: state.players.map((p) =>
      p.id === playerId ? { ...p, effects: [...p.effects, effect] } : p,
    ),
  };
}

/** Atajo: agrega un efecto global montándolo en el host (todos lo ven). */
export function addGlobalEffect(state: GameState, effect: ActiveEffect): GameState {
  return addEffectToPlayer(state, state.hostId, effect);
}

export function removeEffect(state: GameState, effectId: string): GameState {
  return {
    ...state,
    players: state.players.map((p) => ({
      ...p,
      effects: p.effects.filter((e) => e.id !== effectId),
    })),
  };
}

/** Llamado al fin de cada turno: expira efectos cuya expiresAtTurn <= turnsPlayed. */
export function expireEffects(state: GameState, currentTurn: number): GameState {
  let s = state;
  for (const p of s.players) {
    for (const e of p.effects) {
      if (e.expiresAtTurn !== -1 && e.expiresAtTurn <= currentTurn) {
        s = removeEffect(s, e.id);
      }
    }
  }
  return s;
}
