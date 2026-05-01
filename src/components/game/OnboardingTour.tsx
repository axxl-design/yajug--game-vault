import { useState } from 'react';
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
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      <div className="flex flex-col">
        <div className="flex items-start justify-between">
          <div className="flex items-center">
            <Sparkles size={18} />
            <h2>{current.title}</h2>
          </div>
          <button type="button" onClick={close} aria-label="Cerrar onboarding">
            <X size={18} />
          </button>
        </div>
        <p>{current.body}</p>
        <div className="flex items-center justify-between">
          <span>
            {step + 1} / {STEPS.length}
          </span>
          <div className="flex">
            <Button variant="ghost" onClick={close}>
              Saltear
            </Button>
            <Button onClick={next}>{step < STEPS.length - 1 ? 'Siguiente' : 'Listo'}</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
