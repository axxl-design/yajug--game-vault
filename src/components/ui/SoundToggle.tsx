import { Volume2, VolumeX } from 'lucide-react';
import { usePrefsStore } from '@/stores/prefsStore';
import { cn } from '@/utils/cn';

export interface SoundToggleProps {
  className?: string;
}

export function SoundToggle({ className }: SoundToggleProps) {
  const enabled = usePrefsStore((s) => s.soundEnabled);
  const toggleSound = usePrefsStore((s) => s.toggleSound);

  return (
    <button
      type="button"
      onClick={toggleSound}
      role="switch"
      aria-checked={enabled}
      aria-label={enabled ? 'Silenciar sonidos' : 'Activar sonidos'}
      title={enabled ? 'Sonido activado' : 'Sonido silenciado'}
      className={cn('ed-icon-btn', className)}
    >
      {enabled ? (
        <Volume2 size={16} aria-hidden="true" />
      ) : (
        <VolumeX size={16} aria-hidden="true" />
      )}
    </button>
  );
}
