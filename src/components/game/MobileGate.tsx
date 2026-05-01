import { Smartphone } from 'lucide-react';
import { Logo } from '@/components/ui';

export function MobileGate() {
  return (
    <main
      className="shell"
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
        minHeight: '100vh',
        padding: 'var(--s-6)',
      }}
    >
      <div
        className="ed-frame"
        style={{
          maxWidth: 420,
          width: '100%',
          padding: 'var(--s-6)',
          display: 'flex',
          flexDirection: 'column',
          gap: 'var(--s-3)',
          alignItems: 'flex-start',
          background: 'var(--surface)',
          boxShadow: 'var(--shadow-press)',
        }}
      >
        <Logo variant="title" height={24} ariaHidden />
        <Smartphone size={32} aria-hidden="true" color="var(--tomate)" />
        <h1 className="ed-section-title" style={{ fontSize: 'var(--fs-32)' }}>
          Pantalla <em>chica</em>.
        </h1>
        <p style={{ fontFamily: 'var(--font-text)', color: 'var(--text-soft)', margin: 0 }}>
          YAJUGÁ funciona mejor en pantallas <strong>≥ 768px</strong>. Probá en
          una tablet o computadora.
        </p>
        <p className="ed-caption">La versión móvil llega después del MVP.</p>
      </div>
    </main>
  );
}
