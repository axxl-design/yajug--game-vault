import { describe, expect, test } from 'vitest';
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
import {
  createActionCard,
  createMoneyCard,
  createPropertyCard,
  createRentCard,
  createWildcardCard,
} from './cards';
import { buildTestState, makeSet, newIds, seededRng } from './test-helpers';

/* ----------------- playCardAsMoney ------------------ */

describe('playCardAsMoney', () => {
  test('mueve carta de mano al banco e incrementa played count', () => {
    const ids = newIds();
    const card = createMoneyCard(5, ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [card] }] });
    const after = playCardAsMoney(state, 'p1', card.id);
    expect(after.players[0].hand).toEqual([]);
    expect(after.players[0].bank.map((c) => c.id)).toEqual([card.id]);
    expect(after.players[0].hasPlayedCardsThisTurn).toBe(1);
  });

  test('throws si no es turno del jugador', () => {
    const ids = newIds();
    const card = createMoneyCard(1, ids);
    const state = buildTestState({
      players: [
        { id: 'p1' },
        { id: 'p2', hand: [card] },
      ],
      currentPlayerIndex: 0,
    });
    expect(() => playCardAsMoney(state, 'p2', card.id)).toThrow(GameError);
  });

  test('throws si ya jugó 3 cartas', () => {
    const ids = newIds();
    const card = createMoneyCard(1, ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [card], hasPlayedCardsThisTurn: 3 },
      ],
    });
    expect(() => playCardAsMoney(state, 'p1', card.id)).toThrow(GameError);
  });

  test('throws si la carta no está en mano', () => {
    const state = buildTestState({ players: [{ id: 'p1' }] });
    expect(() => playCardAsMoney(state, 'p1', 'fake')).toThrow(GameError);
  });
});

/* ----------------- playPropertyToSet ----------------- */

describe('playPropertyToSet', () => {
  test('crea un set nuevo cuando no existe', () => {
    const ids = newIds();
    const card = createPropertyCard('rojo', ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [card] }] });
    const after = playPropertyToSet(state, 'p1', card.id, 'rojo');
    expect(after.players[0].sets.length).toBe(1);
    expect(after.players[0].sets[0].color).toBe('rojo');
    expect(after.players[0].sets[0].properties.length).toBe(1);
    expect(after.players[0].sets[0].isComplete).toBe(false);
  });

  test('completa un set y registra log de set_completed', () => {
    const ids = newIds();
    const props = [createPropertyCard('marron', ids), createPropertyCard('marron', ids)];
    const incoming = createPropertyCard('marron', ids);
    // Marron requiere 2; ya tiene 1 → al jugar la 2da completa.
    const state = buildTestState({
      players: [
        {
          id: 'p1',
          hand: [props[1], incoming],
          sets: [makeSet('marron', [props[0]], 2)],
        },
      ],
    });
    const after = playPropertyToSet(state, 'p1', props[1].id, 'marron');
    expect(after.players[0].sets[0].isComplete).toBe(true);
    expect(after.log.some((l) => l.type === 'set_completed')).toBe(true);
  });

  test('throws en color mismatch', () => {
    const ids = newIds();
    const card = createPropertyCard('rojo', ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [card] }] });
    expect(() => playPropertyToSet(state, 'p1', card.id, 'azul')).toThrow(GameError);
  });

  test('victoria: 3 sets completos dispara winner', () => {
    const ids = newIds();
    const finalCard = createPropertyCard('marron', ids);
    const state = buildTestState({
      players: [
        {
          id: 'p1',
          hand: [finalCard],
          sets: [
            { ...makeSet('rojo', [
              createPropertyCard('rojo', ids),
              createPropertyCard('rojo', ids),
              createPropertyCard('rojo', ids),
            ], 3), isComplete: true },
            { ...makeSet('verde', [
              createPropertyCard('verde', ids),
              createPropertyCard('verde', ids),
              createPropertyCard('verde', ids),
            ], 3), isComplete: true },
            makeSet('marron', [createPropertyCard('marron', ids)], 2),
          ],
        },
      ],
    });
    const after = playPropertyToSet(state, 'p1', finalCard.id, 'marron');
    expect(after.winner).toBe('p1');
    expect(after.phase).toBe('game_over');
  });
});

