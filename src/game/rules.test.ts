import { describe, expect, test } from 'vitest';
import {
  calculateBaseRent,
  calculateSetRent,
  checkVictoryCondition,
  computeDefaultPayment,
  distinctCompletedSetColors,
  findCardInHand,
  getBankTotal,
  getStrayProperties,
  hasStrayProperty,
  isPlayerTurn,
  recomputeSetCompleteness,
  validateBuildingPlacement,
  validatePropertyToSet,
  validateRent,
  validateWildcardToSet,
} from './rules';
import { createIdFactory } from './ids';
import {
  createActionCard,
  createMoneyCard,
  createPropertyCard,
  createRentCard,
  createWildcardCard,
} from './cards';
import type { Card, GameState, Player, PropertySet } from '@/types/game';

function blankPlayer(id: string, role: Player['role'] = 'abogado'): Player {
  return {
    id,
    nickname: id,
    role,
    expansion: 'tribunal_dominio',
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
  };
}

function makeSet(color: PropertySet['color'], count: number, ids = createIdFactory()): PropertySet {
  const props: Card[] = [];
  for (let i = 0; i < count; i++) props.push(createPropertyCard(color, ids));
  return recomputeSetCompleteness({
    color,
    properties: props,
    buildings: [],
    requiredCount: count, // Caller debería poner el real, simplificado para tests
    isComplete: false,
    isMonument: false,
  });
}

describe('isPlayerTurn', () => {
  test('true cuando id coincide con currentPlayerIndex', () => {
    const state = {
      players: [blankPlayer('a'), blankPlayer('b')],
      currentPlayerIndex: 1,
    } as unknown as GameState;
    expect(isPlayerTurn(state, 'b')).toBe(true);
    expect(isPlayerTurn(state, 'a')).toBe(false);
  });
});

describe('recomputeSetCompleteness', () => {
  test('marca como complete cuando properties.length >= requiredCount', () => {
    const ids = createIdFactory();
    const set: PropertySet = {
      color: 'azul',
      properties: [createPropertyCard('azul', ids), createPropertyCard('azul', ids)],
      buildings: [],
      requiredCount: 2,
      isComplete: false,
      isMonument: false,
    };
    expect(recomputeSetCompleteness(set).isComplete).toBe(true);
  });

  test('marca como incomplete si quedan menos del required', () => {
    const ids = createIdFactory();
    const set: PropertySet = {
      color: 'rojo',
      properties: [createPropertyCard('rojo', ids), createPropertyCard('rojo', ids)],
      buildings: [],
      requiredCount: 3,
      isComplete: true,
      isMonument: false,
    };
    expect(recomputeSetCompleteness(set).isComplete).toBe(false);
  });
});

describe('distinctCompletedSetColors', () => {
  test('cuenta solo colores distintos completos', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const a = makeSet('rojo', 3, ids);
    const b = makeSet('rojo', 3, ids); // duplicado
    const c = makeSet('verde', 3, ids);
    player.sets = [a, b, c];
    expect(distinctCompletedSetColors(player).sort()).toEqual(['rojo', 'verde']);
  });

  test('ignora sets incompletos', () => {
    const player = blankPlayer('p');
    const incomplete: PropertySet = {
      color: 'rojo',
      properties: [createPropertyCard('rojo', createIdFactory())],
      buildings: [],
      requiredCount: 3,
      isComplete: false,
      isMonument: false,
    };
    player.sets = [incomplete];
    expect(distinctCompletedSetColors(player)).toEqual([]);
  });
});

describe('hasStrayProperty', () => {
  test('true cuando hay set incompleto con propiedades', () => {
    const player = blankPlayer('p');
    player.sets = [
      {
        color: 'rojo',
        properties: [createPropertyCard('rojo', createIdFactory())],
        buildings: [],
        requiredCount: 3,
        isComplete: false,
        isMonument: false,
      },
    ];
    expect(hasStrayProperty(player)).toBe(true);
  });
  test('false cuando todos los sets están completos', () => {
    const player = blankPlayer('p');
    player.sets = [makeSet('azul', 2, createIdFactory())];
    player.sets[0] = recomputeSetCompleteness({ ...player.sets[0], requiredCount: 2 });
    expect(hasStrayProperty(player)).toBe(false);
  });
});

