/**
 * Factory de IDs para cartas. No security-grade — solo necesitamos
 * unicidad dentro de una partida y reproducibilidad en tests.
 */
export interface IdFactory {
  next(): string;
}

export function createIdFactory(prefix = 'c'): IdFactory {
  let counter = 0;
  return {
    next: () => `${prefix}${++counter}`,
  };
}
