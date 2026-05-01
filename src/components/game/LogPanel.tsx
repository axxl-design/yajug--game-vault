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
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          maxHeight: '60vh',
          overflow: 'auto',
          gap: 0,
        }}
      >
        {log.length === 0 ? (
          <p className="ed-caption">Todavía no hay eventos.</p>
        ) : (
          [...log].reverse().map((entry, i) => (
            <div
              key={`${entry.timestamp}-${i}`}
              data-type={entry.type}
              style={{
                display: 'grid',
                gridTemplateColumns: '90px 1fr',
                gap: 'var(--s-3)',
                padding: '8px 0',
                borderTop: i === 0 ? 0 : '1px dotted var(--border)',
                fontFamily: 'var(--font-text)',
                fontSize: 13,
                lineHeight: 1.4,
              }}
            >
              <span
                style={{
                  fontFamily: 'var(--font-mono)',
                  fontSize: 10,
                  letterSpacing: '0.12em',
                  color: 'var(--text-mute)',
                  textTransform: 'uppercase',
                }}
              >
                #{entry.timestamp}
              </span>
              <span style={{ color: 'var(--text-soft)' }}>{entry.humanReadable}</span>
            </div>
          ))
        )}
      </div>
    </Modal>
  );
}
