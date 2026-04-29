import { describe, expect, test } from 'vitest';
import { buyFromMarket, getMarketPrice, initMarket } from './market';
import {
  createActionCard,
  createMoneyCard,
  createPropertyCard,
} from './cards';
import { buildTestState, newIds, seededRng } from './test-helpers';

describe('Market', () => {
  test('initMarket toma N cartas del top del deck', () => {
    const ids = newIds();
    const a = createMoneyCard(1, ids);
    const b = createMoneyCard(2, ids);
    const c = createMoneyCard(3, ids);
    const d = createMoneyCard(4, ids);
    const state = buildTestState({ players: [{ id: 'p1' }], deck: [a, b, c, d] });
    const after = initMarket(state);
    expect(after.marketCards.length).toBe(3);
    expect(after.deck.length).toBe(1);
  });

  test('getMarketPrice respeta la tabla de constantes', () => {
    const ids = newIds();
    expect(getMarketPrice(createPropertyCard('rojo', ids))).toBe(2);
    expect(getMarketPrice(createActionCard('confiscacion', ids))).toBe(3);
    expect(getMarketPrice(createActionCard('edificio', ids))).toBe(4);
  });

  test('buyFromMarket transfiere carta y descuenta dinero', () => {
    const ids = newIds();
    const property = createPropertyCard('verde', ids);
    const state = buildTestState({
      players: [{ id: 'p1', bank: [createMoneyCard(5, ids)] }],
      deck: [createMoneyCard(1, ids)],
    });
    const withMarket = { ...state, marketCards: [property] };
    const after = buyFromMarket(withMarket, 'p1', property.id, seededRng());
    expect(after.players[0].hand.some((c) => c.id === property.id)).toBe(true);
    expect(after.players[0].hasBoughtFromMarket).toBe(true);
    // El Mercado se reabasteció con la carta del deck
    expect(after.marketCards.length).toBe(1);
  });

  test('rechaza si ya compró este turno', () => {
    const ids = newIds();
    const property = createPropertyCard('verde', ids);
    const state = buildTestState({
      players: [{ id: 'p1', bank: [createMoneyCard(5, ids)] }],
    });
    const withMarket = {
      ...state,
      marketCards: [property],
      players: state.players.map((p) => ({ ...p, hasBoughtFromMarket: true })),
    };
    expect(() => buyFromMarket(withMarket, 'p1', property.id, seededRng())).toThrow();
  });

  test('rechaza si no alcanza el dinero', () => {
    const ids = newIds();
    const expensive = createActionCard('edificio', ids); // $4M
    const state = buildTestState({
      players: [{ id: 'p1', bank: [createMoneyCard(1, ids)] }],
    });
    const withMarket = { ...state, marketCards: [expensive] };
    expect(() => buyFromMarket(withMarket, 'p1', expensive.id, seededRng())).toThrow();
  });
});
