import type { Card } from '@/types/game';
import { cn } from '@/utils/cn';

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
  sm: 'w-12 h-16',
  md: 'w-20 h-28',
  lg: 'w-28 h-40',
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
        data-face="down"
        className={cn('inline-flex items-center justify-center', SIZE_CLASS[size], className)}
      >
        Y
      </div>
    );
  }

  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      data-selected={selected || undefined}
      data-highlighted={highlighted || undefined}
      data-card-type={card.type}
      data-card-color={card.color ?? card.colors?.[0]}
      aria-label={card.name}
      className={cn('relative inline-flex flex-col text-left', SIZE_CLASS[size], className)}
    >
      <div className="absolute inset-0 flex flex-col justify-between">
        <div className="flex items-start justify-between">
          <span>{cardLabel(card)}</span>
          <span>${card.value}</span>
        </div>
        <div>{card.id}</div>
      </div>
    </button>
  );
}
