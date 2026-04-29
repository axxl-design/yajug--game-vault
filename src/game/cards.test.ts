import { describe, expect, test } from 'vitest';
import { createIdFactory } from './ids';
import {
  createActionCard,
  createMoneyCard,
  createPropertyCard,
  createRentCard,
  createTitularCard,
  createWildcardCard,
  isAction,
  isAttackAction,
  isBuilding,
  isMoney,
  isProperty,
  isRent,
  isTitular,
  isUniversalWildcard,
  isWildcard,
  rentAppliesToColor,
  wildcardAcceptsColor,
} from './cards';

const ids = () => createIdFactory();

describe('predicates', () => {
  test('isProperty / isMoney / isAction etc.', () => {
    const f = ids();
    expect(isProperty(createPropertyCard('rojo', f))).toBe(true);
    expect(isMoney(createMoneyCard(5, f))).toBe(true);
    expect(isAction(createActionCard('confiscacion', f))).toBe(true);
    expect(isRent(createRentCard(['rojo', 'amarillo'], f))).toBe(true);
    expect(isWildcard(createWildcardCard(['rojo', 'amarillo'], f))).toBe(true);
    expect(isTitular(createTitularCard('boom', 'Boom', 'desc', f))).toBe(true);
    expect(isBuilding(createActionCard('edificio', f))).toBe(true);
  });

  test('isAttackAction marca correctamente', () => {
    const f = ids();
    expect(isAttackAction(createActionCard('confiscacion', f))).toBe(true);
    expect(isAttackAction(createActionCard('trato_sucio', f))).toBe(true);
    expect(isAttackAction(createActionCard('factura', f))).toBe(true);
    expect(isAttackAction(createActionCard('cuota', f))).toBe(true);
    expect(isAttackAction(createActionCard('bloqueo', f))).toBe(false);
    expect(isAttackAction(createActionCard('movida_extra', f))).toBe(false);
    expect(isAttackAction(createRentCard([], f))).toBe(true);
  });

  test('isUniversalWildcard distingue universal de bicolor', () => {
    const f = ids();
    expect(isUniversalWildcard(createWildcardCard([], f))).toBe(true);
    expect(isUniversalWildcard(createWildcardCard(['rojo', 'amarillo'], f))).toBe(false);
    expect(isUniversalWildcard(createPropertyCard('rojo', f))).toBe(false);
  });

  test('wildcardAcceptsColor: universal acepta cualquier color no-comodín', () => {
    const f = ids();
    const universal = createWildcardCard([], f);
    expect(wildcardAcceptsColor(universal, 'rojo')).toBe(true);
    expect(wildcardAcceptsColor(universal, 'amarillo')).toBe(true);
    expect(wildcardAcceptsColor(universal, 'comodin')).toBe(false);
  });

  test('wildcardAcceptsColor: bicolor solo acepta sus dos colores', () => {
    const f = ids();
    const bi = createWildcardCard(['rojo', 'amarillo'], f);
    expect(wildcardAcceptsColor(bi, 'rojo')).toBe(true);
    expect(wildcardAcceptsColor(bi, 'amarillo')).toBe(true);
    expect(wildcardAcceptsColor(bi, 'verde')).toBe(false);
  });

  test('wildcardAcceptsColor: no-wildcard no acepta nada', () => {
    const f = ids();
    expect(wildcardAcceptsColor(createPropertyCard('rojo', f), 'rojo')).toBe(false);
  });

  test('rentAppliesToColor: multicolor acepta cualquier color real', () => {
    const f = ids();
    const multi = createRentCard([], f);
    expect(rentAppliesToColor(multi, 'rojo')).toBe(true);
    expect(rentAppliesToColor(multi, 'comodin')).toBe(false);
  });

  test('rentAppliesToColor: bicolor solo acepta su par', () => {
    const f = ids();
    const r = createRentCard(['rojo', 'amarillo'], f);
    expect(rentAppliesToColor(r, 'rojo')).toBe(true);
    expect(rentAppliesToColor(r, 'verde')).toBe(false);
  });

  test('rentAppliesToColor: false si no es renta', () => {
    const f = ids();
    expect(rentAppliesToColor(createPropertyCard('rojo', f), 'rojo')).toBe(false);
  });
});

describe('factories', () => {
  test('createPropertyCard tiene type, color y value', () => {
    const f = ids();
    const c = createPropertyCard('rojo', f, 'A');
    expect(c.type).toBe('property');
    expect(c.color).toBe('rojo');
    expect(c.value).toBe(3); // PROPERTY_VALUES rojo = 3
    expect(c.id).toBeTruthy();
    expect(c.name).toContain('rojo');
  });

  test('createWildcardCard universal tiene colors vacío', () => {
    const f = ids();
    const u = createWildcardCard([], f);
    expect(u.type).toBe('wildcard');
    expect(u.colors).toEqual([]);
    expect(u.value).toBe(0);
  });

  test('createMoneyCard refleja value', () => {
    const f = ids();
    expect(createMoneyCard(10, f).value).toBe(10);
  });

  test('createActionCard edificio tiene type=building', () => {
    const f = ids();
    expect(createActionCard('edificio', f).type).toBe('building');
    expect(createActionCard('torre', f).type).toBe('building');
    expect(createActionCard('confiscacion', f).type).toBe('action');
  });

  test('createRentCard multicolor vs bicolor', () => {
    const f = ids();
    expect(createRentCard([], f).value).toBe(3);
    expect(createRentCard(['rojo', 'amarillo'], f).value).toBe(1);
  });
});