/* ----------------- playWildcardToSet ----------------- */

describe('playWildcardToSet', () => {
  test('coloca wildcard universal en cualquier color', () => {
    const ids = newIds();
    const w = createWildcardCard([], ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [w] }] });
    const after = playWildcardToSet(state, 'p1', w.id, 'verde');
    expect(after.players[0].sets[0].color).toBe('verde');
  });

  test('rechaza color que no acepta el wildcard', () => {
    const ids = newIds();
    const w = createWildcardCard(['rojo', 'amarillo'], ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [w] }] });
    expect(() => playWildcardToSet(state, 'p1', w.id, 'verde')).toThrow(GameError);
  });
});

/* --------------------- moveWildcard ------------------- */

describe('moveWildcard', () => {
  test('mueve wildcard entre sets sin gastar carta jugada', () => {
    const ids = newIds();
    const w = createWildcardCard(['rojo', 'amarillo'], ids);
    const state = buildTestState({
      players: [
        {
          id: 'p1',
          sets: [makeSet('rojo', [w], 3)],
          hasPlayedCardsThisTurn: 1,
        },
      ],
    });
    const after = moveWildcard(state, 'p1', w.id, 'amarillo');
    // El set rojo se vacía/elimina, hay nuevo set amarillo con el wildcard.
    expect(after.players[0].sets.find((s) => s.color === 'amarillo')?.properties[0].id).toBe(w.id);
    // Acción libre: counter NO incrementó.
    expect(after.players[0].hasPlayedCardsThisTurn).toBe(1);
  });

  test('rechaza si la carta no es wildcard', () => {
    const ids = newIds();
    const p = createPropertyCard('rojo', ids);
    const state = buildTestState({
      players: [{ id: 'p1', sets: [makeSet('rojo', [p], 3)] }],
    });
    expect(() => moveWildcard(state, 'p1', p.id, 'amarillo')).toThrow(GameError);
  });

  test('rechaza si el color destino no está aceptado', () => {
    const ids = newIds();
    const w = createWildcardCard(['rojo', 'amarillo'], ids);
    const state = buildTestState({
      players: [{ id: 'p1', sets: [makeSet('rojo', [w], 3)] }],
    });
    expect(() => moveWildcard(state, 'p1', w.id, 'verde')).toThrow(GameError);
  });
});

/* ---------------------- playBuilding ----------------- */

describe('playBuilding', () => {
  test('coloca Edificio en set completo', () => {
    const ids = newIds();
    const set = makeSet(
      'rojo',
      [
        createPropertyCard('rojo', ids),
        createPropertyCard('rojo', ids),
        createPropertyCard('rojo', ids),
      ],
      3,
    );
    const e = createActionCard('edificio', ids);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [e], sets: [set] }],
    });
    const after = playBuilding(state, 'p1', e.id, 'rojo');
    expect(after.players[0].sets[0].buildings.length).toBe(1);
  });

  test('Torre requiere Edificio previo', () => {
    const ids = newIds();
    const set = makeSet(
      'rojo',
      [
        createPropertyCard('rojo', ids),
        createPropertyCard('rojo', ids),
        createPropertyCard('rojo', ids),
      ],
      3,
    );
    const t = createActionCard('torre', ids);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [t], sets: [set] }],
    });
    expect(() => playBuilding(state, 'p1', t.id, 'rojo')).toThrow(GameError);
  });
});

/* ------------------------- playRent ------------------- */

