import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button, Logo, SoundToggle, ThemeToggle } from '@/components/ui';

interface Section {
  title: string;
  body: string;
}

const SECTIONS: Section[] = [
  {
    title: 'Objetivo del juego',
    body: 'Sos el primero en completar 3 sets de propiedades en Sunhaven. Cada set son las propiedades del mismo color — la cantidad necesaria depende del color (placeholder).',
  },
  {
    title: 'Tu turno',
    body: 'Robás 2 cartas al inicio del turno y podés jugar hasta 3. Las cartas pueden ir a tus sets, a tu banco como dinero, o jugarse como acción (placeholder).',
  },
  {
    title: 'Tipos de cartas',
    body: 'Propiedades, dinero, acciones, comodines, rentas, edificios y torres. Cada tipo tiene reglas propias y la mayoría puede convertirse en dinero si la mandás al banco (placeholder).',
  },
  {
    title: 'Cobrar rentas',
    body: 'Cuando completás un set, podés cobrar renta a otros jugadores. El monto sube si agregás edificios al set. Quien recibe puede defenderse (placeholder).',
  },
  {
    title: 'Defensa',
    body: 'Si te atacan, tenés 8 segundos para elegir entre 3 respuestas: Bloquear (con carta de bloqueo), Negociar (proponer pago alternativo) o Contraatacar (devolver el efecto, placeholder).',
  },
  {
    title: 'Mercado',
    body: 'Hay 3 cartas siempre disponibles para comprar usando el dinero de tu banco. Comprar es una de tus acciones del turno (placeholder).',
  },
  {
    title: 'Titulares',
    body: 'Eventos globales que cambian las reglas durante una vuelta entera: subastas, auditorías, intercambios forzados, etc. (placeholder).',
  },
  {
    title: 'Roles y Expansiones',
    body: 'Cada jugador recibe un rol con habilidad pasiva y una Expansión cargable. Cuando el medidor llega al 100%, podés activar la Expansión y disparar un efecto firma (placeholder).',
  },
  {
    title: 'Tiempo Extra',
    body: 'Cuando alguien queda muy cerca de ganar, dispara una última vuelta. Todos los demás juegan un turno extra para intentar empatar o evitar la victoria (placeholder).',
  },
  {
    title: 'Final del juego',
    body: 'Gana el primer jugador que termina su turno con 3 sets completos. Si Tiempo Extra falla en evitar la victoria, hay ganador. Si alguien empata, se aplican criterios de desempate (placeholder).',
  },
];

export default function TutorialScreen() {
  const navigate = useNavigate();
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  return (
    <main className="shell">
      <header className="ed-topbar">
        <div className="ed-topbar-mark">
          <Link
            to="/"
            className="ed-btn ed-btn-ghost ed-btn-sm"
            style={{ textDecoration: 'none' }}
          >
            <ArrowLeft size={14} aria-hidden="true" />
            Inicio
          </Link>
          <Logo variant="title" height={20} ariaHidden />
          <span style={{ color: 'var(--text-mute)', fontFamily: 'var(--font-mono)', fontSize: 11, letterSpacing: '0.18em' }}>
            / cómo se juega
          </span>
        </div>
        <div className="ed-topbar-meta">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="ed-page-narrow">
        <div className="ed-masthead">
          <span className="ed-masthead-volume">Manual</span>
          <span className="ed-masthead-edition">Reglas v1</span>
          <h1 className="ed-section-title" style={{ fontSize: 'var(--fs-72)' }}>
            Cómo se <em>juega</em>.
          </h1>
          <p className="ed-section-lead" style={{ textAlign: 'center', margin: '0 auto' }}>
            Las reglas de YAJUGÁ : DOMINIO en diez secciones. La copy es{' '}
            <em>placeholder</em> hasta que se cierre la mecánica final — pero la
            estructura ya es la definitiva.
          </p>
        </div>

        <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column' }}>
          {SECTIONS.map((section, i) => (
            <li key={section.title}>
              <AccordionItem
                index={i}
                section={section}
                isOpen={openIndex === i}
                onToggle={() => setOpenIndex(openIndex === i ? null : i)}
              />
            </li>
          ))}
        </ul>

        <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 'var(--s-8)' }}>
          <Button onClick={() => navigate('/')} size="lg">
            Volver al inicio
          </Button>
        </div>
      </div>
    </main>
  );
}

interface AccordionItemProps {
  index: number;
  section: Section;
  isOpen: boolean;
  onToggle: () => void;
}

function AccordionItem({ index, section, isOpen, onToggle }: AccordionItemProps) {
  const headerId = `tutorial-section-${index}-header`;
  const panelId = `tutorial-section-${index}-panel`;

  return (
    <div
      data-open={isOpen || undefined}
      style={{ borderTop: '1.5px solid var(--rule)' }}
    >
      <h3 style={{ margin: 0 }}>
        <button
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          style={{
            display: 'flex',
            width: '100%',
            alignItems: 'center',
            justifyContent: 'space-between',
            textAlign: 'left',
            padding: 'var(--s-4) 0',
            background: 'transparent',
            border: 0,
            cursor: 'pointer',
            color: 'var(--text)',
          }}
        >
          <span style={{ display: 'inline-flex', alignItems: 'baseline', gap: 'var(--s-3)' }}>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontStyle: 'italic',
                color: 'var(--tomate)',
                fontSize: 'var(--fs-28)',
                lineHeight: 1,
              }}
            >
              {String(index + 1).padStart(2, '0')}
            </span>
            <span
              style={{
                fontFamily: 'var(--font-serif)',
                fontSize: 'var(--fs-22)',
                lineHeight: 1.2,
              }}
            >
              {section.title}
            </span>
          </span>
          <span
            style={{
              transition: 'transform 200ms var(--ease)',
              transform: isOpen ? 'rotate(180deg)' : 'rotate(0deg)',
              color: 'var(--text-mute)',
            }}
          >
            <ChevronDown size={18} aria-hidden="true" />
          </span>
        </button>
      </h3>
      {isOpen && (
        <div
          id={panelId}
          role="region"
          aria-labelledby={headerId}
          style={{
            paddingBottom: 'var(--s-5)',
            fontFamily: 'var(--font-text)',
            fontSize: 'var(--fs-16)',
            lineHeight: 1.6,
            color: 'var(--text-soft)',
            maxWidth: '64ch',
          }}
        >
          {section.body}
        </div>
      )}
    </div>
  );
}
