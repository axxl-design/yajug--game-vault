import { Smartphone } from 'lucide-react';
import { Card } from '@/components/ui';

export function MobileGate() {
  return (
    <main className="min-h-screen bg-bg text-text flex items-center justify-center p-6">
      <Card variant="elevated" padding="lg" className="max-w-sm text-center flex flex-col gap-4 items-center">
        <Smartphone size={32} className="text-coral" />
        <h1 className="font-display text-20 font-semibold tracking-tight">
          Pantalla muy chica
        </h1>
        <p className="font-sans text-14 text-text-muted leading-relaxed">
          YAJUGÁ funciona mejor en pantallas <strong>≥ 768px</strong>. Probá en una tablet o computadora.
        </p>
        <p className="font-mono text-11 text-text-subtle">
          La versión móvil llega después del MVP.
        </p>
      </Card>
    </main>
  );
}
