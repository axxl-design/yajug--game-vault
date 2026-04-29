import { useState } from 'react';
import { motion, AnimatePresence, useReducedMotion } from 'framer-motion';
import { Button } from '@/components/ui';
import { Sparkles, X } from 'lucide-react';
import { usePrefsStore } from '@/stores/prefsStore';

const STEPS = [
  {
    title: '1. Tu mano',
    body:
      'Estas son tus cartas. Click en cualquiera para abrir el menú de opciones (jugar al banco, a un set, como acción, etc.).',
  },
  {
    title: '2. Tus sets',
    body:
      'Las propiedades del mismo color forman sets. Necesitás 3 sets completos para ganar (2 + 1 propiedad suelta si sos Coleccionista).',
  },
  {
    title: '3. El Mercado',
    body:
      'Comprá cartas extra con el dinero de tu banco. Sólo 1 compra por turno.',
  },
  {
    title: '4. Terminar turno',
    body:
      'Cuando termines, click en TERMINAR TURNO. Si tu mano supera 7 cartas, vas a tener que descartar.',
  },
];

export function OnboardingTour() {
  const hasSeen = usePrefsStore((s) => s.hasSeenOnboarding);
  const setHasSeen = usePrefsStore((s) => s.setHasSeenOnboarding);
  const reduceMotion = useReducedMotion();
  const [step, setStep] = useState(0);

  if (hasSeen) return null;

  const close = () => {
    setHasSeen(true);
  };

  const next = () => {
    if (step < STEPS.length - 1) {
      setStep((s) => s + 1);
    } else {
      close();
    }
  };

  const current = STEPS[step];

  return (
    <AnimatePresence>
      <motion.div
        key="overlay"
        className="fixed inset-0 z-[80] bg-ink/70 backdrop-blur-sm flex items-center justify-center p-4"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: reduceMotion ? 0 : 0.25 }}
      >
        <motion.div
          className="rounded-12 bg-bg-elev-1 border border-border shadow-lg max-w-md w-full p-5 flex flex-col gap-4"
          initial={{ y: 24, opacity: 0 }}
          animate={{ y: 0, opacity: 1 }}
          exit={{ y: 24, opacity: 0 }}
          transition={{ duration: reduceMotion ? 0 : 0.25, ease: [0.16, 1, 0.3, 1] }}
        >
          <div className="flex items-start justify-between gap-3">
            <div className="flex items-center gap-2">
              <Sparkles size={18} className="text-coral" />
              <h2 className="font-display text-18 font-semibold tracking-tight">
                {current.title}
              </h2>
            </div>
            <button
              type="button"
              onClick={close}
              className="text-text-muted hover:text-text"
              aria-label="Cerrar onboarding"
            >
              <X size={18} />
            </button>
          </div>
          <p className="font-sans text-14 text-text-muted leading-relaxed">{current.body}</p>
          <div className="flex items-center justify-between">
            <span className="font-mono text-11 text-text-subtle">
              {step + 1} / {STEPS.length}
            </span>
            <div className="flex gap-2">
              <Button variant="ghost" onClick={close}>
                Saltear
              </Button>
              <Button onClick={next}>{step < STEPS.length - 1 ? 'Siguiente' : 'Listo'}</Button>
            </div>
          </div>
        </motion.div>
      </motion.div>
    </AnimatePresence>
  );
}
