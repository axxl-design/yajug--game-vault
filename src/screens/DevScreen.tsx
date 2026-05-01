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

export default function DevScreen() {
  const toast = useToast();
  const [modalOpen, setModalOpen] = useState(false);
  const [smallModalOpen, setSmallModalOpen] = useState(false);
  const lastNickname = usePrefsStore((s) => s.lastNickname);
  const setLastNickname = usePrefsStore((s) => s.setLastNickname);
  const [nickname, setNickname] = useState(lastNickname);

  return (
    <main style={{ minHeight: '100vh' }}>
      <header className="sticky top-0 z-10 flex items-center justify-between">
        <div className="flex items-center">
          <Link to="/">
            YAJUGÁ <span>/dev</span>
          </Link>
          <span>galería · fase 2</span>
        </div>
        <div className="flex items-center">
          <span>Modo</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex flex-col">
        <Section
          title="Button"
          description="4 variants × 5 estados. Hover / active / focus son interactivos — pasá el mouse, mantené pulsado o tabuleá para verlos."
        >
          <Grid>
            {(['primary', 'secondary', 'danger', 'ghost'] as const).map((variant) => (
              <Card key={variant} padding="md" className="flex flex-col">
                <h3>{variant}</h3>
                <div className="flex flex-wrap items-center">
                  <Button variant={variant}>Rest</Button>
                  <Button variant={variant} disabled>
                    Disabled
                  </Button>
                  <Button variant={variant} loading>
                    Loading
                  </Button>
                </div>
                <div className="flex flex-wrap items-center">
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
                <div className="flex flex-wrap items-center">
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
              <p>Fondo elev-1 + border. Uso por defecto en paneles.</p>
            </Card>
            <Card variant="elevated">
              <CardLabel>elevated</CardLabel>
              <p>Fondo elev-2 + border-strong + shadow-md. Para destacar.</p>
            </Card>
            <Card variant="surface">
              <CardLabel>surface</CardLabel>
              <p>Fondo `surface` (carbon en dark, white en light).</p>
            </Card>
          </Grid>
        </Section>

        <Section title="Modal" description="Abrible vía botón. Cerrable con click en overlay, tecla Esc o el botón X.">
          <div className="flex flex-wrap">
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
            <p>
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
            <p>Variante compacta sin footer.</p>
          </Modal>
        </Section>

        <Section title="Toast" description="Auto-dismiss 4s. Click para cerrar antes. Stack vertical (más nuevo arriba).">
          <div className="flex flex-wrap">
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
          <div className="flex flex-wrap items-center">
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
          <Card padding="lg" className="flex flex-col">
            <NicknameInput
              value={nickname}
              onChange={setNickname}
              onSubmitValid={(v) => {
                setLastNickname(v);
                toast.success(`Nickname guardado: ${v}`);
              }}
            />
            <div className="flex items-center justify-between">
              <span>
                Último guardado: <code>{lastNickname || '(ninguno)'}</code>
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
          <div className="flex items-center">
            <ThemeToggle />
            <span>theme = {usePrefsStore.getState().theme}</span>
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
    <section className="flex flex-col">
      <header className="flex flex-col">
        <h2>{title}</h2>
        {description && <p>{description}</p>}
      </header>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return <div className="grid md:grid-cols-2">{children}</div>;
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return <h3>{children}</h3>;
}
