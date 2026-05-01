import type { Card } from '@/types/game';
import { Bell } from 'lucide-react';

interface TitularBannerProps {
  titular: Card | null;
}

export function TitularBanner({ titular }: TitularBannerProps) {
  if (!titular) return null;
  return (
    <div className="flex items-center" role="status" aria-live="polite">
      <Bell size={14} />
      <span>Titular: {titular.name}</span>
      <span>{titular.description}</span>
    </div>
  );
}
