import type { GameLogEntry } from '@/types/game';
import { Modal } from '@/components/ui';

interface LogPanelProps {
  open: boolean;
  onClose: () => void;
  log: GameLogEntry[];
}

export function LogPanel({ open, onClose, log }: LogPanelProps) {
  return (
    <Modal open={open} onClose={onClose} title="Log de partida" size="lg">
      <div className="flex flex-col" style={{ maxHeight: '60vh', overflow: 'auto' }}>
        {[...log]
          .reverse()
          .map((entry, i) => (
            <div key={`${entry.timestamp}-${i}`} data-type={entry.type} className="flex">
              <span>#{entry.timestamp}</span>
              <span>{entry.humanReadable}</span>
            </div>
          ))}
        {log.length === 0 && <p>Todavía no hay eventos.</p>}
      </div>
    </Modal>
  );
}
