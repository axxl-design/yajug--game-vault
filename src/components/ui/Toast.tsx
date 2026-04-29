import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
  type ReactNode,
} from 'react';
import { createPortal } from 'react-dom';
import { AnimatePresence, motion } from 'framer-motion';
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';
import { cn } from '@/utils/cn';

export type ToastType = 'info' | 'success' | 'warning' | 'error';

interface ToastItem {
  id: string;
  type: ToastType;
  message: string;
}

interface ToastApi {
  info: (message: string) => void;
  success: (message: string) => void;
  warning: (message: string) => void;
  error: (message: string) => void;
  dismiss: (id: string) => void;
}

const ToastContext = createContext<ToastApi | null>(null);

const DEFAULT_DURATION_MS = 4000;

const variantStyles: Record<ToastType, { container: string; icon: LucideIcon }> = {
  info: {
    container: 'bg-surface text-text border-border-strong',
    icon: Info,
  },
  success: {
    container: 'bg-amber text-ink border-amber-700',
    icon: CheckCircle2,
  },
  warning: {
    container: 'bg-amber-700 text-bone border-amber-700',
    icon: AlertTriangle,
  },
  error: {
    container: 'bg-coral text-bone border-coral-700',
    icon: XCircle,
  },
};

export function ToastProvider({ children }: { children: ReactNode }) {
  const [toasts, setToasts] = useState<ToastItem[]>([]);
  const timersRef = useRef<Map<string, number>>(new Map());

  const dismiss = useCallback((id: string) => {
    const timer = timersRef.current.get(id);
    if (timer) {
      window.clearTimeout(timer);
      timersRef.current.delete(id);
    }
    setToasts((prev) => prev.filter((t) => t.id !== id));
  }, []);

  const push = useCallback(
    (type: ToastType, message: string) => {
      const id =
        typeof crypto !== 'undefined' && 'randomUUID' in crypto
          ? crypto.randomUUID()
          : `toast-${Date.now()}-${Math.random().toString(36).slice(2)}`;
      setToasts((prev) => [{ id, type, message }, ...prev]);
      const timer = window.setTimeout(() => dismiss(id), DEFAULT_DURATION_MS);
      timersRef.current.set(id, timer);
    },
    [dismiss],
  );

  useEffect(() => {
    const timers = timersRef.current;
    return () => {
      timers.forEach((t) => window.clearTimeout(t));
      timers.clear();
    };
  }, []);

  const api = useMemo<ToastApi>(
    () => ({
      info: (msg) => push('info', msg),
      success: (msg) => push('success', msg),
      warning: (msg) => push('warning', msg),
      error: (msg) => push('error', msg),
      dismiss,
    }),
    [push, dismiss],
  );

  const portal =
    typeof document !== 'undefined'
      ? createPortal(
          <div
            className="fixed bottom-6 right-6 z-[60] flex w-full max-w-sm flex-col gap-2 pointer-events-none"
            aria-live="polite"
            aria-atomic="false"
            role="region"
          >
            <AnimatePresence initial={false}>
              {toasts.map((t) => {
                const v = variantStyles[t.type];
                const Icon = v.icon;
                return (
                  <motion.button
                    key={t.id}
                    type="button"
                    onClick={() => dismiss(t.id)}
                    initial={{ opacity: 0, x: 24, scale: 0.96 }}
                    animate={{
                      opacity: 1,
                      x: 0,
                      scale: 1,
                      transition: { duration: 0.22, ease: [0.16, 1, 0.3, 1] },
                    }}
                    exit={{
                      opacity: 0,
                      x: 24,
                      transition: { duration: 0.15, ease: [0.7, 0, 0.84, 0] },
                    }}
                    layout
                    className={cn(
                      'pointer-events-auto flex items-start gap-3 rounded-8 border px-4 py-3',
                      'text-left shadow-md cursor-pointer',
                      'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2',
                      v.container,
                    )}
                  >
                    <Icon size={18} className="mt-0.5 shrink-0" aria-hidden="true" />
                    <span className="font-sans text-14 leading-snug">{t.message}</span>
                  </motion.button>
                );
              })}
            </AnimatePresence>
          </div>,
          document.body,
        )
      : null;

  return (
    <ToastContext.Provider value={api}>
      {children}
      {portal}
    </ToastContext.Provider>
  );
}

export function useToast(): ToastApi {
  const ctx = useContext(ToastContext);
  if (!ctx) {
    throw new Error('useToast debe usarse dentro de <ToastProvider>.');
  }
  return ctx;
}
