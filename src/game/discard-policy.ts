import type { Player } from '@/types/game';

/**
 * Política default de descarte forzado: descartar las cartas de menor
 * valor primero. Tie-break por id ascendente para reproducibilidad.
 */
export function computeDefaultDiscard(player: Player, count: number): string[] {
  if (count <= 0) return [];
  return [...player.hand]
    .sort((a, b) => a.value - b.value || a.id.localeCompare(b.id))
    .slice(0, count)
    .map((c) => c.id);
}
