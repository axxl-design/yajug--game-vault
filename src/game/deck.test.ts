import { describe, expect, test } from 'vitest';
import { createIdFactory } from './ids';
import { mulberry32 } from './rng';
import {
  buildMainDeck,
  buildTitularDeck,
  drawCards,
  ensureDeckHasCards,
  shuffle,
} from './deck';
import { TITULAR_DEFINITIONS } from './titulares';
import {
  ACTION_COUNTS,
  MONEY_DENOMINATIONS,
  MULTICOLOR_RENT_COUNT,
  PROPERTY_REQUIREMENTS,
  RENT_PAIRS,
  WILDCARD_PAIRS,
} from './constants';
import type { Card, GameState } from '@/types/game';

const sumOfMoney = MONEY_DENOMINATIONS.reduce((sum, m) => sum + m.count, 0);
const sumOfProperties = (Object.keys(PROPERTY_REQUIREMENTS) as Array<keyof typeof PROPERTY_REQUIREMENTS>)
  .filter((c) => c !== 'comodin')
  .reduce((sum, c) => sum + PROPERTY_REQUIREMENTS[c], 0);
const sumOfActions = (Object.keys(ACTION_COUNTS) as Array<keyof typeof ACTION_COUNTS>)
  .filter((n) => n !== 'edificio' && n !== 'torre')
  .reduce((sum, n) => sum + ACTION_COUNTS[n], 0);

describe('shuffle', () => {
  test('preserva el contenido', () => {
    const original = [1, 2, 3, 4, 5, 6, 7, 8];
    const shuffled = shuffle(original, mulberry32(1));
    expect(shuffled.sort()).toEqual([...original].sort());
  });

  test('mismo seed produce mismo resultado', () => {
    const a = shuffle([1, 2, 3, 4, 5], mulberry32(7));
    const b = shuffle([1, 2, 3, 4, 5], mulberry32(7));
    expect(a).toEqual(b);
  });

  test('no muta el input', () => {
    const original = [1, 2, 3];
    const ref = original;
    shuffle(original, mulberry32(1));
    expect(ref).toEqual([1, 2, 3]);
  });
});

describe('buildMainDeck', () => {
  const ids = createIdFactory();
  const deck = buildMainDeck(ids);

  test('total esperado: 111 cartas (29 prop + 11 wild + 20 dinero + 13 rent + 28 acc + 10 build)', () => {
    expect(deck.length).toBe(
      sumOfProperties +
        WILDCARD_PAIRS.length * 2 + 1 +
        sumOfMoney +
        (MULTICOLOR_RENT_COUNT + RENT_PAIRS.length) +
        sumOfActions +
        ACTION_COUNTS.edificio + ACTION_COUNTS.torre,
    );
    expect(deck.length).toBe(111);
  });

  test('cantidad correcta de propiedades', () => {
    const props = deck.filter((c) => c.type === 'property');
    expect(props.length).toBe(sumOfProperties); // 29
  });

  test('cantidad correcta de wildcards (10 bicolor + 1 universal)', () => {
    const wilds = deck.filter((c) => c.type === 'wildcard');
    expect(wilds.length).toBe(11);
    const universals = wilds.filter((c) => (c.colors ?? []).length === 0);
    expect(universals.length).toBe(1);
  });

  test('cantidad correcta de dinero', () => {
    const moneyCards = deck.filter((c) => c.type === 'money');
    expect(moneyCards.length).toBe(sumOfMoney); // 20
    for (const denom of MONEY_DENOMINATIONS) {
      expect(moneyCards.filter((c) => c.value === denom.value).length).toBe(denom.count);
    }
  });

  test('cantidad correcta de rentas (3 multicolor + 10 par)', () => {
    const rents = deck.filter((c) => c.type === 'rent');
    expect(rents.length).toBe(13);
    expect(rents.filter((c) => (c.colors ?? []).length === 0).length).toBe(MULTICOLOR_RENT_COUNT);
  });

  test('cantidad correcta de acciones y buildings', () => {
    const actions = deck.filter((c) => c.type === 'action');
    expect(actions.length).toBe(sumOfActions); // 28
    const buildings = deck.filter((c) => c.type === 'building');
    expect(buildings.length).toBe(ACTION_COUNTS.edificio + ACTION_COUNTS.torre); // 10
  });

  test('todos los IDs son únicos', () => {
    const idsSet = new Set(deck.map((c) => c.id));
    expect(idsSet.size).toBe(deck.length);
  });
});

