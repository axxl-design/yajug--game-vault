import { describe, expect, test } from 'vitest';
import { createIdFactory } from './ids';

describe('createIdFactory', () => {
  test('genera IDs únicos secuenciales', () => {
    const ids = createIdFactory();
    expect(ids.next()).toBe('c1');
    expect(ids.next()).toBe('c2');
    expect(ids.next()).toBe('c3');
  });

  test('cada factory tiene su propio counter', () => {
    const a = createIdFactory();
    const b = createIdFactory();
    a.next();
    a.next();
    expect(b.next()).toBe('c1'); // independiente
  });

  test('respeta el prefix custom', () => {
    const ids = createIdFactory('card-');
    expect(ids.next()).toBe('card-1');
  });
});
