/**
 * RNG seedable para que los tests sean reproducibles. Para producción
 * se inyecta un wrapper sobre `Math.random` (`defaultRng`).
 *
 * Algoritmo: mulberry32 — pequeño, rápido, suficiente para shuffles de
 * deck (no security-grade).
 */
export interface Rng {
  next(): number; // [0, 1)
  int(maxExclusive: number): number;
}

export function mulberry32(seed: number): Rng {
  let s = seed >>> 0;
  const next = (): number => {
    s = (s + 0x6d2b79f5) >>> 0;
    let t = s;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  return {
    next,
    int(maxExclusive) {
      if (maxExclusive <= 0) return 0;
      return Math.floor(next() * maxExclusive);
    },
  };
}

export const defaultRng: Rng = {
  next: () => Math.random(),
  int: (maxExclusive) => Math.floor(Math.random() * maxExclusive),
};
