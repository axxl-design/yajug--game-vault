import { Button } from '@/components/ui';
import { Crown, FlagOff, HelpCircle, Sparkles, ScrollText } from 'lucide-react';
import { cn } from '@/utils/cn';

interface ActionBarProps {
  onEndTurn: () => void;
  onActivateExpansion: () => void;
  onToggleLog: () => void;
  onHelp: () => void;
  canActivateExpansion: boolean;
  isMyTurn: boolean;
  className?: string;
}

export function ActionBar({
  onEndTurn,
  onActivateExpansion,
  onToggleLog,
  onHelp,
  canActivateExpansion,
  isMyTurn,
  className,
}: ActionBarProps) {
  return (
    <div
      className={cn(className)}
      style={{
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 'var(--s-4)',
        flexWrap: 'wrap',
        padding: 'var(--s-4)',
        borderTop: '4px double var(--rule)',
        marginTop: 'var(--s-4)',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-3)', flexWrap: 'wrap' }}>
        <Button
          variant="primary"
          leftIcon={FlagOff}
          onClick={onEndTurn}
          disabled={!isMyTurn}
        >
          Terminar turno
        </Button>
        <Button
          variant={canActivateExpansion ? 'mostaza' : 'ghost'}
          leftIcon={Sparkles}
          onClick={onActivateExpansion}
          disabled={!canActivateExpansion || !isMyTurn}
          style={canActivateExpansion ? { borderColor: 'var(--violet)' } : undefined}
        >
          Expansión {canActivateExpansion && <Crown size={12} aria-hidden="true" />}
        </Button>
      </div>
      <div style={{ display: 'flex', alignItems: 'center', gap: 'var(--s-2)' }}>
        <Button variant="ghost" leftIcon={ScrollText} onClick={onToggleLog} size="sm">
          Log
        </Button>
        <Button variant="ghost" leftIcon={HelpCircle} onClick={onHelp} size="sm">
          Ayuda
        </Button>
      </div>
    </div>
  );
}
