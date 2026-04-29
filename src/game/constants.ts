import type { ActionCardName, CardColor } from '@/types/game';

export const GAME_CONFIG = {
  STARTING_HAND_SIZE: 5,
  CARDS_DRAWN_PER_TURN: 2,
  CARDS_DRAWN_IF_EMPTY_HAND: 5,
  MAX_HAND_SIZE: 7,
  MAX_PLAYS_PER_TURN: 3,
  SETS_NEEDED_TO_WIN: 3,
  COLECCIONISTA_SETS_NEEDED: 2, // + 1 propiedad suelta extra.
  DEFENSE_TIMEOUT_MS: 8000,
  MARKET_SIZE: 3,
  TITULAR_INTERVAL: 5,
  MAX_PLAYERS: 4,
  MIN_PLAYERS: 2,
  FACTURA_AMOUNT: 5,
  CUOTA_AMOUNT: 2,
  EDIFICIO_RENT_BONUS: 3,
  TORRE_RENT_BONUS: 4,
} as const;

/** Cuántas propiedades hacen falta para completar el set de cada color. */
export const PROPERTY_REQUIREMENTS: Record<CardColor, number> = {
  rojo: 3,
  naranja: 3,
  amarillo: 3,
  verde: 3,
  turquesa: 3,
  azul: 2,
  morado: 3,
  rosa: 3,
  marron: 2,
  gris: 4,
  comodin: 0,
};

/** Renta por cantidad de propiedades en el set. Index 0 = 1 propiedad. */
export const PROPERTY_RENT_VALUES: Record<CardColor, readonly number[]> = {
  rojo: [3, 6, 8],
  naranja: [1, 3, 5],
  amarillo: [2, 4, 6],
  verde: [2, 4, 7],
  turquesa: [1, 2, 3],
  azul: [3, 8],
  morado: [1, 2, 4],
  rosa: [1, 2, 3],
  marron: [1, 2],
  gris: [1, 2, 3, 4],
  comodin: [],
};

/** Valor monetario de una propiedad cuando se juega al banco.
 *  Calcado de Monopoly Deal canónico — documentado en DECISIONS.md. */
export const PROPERTY_VALUES: Record<CardColor, number> = {
  marron: 1,
  turquesa: 1,
  rosa: 2,
  naranja: 2,
  rojo: 3,
  amarillo: 3,
  verde: 4,
  azul: 4,
  morado: 2,
  gris: 2,
  comodin: 0,
};

/** Valor monetario de cada acción al jugarse al banco. */
export const ACTION_VALUES: Record<ActionCardName, number> = {
  bloqueo: 4,
  confiscacion: 5,
  trato_sucio: 3,
  trueque_forzado: 3,
  factura: 3,
  cuota: 2,
  movida_extra: 1,
  sobrecargo: 1,
  edificio: 3,
  torre: 4,
};

/** Cuántas copias de cada acción hay en el mazo (sec 8 brief). */
export const ACTION_COUNTS: Record<ActionCardName, number> = {
  bloqueo: 3,
  confiscacion: 2,
  trato_sucio: 3,
  trueque_forzado: 3,
  factura: 3,
  cuota: 3,
  movida_extra: 10,
  sobrecargo: 1,
  edificio: 5,
  torre: 5,
};

/** Denominaciones y cantidad de cartas de dinero. */
export const MONEY_DENOMINATIONS: ReadonlyArray<{ value: number; count: number }> = [
  { value: 1, count: 6 },
  { value: 2, count: 5 },
  { value: 3, count: 3 },
  { value: 4, count: 3 },
  { value: 5, count: 2 },
  { value: 10, count: 1 },
];

/**
 * Pares de comodines bicolor. 5 pares × 2 cartas = 10, más 1 universal = 11.
 * Elegidos para cubrir todos los 10 colores no-comodín una sola vez.
 */
export const WILDCARD_PAIRS: ReadonlyArray<readonly [CardColor, CardColor]> = [
  ['rojo', 'amarillo'],
  ['naranja', 'morado'],
  ['verde', 'turquesa'],
  ['azul', 'marron'],
  ['rosa', 'gris'],
];

/** Pares específicos para cartas de Renta (10 cards × 2-color cada una). */
export const RENT_PAIRS: ReadonlyArray<readonly [CardColor, CardColor]> = [
  ['rojo', 'amarillo'],
  ['naranja', 'morado'],
  ['verde', 'turquesa'],
  ['azul', 'marron'],
  ['rosa', 'gris'],
  ['rojo', 'naranja'],
  ['amarillo', 'verde'],
  ['turquesa', 'azul'],
  ['morado', 'rosa'],
  ['marron', 'gris'],
];

/** Cantidad de cartas multicolor de Renta. */
export const MULTICOLOR_RENT_COUNT = 3;

/** Valor monetario al banco de cada carta de Renta. */
export const RENT_PAIR_VALUE = 1;
export const RENT_MULTICOLOR_VALUE = 3;

/** Valor monetario al banco de los wildcards. Canon Monopoly Deal: $0. */
export const WILDCARD_PAIR_VALUE = 0;
export const WILDCARD_UNIVERSAL_VALUE = 0;

/** Precios del mercado por tipo de carta (sec 11 brief). */
export const MARKET_PRICES = {
  property: 2,
  action: 3,
  wildcard: 4,
  building: 4,
  rent: 3,
  money: 0, // Comprar dinero con dinero no tiene mucho sentido — fallback.
  event: 0,
} as const;