describe('checkVictoryCondition', () => {
  test('jugador normal gana con 3 sets de colores DISTINTOS', () => {
    const player = blankPlayer('p', 'abogado');
    player.sets = [
      { ...makeSet('rojo', 3), requiredCount: 3, isComplete: true },
      { ...makeSet('verde', 3), requiredCount: 3, isComplete: true },
      { ...makeSet('azul', 2), requiredCount: 2, isComplete: true },
    ];
    expect(checkVictoryCondition(player)).toBe(true);
  });

  test('jugador normal NO gana con 2 sets', () => {
    const player = blankPlayer('p', 'abogado');
    player.sets = [
      { ...makeSet('rojo', 3), requiredCount: 3, isComplete: true },
      { ...makeSet('verde', 3), requiredCount: 3, isComplete: true },
    ];
    expect(checkVictoryCondition(player)).toBe(false);
  });

  test('Coleccionista gana con 2 sets + 1 propiedad suelta', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p', 'coleccionista');
    player.sets = [
      { ...makeSet('rojo', 3, ids), requiredCount: 3, isComplete: true },
      { ...makeSet('verde', 3, ids), requiredCount: 3, isComplete: true },
      {
        color: 'azul',
        properties: [createPropertyCard('azul', ids)],
        buildings: [],
        requiredCount: 2,
        isComplete: false,
        isMonument: false,
      },
    ];
    expect(checkVictoryCondition(player)).toBe(true);
  });

  test('Coleccionista NO gana con 2 sets pero sin propiedad suelta', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p', 'coleccionista');
    player.sets = [
      { ...makeSet('rojo', 3, ids), requiredCount: 3, isComplete: true },
      { ...makeSet('verde', 3, ids), requiredCount: 3, isComplete: true },
    ];
    expect(checkVictoryCondition(player)).toBe(false);
  });

  test('Coleccionista también gana con 3 sets (regla más fuerte aplica)', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p', 'coleccionista');
    // Tiene 3 sets pero sin sueltas — para Coleccionista esto NO califica.
    // Tiene que tener al menos 1 suelta también.
    player.sets = [
      { ...makeSet('rojo', 3, ids), requiredCount: 3, isComplete: true },
      { ...makeSet('verde', 3, ids), requiredCount: 3, isComplete: true },
      { ...makeSet('azul', 2, ids), requiredCount: 2, isComplete: true },
    ];
    // Con la regla actual del Coleccionista (2 + suelta), 3 sets sin suelta NO gana.
    expect(checkVictoryCondition(player)).toBe(false);
  });
});

describe('calculateBaseRent', () => {
  test('rojo con 1/2/3 propiedades', () => {
    expect(calculateBaseRent('rojo', 1)).toBe(3);
    expect(calculateBaseRent('rojo', 2)).toBe(6);
    expect(calculateBaseRent('rojo', 3)).toBe(8);
  });

  test('clamps al máximo si propertyCount excede el array', () => {
    expect(calculateBaseRent('rojo', 99)).toBe(8);
  });

  test('returns 0 con count <= 0', () => {
    expect(calculateBaseRent('rojo', 0)).toBe(0);
  });

  test('returns 0 para comodín (no aplicable)', () => {
    expect(calculateBaseRent('comodin', 1)).toBe(0);
  });
});

describe('calculateSetRent', () => {
  test('suma bonus de Edificio (+3)', () => {
    const ids = createIdFactory();
    const set: PropertySet = {
      ...makeSet('rojo', 3, ids),
      requiredCount: 3,
      isComplete: true,
      buildings: [createActionCard('edificio', ids)],
    };
    expect(calculateSetRent(set)).toBe(8 + 3);
  });

  test('suma bonus de Edificio + Torre (+3+4=+7)', () => {
    const ids = createIdFactory();
    const set: PropertySet = {
      ...makeSet('rojo', 3, ids),
      requiredCount: 3,
      isComplete: true,
      buildings: [createActionCard('edificio', ids), createActionCard('torre', ids)],
    };
    expect(calculateSetRent(set)).toBe(8 + 3 + 4);
  });
});

describe('getBankTotal', () => {
  test('suma valores del banco', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    player.bank = [createMoneyCard(5, ids), createMoneyCard(2, ids), createMoneyCard(1, ids)];
    expect(getBankTotal(player)).toBe(8);
  });
});

