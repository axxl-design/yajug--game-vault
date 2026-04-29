import { beforeEach, describe, expect, test } from 'vitest';
import {
  selectCurrentPlayer,
  selectIsMyTurn,
  selectPhase,
  selectPlayerById,
  selectWinner,
  useGameStore,
} from './gameStore';
import { mulberry32 } from '@/game/rng';
import { createIdFactory } from '@/game/ids';
import {
  isAction,
  isBuilding,
  isProperty,
  isRent,
  isWildcard,
  wildcardAcceptsColor,
} from '@/game/cards';
import { GAME_CONFIG } from '@/game/constants';
import type { GameState, PlayerAction } from '@/types/game';

const seeds2 = [
  { id: 'p1', nickname: 'Alice' },
  { id: 'p2', nickname: 'Bob' },
];

const seeds4 = [
  { id: 'p1', nickname: 'A' },
  { id: 'p2', nickname: 'B' },
  { id: 'p3', nickname: 'C' },
  { id: 'p4', nickname: 'D' },
];

function init(seed = 1, seeds = seeds4) {
  useGameStore.getState().reset();
  useGameStore.getState().initGame({
    gameId: 'g',
    hostId: seeds[0].id,
    playerSeeds: seeds,
    rng: mulberry32(seed),
    ids: createIdFactory(),
  });
}

beforeEach(() => {
  useGameStore.getState().reset();
});

describe('gameStore — init / lifecycle', () => {
  test('estado inicial es null', () => {
    expect(useGameStore.getState().gameState).toBeNull();
    expect(useGameStore.getState().lastError).toBeNull();
  });

  test('initGame setea gameState con la composición correcta', () => {
    init(1);
    const s = useGameStore.getState().gameState!;
    expect(s).not.toBeNull();
    expect(s.players.length).toBe(4);
    expect(s.phase).toBe('playing');
    s.players.forEach((p) => {
      expect(p.hand.length).toBe(GAME_CONFIG.STARTING_HAND_SIZE);
    });
  });

  test('reset limpia gameState y error', () => {
    init(1);
    useGameStore.getState().reset();
    expect(useGameStore.getState().gameState).toBeNull();
    expect(useGameStore.getState().lastError).toBeNull();
  });

  test('setGameState reemplaza el estado entero', () => {
    init(1);
    const before = useGameStore.getState().gameState!;
    const fake: GameState = { ...before, gameId: 'replaced' };
    useGameStore.getState().setGameState(fake);
    expect(useGameStore.getState().gameState?.gameId).toBe('replaced');
  });

  test('clearError limpia lastError', () => {
    init(1);
    // Forzar error
    useGameStore.getState().playCardAsMoney('p1', 'inexistente');
    expect(useGameStore.getState().lastError).not.toBeNull();
    useGameStore.getState().clearError();
    expect(useGameStore.getState().lastError).toBeNull();
  });
});

describe('gameStore — error handling', () => {
  test('acción sobre estado nulo registra lastError sin throw', () => {
    expect(() => useGameStore.getState().playCardAsMoney('p1', 'c1')).not.toThrow();
    expect(useGameStore.getState().lastError).toBe('No hay partida en curso.');
  });

  test('acción inválida registra lastError sin mutar gameState', () => {
    init(1);
    const before = useGameStore.getState().gameState;
    useGameStore.getState().playCardAsMoney('p1', 'no-existe');
    expect(useGameStore.getState().lastError).toBeTruthy();
    expect(useGameStore.getState().gameState).toBe(before); // misma referencia
  });

  test('acción válida limpia lastError previo', () => {
    init(1);
    useGameStore.getState().playCardAsMoney('p1', 'no-existe'); // error
    expect(useGameStore.getState().lastError).not.toBeNull();
    const card = useGameStore.getState().gameState!.players[0].hand[0];
    useGameStore.getState().playCardAsMoney('p1', card.id);
    expect(useGameStore.getState().lastError).toBeNull();
  });
});

