import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Button,
  Modal,
  NicknameInput,
  SoundToggle,
  ThemeToggle,
  Tooltip,
  useToast,
} from '@/components/ui';
import { usePrefsStore } from '@/stores/prefsStore';
import {
  GAME_CODE_LENGTH,
  generateGameCode,
  isValidGameCode,
  normalizeGameCode,
} from '@/utils/gameCode';

const TAGLINE = 'Cada calle tiene dueño. Cada dueño tiene precio.';

export default function HomeScreen() {
  const navigate = useNavigate();
  const toast = useToast();
  const lastNickname = usePrefsStore((s) => s.lastNickname);
  const setLastNickname = usePrefsStore((s) => s.setLastNickname);

  const [nickname, setNickname] = useState(lastNickname);
  const [joinOpen, setJoinOpen] = useState(false);
  const [creating, setCreating] = useState(false);

  const trimmed = nickname.trim();
  const nicknameValid = trimmed.length > 0 && trimmed.length <= 20;

  const handleCreate = async () => {
    if (!nicknameValid) return;
    setLastNickname(trimmed);
    setCreating(true);
    await new Promise((r) => setTimeout(r, 500));
    const code = generateGameCode();
    sessionStorage.setItem(`mp_role_${code}`, 'host');
    navigate(`/game/${code}`);
  };

  const handleJoinSubmit = (code: string) => {
    if (!nicknameValid) return;
    setLastNickname(trimmed);
    setJoinOpen(false);
    sessionStorage.setItem(`mp_role_${code}`, 'client');
    navigate(`/game/${code}`);
  };

  return (
    <main className="relative" style={{ minHeight: '100vh' }}>
      <header className="absolute right-0 top-0 z-10 flex items-center">
        <SoundToggle />
        <ThemeToggle />
      </header>

      <div className="mx-auto flex flex-col items-center justify-center" style={{ minHeight: '100vh' }}>
        <Logo />

        <p>{TAGLINE}</p>

        <div className="flex w-full flex-col">
          <NicknameInput value={nickname} onChange={setNickname} autoFocus />

          <div className="flex w-full flex-col">
            {nicknameValid ? (
              <Button
                variant="primary"
                size="lg"
                fullWidth
                loading={creating}
                onClick={handleCreate}
              >
                Crear partida
              </Button>
            ) : (
              <Tooltip content="Necesitás un nickname para continuar.">
                <Button variant="primary" size="lg" fullWidth disabled>
                  Crear partida
                </Button>
              </Tooltip>
            )}

            {nicknameValid ? (
              <Button
                variant="secondary"
                size="lg"
                fullWidth
                onClick={() => setJoinOpen(true)}
              >
                Unirme a partida
              </Button>
            ) : (
              <Tooltip content="Necesitás un nickname para continuar.">
                <Button variant="secondary" size="lg" fullWidth disabled>
                  Unirme a partida
                </Button>
              </Tooltip>
            )}
          </div>
        </div>

        <button type="button" onClick={() => navigate('/tutorial')}>
          ¿Cómo se juega?
        </button>
      </div>

      <JoinModal
        open={joinOpen}
        onClose={() => setJoinOpen(false)}
        onSubmit={handleJoinSubmit}
        onInvalid={(reason) => toast.error(reason)}
      />
    </main>
  );
}

function Logo() {
  return (
    <div className="flex flex-col items-center">
      <h1>YAJUGÁ</h1>
      <span>DOMINIO</span>
    </div>
  );
}

interface JoinModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (code: string) => void;
  onInvalid: (reason: string) => void;
}

function JoinModal({ open, onClose, onSubmit, onInvalid }: JoinModalProps) {
  const [raw, setRaw] = useState('');
  const code = useMemo(() => normalizeGameCode(raw), [raw]);
  const valid = isValidGameCode(code);

  useEffect(() => {
    if (!open) setRaw('');
  }, [open]);

  const submit = () => {
    if (!valid) {
      onInvalid(`El código tiene que ser de ${GAME_CODE_LENGTH} caracteres válidos.`);
      return;
    }
    onSubmit(code);
  };

  return (
    <Modal
      open={open}
      onClose={onClose}
      title="Unirme a partida"
      size="sm"
      footer={
        <>
          <Button variant="ghost" onClick={onClose}>
            Cancelar
          </Button>
          <Button onClick={submit} disabled={!valid}>
            Unirme
          </Button>
        </>
      }
    >
      <div className="flex flex-col">
        <label htmlFor="join-code">Código de partida</label>
        <input
          id="join-code"
          type="text"
          value={code}
          onChange={(e) => setRaw(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === 'Enter' && valid) {
              e.preventDefault();
              submit();
            }
          }}
          autoFocus
          autoComplete="off"
          spellCheck={false}
          inputMode="text"
          maxLength={GAME_CODE_LENGTH}
          placeholder="K7P2RF"
          aria-invalid={raw.length > 0 && !valid}
        />
        <p>
          {GAME_CODE_LENGTH} caracteres. Sin O, 0, I ni 1 (para evitar confusiones al compartir).
        </p>
      </div>
    </Modal>
  );
}
