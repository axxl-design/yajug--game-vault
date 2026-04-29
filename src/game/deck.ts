import type { Card, GameState, GameLogEntry } from '@/types/game';
import type { IdFactory } from './ids';
import { defaultRng, type Rng } from './rng';
import {
  ACTION_COUNTS,
  MONEY_DENOMINATIONS,
  MULTICOLOR_RENT_COUNT,
  PROPERTY_REQUIREMENTS,
  RENT_PAIRS,
  WILDCARD_PAIRS,
} from './constants';
import {
  createActionCard,
  createMoneyCard,
  createPropertyCard,
  createRentCard,
  createTitularCard,
  createWildcardCard,
} from './cards';
import { TITULAR_DEFINITIONS } from './titulares';
import type { ActionCardName, CardColor } from '@/types/game';

/* ----------------------------- Shuffle ----------------------------- */

export function shuffle<T>(arr: ReadonlyArray<T>, rng: Rng = defaultRng): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = rng.int(i + 1);
    const tmp = a[i];
    a[i] = a[j];
    a[j] = tmp;
  }
  return a;
}

/* --------------------------- Deck builders ------------------------- */

export function buildMainDeck(ids: IdFactory): Card[] {
  const deck: Card[] = [];

  // Propiedades — 29 cartas (sum of PROPERTY_REQUIREMENTS sin comodín).
  const propColors = Object.keys(PROPERTY_REQUIREMENTS) as CardColor[];
  for (const color of propColors) {
    if (color === 'comodin') continue;
    const count = PROPERTY_REQUIREMENTS[color];
    for (let i = 0; i < count; i++) {
      deck.push(createPropertyCard(color, ids, String.fromCharCode(65 + i)));
    }
  }

  // Comodines — 5 pares × 2 + 1 universal = 11 cartas.
  for (const pair of WILDCARD_PAIRS) {
    deck.push(createWildcardCard([...pair], ids));
    deck.push(createWildcardCard([...pair], ids));
  }
  deck.push(createWildcardCard([], ids));

  // Dinero — 20 cartas.
  for (const { value, count } of MONEY_DENOMINATIONS) {
    for (let i = 0; i < count; i++) {
      deck.push(createMoneyCard(value, ids));
    }
  }

  // Rentas — 3 multicolor + 10 por par = 13 cartas.
  for (let i = 0; i < MULTICOLOR_RENT_COUNT; i++) {
    deck.push(createRentCard([], ids));
  }
  for (const pair of RENT_PAIRS) {
    deck.push(createRentCard([...pair], ids));
  }

  // Acciones (excluyendo edificio/torre que se agregan abajo) — 28 cartas.
  const actionNames = Object.keys(ACTION_COUNTS) as ActionCardName[];
  for (const name of actionNames) {
    if (name === 'edificio' || name === 'torre') continue;
    const count = ACTION_COUNTS[name];
    for (let i = 0; i < count; i++) {
      deck.push(createActionCard(name, ids));
    }
  }

  // Edificio + Torre — 5 + 5 = 10 cartas.
  for (let i = 0; i < ACTION_COUNTS.edificio; i++) {
    deck.push(createActionCard('edificio', ids));
  }
  for (let i = 0; i < ACTION_COUNTS.torre; i++) {
    deck.push(createActionCard('torre', ids));
  }

  return deck;
}

export function buildTitularDeck(ids: IdFactory): Card[] {
  return TITULAR_DEFINITIONS.map((t) =>
    createTitularCard(t.key, t.name, t.description, ids),
  );
}

/* --------------------------- Draw / reshuffle ---------------------- */

/**
 * Reshuffle: si el deck queda vacío, mezcla todo el descarte excepto la
 * última carta (sec 22 brief). Retorna el nuevo state. Idempotente si ya
 * hay cartas en el deck.
 */
export function ensureDeckHasCards(
  state: GameState,
  rng: Rng,
  timestamp: number,
): GameState {
  if (state.deck.length > 0) return state;
  if (state.discardPile.length <= 1) return state; // nada que reshufflear

  const last = state.discardPile[state.discardPile.length - 1];
  const rest = state.discardPile.slice(0, -1);
  const newDeck = shuffle(rest, rng);
  const log: GameLogEntry = {
    timestamp,
    type: 'deck_reshuffled',
    humanReadable: `Mazo reshuffleado desde el descarte (${rest.length} cartas).`,
  };
  return {
    ...state,
    deck: newDeck,
    discardPile: [last],
    log: [...state.log, log],
  };
}

/**
 * Roba `count` cartas para el jugador `playerId`. Si el deck se queda
 * corto, intenta reshufflear y robar el resto. Si después del reshuffle
 * sigue sin haber cartas, roba lo que pueda (sec 22).
 */
export function drawCards(
  state: GameState,
  playerId: string,
  count: number,
  rng: Rng,
  timestamp: number,
): GameState {
  let s = state;
  let drawn: Card[] = [];

  while (drawn.length < count) {
    if (s.deck.length === 0) {
      s = ensureDeckHasCards(s, rng, timestamp);
      if (s.deck.length === 0) break; // no hay forma de robar más
    }
    const taken = s.deck[0];
    s = { ...s, deck: s.deck.slice(1) };
    drawn.push(taken);
  }

  if (drawn.length === 0) return s;

  const players = s.players.map((p) =>
    p.id === playerId ? { ...p, hand: [...p.hand, ...drawn] } : p,
  );
  const log: GameLogEntry = {
    timestamp,
    type: 'card_drawn',
    playerId,
    data: { count: drawn.length },
    humanReadable: `${playerId} robó ${drawn.length} carta(s).`,
  };
  return { ...s, players, log: [...s.log, log] };
}

/** Agrega cartas al descarte (en orden recibido). */
export function discardCardsToPile(state: GameState, cards: Card[]): GameState {
  if (cards.length === 0) return state;
  return { ...state, discardPile: [...state.discardPile, ...cards] };
}
