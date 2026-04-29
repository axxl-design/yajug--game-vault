import type {
  Card,
  GameState,
  Player,
  PropertySet,
  RoleId,
} from '@/types/game';
import { createIdFactory, type IdFactory } from './ids';
import { mulberry32 } from './rng';

export interface TestPlayerSpec {
  id: string;
  role?: RoleId;
  hand?: Card[];
  bank?: Card[];
  sets?: PropertySet[];
  hasPlayedCardsThisTurn?: number;
  isConnected?: boolean;
}

/**
 * Construye un GameState minimalista para tests. No respeta la coherencia
 * total del juego (deck vacío, sin titulares, etc.) — la idea es testear
 * funciones puras con state lo más chico posible.
 */
export function buildTestState(opts: {
  players: TestPlayerSpec[];
  currentPlayerIndex?: number;
  deck?: Card[];
  discardPile?: Card[];
  turnsPlayed?: number;
  enableTitulares?: boolean;
}): GameState {
  const players: Player[] = opts.players.map((p) => ({
    id: p.id,
    nickname: p.id,
    role: p.role ?? 'abogado',
    expansion: 'tribunal_dominio',
    expansionCharge: 0,
    expansionUsed: false,
    passiveUsed: false,
    hand: p.hand ?? [],
    bank: p.bank ?? [],
    sets: p.sets ?? [],
    hasFinishedTurn: false,
    isConnected: p.isConnected ?? true,
    hasPlayedCardsThisTurn: p.hasPlayedCardsThisTurn ?? 0,
    effects: [],
    lastRentInTurn: null,
    bankerDebt: 0,
    hasBoughtFromMarket: false,
    bonusDraws: 0,
  }));
  return {
    gameId: 'test',
    hostId: players[0].id,
    phase: 'playing',
    players,
    currentPlayerIndex: opts.currentPlayerIndex ?? 0,
    turnsPlayed: opts.turnsPlayed ?? 0,
    deck: opts.deck ?? [],
    discardPile: opts.discardPile ?? [],
    marketCards: [],
    marketDeck: [],
    titularDeck: [],
    activeTitular: null,
    pendingDefense: null,
    activeExpansion: null,
    tiempoExtraState: null,
    winner: null,
    log: [],
    prefs: {
      enableTitulares: opts.enableTitulares ?? false,
      enableSounds: false,
      enableAnimations: false,
    },
  };
}

export function makeSet(
  color: PropertySet['color'],
  properties: Card[],
  requiredCount: number,
  buildings: Card[] = [],
): PropertySet {
  return {
    color,
    properties,
    buildings,
    requiredCount,
    isComplete: properties.length >= requiredCount,
    isMonument: false,
  };
}

export function newIds(): IdFactory {
  return createIdFactory();
}

export const seededRng = (seed = 1) => mulberry32(seed);

/**
 * Helper para tests: si un ataque deja `pendingDefense`, auto-acepta para
 * que el test pueda assertear el estado post-ataque.
 */
import { resolveDefense } from './defense';
export function autoAcceptDefenses(s: GameState, rng = seededRng()): GameState {
  let cur = s;
  while (cur.pendingDefense) {
    cur = resolveDefense(cur, { type: 'accept' }, rng);
  }
  return cur;
}
