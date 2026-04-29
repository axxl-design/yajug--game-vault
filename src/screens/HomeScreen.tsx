import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { motion, useReducedMotion } from 'framer-motion';
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
import { cn } from '@/utils/cn';

const TAGLINE = 'Cada calle tiene dueño. Cada dueño tiene precio.';
const TAGLINE_DURATION_MS = 1500;

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
    <main className="relative min-h-screen overflow-hidden bg-bg text-text">
      <header className="absolute right-6 top-6 z-10 flex items-center gap-2">
        <SoundToggle />
        <ThemeToggle />
      </header>

      <div className="mx-auto flex min-h-screen max-w-md flex-col items-center justify-center gap-10 px-6 py-16">
        <Logo />

        <p className="text-center font-sans text-15 text-text-muted leading-relaxed min-h-[3em]">
          <Typewriter text={TAGLINE} durationMs={TAGLINE_DURATION_MS} />
        </p>

        <div className="flex w-full flex-col gap-6">
          <NicknameInput value={nickname} onChange={setNickname} autoFocus />

          <div className="flex w-full flex-col gap-3">
            <StaggerItem delay={0.2}>
              {nicknameValid ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={creating}
                  onClick={handleCreate}
                  className="hover:scale-[1.02] !h-12 text-15 tracking-wide uppercase"
                >
                  Crear partida
                </Button>
              ) : (
                <Tooltip content="Necesitás un nickname para continuar.">
                  <Button
                    variant="primary"
                    size="lg"
                    fullWidth
                    disabled
                    className="!h-12 text-15 tracking-wide uppercase"
                  >
                    Crear partida
                  </Button>
                </Tooltip>
              )}
            </StaggerItem>

            <StaggerItem delay={0.3}>
              {nicknameValid ? (
                <Button
                  variant="secondary"
                  size="lg"
                  fullWidth
                  onClick={() => setJoinOpen(true)}
                  className="hover:scale-[1.02] !h-12 text-15 tracking-wide uppercase"
                >
                  Unirme a partida
                </Button>
              ) : (
                <Tooltip content="Necesitás un nickname para continuar.">
                  <Button
                    variant="secondary"
                    size="lg"
                    fullWidth
                    disabled
                    className="!h-12 text-15 tracking-wide uppercase"
                  >
                    Unirme a partida
                  </Button>
                </Tooltip>
              )}
            </StaggerItem>
          </div>
        </div>

        <button
          type="button"
          onClick={() => navigate('/tutorial')}
          className={cn(
            'font-sans text-14 text-text-muted underline-offset-4 hover:text-coral hover:underline',
            'transition-colors duration-fast ease-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-4 rounded-2',
          )}
        >
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

/* ------------------------------ Logo ------------------------------ */

function Logo() {
  const reduceMotion = useReducedMotion();
  return (
    <motion.div
      className="flex flex-col items-center gap-1 select-none"
      initial={{ opacity: 0, y: -8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: [0.16, 1, 0.3, 1] }}
    >
      <motion.h1
        className="font-display text-80 leading-none font-bold tracking-tight text-text"
        animate={
          reduceMotion ? undefined : { scale: [1, 1.02, 1] }
        }
        transition={
          reduceMotion
            ? undefined
            : { duration: 4, repeat: Infinity, ease: 'easeInOut' }
        }
      >
        YAJUGÁ
      </motion.h1>
      <span className="font-display text-20 font-medium tracking-[0.18em] text-coral">
        DOMINIO
      </span>
    </motion.div>
  );
}

/* ---------------------------- Typewriter -------------------------- */

function Typewriter({
  text,
  durationMs,
}: {
  text: string;
  durationMs: number;
}) {
  const reduceMotion = useReducedMotion();
  const [shown, setShown] = useState(reduceMotion ? text : '');

  useEffect(() => {
    if (reduceMotion) {
      setShown(text);
      return;
    }
    let raf = 0;
    const start = performance.now();
    const tick = (t: number) => {
      const elapsed = t - start;
      const p = Math.min(elapsed / durationMs, 1);
      const count = Math.floor(p * text.length);
      setShown(text.slice(0, count));
      if (p < 1) {
        raf = requestAnimationFrame(tick);
      } else {
        setShown(text);
      }
    };
    raf = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(raf);
  }, [text, durationMs, reduceMotion]);

  return <>{shown || ' '}</>;
}

/* --------------------------- StaggerItem -------------------------- */

function StaggerItem({
  delay,
  children,
}: {
  delay: number;
  children: React.ReactNode;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 8 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.32, ease: [0.16, 1, 0.3, 1], delay }}
    >
      {children}
    </motion.div>
  );
}

/* ---------------------------- JoinModal --------------------------- */

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

  // Reset al cerrar.
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
      <div className="flex flex-col gap-2">
        <label
          htmlFor="join-code"
          className="font-sans text-13 font-medium text-text-muted"
        >
          Código de partida
        </label>
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
          className={cn(
            'h-12 w-full rounded-6 px-4',
            'bg-bg-elev-2 border border-border focus:border-border-strong',
            'font-mono text-24 tracking-[0.3em] text-center uppercase text-text',
            'placeholder:text-text-subtle',
            'focus:outline-none focus-visible:ring-2 focus-visible:ring-amber focus-visible:ring-offset-2 focus-visible:ring-offset-bg-elev-1',
            'transition-colors duration-fast ease-out',
          )}
          aria-invalid={raw.length > 0 && !valid}
        />
        <p className="font-sans text-12 text-text-subtle">
          {GAME_CODE_LENGTH} caracteres. Sin O, 0, I ni 1 (para evitar confusiones al compartir).
        </p>
      </div>
    </Modal>
  );
}