describe('buildTitularDeck', () => {
  test('crea 8 titulares', () => {
    const deck = buildTitularDeck(createIdFactory());
    expect(deck.length).toBe(TITULAR_DEFINITIONS.length);
    expect(deck.length).toBe(8);
    deck.forEach((c) => expect(c.type).toBe('event'));
  });
});

/* ----------------------- Helpers para drawing ----------------------- */

function emptyState(): GameState {
  return {
    gameId: 'test',
    hostId: 'p1',
    phase: 'playing',
    players: [
      { id: 'p1', nickname: 'P1', role: 'abogado', expansion: 'tribunal_dominio',
        expansionCharge: 0, expansionUsed: false, passiveUsed: false,
        hand: [], bank: [], sets: [], hasFinishedTurn: false, isConnected: true,
        hasPlayedCardsThisTurn: 0, effects: [], lastRentInTurn: null, bankerDebt: 0,
        hasBoughtFromMarket: false, bonusDraws: 0 },
    ],
    currentPlayerIndex: 0, turnsPlayed: 0,
    deck: [], discardPile: [], marketCards: [], marketDeck: [], titularDeck: [],
    activeTitular: null, pendingDefense: null, activeExpansion: null,
    tiempoExtraState: null, winner: null, log: [],
    prefs: { enableTitulares: false, enableSounds: false, enableAnimations: false },
  };
}

function makeCard(id: string, value = 1): Card {
  return { id, type: 'money', name: `M${id}`, value, imageKey: 'm' };
}

describe('drawCards', () => {
  test('roba N cartas del top del deck', () => {
    let s = emptyState();
    s = { ...s, deck: [makeCard('a'), makeCard('b'), makeCard('c')] };
    const after = drawCards(s, 'p1', 2, mulberry32(1), 0);
    expect(after.players[0].hand.map((c) => c.id)).toEqual(['a', 'b']);
    expect(after.deck.map((c) => c.id)).toEqual(['c']);
  });

  test('si deck vacío y descarte tiene cartas, reshuffles y roba', () => {
    let s = emptyState();
    s = { ...s, discardPile: [makeCard('x'), makeCard('y'), makeCard('z')] };
    const after = drawCards(s, 'p1', 2, mulberry32(1), 0);
    // Última del descarte queda como descarte
    expect(after.discardPile.length).toBe(1);
    expect(after.discardPile[0].id).toBe('z');
    expect(after.players[0].hand.length).toBe(2);
  });

  test('si no hay nada para robar, retorna sin cambios fatales', () => {
    let s = emptyState();
    const after = drawCards(s, 'p1', 5, mulberry32(1), 0);
    expect(after.players[0].hand.length).toBe(0);
  });

  test('roba lo que pueda si descarte solo tiene 1 carta', () => {
    let s = emptyState();
    s = { ...s, discardPile: [makeCard('only')] };
    const after = drawCards(s, 'p1', 3, mulberry32(1), 0);
    // Reshuffle no aplica porque discard <= 1
    expect(after.players[0].hand.length).toBe(0);
    expect(after.discardPile.length).toBe(1);
  });
});

describe('ensureDeckHasCards', () => {
  test('idempotente cuando el deck ya tiene cartas', () => {
    const s: GameState = { ...emptyState(), deck: [makeCard('a')] };
    const after = ensureDeckHasCards(s, mulberry32(1), 0);
    expect(after.deck.length).toBe(1);
    expect(after.discardPile.length).toBe(0);
  });

  test('reshuffles dejando la última carta del descarte', () => {
    const s: GameState = {
      ...emptyState(),
      discardPile: [makeCard('a'), makeCard('b'), makeCard('c')],
    };
    const after = ensureDeckHasCards(s, mulberry32(1), 0);
    expect(after.deck.length).toBe(2);
    expect(after.discardPile.length).toBe(1);
    expect(after.discardPile[0].id).toBe('c');
  });
});
