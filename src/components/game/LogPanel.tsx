import type { GameLogEntry } from '@/types/game';
import { Modal } from '@/components/ui';

interface LogPanelProps {
  open: boolean;
  onClose: () => void;
  log: GameLogEntry[];
}

const TYPE_COLOR: Record<string, string> = {
  game_won: 'text-amber',
  defense_pending: 'text-coral',
  defense_blocked: 'text-amber',
  defense_countered: 'text-coral',
  rent_collected: 'text-amber',
  set_completed: 'text-amber',
  expansion_activated: 'text-violet',
  tiempo_extra_started: 'text-violet',
};

export function LogPanel({ open, onClose, log }: LogPanelProps) {
  return (
    <Modal open={open} onClose={onClose} title="Log de partida" size="lg">
      <div className="max-h-[60vh] overflow-auto flex flex-col gap-1 font-mono text-12">
        {[...log]
          .reverse()
          .map((entry, i) => (
            <div
              key={`${entry.timestamp}-${i}`}
              className={`flex gap-2 px-2 py-0.5 rounded-2 hover:bg-bg-elev-2 ${TYPE_COLOR[entry.type] ?? 'text-text'}`}
            >
              <span className="text-text-subtle w-12 shrink-0">#{entry.timestamp}</span>
              <span className="truncate">{entry.humanReadable}</span>
            </div>
          ))}
        {log.length === 0 && (
          <p className="font-sans text-text-muted italic text-center py-4">
            Todavía no hay eventos.
          </p>
        )}
      </div>
    </Modal>
  );
}
