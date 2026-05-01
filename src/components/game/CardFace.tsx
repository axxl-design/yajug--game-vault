import type { Card, CardColor } from '@/types/game';
import { cn } from '@/utils/cn';

interface CardFaceProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  faceDown?: boolean;
  className?: string;
}

const SET_LABEL: Record<CardColor, string> = {
  rojo: 'Rojo',
  naranja: 'Naranja',
  amarillo: 'Amarillo',
  verde: 'Verde',
  turquesa: 'Turquesa',
  azul: 'Azul',
  morado: 'Morado',
  rosa: 'Rosa',
  marron: 'Marrón',
  gris: 'Gris',
  comodin: 'Comodín',
};

const ROMAN: Record<number, string> = {
  1: 'I', 2: 'II', 3: 'III', 4: 'IV', 5: 'V', 6: 'VI', 7: 'VII', 8: 'VIII',
};

function setColorVar(color: CardColor): string {
  return `var(--set-${color})`;
}

function setInk(color: CardColor): string {
  return color === 'amarillo' || color === 'rosa' || color === 'comodin'
    ? 'var(--ink)'
    : 'var(--paper)';
}

function actionGlyph(card: Card): string {
  if (card.type === 'rent') return '$';
  if (card.type === 'wildcard') return '★';
  if (card.type === 'building') return card.actionName === 'torre' ? '▲' : '▣';
  if (card.actionName === 'bloqueo') return '✋';
  if (card.actionName === 'confiscacion') return '⚖';
  if (card.actionName === 'trato_sucio') return '⌖';
  if (card.actionName === 'trueque_forzado') return '⇌';
  if (card.actionName === 'factura') return '%';
  if (card.actionName === 'cuota') return '€';
  if (card.actionName === 'movida_extra') return '⇈';
  if (card.actionName === 'sobrecargo') return '++';
  return '◆';
}

function actionAccent(card: Card): { color: string; ink: string; label: string } {
  if (card.type === 'rent') {
    return { color: 'var(--tomate)', ink: 'var(--paper)', label: 'Acción · Renta' };
  }
  if (card.type === 'wildcard') {
    return { color: 'var(--mostaza)', ink: 'var(--ink)', label: 'Comodín' };
  }
  if (card.type === 'building') {
    return { color: 'var(--aqua)', ink: 'var(--paper)', label: 'Edificio' };
  }
  if (card.actionName === 'bloqueo') {
    return { color: 'var(--ink)', ink: 'var(--paper)', label: 'Reacción' };
  }
  if (card.actionName === 'confiscacion' || card.actionName === 'trato_sucio') {
    return { color: 'var(--indigo)', ink: 'var(--paper)', label: 'Acción · Ataque' };
  }
  if (card.actionName === 'factura' || card.actionName === 'cuota' || card.actionName === 'sobrecargo') {
    return { color: 'var(--tomate)', ink: 'var(--paper)', label: 'Acción · Cobro' };
  }
  if (card.actionName === 'movida_extra') {
    return { color: 'var(--oliva)', ink: 'var(--paper)', label: 'Acción · Robar' };
  }
  if (card.actionName === 'trueque_forzado') {
    return { color: 'var(--aqua)', ink: 'var(--paper)', label: 'Acción · Intercambio' };
  }
  return { color: 'var(--mostaza)', ink: 'var(--ink)', label: 'Acción' };
}

function moneyTone(value: number): { c: string; ink: string } {
  if (value >= 10) return { c: 'var(--tomate)', ink: 'var(--paper)' };
  if (value >= 5)  return { c: 'var(--aqua)', ink: 'var(--paper)' };
  if (value >= 3)  return { c: 'var(--oliva)', ink: 'var(--paper)' };
  if (value >= 2)  return { c: 'var(--mostaza)', ink: 'var(--ink)' };
  return { c: 'var(--paper-3)', ink: 'var(--ink)' };
}

const SIZE_CLASS: Record<NonNullable<CardFaceProps['size']>, string> = {
  sm: 'card-sm',
  md: 'card-md',
  lg: 'card-lg',
};

