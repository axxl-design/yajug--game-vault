import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { X } from 'lucide-react';
import { cn } from '@/utils/cn';

type ModalSize = 'sm' | 'md' | 'lg';

export interface ModalProps {
  open: boolean;
  onClose: () => void;
  title?: string;
  size?: ModalSize;
  footer?: ReactNode;
  children?: ReactNode;
  closeOnOverlay?: boolean;
  closeOnEsc?: boolean;
  showClose?: boolean;
  /** Override aria-label si el modal no tiene title visible. */
  ariaLabel?: string;
}

const sizeStyles: Record<ModalSize, string> = {
  sm: 'max-w-sm',
  md: 'max-w-md',
  lg: 'max-w-lg',
};

const overlayMotion = {
  initial: { opacity: 0 },
  animate: { opacity: 1, transition: { duration: 0.25, ease: [0.16, 1, 0.3, 1] as const } },
  exit: { opacity: 0, transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] as const } },
};

const containerMotion = {
  initial: { opacity: 0, y: 32, scale: 0.96 },
  animate: {
    opacity: 1,
    y: 0,
    scale: 1,
    transition: { duration: 0.25, ease: [0.68, -0.55, 0.265, 1.55] as const },
  },
  exit: {
    opacity: 0,
    y: 16,
    scale: 0.98,
    transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] as const },
  },
};

export function Modal({
  open,
  onClose,
  title,
  size = 'md',
  footer,
  children,
  closeOnOverlay = true,
  closeOnEsc = true,
  showClose = true,
  ariaLabel,
}: ModalProps) {
  const titleId = useId();
  const containerRef = useRef<HTMLDivElement>(null);
  const previouslyFocused = useRef<HTMLElement | null>(null);

  // Esc para cerrar.
  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeOnEsc, onClose]);

  // Mover foco al modal al abrir, restaurar al cerrar.
  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
      // Esperar al mount del container.
      requestAnimationFrame(() => {
        const el = containerRef.current;
        if (!el) return;
        const focusable = el.querySelector<HTMLElement>(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])',
        );
        (focusable ?? el).focus();
      });
    } else if (previouslyFocused.current) {
      previouslyFocused.current.focus?.();
      previouslyFocused.current = null;
    }
  }, [open]);

  // Bloquear scroll del body mientras está abierto.
  useEffect(() => {
    if (!open) return;
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.body.style.overflow = prev;
    };
  }, [open]);

  const handleOverlayClick = useCallback(() => {
    if (closeOnOverlay) onClose();
  }, [closeOnOverlay, onClose]);

  const node = (
    <AnimatePresence>
      {open && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center p-4"
          role="presentation"
        >
          <motion.div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={handleOverlayClick}
            aria-hidden="true"
            {...overlayMotion}
          />
          <motion.div
            ref={containerRef}
            role="dialog"
            aria-modal="true"
            aria-labelledby={title ? titleId : undefined}
            aria-label={!title ? ariaLabel : undefined}
            tabIndex={-1}
            className={cn(
              'relative w-full rounded-12 bg-bg-elev-1 border border-border',
              'shadow-lg text-text outline-none',
              sizeStyles[size],
            )}
            {...containerMotion}
          >
            {(title || showClose) && (
              <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
                {title ? (
                  <h2
                    id={titleId}
                    className="font-display text-18 font-semibold tracking-tight"
                  >
                    {title}
                  </h2>
                ) : (
                  <span aria-hidden />
                )}
                {showClose && (
                  <button
                    type="button"
                    onClick={onClose}
                    aria-label="Cerrar modal"
                    className={cn(
                      '-mr-1 -mt-1 inline-flex h-8 w-8 items-center justify-center',
                      'rounded-6 text-text-muted hover:text-text hover:bg-bg-elev-2',
                      'transition-colors duration-fast ease-out',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2',
                    )}
                  >
                    <X size={18} aria-hidden="true" />
                  </button>
                )}
              </div>
            )}
            <div className={cn('px-5', !title && !showClose && 'pt-5', !footer && 'pb-5')}>
              {children}
            </div>
            {footer && (
              <div className="flex items-center justify-end gap-2 border-t border-divider px-5 py-4 mt-4">
                {footer}
              </div>
            )}
          </motion.div>
        </div>
      )}
    </AnimatePresence>
  );

  if (typeof document === 'undefined') return null;
  return createPortal(node, document.body);
}
