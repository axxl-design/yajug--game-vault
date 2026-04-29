import { describe, expect, test } from 'vitest';
import { chargeRoleMeter } from './charge';
import { buildTestState } from './test-helpers';

describe('chargeRoleMeter', () => {
  test('carga al jugador cuando trigger matchea su rol', () => {
    const state = buildTestState({
      players: [{ id: 'p1', role: 'abogado' }, { id: 'p2', role: 'corredor' }],
    });
    const after = chargeRoleMeter(state, 'p1', 'attacked');
    expect(after.players[0].expansionCharge).toBe(25);
  });

  test('no carga si trigger no coincide', () => {
    const state = buildTestState({
      players: [{ id: 'p1', role: 'abogado' }],
    });
    const after = chargeRoleMeter(state, 'p1', 'rent_collected');
    expect(after.players[0].expansionCharge).toBe(0);
  });

  test('clamp a 100', () => {
    const state = buildTestState({
      players: [{ id: 'p1', role: 'abogado' }],
    });
    let s = state;
    for (let i = 0; i < 10; i++) s = chargeRoleMeter(s, 'p1', 'attacked');
    expect(s.players[0].expansionCharge).toBe(100);
  });

  test('no carga si la expansión ya fue usada', () => {
    const state = buildTestState({
      players: [{ id: 'p1', role: 'abogado' }],
    });
    const withUsed = {
      ...state,
      players: state.players.map((p) => ({ ...p, expansionUsed: true })),
    };
    const after = chargeRoleMeter(withUsed, 'p1', 'attacked');
    expect(after.players[0].expansionCharge).toBe(0);
  });
});
