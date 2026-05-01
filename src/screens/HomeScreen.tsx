import { useEffect, useMemo, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowRight, BookOpen } from 'lucide-react';
import {
  Button,
  Logo,
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
    <main className="shell">
      {/* Topbar */}
      <header className="ed-topbar">
        <div className="ed-topbar-mark">
          <Logo variant="title" height={26} ariaHidden />
          <span style={{ color: 'var(--text-mute)' }}>·</span>
          <span
            style={{
              fontFamily: 'var(--font-mono)',
              fontSize: 11,
              letterSpacing: '0.18em',
              textTransform: 'uppercase',
              color: 'var(--text-mute)',
            }}
          >
            Vol. 1 · Edición ensayo
          </span>
        </div>
        <div className="ed-topbar-meta">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="ed-page-narrow" style={{ paddingTop: 'var(--s-12)' }}>
        {/* Masthead con logo grande */}
        <div className="ed-masthead">
          <span className="ed-masthead-volume">Vol. 1 · Núm. 47</span>
          <span className="ed-masthead-edition">Sunhaven · Ed. lobby</span>
          <Logo variant="full" width="min(560px, 80vw)" />
          <p
            className="ed-pull"
            style={{
              borderLeft: 0,
              padding: 0,
              textAlign: 'center',
              fontSize: 'var(--fs-22)',
              maxWidth: 38 + 'ch',
              margin: '8px auto 0',
              color: 'var(--text-soft)',
            }}
          >
            {TAGLINE}
          </p>
        </div>

        {/* Sección 01 — Nickname + acción */}
        <section className="ed-section">
          <div className="ed-kicker">
            <span className="ed-kicker-num">i</span>
            <span>Antes de la mano</span>
          </div>
          <h1 className="ed-section-title">
            Tu <em>nickname</em>, primero.
          </h1>
          <p className="ed-section-lead">
            Es el nombre que te identifica en la mesa. Lo cambiás cuando quieras
            — pero asegurate de que tus oponentes te reconozcan.
          </p>

          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'minmax(0, 1fr)',
              gap: 'var(--s-4)',
              maxWidth: 480,
            }}
          >
            <NicknameInput value={nickname} onChange={setNickname} autoFocus />

            <div style={{ display: 'flex', flexDirection: 'column', gap: 'var(--s-2)' }}>
              {nicknameValid ? (
                <Button
                  variant="primary"
                  size="lg"
                  fullWidth
                  loading={creating}
                  onClick={handleCreate}
                  rightIcon={ArrowRight}
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
        </section>

        {/* Sección 02 — Tutorial */}
        <section className="ed-section">
          <div className="ed-kicker">
            <span className="ed-kicker-num">ii</span>
            <span>Si es tu primera vez</span>
          </div>
          <h2 className="ed-section-title">
            Las reglas en <em>diez</em> secciones.
          </h2>
          <p className="ed-section-lead">
            Lee la guía: cómo funcionan los turnos, los cobros, las defensas, las
            Expansiones de Dominio y el Tiempo Extra.
          </p>
          <Button
            variant="ghost"
            leftIcon={BookOpen}
            rightIcon={ArrowRight}
            onClick={() => navigate('/tutorial')}
          >
            ¿Cómo se juega?
          </Button>
        </section>

        <div className="ed-rule-double" />

        <p
          style={{
            fontFamily: 'var(--font-mono)',
            fontSize: 10,
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
            color: 'var(--text-mute)',
            textAlign: 'center',
          }}
        >
          YAJUGÁ : DOMINIO — Edición de prensa, hot-seat y multijugador.
        </p>
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
      <div className="ed-field">
        <label htmlFor="join-code" className="ed-field-label">
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
          aria-invalid={raw.length > 0 && !valid}
          className="ed-input"
          style={{
            fontFamily: 'var(--font-display)',
            fontSize: 'var(--fs-22)',
            letterSpacing: '0.20em',
            textTransform: 'uppercase',
          }}
        />
        <p className="ed-caption" style={{ marginTop: 6 }}>
          {GAME_CODE_LENGTH} caracteres. Sin O, 0, I ni 1.
        </p>
      </div>
    </Modal>
  );
}
