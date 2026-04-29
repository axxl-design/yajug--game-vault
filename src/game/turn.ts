import type { GameState, Player } from '@/types/game';
import { GAME_CONFIG } from './constants';
import { drawCards, discardCardsToPile } from './deck';
import type { Rng } from './rng';
import { discardFromHand } from './actions';
import { GameError } from './errors';
import { appendLog, applyPlayerUpdate, makeLog, ts } from './state-helpers';
import { computeDefaultDiscard } from './discard-policy';
import { advanceTiempoExtra } from './tiempo-extra';
import { expireEffects } from './effects';

/**
 * Inicio de turno (sec 7 brief):
 * 1. Si no es el primer turno del jugador, robar 2 cartas (5 si la mano
 *    está vacía).
 * 2. Si turnsPlayed > 0 && turnsPlayed % 5 === 0 y hay Titulares: voltear
 *    la siguiente carta de Titular. Phase 4 sólo la stashea en activeTitular;
 *    los efectos los aplica Fase 8.
 * 3. Reset de contadores del turno.
 */
export function startTurn(state: GameState, rng: Rng): GameState {
  const player = state.players[state.currentPlayerIndex];
  if (!player) throw new GameError('No hay jugador en el index actual.');

  // Reset contadores del nuevo turno antes de cualquier draw / titular.
  let s = applyPlayerUpdate(state, {
    ...player,
    hasPlayedCardsThisTurn: 0,
    lastRentInTurn: null,
    hasFinishedTurn: false,
  });

  // Drawing
  const isFirstTurnForPlayer = state.turnsPlayed < state.players.length;
  if (!isFirstTurnForPlayer) {
    const cardsToDraw =
      player.hand.length === 0
        ? GAME_CONFIG.CARDS_DRAWN_IF_EMPTY_HAND
        : GAME_CONFIG.CARDS_DRAWN_PER_TURN;
    s = drawCards(s, player.id, cardsToDraw, rng, ts(s));
  }

  // Titular flip — solo cuando enableTitulares está on, no en t=0, múltiplo de 5.
  if (
    s.prefs.enableTitulares &&
    s.turnsPlayed > 0 &&
    s.turnsPlayed % GAME_CONFIG.TITULAR_INTERVAL === 0 &&
    s.titularDeck.length > 0
  ) {
    // Si había un Titular activo, su efecto expiró hace una ronda — al descarte.
    const prevActive = s.activeTitular;
    const [titular, ...rest] = s.titularDeck;
    s = { ...s, titularDeck: rest, activeTitular: titular };
    if (prevActive) {
      s = discardCardsToPile(s, [prevActive]);
    }
    s = appendLog(
      s,
      makeLog(s, 'turn_started', `Titular ${titular.name} aparece (efecto en Fase 8).`, player.id, {
        titular: titular.name,
      }),
    );
  }

  s = appendLog(
    s,
    makeLog(s, 'turn_started', `Turno de ${player.id} comenzó.`, player.id, {
      turnsPlayed: s.turnsPlayed,
    }),
  );
  return s;
}

/**
 * Fin de turno: forzar descarte si hand > 7, advance index, increment
 * turnsPlayed. Si la `lastRentInTurn` quedó pendiente, se descarta.
 *
 * Si winner ya está seteado, no avanza (juego terminado).
 */
export function endTurn(state: GameState, rng: Rng): GameState {
  if (state.winner) return state;

  const player = state.players[state.currentPlayerIndex];
  if (!player) throw new GameError('No hay jugador en el index actual.');

  let s = state;

  // Forced discard — si hand > 7, descartar lowest-value primero.
  if (player.hand.length > GAME_CONFIG.MAX_HAND_SIZE) {
    const toDiscardIds = computeDefaultDiscard(
      player,
      player.hand.length - GAME_CONFIG.MAX_HAND_SIZE,
    );
    s = discardFromHand(s, player.id, toDiscardIds);
  }

  // Marcar fin de turno y avanzar
  const playerNow = s.players[s.currentPlayerIndex];
  s = applyPlayerUpdate(s, { ...playerNow, hasFinishedTurn: true });

  s = appendLog(
    s,
    makeLog(s, 'turn_ended', `${player.id} terminó su turno.`, player.id),
  );

  // Expirar efectos antes de avanzar
  s = expireEffects(s, s.turnsPlayed);

  const nextIndex = (s.currentPlayerIndex + 1) % s.players.length;
  s = {
    ...s,
    currentPlayerIndex: nextIndex,
    turnsPlayed: s.turnsPlayed + 1,
  };

  // Si estamos en Tiempo Extra, avanzar el contador.
  if (s.phase === 'tiempo_extra') {
    s = advanceTiempoExtra(s);
    if (s.winner) return s;
  }

  // Iniciar el turno del siguiente jugador automáticamente.
  s = startTurn(s, rng);
  return s;
}

/** Devuelve los IDs de jugadores conectados, en orden de turno. */
export function connectedPlayers(state: GameState): Player[] {
  return state.players.filter((p) => p.isConnected);
}
