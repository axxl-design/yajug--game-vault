import { describe, expect, test } from 'vitest';
import { defaultRng, mulberry32 } from './rng';

describe('mulberry32', () => {
  test('produce sequence reproducible para una misma semilla', () => {
    const a = mulberry32(42);
    const b = mulberry32(42);
    for (let i = 0; i < 10; i++) {
      expect(a.next()).toBe(b.next());
    }
  });

  test('semillas distintas producen secuencias distintas', () => {
    const a = mulberry32(1);
    const b = mulberry32(2);
    let differ = false;
    for (let i = 0; i < 5; i++) {
      if (a.next() !== b.next()) {
        differ = true;
        break;
      }
    }
    expect(differ).toBe(true);
  });

  test('next() retorna [0, 1)', () => {
    const r = mulberry32(7);
    for (let i = 0; i < 100; i++) {
      const v = r.next();
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(1);
    }
  });

  test('int(N) retorna [0, N)', () => {
    const r = mulberry32(99);
    for (let i = 0; i < 100; i++) {
      const v = r.int(7);
      expect(v).toBeGreaterThanOrEqual(0);
      expect(v).toBeLessThan(7);
      expect(Number.isInteger(v)).toBe(true);
    }
  });

  test('int(0) retorna 0 (no truena)', () => {
    const r = mulberry32(1);
    expect(r.int(0)).toBe(0);
  });
});

describe('defaultRng', () => {
  test('next() está en [0,1)', () => {
    const v = defaultRng.next();
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(1);
  });

  test('int(N) está en [0,N)', () => {
    const v = defaultRng.int(5);
    expect(v).toBeGreaterThanOrEqual(0);
    expect(v).toBeLessThan(5);
  });
});
