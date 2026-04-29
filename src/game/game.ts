import type {
  GameLogEntry,
  GamePreferences,
  GameState,
  Player,
  PlayerAction,
  RoleId,
  ExpansionId,
} from '@/types/game';
import { GAME_CONFIG } from './constants';
import { buildMainDeck, buildTitularDeck, shuffle, drawCards } from './deck';
import { ALL_ROLE_IDS, ROLE_DEFINITIONS } from './roles';
import type { Rng } from './rng';
import type { IdFactory } from './ids';
import { startTurn, endTurn } from './turn';
import {
  collectDebt,
  collectTribute,
  confiscate,
  discardFromHand,
  drawExtra,
  forceTrade,
  GameError,
  moveWildcard,
  playBuilding,
  playCardAsMoney,
  playPropertyToSet,
  playRent,
  playSobrecargo,
  playWildcardToSet,
  stealProperty,
} from './actions';
import { ts, makeLog } from './state-helpers';

export interface PlayerSeed {
  id: string;
  nickname: string;
}

export interface CreateGameOptions {
  gameId: string;
  hostId: string;
  playerSeeds: PlayerSeed[];
  rng: Rng;
  ids: IdFactory;
  prefs?: Partial<GamePreferences>;
}

export interface RoleAssignment {
  playerId: string;
  role: RoleId;
  expansion: ExpansionId;
}

const DEFAULT_PREFS: GamePreferences = {
  enableTitulares: true,
  enableSounds: true,
  enableAnimations: true,
};

/* ----------------------- Asignación de roles ----------------------- */

export function assignRolesAndExpansions(
  seeds: PlayerSeed[],
  rng: Rng,
): RoleAssignment[] {
  if (seeds.length < GAME_CONFIG.MIN_PLAYERS || seeds.length > GAME_CONFIG.MAX_PLAYERS) {
    throw new GameError(
      `Cantidad de jugadores fuera de rango: ${seeds.length} (min ${GAME_CONFIG.MIN_PLAYERS}, max ${GAME_CONFIG.MAX_PLAYERS}).`,
    );
  }
  const shuffledRoles = shuffle(ALL_ROLE_IDS, rng);
  return seeds.map((seed, i) => {
    const role = shuffledRoles[i];
    const expansions = ROLE_DEFINITIONS[role].expansions;
    const expansion = expansions[rng.int(2)];
    return { playerId: seed.id, role, expansion };
  });
}

/* ----------------------- Construcción del jugador -------------------- */

function buildPlayer(seed: PlayerSeed, role: RoleId, expansion: ExpansionId): Player {
  return {
    id: seed.id,
    nickname: seed.nickname,
    role,
    expansion,
    expansionCharge: 0,
    expansionUsed: false,
    passiveUsed: false,
    hand: [],
    bank: [],
    sets: [],
    hasFinishedTurn: false,
    isConnected: true,
    hasPlayedCardsThisTurn: 0,
    effects: [],
    lastRentInTurn: null,
    bankerDebt: 0,
    hasBoughtFromMarket: false,
    bonusDraws: 0,
  };
}

/* ----------------------- createInitialGameState --------------------- */