describe('gameStore — convenience methods', () => {
  test('playCardAsMoney delega correctamente', () => {
    init(1);
    const card = useGameStore.getState().gameState!.players[0].hand[0];
    useGameStore.getState().playCardAsMoney('p1', card.id);
    const after = useGameStore.getState().gameState!;
    expect(after.players[0].bank.some((c) => c.id === card.id)).toBe(true);
    expect(after.players[0].hasPlayedCardsThisTurn).toBe(1);
  });

  test('endTurn avanza el currentPlayerIndex', () => {
    init(1);
    expect(useGameStore.getState().gameState!.currentPlayerIndex).toBe(0);
    useGameStore.getState().endTurn('p1');
    expect(useGameStore.getState().gameState!.currentPlayerIndex).toBe(1);
  });

  test('discard remueve cartas de la mano', () => {
    init(1);
    const cards = useGameStore.getState().gameState!.players[0].hand.slice(0, 2);
    useGameStore.getState().discard('p1', cards.map((c) => c.id));
    const after = useGameStore.getState().gameState!.players[0];
    expect(after.hand.length).toBe(GAME_CONFIG.STARTING_HAND_SIZE - 2);
  });
});

describe('gameStore — dispatch genérico', () => {
  test('dispatch acepta PlayerAction tipada', () => {
    init(1);
    const card = useGameStore.getState().gameState!.players[0].hand[0];
    useGameStore.getState().dispatch('p1', { type: 'PLAY_CARD_AS_MONEY', cardId: card.id });
    expect(useGameStore.getState().gameState!.players[0].bank.length).toBe(1);
  });
});

describe('gameStore — selectors', () => {
  test('selectCurrentPlayer / selectIsMyTurn', () => {
    init(1);
    const state = useGameStore.getState();
    expect(selectCurrentPlayer(state)?.id).toBe('p1');
    expect(selectIsMyTurn('p1')(state)).toBe(true);
    expect(selectIsMyTurn('p2')(state)).toBe(false);
  });

  test('selectPlayerById retorna el player o null', () => {
    init(1);
    const state = useGameStore.getState();
    expect(selectPlayerById('p2')(state)?.id).toBe('p2');
    expect(selectPlayerById('inexistente')(state)).toBeNull();
  });

  test('selectPhase y selectWinner', () => {
    init(1);
    const state = useGameStore.getState();
    expect(selectPhase(state)).toBe('playing');
    expect(selectWinner(state)).toBeNull();
  });

  test('selectores devuelven null cuando no hay partida', () => {
    const state = useGameStore.getState();
    expect(selectCurrentPlayer(state)).toBeNull();
    expect(selectPhase(state)).toBeNull();
    expect(selectWinner(state)).toBeNull();
  });
});

describe('gameStore — simulación a través del store', () => {
  function nextLegalAction(state: GameState): PlayerAction {
    const player = state.players[state.currentPlayerIndex];
    const remaining = GAME_CONFIG.MAX_PLAYS_PER_TURN - player.hasPlayedCardsThisTurn;
    if (remaining <= 0) return { type: 'END_TURN' };
    const others = state.players.filter((p) => p.id !== player.id && p.isConnected);

    for (const c of player.hand) {
      if (c.actionName === 'confiscacion') {
        for (const o of others) {
          const ts = o.sets.find((s) => s.isComplete);
          if (ts) return { type: 'CONFISCATE', actionCardId: c.id, targetPlayerId: o.id, setColor: ts.color };
        }
      }
    }
    for (const c of player.hand) {
      if (c.actionName === 'trato_sucio') {
        for (const o of others) {
          for (const s of o.sets) {
            if (!s.isComplete && s.properties.length > 0) {
              return { type: 'STEAL_PROPERTY', actionCardId: c.id, targetPlayerId: o.id, cardId: s.properties[0].id };
            }
          }
        }
      }
    }
    for (const c of player.hand) {
      if (isProperty(c) && c.color) return { type: 'PLAY_PROPERTY_TO_SET', cardId: c.id, setColor: c.color };
    }
    for (const c of player.hand) {
      if (isWildcard(c)) {
        const colors = c.colors && c.colors.length > 0 ? c.colors : (['rojo', 'amarillo', 'verde', 'azul'] as const);
        for (const col of colors) {
          if (wildcardAcceptsColor(c, col)) return { type: 'PLAY_WILDCARD_TO_SET', cardId: c.id, chosenColor: col };
        }
      }
    }
    for (const c of player.hand) {
      if (isRent(c) && (c.colors ?? []).length > 0) {
        for (const col of c.colors!) {
          const set = player.sets.find((s) => s.color === col && s.properties.length > 0);
          if (set && others.length > 0) {
            return { type: 'PLAY_RENT', rentCardId: c.id, targetSetColor: col, targetPlayerId: others[0].id };
          }
        }
      }
    }
    for (const c of player.hand) {
      if (isBuilding(c) && c.actionName === 'edificio') {
        const cs = player.sets.find((s) => s.isComplete);
        if (cs) return { type: 'PLAY_BUILDING', buildingCardId: c.id, targetSetColor: cs.color };
      }
    }
    for (const c of player.hand) {
      if (isAction(c) && c.actionName === 'movida_extra' && state.deck.length > 0) {
        return { type: 'DRAW_EXTRA', actionCardId: c.id };
      }
    }
    if (player.hand.length > 0) return { type: 'PLAY_CARD_AS_MONEY', cardId: player.hand[0].id };
    return { type: 'END_TURN' };
  }

  test('una partida completa puede correrse vía dispatch del store', () => {
    init(101);
    const MAX = 1000;
    for (let i = 0; i < MAX; i++) {
      const s = useGameStore.getState().gameState!;
      if (s.winner) break;
      const playerId = s.players[s.currentPlayerIndex].id;
      const action = nextLegalAction(s);
      useGameStore.getState().dispatch(playerId, action);
      // Si una acción rompió validación, end turn como rescate.
      if (useGameStore.getState().lastError) {
        useGameStore.getState().endTurn(playerId);
      }
    }
    const final = useGameStore.getState().gameState!;
    expect(final.winner).not.toBeNull();
    expect(final.phase).toBe('game_over');
  }, 20000);
});

