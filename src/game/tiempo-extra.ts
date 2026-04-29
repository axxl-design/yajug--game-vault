import type { GameState, Player } from '@/types/game';
import { checkVictoryCondition } from './rules';
import { appendLog, makeLog } from './state-helpers';

/**
 * Lógica de Tiempo Extra:
 *  - Cuando un jugador alcanza la condición de victoria, en lugar de declarar
 *    `winner` directo, entramos a `phase = 'tiempo_extra'`.
 *  - Cada otro jugador (en orden de turno) recibe 1 turno completo.
 *  - Si en algún momento la condición deja de cumplirse → cancelamos Tiempo
 *    Extra y volvemos a 'playing'.
 *  - Si todos los demás terminan su turno y la condición sigue → declaramos
 *    `winner`.
 */

export function startTiempoExtra(state: GameState, triggerPlayerId: string): GameState {
  const others = state.players
    .filter((p) => p.id !== triggerPlayerId && p.isConnected)
    .map((p) => p.id);
  let s: GameState = {
    ...state,
    phase: 'tiempo_extra',
    tiempoExtraState: {
      triggeringPlayerId: triggerPlayerId,
      remainingPlayers: others,
      turnsRemaining: others.length,
    },
  };
  s = appendLog(
    s,
    makeLog(
      s,
      'tiempo_extra_started',
      `TIEMPO EXTRA: ${triggerPlayerId} está a punto de ganar.`,
      triggerPlayerId,
      { remaining: others.length },
    ),
  );
  return s;
}

/** Llamado cuando un jugador termina su turno durante Tiempo Extra. */
export function advanceTiempoExtra(state: GameState): GameState {
  if (state.phase !== 'tiempo_extra' || !state.tiempoExtraState) return state;
  const triggerPlayer = state.players.find((p) => p.id === state.tiempoExtraState!.triggeringPlayerId);
  if (!triggerPlayer) return state;

  // Si el trigger ya no cumple condición → cancelar.
  if (!checkVictoryCondition(triggerPlayer)) {
    let s: GameState = {
      ...state,
      phase: 'playing',
      tiempoExtraState: null,
    };
    s = appendLog(
      s,
      makeLog(s, 'tiempo_extra_canceled', `${triggerPlayer.id} ya no cumple la condición — Tiempo Extra cancelado.`),
    );
    return s;
  }

  const tie = state.tiempoExtraState;
  const remaining = tie.remainingPlayers.slice(1);

  if (remaining.length === 0) {
    // Todos jugaron, trigger gana.
    let s: GameState = {
      ...state,
      phase: 'game_over',
      winner: triggerPlayer.id,
      tiempoExtraState: null,
    };
    s = appendLog(
      s,
      makeLog(s, 'tiempo_extra_ended', `Tiempo Extra terminó: ${triggerPlayer.id} gana.`, triggerPlayer.id),
    );
    s = appendLog(s, makeLog(s, 'game_won', `${triggerPlayer.id} ganó la partida.`, triggerPlayer.id));
    return s;
  }

  return {
    ...state,
    tiempoExtraState: {
      ...tie,
      remainingPlayers: remaining,
      turnsRemaining: remaining.length,
    },
  };
}

/** Cards que pueden romper sets — para highlighting visual en UI. */
export function cardsThatCanBreakSet(player: Player): string[] {
  // Confiscación, Trato Sucio, Trueque Forzado pueden afectar sets.
  return player.hand
    .filter((c) =>
      c.actionName === 'confiscacion' ||
      c.actionName === 'trato_sucio' ||
      c.actionName === 'trueque_forzado',
    )
    .map((c) => c.id);
}
