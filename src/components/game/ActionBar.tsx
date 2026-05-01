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
    <div className={cn('action-bar', className)}>
      <div className="action-bar-primary">
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
      <div className="action-bar-secondary">
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
