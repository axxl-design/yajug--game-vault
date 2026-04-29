import type { GameState, Player } from '@/types/game';
import { applyPlayerUpdate, appendLog, makeLog } from './state-helpers';
import type { IdFactory } from './ids';
import { createMoneyCard } from './cards';

/**
 * Pasivas activas desde el inicio de partida (Phase 9):
 *  - Banquero: +2M iniciales (carta de $2 sintética en banco).
 *  - Coleccionista: condición de victoria especial → ya está en checkVictoryCondition.
 *  - Abogado: 1 bloqueo gratis sin carta → controlado por player.passiveUsed.
 *  - Corredor: +1M en rentas → aplicado en rentModifier.
 *  - Estafador: 1 mentira sobre la mano → meta-mecánica multijugador, simplificada
 *    en hot-seat: no implementada (solo log al inicio).
 *  - Arquitecto: combinar 2 sets cortos como 1 → ambigua, deferida a balance posterior.
 *
 * Las pasivas que NO requieren input ni decisión se aplican al construir el state
 * inicial. Las que requieren decisión (Abogado bloqueo gratis) se gatean cuando
 * el jugador actúa.
 */
export function applyStartingPassives(
  state: GameState,
  ids: IdFactory,
): GameState {
  let s = state;
  for (const p of state.players) {
    if (p.role === 'banquero') {
      const bonus = createMoneyCard(2, ids);
      const updated: Player = { ...p, bank: [...p.bank, bonus] };
      s = applyPlayerUpdate(s, updated);
      s = appendLog(
        s,
        makeLog(
          s,
          'role_passive_applied',
          `${p.id} (Banquero) recibe +$2M iniciales.`,
          p.id,
        ),
      );
    } else if (p.role === 'estafador' || p.role === 'arquitecto') {
      s = appendLog(
        s,
        makeLog(
          s,
          'role_passive_applied',
          `${p.id} (${p.role}) tiene su pasiva (UI multijugador / balance posterior).`,
          p.id,
        ),
      );
    }
  }
  return s;
}

/** Bonus de renta del Corredor (+1M) cuando él cobra. */
export function corredorRentBonus(player: Player): number {
  return player.role === 'corredor' ? 1 : 0;
}

/** Si el Abogado puede bloquear sin carta de Bloqueo (1 vez por partida). */
export function canAbogadoFreeBlock(player: Player): boolean {
  return player.role === 'abogado' && !player.passiveUsed;
}