export function createInitialGameState(opts: CreateGameOptions): GameState {
  const { gameId, hostId, playerSeeds, rng, ids, prefs } = opts;

  if (!playerSeeds.some((s) => s.id === hostId)) {
    throw new GameError('hostId tiene que estar en playerSeeds.');
  }

  const assignments = assignRolesAndExpansions(playerSeeds, rng);
  const players: Player[] = playerSeeds.map((seed) => {
    const a = assignments.find((x) => x.playerId === seed.id)!;
    return buildPlayer(seed, a.role, a.expansion);
  });

  const mainDeckOrdered = buildMainDeck(ids);
  const deck = shuffle(mainDeckOrdered, rng);
  const titularDeck = shuffle(buildTitularDeck(ids), rng);

  const initialPrefs: GamePreferences = { ...DEFAULT_PREFS, ...(prefs ?? {}) };

  let state: GameState = {
    gameId,
    hostId,
    phase: 'playing',
    players,
    currentPlayerIndex: 0,
    turnsPlayed: 0,
    deck,
    discardPile: [],
    marketCards: [],
    marketDeck: [],
    titularDeck,
    activeTitular: null,
    pendingDefense: null,
    activeExpansion: null,
    tiempoExtraState: null,
    winner: null,
    log: [],
    prefs: initialPrefs,
  };

  // Repartir 5 cartas iniciales a cada jugador.
  for (const p of players) {
    state = drawCards(state, p.id, GAME_CONFIG.STARTING_HAND_SIZE, rng, ts(state));
  }

  // Tomar 3 cartas para el Mercado.
  const marketSize = Math.min(GAME_CONFIG.MARKET_SIZE, state.deck.length);
  state = {
    ...state,
    marketCards: state.deck.slice(0, marketSize),
    deck: state.deck.slice(marketSize),
  };

  const start: GameLogEntry = makeLog(
    state,
    'game_started',
    `Partida ${gameId} comenzó con ${players.length} jugadores.`,
    hostId,
    { players: players.map((p) => ({ id: p.id, role: p.role, expansion: p.expansion })) },
  );
  state = { ...state, log: [...state.log, start] };

  // Iniciar turno del primer jugador (no roba — primer turno).
  state = startTurn(state, rng);

  return state;
}

/* ----------------------------- applyAction --------------------------- */

export function applyAction(
  state: GameState,
  playerId: string,
  action: PlayerAction,
  rng: Rng,
): GameState {
  if (state.winner) return state; // ignorar acciones post-game-over.

  switch (action.type) {
    case 'PLAY_CARD_AS_MONEY':
      return playCardAsMoney(state, playerId, action.cardId);
    case 'PLAY_PROPERTY_TO_SET':
      return playPropertyToSet(state, playerId, action.cardId, action.setColor);
    case 'PLAY_WILDCARD_TO_SET':
      return playWildcardToSet(state, playerId, action.cardId, action.chosenColor);
    case 'MOVE_WILDCARD':
      return moveWildcard(state, playerId, action.cardId, action.toColor);
    case 'PLAY_RENT': {
      if (!action.targetPlayerId) {
        throw new GameError('PLAY_RENT requiere targetPlayerId.');
      }
      return playRent(
        state,
        playerId,
        action.rentCardId,
        action.targetSetColor,
        action.targetPlayerId,
      );
    }
    case 'PLAY_BUILDING':
      return playBuilding(state, playerId, action.buildingCardId, action.targetSetColor);
    case 'PLAY_SOBRECARGO':
      return playSobrecargo(state, playerId);
    case 'CONFISCATE':
      return confiscate(state, playerId, action.actionCardId, action.targetPlayerId, action.setColor);
    case 'STEAL_PROPERTY':
      return stealProperty(state, playerId, action.actionCardId, action.targetPlayerId, action.cardId);
    case 'FORCE_TRADE':
      return forceTrade(
        state,
        playerId,
        action.actionCardId,
        action.ownCardId,
        action.targetPlayerId,
        action.targetCardId,
      );
    case 'COLLECT_DEBT':
      return collectDebt(state, playerId, action.actionCardId, action.targetPlayerId);
    case 'COLLECT_TRIBUTE':
      return collectTribute(state, playerId, action.actionCardId);
    case 'DRAW_EXTRA':
      return drawExtra(state, playerId, action.actionCardId, rng);
    case 'DISCARD':
      return discardFromHand(state, playerId, action.cardIds);
    case 'END_TURN':
      return endTurn(state, rng);
    case 'BUY_FROM_MARKET': {
      const { buyFromMarket } = require('./market') as typeof import('./market');
      return buyFromMarket(state, playerId, action.cardId, rng);
    }
    case 'RESOLVE_DEFENSE': {
      const { resolveDefense } = require('./defense') as typeof import('./defense');
      return resolveDefense(state, action.choice, rng);
    }
    case 'ACTIVATE_EXPANSION': {
      const { activateExpansion } = require('./expansion-effects') as typeof import('./expansion-effects');
      return activateExpansion(state, playerId, action.payload, rng);
    }
    default: {
      const _never: never = action;
      throw new GameError(`Acción desconocida: ${JSON.stringify(_never)}`);
    }
  }
}

/* --------------------------- Re-exports ---------------------------- */
export { GameError };