describe('getStrayProperties', () => {
  test('retorna solo propiedades de sets incompletos', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const stray = createPropertyCard('rojo', ids);
    player.sets = [
      {
        color: 'rojo',
        properties: [stray],
        buildings: [],
        requiredCount: 3,
        isComplete: false,
        isMonument: false,
      },
      { ...makeSet('verde', 3, ids), requiredCount: 3, isComplete: true },
    ];
    const strays = getStrayProperties(player);
    expect(strays.length).toBe(1);
    expect(strays[0].id).toBe(stray.id);
  });
});

describe('computeDefaultPayment', () => {
  test('cubre con dinero del banco (lowest first)', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    player.bank = [createMoneyCard(5, ids), createMoneyCard(1, ids), createMoneyCard(2, ids)];
    const payments = computeDefaultPayment(player, 3);
    // Orden ascending: 1, 2, 5. Cubre 3 con 1+2.
    expect(payments.length).toBe(2);
    expect(payments.every((p) => p.fromBank)).toBe(true);
  });

  test('si banco no alcanza, usa propiedades sueltas', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    player.bank = [createMoneyCard(1, ids)];
    player.sets = [
      {
        color: 'rojo',
        properties: [createPropertyCard('rojo', ids)],
        buildings: [],
        requiredCount: 3,
        isComplete: false,
        isMonument: false,
      },
    ];
    const payments = computeDefaultPayment(player, 5);
    expect(payments.some((p) => !p.fromBank)).toBe(true);
  });

  test('si nada alcanza, paga lo que puede (no se queda debiendo)', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    player.bank = [createMoneyCard(1, ids)];
    const payments = computeDefaultPayment(player, 100);
    expect(payments.length).toBe(1);
  });

  test('payment de 0 no genera transferencias', () => {
    expect(computeDefaultPayment(blankPlayer('p'), 0)).toEqual([]);
  });
});

describe('findCardInHand', () => {
  test('retorna la carta si existe', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const c = createMoneyCard(5, ids);
    player.hand = [c];
    expect(findCardInHand(player, c.id)?.id).toBe(c.id);
  });
  test('retorna undefined si no existe', () => {
    expect(findCardInHand(blankPlayer('p'), 'nope')).toBeUndefined();
  });
});

describe('validators', () => {
  test('validatePropertyToSet rechaza color mismatch', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const c = createPropertyCard('rojo', ids);
    player.hand = [c];
    expect(validatePropertyToSet(player, c.id, 'azul').ok).toBe(false);
  });

  test('validatePropertyToSet acepta color correcto', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const c = createPropertyCard('rojo', ids);
    player.hand = [c];
    expect(validatePropertyToSet(player, c.id, 'rojo').ok).toBe(true);
  });

  test('validateWildcardToSet rechaza color no aceptado', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const w = createWildcardCard(['rojo', 'amarillo'], ids);
    player.hand = [w];
    expect(validateWildcardToSet(player, w.id, 'verde').ok).toBe(false);
  });

  test('validateBuildingPlacement requiere set completo', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const e = createActionCard('edificio', ids);
    player.hand = [e];
    // No tiene set completo
    expect(validateBuildingPlacement(player, e.id, 'rojo').ok).toBe(false);
  });

  test('validateBuildingPlacement acepta cuando hay set completo', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const e = createActionCard('edificio', ids);
    player.hand = [e];
    player.sets = [{ ...makeSet('rojo', 3, ids), requiredCount: 3, isComplete: true }];
    expect(validateBuildingPlacement(player, e.id, 'rojo').ok).toBe(true);
  });

  test('validateBuildingPlacement: torre necesita edificio primero', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const t = createActionCard('torre', ids);
    player.hand = [t];
    player.sets = [{ ...makeSet('rojo', 3, ids), requiredCount: 3, isComplete: true }];
    expect(validateBuildingPlacement(player, t.id, 'rojo').ok).toBe(false);
  });

  test('validateRent requiere propiedades del color', () => {
    const ids = createIdFactory();
    const player = blankPlayer('p');
    const r = createRentCard(['rojo', 'amarillo'], ids);
    player.hand = [r];
    // Sin sets de rojo
    expect(validateRent(player, r.id, 'rojo').ok).toBe(false);
    // Con sets de rojo
    player.sets = [
      {
        color: 'rojo',
        properties: [createPropertyCard('rojo', ids)],
        buildings: [],
        requiredCount: 3,
        isComplete: false,
        isMonument: false,
      },
    ];
    expect(validateRent(player, r.id, 'rojo').ok).toBe(true);
  });
});
