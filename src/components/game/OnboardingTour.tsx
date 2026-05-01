import { useState } from 'react';
import { Button, Modal } from '@/components/ui';
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

  const close = () => setHasSeen(true);

  const next = () => {
    if (step < STEPS.length - 1) setStep((s) => s + 1);
    else close();
  };

  const current = STEPS[step];

  return (
    <Modal
      open
      onClose={close}
      title={current.title}
      size="sm"
      footer={
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            gap: 'var(--s-3)',
            width: '100%',
          }}
        >
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              color: 'var(--text-mute)',
              textTransform: 'uppercase',
            }}
          >
            {step + 1} / {STEPS.length}
          </span>
          <div style={{ display: 'flex', gap: 'var(--s-2)' }}>
            <Button variant="ghost" onClick={close}>
              Saltear
            </Button>
            <Button onClick={next}>
              {step < STEPS.length - 1 ? 'Siguiente' : 'Listo'}
            </Button>
          </div>
        </div>
      }
    >
      <p style={{ margin: 0, fontFamily: 'var(--font-text)', fontSize: 'var(--fs-15)', lineHeight: 1.55 }}>
        {current.body}
      </p>
    </Modal>
  );
}
