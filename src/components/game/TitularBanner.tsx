import type { Card } from '@/types/game';
import { Bell } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

interface TitularBannerProps {
  titular: Card | null;
}

export function TitularBanner({ titular }: TitularBannerProps) {
  return (
    <AnimatePresence>
      {titular && (
        <motion.div
          key={titular.id}
          initial={{ opacity: 0, y: -8 }}
          animate={{ opacity: 1, y: 0 }}
          exit={{ opacity: 0, y: -8 }}
          transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
          className="rounded-8 border border-amber/40 bg-amber/10 px-3 py-2 flex items-center gap-2 text-amber"
          role="status"
          aria-live="polite"
        >
          <Bell size={14} />
          <span className="font-display text-13 font-semibold uppercase tracking-wider">
            Titular: {titular.name}
          </span>
          <span className="font-sans text-12 text-amber/80 truncate">
            {titular.description}
          </span>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
