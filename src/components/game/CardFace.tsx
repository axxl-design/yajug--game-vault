import { motion } from 'framer-motion';
import type { Card } from '@/types/game';
import { cn } from '@/utils/cn';

const COLOR_BG: Record<string, string> = {
  rojo: 'bg-[#C5523B]',
  naranja: 'bg-[#D17A2E]',
  amarillo: 'bg-[#C7A23A]',
  verde: 'bg-set-verde',
  turquesa: 'bg-[#3F8B8C]',
  azul: 'bg-[#3D5A99]',
  morado: 'bg-set-vermil',
  rosa: 'bg-[#B85F87]',
  marron: 'bg-[#7E5236]',
  gris: 'bg-set-graphite',
  comodin: 'bg-amber',
};

interface CardFaceProps {
  card: Card;
  size?: 'sm' | 'md' | 'lg';
  selected?: boolean;
  highlighted?: boolean;
  disabled?: boolean;
  onClick?: () => void;
  /** Cara dorso (oculta). */
  faceDown?: boolean;
  className?: string;
}

const SIZE_CLASS: Record<NonNullable<CardFaceProps['size']>, string> = {
  sm: 'w-12 h-16 text-12',
  md: 'w-20 h-28 text-13',
  lg: 'w-28 h-40 text-14',
};

function cardLabel(card: Card): string {
  if (card.type === 'money') return `$${card.value}M`;
  if (card.type === 'property') return card.color ?? 'prop';
  if (card.type === 'wildcard') {
    if (!card.colors || card.colors.length === 0) return '★';
    return card.colors.slice(0, 2).map((c) => c[0]).join('/').toUpperCase();
  }
  if (card.type === 'rent') {
    if (!card.colors || card.colors.length === 0) return 'RENTA *';
    return `RENTA ${card.colors.map((c) => c[0]).join('/').toUpperCase()}`;
  }
  if (card.type === 'action') return card.name;
  if (card.type === 'building') return card.name;
  if (card.type === 'event') return card.name;
  return card.name;
}

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
  if (faceDown) {
    return (
      <div
        className={cn(
          'rounded-card border border-ink/30 bg-ink',
          'flex items-center justify-center text-bone font-display font-bold',
          SIZE_CLASS[size],
          className,
        )}
      >
        Y
      </div>
    );
  }

  const cardBg =
    card.color && COLOR_BG[card.color]
      ? COLOR_BG[card.color]
      : card.colors && card.colors[0] && COLOR_BG[card.colors[0]]
        ? COLOR_BG[card.colors[0]]
        : 'bg-bg-elev-2';

  return (
    <motion.button
      type="button"
      onClick={onClick}
      disabled={disabled}
      whileHover={!disabled ? { y: -4 } : undefined}
      whileTap={!disabled ? { scale: 0.96 } : undefined}
      transition={{ duration: 0.15, ease: [0.16, 1, 0.3, 1] }}
      aria-label={card.name}
      className={cn(
        'relative shrink-0 overflow-hidden text-left',
        'rounded-card border-2 shadow-md',
        'transition-colors duration-fast ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2',
        SIZE_CLASS[size],
        selected ? 'border-coral' : 'border-ink/40',
        highlighted && 'ring-2 ring-violet ring-offset-2 ring-offset-bg',
        disabled && 'opacity-50 cursor-not-allowed',
        cardBg,
        'text-bone',
        className,
      )}
    >
      <div className="absolute inset-0 flex flex-col justify-between p-2">
        <div className="flex items-start justify-between gap-1">
          <span className="font-display font-semibold leading-tight truncate">
            {cardLabel(card)}
          </span>
          <span className="font-mono text-10 opacity-80">${card.value}</span>
        </div>
        <div className="font-mono text-10 opacity-70 truncate">{card.id}</div>
      </div>
    </motion.button>
  );
}
