import { useEffect } from 'react';

export interface ShortcutMap {
  [key: string]: () => void;
}

/**
 * Registra atajos de teclado globales. Las keys son lowercase de
 * `event.key` (ej. 't', 'e', 'h', 'l', 'escape'). Ignora cuando el
 * foco está en input/textarea para no interceptar texto.
 */
export function useKeyboardShortcuts(map: ShortcutMap, enabled = true): void {
  useEffect(() => {
    if (!enabled) return;
    const handler = (e: KeyboardEvent) => {
      if (e.metaKey || e.ctrlKey || e.altKey) return;
      const target = e.target as HTMLElement | null;
      if (
        target &&
        (target.tagName === 'INPUT' ||
          target.tagName === 'TEXTAREA' ||
          target.isContentEditable)
      ) {
        return;
      }
      const key = e.key.toLowerCase();
      const fn = map[key];
      if (fn) {
        e.preventDefault();
        fn();
      }
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [map, enabled]);
}
