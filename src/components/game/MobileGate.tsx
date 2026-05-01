import { Smartphone } from 'lucide-react';
import { Card } from '@/components/ui';

export function MobileGate() {
  return (
    <main className="flex items-center justify-center" style={{ minHeight: '100vh' }}>
      <Card variant="elevated" padding="lg" className="flex flex-col items-center">
        <Smartphone size={32} />
        <h1>Pantalla muy chica</h1>
        <p>
          YAJUGÁ funciona mejor en pantallas <strong>≥ 768px</strong>. Probá en una tablet o computadora.
        </p>
        <p>La versión móvil llega después del MVP.</p>
      </Card>
    </main>
  );
}
