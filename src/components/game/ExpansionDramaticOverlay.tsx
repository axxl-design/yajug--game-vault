import { useEffect, useState } from 'react';
import type { ExpansionId } from '@/types/game';
import { EXPANSION_DEFINITIONS } from '@/game/expansions';

interface ExpansionDramaticOverlayProps {
  /** When set to a non-null expansion id, the cinematic overlay plays. */
  expansionId: ExpansionId | null;
  /** Auto-dismiss duration. 2.5s feels punchy without overstaying. */
  durationMs?: number;
  /** Called when the overlay finishes (timeout or click). */
  onComplete: () => void;
}

const DEFAULT_DURATION = 2500;

export function ExpansionDramaticOverlay({
  expansionId,
  durationMs = DEFAULT_DURATION,
  onComplete,
}: ExpansionDramaticOverlayProps) {
  const [visible, setVisible] = useState<ExpansionId | null>(null);

  useEffect(() => {
    if (!expansionId) return;
    setVisible(expansionId);
    const timer = window.setTimeout(() => {
      setVisible(null);
      onComplete();
    }, durationMs);
    return () => window.clearTimeout(timer);
  }, [expansionId, durationMs, onComplete]);

  if (!visible) return null;

  const def = EXPANSION_DEFINITIONS[visible];
  const handleSkip = () => {
    setVisible(null);
    onComplete();
  };

  return (
    <div
      className="expansion-cinematic-overlay"
      role="alertdialog"
      aria-live="assertive"
      aria-label={`Expansión activada: ${def.name}`}
      onClick={handleSkip}
    >
      <span className="expansion-rays" aria-hidden="true" />
      <SpeedLines />
      <div className="expansion-cinematic-frame">
        <span className="expansion-cinematic-kicker">— Expansión de Dominio —</span>
        <h2 className="expansion-cinematic-title">{def.name}</h2>
        <p className="expansion-cinematic-sub">{def.description}</p>
        <span className="expansion-cinematic-skip">Click para continuar</span>
      </div>
    </div>
  );
}

/** Manga-style radial speed lines drawn as an SVG. */
function SpeedLines() {
  const lines = Array.from({ length: 60 });
  return (
    <svg
      viewBox="-100 -100 200 200"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{
        position: 'absolute',
        inset: 0,
        width: '100%',
        height: '100%',
        zIndex: 1,
        pointerEvents: 'none',
        mixBlendMode: 'screen',
      }}
    >
      <defs>
        <radialGradient id="exp-cine-glow" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="#C7B8FF" stopOpacity="0.85" />
          <stop offset="60%" stopColor="#7A5FFF" stopOpacity="0.18" />
          <stop offset="100%" stopColor="#7A5FFF" stopOpacity="0" />
        </radialGradient>
      </defs>
      <circle cx="0" cy="0" r="80" fill="url(#exp-cine-glow)" />
      <g stroke="rgba(255,255,255,0.55)" strokeLinecap="round">
        {lines.map((_, i) => {
          const angle = (i / lines.length) * Math.PI * 2;
          const r1 = 18 + (i % 5) * 1.5;
          const r2 = 100;
          const w = i % 4 === 0 ? 1.6 : i % 2 === 0 ? 0.9 : 0.4;
          return (
            <line
              key={i}
              x1={Math.cos(angle) * r1}
              y1={Math.sin(angle) * r1}
              x2={Math.cos(angle) * r2}
              y2={Math.sin(angle) * r2}
              strokeWidth={w}
              opacity={i % 4 === 0 ? 0.55 : 0.3}
            />
          );
        })}
      </g>
      {/* central star */}
      <g
        style={{
          transformOrigin: 'center',
          animation: 'expSpinSlow 18s linear infinite',
        }}
      >
        <polygon
          points="0,-44 12,-12 44,-8 18,12 26,42 0,26 -26,42 -18,12 -44,-8 -12,-12"
          fill="#7A5FFF"
          stroke="#1A1814"
          strokeWidth="2.5"
          opacity="0.85"
        />
        <polygon
          points="0,-22 6,-6 22,-4 9,6 13,22 0,12 -13,22 -9,6 -22,-4 -6,-6"
          fill="#C99022"
          stroke="#1A1814"
          strokeWidth="1.2"
        />
      </g>
    </svg>
  );
}
