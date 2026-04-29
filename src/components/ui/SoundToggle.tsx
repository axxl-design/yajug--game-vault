import { AnimatePresence, motion } from 'framer-motion';
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
      className={cn(
        'relative inline-flex h-9 w-9 items-center justify-center',
        'rounded-full border border-border bg-bg-elev-1 text-text',
        'hover:bg-bg-elev-2 hover:border-border-strong',
        'transition-colors duration-fast ease-out',
        'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-2',
        className,
      )}
    >
      <AnimatePresence mode="wait" initial={false}>
        {enabled ? (
          <motion.span
            key="on"
            className="absolute inset-0 flex items-center justify-center"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <Volume2 size={18} aria-hidden="true" />
          </motion.span>
        ) : (
          <motion.span
            key="off"
            className="absolute inset-0 flex items-center justify-center text-text-muted"
            initial={{ opacity: 0, scale: 0.7 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.7 }}
            transition={{ duration: 0.18, ease: [0.16, 1, 0.3, 1] }}
          >
            <VolumeX size={18} aria-hidden="true" />
          </motion.span>
        )}
      </AnimatePresence>
    </button>
  );
}
