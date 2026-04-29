import { describe, expect, test } from 'vitest';
import { applyTitularEffect, getActiveRentModifiers } from './titulares-effects';
import { createMoneyCard, createTitularCard } from './cards';
import { buildTestState, newIds } from './test-helpers';

describe('Titulares — efectos aplicados', () => {
  test('Boom Inmobiliario suma +1 a renta', () => {
    const ids = newIds();
    const titular = createTitularCard('boom_inmobiliario', 'Boom', '+1M', ids);
    const state = buildTestState({ players: [{ id: 'p1' }, { id: 'p2' }] });
    const after = applyTitularEffect(state, titular);
    const mods = getActiveRentModifiers(after);
    expect(mods.add).toBe(1);
    expect(mods.canceled).toBe(false);
  });

  test('Recesión cancela rentas', () => {
    const ids = newIds();
    const titular = createTitularCard('recesion', 'Recesión', '', ids);
    const state = buildTestState({ players: [{ id: 'p1' }, { id: 'p2' }] });
    const after = applyTitularEffect(state, titular);
    expect(getActiveRentModifiers(after).canceled).toBe(true);
  });

  test('Especulación Salvaje multiplica rentas x2', () => {
    const ids = newIds();
    const titular = createTitularCard('especulacion_salvaje', 'EspSalvaje', '', ids);
    const state = buildTestState({ players: [{ id: 'p1' }, { id: 'p2' }] });
    const after = applyTitularEffect(state, titular);
    expect(getActiveRentModifiers(after).multiply).toBe(2);
  });

  test('Crisis Bancaria descarta 1M de cada banco no vacío', () => {
    const ids = newIds();
    const titular = createTitularCard('crisis_bancaria', 'Crisis', '', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', bank: [createMoneyCard(1, ids)] },
        { id: 'p2', bank: [createMoneyCard(2, ids)] },
        { id: 'p3' }, // banco vacío
      ],
    });
    const after = applyTitularEffect(state, titular);
    expect(after.players[0].bank.length).toBe(0);
    expect(after.players[1].bank.length).toBe(0);
    expect(after.players[2].bank.length).toBe(0);
    expect(after.discardPile.length).toBe(2);
  });

  test('Noche de Gala suma bonusDraws a cada jugador', () => {
    const ids = newIds();
    const titular = createTitularCard('noche_de_gala', 'Gala', '', ids);
    const state = buildTestState({ players: [{ id: 'p1' }, { id: 'p2' }] });
    const after = applyTitularEffect(state, titular);
    expect(after.players[0].bonusDraws).toBe(2);
    expect(after.players[1].bonusDraws).toBe(2);
  });
});
