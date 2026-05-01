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
import {
  AlertTriangle,
  CheckCircle2,
  Info,
  XCircle,
  type LucideIcon,
} from 'lucide-react';

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

const variantIcons: Record<ToastType, LucideIcon> = {
  info: Info,
  success: CheckCircle2,
  warning: AlertTriangle,
  error: XCircle,
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
            style={{
              position: 'fixed',
              bottom: 20,
              right: 20,
              zIndex: 200,
              display: 'flex',
              flexDirection: 'column',
              gap: 12,
              maxWidth: '92vw',
            }}
            aria-live="polite"
            aria-atomic="false"
            role="region"
          >
            {toasts.map((t) => {
              const Icon = variantIcons[t.type];
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => dismiss(t.id)}
                  data-type={t.type}
                  className="ed-toast"
                >
                  <Icon size={18} aria-hidden="true" />
                  <span className="ed-toast-body">{t.message}</span>
                </button>
              );
            })}
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