describe('playRent', () => {
  test('cobra renta del target con dinero del banco', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3); // 1 prop = renta 3
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [rent], sets: [set] },
        { id: 'p2', bank: [createMoneyCard(5, ids)] },
      ],
    });
    const after = playRent(state, 'p1', rent.id, 'rojo', 'p2');
    // p2 paga 3M; con un billete de 5 termina dando 5 (no hay change).
    expect(after.players[0].bank.length).toBe(1);
    expect(after.players[1].bank.length).toBe(0);
    expect(after.players[0].lastRentInTurn?.amount).toBe(3);
  });

  test('si target no tiene cartas, no transfiere nada (no debt)', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [rent], sets: [set] },
        { id: 'p2' }, // sin nada
      ],
    });
    const after = playRent(state, 'p1', rent.id, 'rojo', 'p2');
    expect(after.players[0].bank.length).toBe(0);
  });

  test('descarta la carta de renta', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [rent], sets: [set] },
        { id: 'p2' },
      ],
    });
    const after = playRent(state, 'p1', rent.id, 'rojo', 'p2');
    expect(after.discardPile.some((c) => c.id === rent.id)).toBe(true);
  });

  test('no se puede cobrar a uno mismo', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [rent], sets: [set] }, { id: 'p2' }],
    });
    expect(() => playRent(state, 'p1', rent.id, 'rojo', 'p1')).toThrow(GameError);
  });

  test('marker de Defense en log', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [rent], sets: [set] }, { id: 'p2' }],
    });
    const after = playRent(state, 'p1', rent.id, 'rojo', 'p2');
    expect(after.log.some((l) => l.type === 'defense_would_trigger')).toBe(true);
  });
});

/* ---------------------- playSobrecargo ----------------- */

describe('playSobrecargo', () => {
  test('duplica la última renta del turno', () => {
    const ids = newIds();
    const rent = createRentCard(['rojo', 'amarillo'], ids);
    const sobre = createActionCard('sobrecargo', ids);
    const set = makeSet('rojo', [createPropertyCard('rojo', ids)], 3);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [rent, sobre], sets: [set] },
        { id: 'p2', bank: [createMoneyCard(5, ids), createMoneyCard(5, ids)] },
      ],
    });
    const afterRent = playRent(state, 'p1', rent.id, 'rojo', 'p2');
    const afterSobre = playSobrecargo(afterRent, 'p1');
    // 3 + 3 cobrados → p1 recibió ambas pagas.
    expect(afterSobre.players[0].bank.length).toBe(2);
    expect(afterSobre.players[0].lastRentInTurn).toBeNull();
  });

  test('throws si no hubo renta previa', () => {
    const ids = newIds();
    const sobre = createActionCard('sobrecargo', ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [sobre] }] });
    expect(() => playSobrecargo(state, 'p1')).toThrow(GameError);
  });
});

/* ----------------------- confiscate ------------------- */

describe('confiscate', () => {
  test('transfiere set completo al atacante', () => {
    const ids = newIds();
    const conf = createActionCard('confiscacion', ids);
    const targetSet = makeSet(
      'rojo',
      [
        createPropertyCard('rojo', ids),
        createPropertyCard('rojo', ids),
        createPropertyCard('rojo', ids),
      ],
      3,
    );
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [conf] },
        { id: 'p2', sets: [targetSet] },
      ],
    });
    const after = confiscate(state, 'p1', conf.id, 'p2', 'rojo');
    expect(after.players[1].sets.length).toBe(0);
    expect(after.players[0].sets.length).toBe(1);
    expect(after.players[0].sets[0].color).toBe('rojo');
    expect(after.players[0].sets[0].isComplete).toBe(true);
  });

  test('throws si target no tiene set completo del color', () => {
    const ids = newIds();
    const conf = createActionCard('confiscacion', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [conf] },
        { id: 'p2', sets: [makeSet('rojo', [createPropertyCard('rojo', ids)], 3)] },
      ],
    });
    expect(() => confiscate(state, 'p1', conf.id, 'p2', 'rojo')).toThrow(GameError);
  });

  test('victoria si confiscación completa la 3ra set distinta', () => {
    const ids = newIds();
    const conf = createActionCard('confiscacion', ids);
    const state = buildTestState({
      players: [
        {
          id: 'p1',
          hand: [conf],
          sets: [
            { ...makeSet('verde', [createPropertyCard('verde', ids), createPropertyCard('verde', ids), createPropertyCard('verde', ids)], 3), isComplete: true },
            { ...makeSet('amarillo', [createPropertyCard('amarillo', ids), createPropertyCard('amarillo', ids), createPropertyCard('amarillo', ids)], 3), isComplete: true },
          ],
        },
        {
          id: 'p2',
          sets: [
            { ...makeSet('rojo', [createPropertyCard('rojo', ids), createPropertyCard('rojo', ids), createPropertyCard('rojo', ids)], 3), isComplete: true },
          ],
        },
      ],
    });
    const after = confiscate(state, 'p1', conf.id, 'p2', 'rojo');
    expect(after.winner).toBe('p1');
  });
});

