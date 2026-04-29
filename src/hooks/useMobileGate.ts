import { useEffect, useState } from 'react';

const MOBILE_BREAKPOINT_PX = 768;

/**
 * Detecta si el viewport es < 768px (móvil). Usado para mostrar el
 * gate "YAJUGÁ funciona mejor en pantallas más grandes" en GameScreen.
 */
export function useMobileGate(): boolean {
  const [isMobile, setIsMobile] = useState(() =>
    typeof window === 'undefined' ? false : window.innerWidth < MOBILE_BREAKPOINT_PX,
  );

  useEffect(() => {
    if (typeof window === 'undefined') return;
    const onResize = () => setIsMobile(window.innerWidth < MOBILE_BREAKPOINT_PX);
    window.addEventListener('resize', onResize);
    return () => window.removeEventListener('resize', onResize);
  }, []);

  return isMobile;
}
