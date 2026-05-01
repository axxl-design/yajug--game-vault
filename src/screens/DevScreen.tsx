import { useState } from 'react';
import { Link } from 'react-router-dom';
import { ArrowRight, Info, Sparkles } from 'lucide-react';
import {
  Button,
  Card,
  Logo,
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
    <main className="shell">
      <header className="ed-topbar" style={{ position: 'sticky', top: 0, zIndex: 20 }}>
        <div className="ed-topbar-mark">
          <Link to="/" style={{ textDecoration: 'none', display: 'inline-flex', alignItems: 'center', gap: 8 }}>
            <Logo variant="title" height={20} ariaHidden />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em', color: 'var(--text-mute)' }}>
              /dev
            </span>
          </Link>
          <span style={{ fontFamily: 'var(--font-serif)', fontStyle: 'italic', color: 'var(--text-mute)', fontSize: 13 }}>
            galería · sistema visual
          </span>
        </div>
        <div className="ed-topbar-meta">
          <span>Modo</span>
          <ThemeToggle />
        </div>
      </header>

      <div className="ed-page">
        <Section
          title="Logo"
          description="El logo custom en sus tres variantes principales: completo, sólo título y favicon. Reemplaza cualquier wordmark anterior."
        >
          <Grid>
            <Card padding="lg" className="flex flex-col" style={{ gap: 12 }}>
              <CardLabel>Completo</CardLabel>
              <Logo variant="full" width={260} />
            </Card>
            <Card padding="lg" className="flex flex-col" style={{ gap: 12 }}>
              <CardLabel>Sólo título</CardLabel>
              <Logo variant="title" width={260} />
            </Card>
            <Card padding="lg" className="flex flex-col" style={{ gap: 12 }}>
              <CardLabel>Favicon</CardLabel>
              <Logo variant="mark" width={64} />
            </Card>
          </Grid>
        </Section>

        <Section
          title="Button"
          description="5 variants × 3 tamaños. Estilo letterpress: hover sube 1px, active sume al fondo, focus con outline tomate."
        >
          <Grid>
            {(['primary', 'secondary', 'mostaza', 'danger', 'ghost'] as const).map((variant) => (
              <Card key={variant} padding="md" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <h3 style={{ margin: 0, fontFamily: 'var(--font-serif)', fontStyle: 'italic' }}>{variant}</h3>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <Button variant={variant}>Rest</Button>
                  <Button variant={variant} disabled>Disabled</Button>
                  <Button variant={variant} loading>Loading</Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <Button variant={variant} size="sm">Small</Button>
                  <Button variant={variant} size="md">Medium</Button>
                  <Button variant={variant} size="lg">Large</Button>
                </div>
                <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8, alignItems: 'center' }}>
                  <Button variant={variant} leftIcon={Sparkles}>Con icono</Button>
                  <Button variant={variant} rightIcon={ArrowRight}>Continuar</Button>
                </div>
              </Card>
            ))}
          </Grid>
        </Section>

        <Section title="Card / Frame" description="Contenedor estructural editorial. Surface crema, borde tinta, padding ajustable.">
          <Grid>
            <Card variant="default">
              <CardLabel>default</CardLabel>
              <p style={{ margin: 0 }}>Fondo surface + border. Uso por defecto.</p>
            </Card>
            <Card variant="elevated">
              <CardLabel>elevated</CardLabel>
              <p style={{ margin: 0 }}>Mismo frame con sombra letterpress. Para destacar.</p>
            </Card>
            <Card variant="surface">
              <CardLabel>surface</CardLabel>
              <p style={{ margin: 0 }}>Fondo surface (por defecto el editorial usa el mismo).</p>
            </Card>
          </Grid>
        </Section>

        <Section title="Modal" description="Abrible vía botón. Cerrable con click en overlay, tecla Esc o el botón X.">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
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
            <p style={{ margin: 0 }}>
              Modal editorial — cabecera con título serif itálico, body en papel, footer con acción primaria a la derecha.
            </p>
          </Modal>

          <Modal
            open={smallModalOpen}
            onClose={() => setSmallModalOpen(false)}
            title="Modal small"
            size="sm"
          >
            <p style={{ margin: 0 }}>Variante compacta sin footer.</p>
          </Modal>
        </Section>

        <Section title="Toast" description="Auto-dismiss 4s. Click para cerrar antes. Stack vertical (más nuevo arriba).">
          <div style={{ display: 'flex', flexWrap: 'wrap', gap: 12 }}>
            <Button variant="ghost" onClick={() => toast.info('Conexión establecida.')}>Info</Button>
            <Button variant="primary" onClick={() => toast.success('Carta jugada con éxito.')}>Success</Button>
            <Button variant="mostaza" onClick={() => toast.warning('Quedan 8 segundos para defender.')}>Warning</Button>
            <Button variant="danger" onClick={() => toast.error('Movimiento ilegal: no podés jugar esa carta ahora.')}>Error</Button>
          </div>
        </Section>

        <Section title="Tooltip" description="Aparece al hover (>800ms) o al focus por teclado.">
          <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 12 }}>
            <Tooltip content="Tooltip arriba (default).">
              <Button variant="ghost" leftIcon={Info}>Hover top</Button>
            </Tooltip>
            <Tooltip side="bottom" content="Tooltip abajo.">
              <Button variant="ghost" leftIcon={Info}>Hover bottom</Button>
            </Tooltip>
            <Tooltip side="right" content="Tooltip a la derecha.">
              <Button variant="ghost" leftIcon={Info}>Hover right</Button>
            </Tooltip>
            <Tooltip side="left" content="Tooltip a la izquierda con texto un poquito más largo.">
              <Button variant="ghost" leftIcon={Info}>Hover left</Button>
            </Tooltip>
          </div>
        </Section>

        <Section title="NicknameInput" description="Validación: no vacío, máximo 20 caracteres. Persiste en prefsStore al confirmar (Enter).">
          <Card padding="lg" style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
            <NicknameInput
              value={nickname}
              onChange={setNickname}
              onSubmitValid={(v) => {
                setLastNickname(v);
                toast.success(`Nickname guardado: ${v}`);
              }}
            />
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', flexWrap: 'wrap', gap: 12 }}>
              <span className="ed-caption">
                Último guardado: <code style={{ fontFamily: 'var(--font-mono)' }}>{lastNickname || '(ninguno)'}</code>
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

        <Section title="ThemeToggle" description="Sun/Moon. Persistido en prefsStore via middleware persist.">
          <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
            <ThemeToggle />
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--text-mute)' }}>
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
    <section className="ed-section">
      <header style={{ display: 'flex', flexDirection: 'column', gap: 6, marginBottom: 'var(--s-5)' }}>
        <h2 className="ed-section-title" style={{ fontSize: 'var(--fs-32)' }}>
          {title}
        </h2>
        {description && (
          <p className="ed-section-lead" style={{ fontSize: 'var(--fs-15)', margin: 0 }}>
            {description}
          </p>
        )}
      </header>
      {children}
    </section>
  );
}

function Grid({ children }: { children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
        gap: 'var(--s-4)',
      }}
    >
      {children}
    </div>
  );
}

function CardLabel({ children }: { children: React.ReactNode }) {
  return (
    <h3
      style={{
        margin: 0,
        fontFamily: 'var(--font-mono)',
        fontSize: 11,
        letterSpacing: '0.20em',
        textTransform: 'uppercase',
        color: 'var(--tomate)',
      }}
    >
      {children}
    </h3>
  );
}
