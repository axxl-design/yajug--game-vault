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
    <div className={cn('flex items-center justify-between gap-2 flex-wrap', className)}>
      <div className="flex items-center gap-2 flex-wrap">
        <Button
          variant="primary"
          leftIcon={FlagOff}
          onClick={onEndTurn}
          disabled={!isMyTurn}
        >
          Terminar turno
        </Button>
        <Button
          variant="ghost"
          leftIcon={Sparkles}
          onClick={onActivateExpansion}
          disabled={!canActivateExpansion || !isMyTurn}
          className={cn(canActivateExpansion && '!bg-violet/20 !border-violet text-violet hover:!bg-violet/30')}
        >
          Expansión {canActivateExpansion && <Crown size={12} className="ml-1" />}
        </Button>
      </div>
      <div className="flex items-center gap-2">
        <Button variant="ghost" leftIcon={ScrollText} onClick={onToggleLog}>
          Log
        </Button>
        <Button variant="ghost" leftIcon={HelpCircle} onClick={onHelp}>
          Ayuda
        </Button>
      </div>
    </div>
  );
}