/* ---------------------- stealProperty ----------------- */

describe('stealProperty', () => {
  test('roba propiedad de set incompleto', () => {
    const ids = newIds();
    const trato = createActionCard('trato_sucio', ids);
    const stolen = createPropertyCard('rojo', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [trato] },
        { id: 'p2', sets: [makeSet('rojo', [stolen], 3)] },
      ],
    });
    const after = stealProperty(state, 'p1', trato.id, 'p2', stolen.id);
    expect(after.players[1].sets.length).toBe(0);
    expect(after.players[0].sets[0].properties[0].id).toBe(stolen.id);
  });

  test('rechaza robar de set completo', () => {
    const ids = newIds();
    const trato = createActionCard('trato_sucio', ids);
    const props = [
      createPropertyCard('marron', ids),
      createPropertyCard('marron', ids),
    ];
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [trato] },
        { id: 'p2', sets: [{ ...makeSet('marron', props, 2), isComplete: true }] },
      ],
    });
    expect(() => stealProperty(state, 'p1', trato.id, 'p2', props[0].id)).toThrow(GameError);
  });
});

/* ----------------------- forceTrade ------------------- */

describe('forceTrade', () => {
  test('intercambia dos propiedades sueltas', () => {
    const ids = newIds();
    const trueque = createActionCard('trueque_forzado', ids);
    const own = createPropertyCard('rojo', ids);
    const tgt = createPropertyCard('amarillo', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [trueque], sets: [makeSet('rojo', [own], 3)] },
        { id: 'p2', sets: [makeSet('amarillo', [tgt], 3)] },
      ],
    });
    const after = forceTrade(state, 'p1', trueque.id, own.id, 'p2', tgt.id);
    expect(after.players[0].sets.find((s) => s.color === 'amarillo')?.properties[0].id).toBe(tgt.id);
    expect(after.players[1].sets.find((s) => s.color === 'rojo')?.properties[0].id).toBe(own.id);
  });

  test('rechaza si propiedad propia está en set completo', () => {
    const ids = newIds();
    const trueque = createActionCard('trueque_forzado', ids);
    const a = createPropertyCard('marron', ids);
    const b = createPropertyCard('marron', ids);
    const tgt = createPropertyCard('rojo', ids);
    const state = buildTestState({
      players: [
        {
          id: 'p1',
          hand: [trueque],
          sets: [{ ...makeSet('marron', [a, b], 2), isComplete: true }],
        },
        { id: 'p2', sets: [makeSet('rojo', [tgt], 3)] },
      ],
    });
    expect(() => forceTrade(state, 'p1', trueque.id, a.id, 'p2', tgt.id)).toThrow(GameError);
  });
});

/* ----------------------- collectDebt ------------------ */

describe('collectDebt (Factura)', () => {
  test('cobra 5M del target', () => {
    const ids = newIds();
    const fac = createActionCard('factura', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [fac] },
        { id: 'p2', bank: [createMoneyCard(5, ids), createMoneyCard(5, ids)] },
      ],
    });
    const after = collectDebt(state, 'p1', fac.id, 'p2');
    expect(after.players[0].bank.length).toBeGreaterThanOrEqual(1);
    expect(after.players[1].bank.length).toBeLessThan(2);
  });

  test('si target no tiene plata, no transfiere (no debt)', () => {
    const ids = newIds();
    const fac = createActionCard('factura', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [fac] },
        { id: 'p2' },
      ],
    });
    const after = collectDebt(state, 'p1', fac.id, 'p2');
    expect(after.players[0].bank.length).toBe(0);
  });
});