describe('gameStore — partidas pequeñas (2 players)', () => {
  test('initGame con 2 jugadores funciona', () => {
    init(7, seeds2);
    const s = useGameStore.getState().gameState!;
    expect(s.players.length).toBe(2);
  });
});

describe('gameStore — convenience methods cobertura completa', () => {
  test('playPropertyToSet vía store', () => {
    init(1);
    const player = useGameStore.getState().gameState!.players[0];
    const prop = player.hand.find((c) => c.type === 'property');
    if (!prop || !prop.color) return; // skip si seed no devolvió propiedad
    useGameStore.getState().playPropertyToSet('p1', prop.id, prop.color);
    expect(useGameStore.getState().lastError).toBeNull();
  });

  test('playWildcardToSet vía store registra error si la carta no existe', () => {
    init(1);
    useGameStore.getState().playWildcardToSet('p1', 'fake', 'rojo');
    expect(useGameStore.getState().lastError).toBeTruthy();
  });

  test('moveWildcard vía store', () => {
    init(1);
    useGameStore.getState().moveWildcard('p1', 'fake', 'rojo');
    expect(useGameStore.getState().lastError).toBeTruthy();
  });

  test('playRent / playSobrecargo / playBuilding registran errores cuando no aplican', () => {
    init(1);
    useGameStore.getState().playRent('p1', 'fake', 'rojo', 'p2');
    expect(useGameStore.getState().lastError).toBeTruthy();
    useGameStore.getState().clearError();

    useGameStore.getState().playSobrecargo('p1');
    expect(useGameStore.getState().lastError).toBeTruthy();
    useGameStore.getState().clearError();

    useGameStore.getState().playBuilding('p1', 'fake', 'rojo');
    expect(useGameStore.getState().lastError).toBeTruthy();
  });

  test('confiscate / stealProperty / forceTrade vía store registran errores apropiados', () => {
    init(1);
    useGameStore.getState().confiscate('p1', 'fake', 'p2', 'rojo');
    expect(useGameStore.getState().lastError).toBeTruthy();
    useGameStore.getState().clearError();

    useGameStore.getState().stealProperty('p1', 'fake', 'p2', 'cardX');
    expect(useGameStore.getState().lastError).toBeTruthy();
    useGameStore.getState().clearError();

    useGameStore.getState().forceTrade('p1', 'fake', 'own', 'p2', 'tgt');
    expect(useGameStore.getState().lastError).toBeTruthy();
  });

  test('collectDebt / collectTribute / drawExtra registran errores con cartas falsas', () => {
    init(1);
    useGameStore.getState().collectDebt('p1', 'fake', 'p2');
    expect(useGameStore.getState().lastError).toBeTruthy();
    useGameStore.getState().clearError();

    useGameStore.getState().collectTribute('p1', 'fake');
    expect(useGameStore.getState().lastError).toBeTruthy();
    useGameStore.getState().clearError();

    useGameStore.getState().drawExtra('p1', 'fake');
    expect(useGameStore.getState().lastError).toBeTruthy();
  });
});