export function CardFace({
  card,
  size = 'md',
  selected,
  highlighted,
  disabled,
  onClick,
  faceDown,
  className,
}: CardFaceProps) {
  const sizeCls = SIZE_CLASS[size];

  if (faceDown) {
    return (
      <div className={cn('card-back', sizeCls, className)} data-face="down">
        <div className="card-back-frame">
          <div className="card-back-center">
            <img
              src="/logo/yajuga-dominio-full.svg"
              alt=""
              aria-hidden="true"
              className="card-back-logo"
            />
            <div className="card-back-deco" />
            <span className="card-back-meta">Volumen Uno</span>
          </div>
        </div>
      </div>
    );
  }

  // ── Money card ──────────────────────────────────────
  if (card.type === 'money') {
    const tone = moneyTone(card.value);
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-selected={selected || undefined}
        data-highlighted={highlighted || undefined}
        data-disabled={disabled || undefined}
        data-card-type="money"
        aria-label={`${card.value} millones`}
        style={{ ['--mn-c' as string]: tone.c, ['--mn-ink' as string]: tone.ink }}
        className={cn('card-money', sizeCls, className)}
      >
        <div className="card-money-corner card-money-tl">${card.value}M</div>
        <div className="card-money-corner card-money-br">${card.value}M</div>
        <div className="card-money-center">
          <span className="card-money-num">{card.value}</span>
          <span className="card-money-unit">millones</span>
        </div>
        <div className="card-money-band">
          <span>YAJUGÁ</span>
          <span>BANCO CENTRAL</span>
        </div>
      </button>
    );
  }

  // ── Property card ──────────────────────────────────
  if (card.type === 'property' && card.color) {
    const color = card.color;
    const setLabel = SET_LABEL[color];
    return (
      <button
        type="button"
        onClick={onClick}
        disabled={disabled}
        data-selected={selected || undefined}
        data-highlighted={highlighted || undefined}
        data-disabled={disabled || undefined}
        data-card-type="property"
        data-card-color={color}
        aria-label={card.name}
        style={{
          ['--card-set' as string]: setColorVar(color),
          ['--card-ink' as string]: setInk(color),
        }}
        className={cn('card-prop', sizeCls, className)}
      >
        <div className="card-prop-band">
          <span>{setLabel}</span>
          <span className="card-prop-tier">{ROMAN[card.value] ?? card.value}</span>
        </div>
        <div className="card-prop-name">
          <span className="card-prop-name-text">{card.name}</span>
        </div>
        <div className="card-prop-illust">
          <span className="card-prop-illust-glyph" aria-hidden="true">⌂</span>
        </div>
        <div className="card-prop-rents">
          <div className="card-prop-rent">
            <span className="card-prop-rent-n">1</span>
            <span className="card-prop-rent-v">{Math.max(1, Math.floor(card.value / 2))}M</span>
          </div>
          <div className="card-prop-rent">
            <span className="card-prop-rent-n">2</span>
            <span className="card-prop-rent-v">{card.value}M</span>
          </div>
          <div className="card-prop-rent">
            <span className="card-prop-rent-n">SET</span>
            <span className="card-prop-rent-v">{card.value * 2}M</span>
          </div>
        </div>
        <div className="card-prop-foot">
          <span className="card-prop-foot-pip" />
          <span className="card-prop-foot-val">${card.value}M</span>
          <span className="card-prop-foot-mark">Y</span>
        </div>
      </button>
    );
  }

  // ── Action / wildcard / rent / building (fallback "card-act") ──
  const accent = actionAccent(card);
  const subtitle = card.type === 'rent'
    ? 'Cobrar a un oponente'
    : card.type === 'wildcard'
      ? 'Asigna a cualquier set'
      : card.type === 'building'
        ? `Mejora un set completo`
        : card.actionName ?? 'Acción';

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-selected={selected || undefined}
      data-highlighted={highlighted || undefined}
      data-disabled={disabled || undefined}
      data-card-type={card.type}
      data-card-color={card.color ?? card.colors?.[0]}
      aria-label={card.name}
      style={{
        ['--act-color' as string]: accent.color,
        ['--act-ink' as string]: accent.ink,
      }}
      className={cn('card-act', sizeCls, className)}
    >
      <div className="card-act-head">
        <span>{accent.label}</span>
        <span className="card-act-val">${card.value}M</span>
      </div>
      <div className="card-act-glyph">
        <span className="card-act-glyph-bg" aria-hidden="true">{actionGlyph(card)}</span>
      </div>
      <div className="card-act-body">
        <h4 className="card-act-title">{card.name}</h4>
        <p className="card-act-sub">{subtitle}</p>
        <div className="card-act-rule" />
        {card.description ? (
          <p className="card-act-text">{card.description}</p>
        ) : null}
      </div>
      <div className="card-act-foot">
        <span>YAJUGÁ : DOMINIO</span>
        <span>${card.value}M</span>
      </div>
    </button>
  );
}