/* ----------------------- collectTribute --------------- */

describe('collectTribute (Cuota)', () => {
  test('cobra 2M a cada otro jugador conectado', () => {
    const ids = newIds();
    const cuota = createActionCard('cuota', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [cuota] },
        { id: 'p2', bank: [createMoneyCard(2, ids)] },
        { id: 'p3', bank: [createMoneyCard(3, ids)] },
      ],
    });
    const after = collectTribute(state, 'p1', cuota.id);
    expect(after.players[0].bank.length).toBe(2);
    expect(after.players[1].bank.length).toBe(0);
    expect(after.players[2].bank.length).toBe(0);
  });

  test('ignora jugadores desconectados', () => {
    const ids = newIds();
    const cuota = createActionCard('cuota', ids);
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [cuota] },
        { id: 'p2', bank: [createMoneyCard(2, ids)], isConnected: false },
      ],
    });
    const after = collectTribute(state, 'p1', cuota.id);
    expect(after.players[0].bank.length).toBe(0);
  });
});

/* ------------------------ drawExtra ------------------ */

describe('drawExtra (Movida Extra)', () => {
  test('roba 2 cartas del mazo', () => {
    const ids = newIds();
    const movi = createActionCard('movida_extra', ids);
    const a = createMoneyCard(1, ids);
    const b = createMoneyCard(2, ids);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [movi] }],
      deck: [a, b],
    });
    const after = drawExtra(state, 'p1', movi.id, seededRng());
    expect(after.players[0].hand.length).toBe(2);
    expect(after.deck.length).toBe(0);
  });

  test('si mazo tiene <2, reshuffles del descarte', () => {
    const ids = newIds();
    const movi = createActionCard('movida_extra', ids);
    const a = createMoneyCard(1, ids);
    const b = createMoneyCard(2, ids);
    const c = createMoneyCard(3, ids);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [movi] }],
      deck: [],
      discardPile: [a, b, c],
    });
    const after = drawExtra(state, 'p1', movi.id, seededRng());
    expect(after.players[0].hand.length).toBe(2);
    // c queda como descarte (la última)
    expect(after.discardPile.length).toBe(1);
  });
});

/* ----------------------- discardFromHand --------------- */

describe('discardFromHand', () => {
  test('mueve cartas de mano al descarte', () => {
    const ids = newIds();
    const a = createMoneyCard(1, ids);
    const b = createMoneyCard(2, ids);
    const state = buildTestState({ players: [{ id: 'p1', hand: [a, b] }] });
    const after = discardFromHand(state, 'p1', [a.id]);
    expect(after.players[0].hand.length).toBe(1);
    expect(after.discardPile.length).toBe(1);
    expect(after.discardPile[0].id).toBe(a.id);
  });

  test('throws si la carta no está en mano', () => {
    const state = buildTestState({ players: [{ id: 'p1' }] });
    expect(() => discardFromHand(state, 'p1', ['fake'])).toThrow(GameError);
  });
});

/* ---------------- Edge cases de pago ------------------ */

describe('pago insuficiente con propiedad rompe set', () => {
  test('si target no tiene banco suficiente, paga con propiedad de set completo (rompe set)', () => {
    const ids = newIds();
    const fac = createActionCard('factura', ids);
    // p2 tiene set completo de marron (2 cartas) y nada de banco
    const props = [createPropertyCard('marron', ids), createPropertyCard('marron', ids)];
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [fac] },
        { id: 'p2', sets: [{ ...makeSet('marron', props, 2), isComplete: true }] },
      ],
    });
    const after = collectDebt(state, 'p1', fac.id, 'p2');
    // El set de p2 quedó vacío y se pruneó.
    expect(after.players[1].sets.length).toBe(0);
    // p1 tiene al menos 1 carta (la propiedad pagada va al banco del cobrador).
    expect(after.players[0].bank.length).toBeGreaterThanOrEqual(1);
  });
});
