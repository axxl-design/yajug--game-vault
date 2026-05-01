import {
  useCallback,
  useEffect,
  useId,
  useRef,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';

export type TooltipSide = 'top' | 'bottom' | 'left' | 'right';

export interface TooltipProps {
  content: ReactNode;
  side?: TooltipSide;
  delayMs?: number;
  children: ReactElement;
}

const SHOW_DELAY_MS = 800;
const GAP_PX = 8;
const EDGE_PAD_PX = 8;

interface Coords {
  top: number;
  left: number;
  side: TooltipSide;
}

function flipIfNeeded(rect: DOMRect, preferred: TooltipSide): TooltipSide {
  const margin = 48;
  if (preferred === 'top' && rect.top < margin) return 'bottom';
  if (preferred === 'bottom' && window.innerHeight - rect.bottom < margin) return 'top';
  if (preferred === 'left' && rect.left < margin) return 'right';
  if (preferred === 'right' && window.innerWidth - rect.right < margin) return 'left';
  return preferred;
}

function computeCoords(rect: DOMRect, side: TooltipSide): Coords {
  switch (side) {
    case 'top':
      return { top: rect.top - GAP_PX, left: rect.left + rect.width / 2, side };
    case 'bottom':
      return { top: rect.bottom + GAP_PX, left: rect.left + rect.width / 2, side };
    case 'left':
      return { top: rect.top + rect.height / 2, left: rect.left - GAP_PX, side };
    case 'right':
      return { top: rect.top + rect.height / 2, left: rect.right + GAP_PX, side };
  }
}

const sideTransform: Record<TooltipSide, string> = {
  top: 'translate(-50%, -100%)',
  bottom: 'translate(-50%, 0%)',
  left: 'translate(-100%, -50%)',
  right: 'translate(0%, -50%)',
};

export function Tooltip({
  content,
  side = 'top',
  delayMs = SHOW_DELAY_MS,
  children,
}: TooltipProps) {
  const [open, setOpen] = useState(false);
  const [coords, setCoords] = useState<Coords | null>(null);
  const triggerRef = useRef<HTMLSpanElement>(null);
  const timerRef = useRef<number | null>(null);
  const tooltipId = useId();

  const clearTimer = () => {
    if (timerRef.current !== null) {
      window.clearTimeout(timerRef.current);
      timerRef.current = null;
    }
  };

  const show = useCallback(() => {
    clearTimer();
    timerRef.current = window.setTimeout(() => {
      const el = triggerRef.current;
      if (!el) return;
      const rect = el.getBoundingClientRect();
      const finalSide = flipIfNeeded(rect, side);
      const c = computeCoords(rect, finalSide);
      c.left = Math.max(EDGE_PAD_PX, Math.min(c.left, window.innerWidth - EDGE_PAD_PX));
      c.top = Math.max(EDGE_PAD_PX, Math.min(c.top, window.innerHeight - EDGE_PAD_PX));
      setCoords(c);
      setOpen(true);
    }, delayMs);
  }, [side, delayMs]);

  const hide = useCallback(() => {
    clearTimer();
    setOpen(false);
  }, []);

  useEffect(() => () => clearTimer(), []);

  useEffect(() => {
    if (!open) return;
    const onScroll = () => hide();
    window.addEventListener('scroll', onScroll, true);
    window.addEventListener('resize', onScroll);
    return () => {
      window.removeEventListener('scroll', onScroll, true);
      window.removeEventListener('resize', onScroll);
    };
  }, [open, hide]);

  const portal =
    typeof document !== 'undefined' && open && coords
      ? createPortal(
          <div
            role="tooltip"
            id={tooltipId}
            className="fixed z-50"
            style={{
              top: coords.top,
              left: coords.left,
              transform: sideTransform[coords.side],
              pointerEvents: 'none',
            }}
          >
            {content}
          </div>,
          document.body,
        )
      : null;

  return (
    <>
      <span
        ref={triggerRef}
        onMouseEnter={show}
        onMouseLeave={hide}
        onFocus={show}
        onBlur={hide}
        className="inline-flex"
        aria-describedby={open ? tooltipId : undefined}
      >
        {children}
      </span>
      {portal}
    </>
  );
}
