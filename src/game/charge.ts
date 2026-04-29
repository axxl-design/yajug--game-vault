import type { ChargeRule, GameState } from '@/types/game';
import { ROLE_CHARGE_RULES } from './roles';
import { applyPlayerUpdate, appendLog, makeLog } from './state-helpers';

/**
 * Avanza el medidor de Expansión de un jugador si su rol matchea el trigger.
 * No hace nada si la Expansión ya se usó o si ya está en 100%.
 */
export function chargeRoleMeter(
  state: GameState,
  playerId: string,
  trigger: ChargeRule['trigger'],
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) return state;
  if (player.expansionUsed) return state;
  const rule = ROLE_CHARGE_RULES[player.role];
  if (!rule || rule.trigger !== trigger) return state;
  if (player.expansionCharge >= 100) return state;

  const newCharge = Math.min(100, player.expansionCharge + rule.amount);
  const reachedFull = newCharge >= 100 && player.expansionCharge < 100;
  let s = applyPlayerUpdate(state, { ...player, expansionCharge: newCharge });
  s = appendLog(
    s,
    makeLog(s, 'expansion_charged', `${playerId} cargó medidor a ${newCharge}%.`, playerId, {
      newCharge,
      trigger,
      reachedFull,
    }),
  );
  return s;
}

/** Carga a TODOS los jugadores cuando el trigger es global (e.g. card_discarded). */
export function chargeAllByTrigger(
  state: GameState,
  trigger: ChargeRule['trigger'],
): GameState {
  let s = state;
  for (const p of state.players) {
    s = chargeRoleMeter(s, p.id, trigger);
  }
  return s;
}
