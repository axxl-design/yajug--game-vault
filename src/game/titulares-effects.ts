import type { Card, GameState } from '@/types/game';
import { addGlobalEffect, makeEffect } from './effects';
import { applyPlayerUpdate, appendLog, makeLog } from './state-helpers';

/**
 * Aplica el efecto de un Titular cuando se voltea. La duración estándar
 * es 1 ronda (= state.players.length turnos desde el actual). Para
 * efectos con cleanup, también se programa una expiración.
 */
export function applyTitularEffect(state: GameState, titular: Card): GameState {
  const expiresAtTurn = state.turnsPlayed + state.players.length;
  const key = titular.imageKey.replace('titular/', '');
  let s = state;

  switch (key) {
    case 'boom_inmobiliario':
      s = addGlobalEffect(
        s,
        makeEffect('rentas_modifier_plus_one', state.hostId, expiresAtTurn),
      );
      break;
    case 'recesion':
      s = addGlobalEffect(
        s,
        makeEffect('rentas_canceladas', state.hostId, expiresAtTurn),
      );
      break;
    case 'auditoria':
      s = addGlobalEffect(
        s,
        makeEffect('mano_publica', state.hostId, expiresAtTurn),
      );
      break;
    case 'especulacion_salvaje':
      s = addGlobalEffect(
        s,
        makeEffect('rentas_dobles', state.hostId, expiresAtTurn),
      );
      break;
    case 'crisis_bancaria': {
      // Cada jugador descarta 1M del banco (la primera carta de $1+, tomamos la menor).
      for (const p of s.players) {
        if (p.bank.length === 0) continue;
        const lowest = [...p.bank].sort((a, b) => a.value - b.value)[0];
        s = applyPlayerUpdate(s, {
          ...p,
          bank: p.bank.filter((c) => c.id !== lowest.id),
        });
        s = { ...s, discardPile: [...s.discardPile, lowest] };
      }
      break;
    }
    case 'reforma_urbana':
      s = addGlobalEffect(
        s,
        makeEffect('reforma_movible', state.hostId, expiresAtTurn),
      );
      break;
    case 'filtracion':
      // En hot-seat la "filtración" es trivial — todos ven todo. Solo log.
      s = appendLog(
        s,
        makeLog(s, 'titular_flipped', 'Filtración: cada jugador muestra 2 cartas (hot-seat: ya visibles).'),
      );
      break;
    case 'noche_de_gala':
      // Cada jugador roba 2 cartas extra. Lo modelamos como bonusDraws para que
      // se aplique al inicio de su próximo turno.
      s = {
        ...s,
        players: s.players.map((p) => ({ ...p, bonusDraws: p.bonusDraws + 2 })),
      };
      break;
    default:
      break;
  }
  return s;
}

/** Multiplicador de renta calculado a partir de efectos globales activos. */
export interface RentModifiers {
  add: number; // sumas (ej. +1 de Boom)
  multiply: number; // multiplicador (ej. x2 de Especulación)
  canceled: boolean; // true → no se cobra
}

export function getActiveRentModifiers(state: GameState): RentModifiers {
  let add = 0;
  let multiply = 1;
  let canceled = false;
  for (const p of state.players) {
    for (const e of p.effects) {
      if (e.type === 'rentas_canceladas') canceled = true;
      else if (e.type === 'rentas_modifier_plus_one') add += 1;
      else if (e.type === 'rentas_dobles') multiply *= 2;
    }
  }
  return { add, multiply, canceled };
}
