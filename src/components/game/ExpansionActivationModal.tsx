import { useState } from 'react';
import { Modal, Button } from '@/components/ui';
import { Sparkles } from 'lucide-react';
import type { ExpansionInput, GameState, Player } from '@/types/game';
import { EXPANSION_DEFINITIONS } from '@/game/expansions';
import { ALL_COLORS } from './ALL_COLORS';

interface ExpansionActivationModalProps {
  open: boolean;
  state: GameState;
  player: Player;
  onActivate: (payload: ExpansionInput) => void;
  onClose: () => void;
}

export function ExpansionActivationModal({
  open,
  state,
  player,
  onActivate,
  onClose,
}: ExpansionActivationModalProps) {
  const def = EXPANSION_DEFINITIONS[player.expansion];
  const others = state.players.filter((p) => p.id !== player.id && p.isConnected);

  const [acusadoId, setAcusadoId] = useState<string>('');
  const [acusadorId, setAcusadorId] = useState<string>('');
  const [protectedId, setProtectedId] = useState<string>('');
  const [suplantadoId, setSuplantadoId] = useState<string>('');
  const [setColor, setSetColor] = useState<string>('');
  const [pieceOwnerId, setPieceOwnerId] = useState<string>('');
  const [pieceCardId, setPieceCardId] = useState<string>('');

  const trigger = () => {
    let payload: ExpansionInput | null = null;
    switch (player.expansion) {
      case 'tribunal_dominio':
        if (!acusadoId || !acusadorId) return;
        payload = { type: 'tribunal_dominio', acusadoId, acusadorId };
        break;
      case 'inmunidad_diplomatica':
        if (!protectedId) return;
        payload = { type: 'inmunidad_diplomatica', protectedId };
        break;
      case 'subasta_siglo':
        payload = { type: 'subasta_siglo', propertyIds: [], bids: {}, assignments: {} };
        break;
      case 'pacto_comercial':
        payload = { type: 'pacto_comercial' };
        break;
      case 'el_truco':
        payload = { type: 'el_truco' };
        break;
      case 'doble_identidad':
        if (!suplantadoId) return;
        payload = { type: 'doble_identidad', suplantadoId };
        break;
      case 'auditoria_forzada':
        payload = { type: 'auditoria_forzada' };
        break;
      case 'prestamo_forzado':
        payload = { type: 'prestamo_forzado' };
        break;
      case 'trueque_imperial':
        payload = { type: 'trueque_imperial', swaps: [] };
        break;
      case 'camara_archivo':
        if (!pieceOwnerId || !pieceCardId) return;
        payload = { type: 'camara_archivo', pieceOwnerId, pieceCardId };
        break;
      case 'rascacielos':
        if (!setColor) return;
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        payload = { type: 'rascacielos', setColor: setColor as any };
        break;
      case 'reordenamiento_urbano':
        payload = { type: 'reordenamiento_urbano' };
        break;
    }
    if (payload) onActivate(payload);
  };

  return (
    <Modal open={open} onClose={onClose} title={`Activar: ${def.name}`} size="md">
      <div className="flex flex-col">
        <div className="flex items-center">
          <Sparkles size={20} />
          <div className="flex flex-col">
            <span>{def.name}</span>
            <span>{def.description}</span>
          </div>
        </div>

        <div>
          <strong>Costo de salida:</strong> {def.exitCost}
        </div>

        {player.expansion === 'tribunal_dominio' && (
          <div className="flex flex-col">
            <label>Acusado:</label>
            <SelectPlayer players={others} value={acusadoId} onChange={setAcusadoId} />
            <label>Acusador:</label>
            <SelectPlayer
              players={others.filter((o) => o.id !== acusadoId)}
              value={acusadorId}
              onChange={setAcusadorId}
            />
          </div>
        )}

        {player.expansion === 'inmunidad_diplomatica' && (
          <div className="flex flex-col">
            <label>Proteger a:</label>
            <SelectPlayer
              players={[...others, player]}
              value={protectedId}
              onChange={setProtectedId}
            />
          </div>
        )}

        {player.expansion === 'doble_identidad' && (
          <div className="flex flex-col">
            <label>Suplantar a:</label>
            <SelectPlayer players={others} value={suplantadoId} onChange={setSuplantadoId} />
          </div>
        )}

        {player.expansion === 'rascacielos' && (
          <div className="flex flex-col">
            <label>Set Monumento:</label>
            <div className="flex flex-wrap">
              {player.sets
                .filter((s) => s.isComplete)
                .map((s) => (
                  <Button
                    key={s.color}
                    size="sm"
                    variant={setColor === s.color ? 'primary' : 'secondary'}
                    onClick={() => setSetColor(s.color)}
                  >
                    {s.color}
                  </Button>
                ))}
            </div>
          </div>
        )}

        {player.expansion === 'camara_archivo' && (
          <div className="flex flex-col">
            <label>Pieza (dueño / propiedad):</label>
            <SelectPlayer
              players={state.players}
              value={pieceOwnerId}
              onChange={setPieceOwnerId}
            />
            {pieceOwnerId && (
              <div className="flex flex-wrap">
                {(state.players.find((p) => p.id === pieceOwnerId)?.sets ?? [])
                  .flatMap((s) => s.properties)
                  .map((c) => (
                    <Button
                      key={c.id}
                      size="sm"
                      variant={pieceCardId === c.id ? 'primary' : 'secondary'}
                      onClick={() => setPieceCardId(c.id)}
                    >
                      {c.name}
                    </Button>
                  ))}
              </div>
            )}
          </div>
        )}

        {(player.expansion === 'subasta_siglo' ||
          player.expansion === 'el_truco' ||
          player.expansion === 'pacto_comercial' ||
          player.expansion === 'auditoria_forzada' ||
          player.expansion === 'prestamo_forzado' ||
          player.expansion === 'trueque_imperial' ||
          player.expansion === 'reordenamiento_urbano') && (
          <p>
            Activación simplificada para hot-seat. La UI completa (selecciones múltiples,
            pujas secretas) llega cuando entremos en multijugador real.
          </p>
        )}

        <span className="hidden">{ALL_COLORS.length}</span>

        <div className="flex justify-end">
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={trigger}>Activar Expansión</Button>
        </div>
      </div>
    </Modal>
  );
}

function SelectPlayer({
  players,
  value,
  onChange,
}: {
  players: Player[];
  value: string;
  onChange: (id: string) => void;
}) {
  return (
    <div className="flex flex-wrap">
      {players.map((p) => (
        <Button
          key={p.id}
          size="sm"
          variant={value === p.id ? 'primary' : 'secondary'}
          onClick={() => onChange(p.id)}
        >
          {p.nickname}
        </Button>
      ))}
    </div>
  );
}
