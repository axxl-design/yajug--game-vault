import type { Card } from '@/types/game';
import { Bell } from 'lucide-react';

interface TitularBannerProps {
  titular: Card | null;
}

export function TitularBanner({ titular }: TitularBannerProps) {
  if (!titular) return null;
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        position: 'relative',
        display: 'grid',
        gridTemplateColumns: 'auto 1fr',
        gap: 'var(--s-4)',
        alignItems: 'center',
        padding: 'var(--s-4) var(--s-5)',
        background: 'var(--ink)',
        color: 'var(--paper)',
        border: '1.5px solid var(--ink)',
        borderRadius: 'var(--r-card)',
        boxShadow: '4px 4px 0 var(--tomate)',
      }}
    >
      <div
        style={{
          display: 'inline-flex',
          alignItems: 'center',
          justifyContent: 'center',
          width: 36,
          height: 36,
          borderRadius: 999,
          background: 'var(--tomate)',
          color: 'var(--paper)',
        }}
      >
        <Bell size={16} aria-hidden="true" />
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
        <span
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'var(--mostaza)',
          }}
        >
          Titular en juego
        </span>
        <span
          style={{
            fontFamily: 'var(--font-serif)',
            fontStyle: 'italic',
            fontSize: 'var(--fs-22)',
            lineHeight: 1.1,
          }}
        >
          {titular.name}
        </span>
        {titular.description && (
          <span
            style={{
              fontFamily: 'var(--font-text)',
              fontSize: 13,
              opacity: 0.85,
              lineHeight: 1.4,
            }}
          >
            {titular.description}
          </span>
        )}
      </div>
    </div>
  );
}
