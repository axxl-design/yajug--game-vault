import {
  useCallback,
  useEffect,
  useId,
  useRef,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
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
  ariaLabel?: string;
}

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

  useEffect(() => {
    if (!open || !closeOnEsc) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    window.addEventListener('keydown', handler);
    return () => window.removeEventListener('keydown', handler);
  }, [open, closeOnEsc, onClose]);

  useEffect(() => {
    if (open) {
      previouslyFocused.current = document.activeElement as HTMLElement | null;
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

  if (!open) return null;
  if (typeof document === 'undefined') return null;

  const node = (
    <div className="ed-modal-overlay" role="presentation">
      <div
        className="absolute inset-0"
        onClick={handleOverlayClick}
        aria-hidden="true"
        style={{ position: 'absolute', inset: 0 }}
      />
      <div
        ref={containerRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={title ? titleId : undefined}
        aria-label={!title ? ariaLabel : undefined}
        tabIndex={-1}
        data-size={size}
        className={cn('ed-modal')}
      >
        {(title || showClose) && (
          <div className="ed-modal-head">
            {title ? (
              <h2 id={titleId} className="ed-modal-title">
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
                className="ed-modal-close"
              >
                <X size={18} aria-hidden="true" />
              </button>
            )}
          </div>
        )}
        <div className="ed-modal-body">{children}</div>
        {footer && <div className="ed-modal-footer">{footer}</div>}
      </div>
    </div>
  );

  return createPortal(node, document.body);
}
