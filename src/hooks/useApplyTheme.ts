import { useEffect } from 'react';
import { usePrefsStore } from '@/stores/prefsStore';

/**
 * Sincroniza `prefsStore.theme` con `<html data-theme="dark|light">`.
 * El switch visual se resuelve en CSS via tokens.css (selector
 * `[data-theme="light"]` overridea las semantic vars). Llamar una sola
 * vez en el árbol (App.tsx).
 */
export function useApplyTheme(): void {
  const theme = usePrefsStore((s) => s.theme);
  useEffect(() => {
    document.documentElement.setAttribute('data-theme', theme);
  }, [theme]);
}
