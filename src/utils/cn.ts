/**
 * Tiny className joiner. Filtra falsy y une con espacios.
 * Suficiente para el MVP — si necesitamos merge de Tailwind conflictivos
 * (clsx + tailwind-merge), evaluamos sumar la dep en una fase posterior.
 */
export function cn(...parts: Array<string | false | null | undefined>): string {
  return parts.filter(Boolean).join(' ');
}
