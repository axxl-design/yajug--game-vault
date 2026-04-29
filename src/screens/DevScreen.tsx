import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, Sparkles } from 'lucide-react';
import {
  Button,
  Card,
  Modal,
  NicknameInput,
  ThemeToggle,
  Tooltip,
  useToast,
} from '@/components/ui';
import { usePrefsStore } from '@/stores/prefsStore';

/**
 * Galería interna de componentes UI.
 * Solo accesible en desarrollo (la ruta se monta condicional a import.meta.env.DEV).
 */
export default function DevScreen() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [smallModalOpen, setSmallModalOpen] = useState(false);
  const lastNickname = usePrefsStore((s) => s.lastNickname);
  const setLastNickname = usePrefsStore((s) => s.setLastNickname);
  const [nickname, setNickname] = useState(lastNickname);

  return (
    <main className="min-h-screen bg-bg text-text">
      <header className="sticky top-0 z-10 flex items-center justify-between gap-4 border-b border-divider bg-bg/85 backdrop-blur px-6 py-4">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="font-display text-20 font-bold tracking-tight hover:text-coral transition-colors"
          >
            YAJUGÁ <span className="text-text-muted">/dev</span>
          </Link>
          <span className="rounded-full border border-border-strong px-2 py-0.5 font-mono text-12 text-text-muted">
            galería · fase 2
          </span>
        </div>
        <div className="flex items-center gap-3">
          <span className="font-sans text-13 text-text-muted">Modo</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto max-w-5xl px-6 py-10 flex flex-col gap-12">
        <Section
          title="Button"
          description="4 variants × 5 estados. Hover / active / focus son interactivos — pasá el mouse, mantené pulsado o tabuleá para verlos."
        >
          <Grid>
            {(['primary', 'secondary', 'danger', 'ghost'] as const).map((variant) => (
              <Card key={variant} padding="md" className="flex flex-col gap-3">
                <h3 className="font-display text-14 font-semibold uppercase tracking-wider text-text-muted">
                  {variant}
                </h3>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant={variant}>Rest</Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                  <Button variant={variant} loading>
                    Loading
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant={variant} size="sm">
                    Small
                  </Button>
                  <Button variant={variant} size="md">
                    Medium
                  </Button>
                  <Button variant={variant} size="lg">
                    Large
                  </Button>
                </div>
                <div className="flex flex-wrap items-center gap-2">
                  <Button variant={variant} leftIcon={Sparkles}>
                    Con icono
                  </Button>
                  <Button variant={variant} rightIcon={ArrowRight}>
                    Continuar
                  </Button>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section title="Card" description="Contenedor de UI estructural — radius 8px, no confundir con cartas del juego.">
          <Grid>
            <Card variant="default">
              <CardLabel>default</CardLabel>
              <p className="font-sans text-14 text-text-muted">
                Fondo elev-1 + border. Uso por defecto en paneles.
              </p>
            </Card>
            <Card variant="elevated">
              <CardLabel>elevated</CardLabel>
              <p className="font-sans text-14 text-text-muted">
                Fondo elev-2 + border-strong + shadow-md. Para destacar.
              </p>
            </Card>
            <Card variant="surface">
              <CardLabel>surface</CardLabel>
              <p className="font-sans text-14 text-text-muted">
                Fondo `surface` (carbon en dark, white en light).
              </p>
            </Card>
          </Grid>
        </Section>

        <Section title="Modal" description="Abrible vía botón. Cerrable con click en overlay, tecla Esc o el botón X.">
          <div className="flex flex-wrap gap-3">
            <Button onClick={() => setModalOpen(true)}>Abrir modal medium</Button>
            <Button variant="secondary" onClick={() => setSmallModalOpen(true)}>
              Abrir modal small
            </Button>
          </div>

          <Modal
            open={modalOpen}
            onClose={() => setModalOpen(false)}
            title="Confirmar acción"
            footer={
              <>
                <Button variant="ghost" onClick={() => setModalOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={() => {
                    setModalOpen(false);
                    toast.success('Acción confirmada.');
                  }}
                >
                  Confirmar
                </Button>
              </>
            }
          >
            <p className="font-sans text-15 text-text leading-relaxed">
              Este es el contenido del modal. La animación de entrada es bouncy 250ms,
              la de salida es ease-in 150ms. El overlay tiene un blur sutil y se
              cierra con click fuera del cuadro.
            </p>
          </Modal>

          <Modal
            open={smallModalOpen}
            onClose={() => setSmallModalOpen(false)}
            title="Modal small"
            size="sm"
          >
            <p className="font-sans text-14 text-text-muted">
              Variante compacta sin footer.
            </p>
          </Modal>
        </Section>

        <Section title="Toast" description="Auto-dismiss 4s. Click para cerrar antes. Stack vertical (más nuevo arriba).">
          <div className="flex flex-wrap gap-3">
            <Button variant="ghost" onClick={() => toast.info('Conexión establecida.')}>
              Info
            </Button>
            <Button onClick={() => toast.success('Carta jugada con éxito.')}>
              Success
            </Button>
            <Button
              variant="secondary"
              onClick={() => toast.warning('Quedan 8 segundos para defender.')}
            >
              Warning
            </Button>
            <Button
              variant="danger"
              onClick={() => toast.error('Movimiento ilegal: no podés jugar esa carta ahora.')}
            >
              Error
            </Button>
          </div>
        </Section>

        <Section title="Tooltip" description="Aparece al hover (>800ms) o al focus por teclado. Smart positioning con flip si toca el borde.">
          <div className="flex flex-wrap items-center gap-6">
            <Tooltip content="Tooltip arriba (default).">
              <Button variant="ghost" leftIcon={Info}>
                Hover top
              </Button>
            </Tooltip>
            <Tooltip side="bottom" content="Tooltip abajo.">
              <Button variant="ghost" leftIcon={Info}>
                Hover bottom
              </Button>
            </Tooltip>
            <Tooltip side="right" content="Tooltip a la derecha.">
              <Button variant="ghost" leftIcon={Info}>
                Hover right
              </Button>
            </Tooltip>
            <Tooltip side="left" content="Tooltip a la izquierda con un texto un poquito más largo para probar el wrap.">
              <Button variant="ghost" leftIcon={Info}>
                Hover left
              </Button>
            </Tooltip>
          </div>
        </Section>

        <Section title="NicknameInput" description="Validación: no vacío, máximo 20 caracteres. Persiste en prefsStore al confirmar (Enter).">
          <Card padding="lg" className="max-w-md flex flex-col gap-4">
            <NicknameInput
              value={nickname}
              onChange={setNickname}
              onSubmitValid={(v) => {
                setLastNickname(v);
                toast.success(`Nickname guardado: ${v}`);
              }}
            />
            <div className="flex items-center justify-between text-13 text-text-muted">
              <span>
                Último guardado:{' '}
                <code className="font-mono text-text">
                  {lastNickname || '(ninguno)'}
                </code>
              </span>
              <Button
                size="sm"
                disabled={!nickname.trim()}
                onClick={() => {
                  setLastNickname(nickname.trim());
                  toast.success(`Nickname guardado: ${nickname.trim()}`);
                }}
              >
                Guardar
              </Button>
            </div>
          </Card>
        </Section>

        <Section title="ThemeToggle" description="Sun/Moon de Lucide con cross-fade. Persistido en prefsStore via middleware persist.">
          <div className="flex items-center gap-3">
            <ThemeToggle />
            <span className="font-mono text-13 text-text-muted">
              theme = {usePrefsStore.getState().theme}
            </span>
          </div>
        </Section>
      </div>
    </main>
  );
}

function Section({
  title,
  description,
  children,
}: {
  title: string;
  description?: string;
  children: React.ReactNode;
}) {
  return (
    <section className="flex flex-col gap-4">
      <header className="flex flex-col gap-1">
        <h2 className="font-display text-24 font-semibold tracking-tight">{title}</h2>
        {description && (
          <p className="font-sans text-14 text-text-muted max-w-2xl leading-snug">
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid gap-4 md:grid-cols-2">{children}</div>;
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3 className="font-display text-14 font-semibold uppercase tracking-wider text-text-muted mb-2">
      {children}
    </h3>
  );
}
