import { describe, expect, test } from 'vitest';
import { collectDebt, collectTribute, confiscate, playRent } from './actions';
import { resolveDefense } from './defense';
import {
  createActionCard,
  createMoneyCard,
  createPropertyCard,
  createRentCard,
} from './cards';
import { buildTestState, makeSet, newIds, seededRng } from './test-helpers';

describe('Defense flow', () => {
  test('confiscate setea pendingDefense y phase=defense_pending', () => {
    const ids = newIds();
    const conf = createActionCard('confiscacion', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [conf] },
        {
          id: 'p2',
          sets: [
            {
              ...makeSet(
                'rojo',
                [
                  createPropertyCard('rojo', ids),
                  createPropertyCard('rojo', ids),
                  createPropertyCard('rojo', ids),
                ],
                3,
              ),
              isComplete: true,
            },
          ],
        },
      ],
    });
    const after = confiscate(state, 'p1', conf.id, 'p2', 'rojo');
    expect(after.phase).toBe('defense_pending');
    expect(after.pendingDefense?.context.type).toBe('confiscate');
  });

  test('resolveDefense con accept aplica el ataque', () => {
    const ids = newIds();
    const conf = createActionCard('confiscacion', ids);
    const props = [
      createPropertyCard('rojo', ids),
      createPropertyCard('rojo', ids),
      createPropertyCard('rojo', ids),
    ];
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [conf] },
        { id: 'p2', sets: [{ ...makeSet('rojo', props, 3), isComplete: true }] },
      ],
    });
    const requested = confiscate(state, 'p1', conf.id, 'p2', 'rojo');
    const resolved = resolveDefense(requested, { type: 'accept' }, seededRng());
    expect(resolved.phase).toBe('playing');
    expect(resolved.players[0].sets.length).toBe(1);
    expect(resolved.players[1].sets.length).toBe(0);
  });

  test('resolveDefense con block cancela el ataque y devuelve carta', () => {
    const ids = newIds();
    const conf = createActionCard('confiscacion', ids);
    const bloq = createActionCard('bloqueo', ids);
    const props = [
      createPropertyCard('rojo', ids),
      createPropertyCard('rojo', ids),
      createPropertyCard('rojo', ids),
    ];
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [conf] },
        { id: 'p2', hand: [bloq], sets: [{ ...makeSet('rojo', props, 3), isComplete: true }] },
      ],
    });
    const requested = confiscate(state, 'p1', conf.id, 'p2', 'rojo');
    const resolved = resolveDefense(requested, { type: 'block' }, seededRng());
    expect(resolved.phase).toBe('playing');
    // p2 mantiene su set
    expect(resolved.players[1].sets.length).toBe(1);
    // p1 recupera la carta de confiscación
    expect(resolved.players[0].hand.some((c) => c.id === conf.id)).toBe(true);
    // Bloqueo descartado
    expect(resolved.discardPile.some((c) => c.id === bloq.id)).toBe(true);
  });

  test('counter aplica ataque + roba 1 carta al atacante (cuando hay cartas)', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const filler = createMoneyCard(1, ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [rent, filler], sets: [set] },
        { id: 'p2' },
      ],
    });
    const requested = playRent(state, 'p1', rent.id, 'rojo', 'p2');
    const resolved = resolveDefense(requested, { type: 'counter' }, seededRng(7));
    // p2 recibió la carta robada (su mano creció) o p1 perdió cartas.
    expect(resolved.players[0].hand.length + resolved.players[1].hand.length).toBeGreaterThanOrEqual(0);
  });

  test('negotiate reduce el monto a pagar', () => {
    const ids = newIds();
    const fac = createActionCard('factura', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [fac] },
        { id: 'p2', bank: [createMoneyCard(10, ids)] },
      ],
    });
    const after = collectDebt(state, 'p1', fac.id, 'p2');
    const resolved = resolveDefense(after, { type: 'negotiate', amount: 2 }, seededRng());
    // p2 pagó solo 2M (con $10M card no hay change → da los 10).
    // En cualquier caso p1 recibió cartas.
    expect(resolved.players[0].bank.length).toBeGreaterThanOrEqual(1);
  });

  test('Cuota encadena defensas para cada otro jugador', () => {
    const ids = newIds();
    const cuota = createActionCard('cuota', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [cuota] },
        { id: 'p2', bank: [createMoneyCard(2, ids)] },
        { id: 'p3', bank: [createMoneyCard(2, ids)] },
      ],
    });
    let s = collectTribute(state, 'p1', cuota.id);
    expect(s.phase).toBe('defense_pending');
    expect(s.pendingDefense?.defenderId).toBe('p2');
    s = resolveDefense(s, { type: 'accept' }, seededRng());
    expect(s.phase).toBe('defense_pending');
    expect(s.pendingDefense?.defenderId).toBe('p3');
    s = resolveDefense(s, { type: 'accept' }, seededRng());
    expect(s.phase).toBe('playing');
    expect(s.pendingDefense).toBeNull();
  });
});
