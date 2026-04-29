import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { AnimatePresence, motion } from 'framer-motion';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button, SoundToggle, ThemeToggle } from '@/components/ui';
import { cn } from '@/utils/cn';

interface Section {
  title: string;
  body: string;
}

/**
 * Contenido placeholder de Fase 3 — la copy real se escribe en Fase 8/9
 * cuando ya tengamos las cartas y mecánicas implementadas.
 */
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
    <main className="relative min-h-screen bg-bg text-text">
      <header className="flex items-center justify-between gap-4 border-b border-divider px-6 py-4">
        <Link
          to="/"
          className={cn(
            'inline-flex items-center gap-2 text-13 text-text-muted',
            'hover:text-text transition-colors duration-fast ease-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-4 rounded-2',
          )}
        >
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al inicio
        </Link>
        <div className="font-display text-16 font-bold tracking-tight">
          YAJUGÁ <span className="text-text-muted font-medium">/ Cómo se juega</span>
        </div>
        <div className="flex items-center gap-2">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex max-w-2xl flex-col gap-8 px-6 py-12">
        <header className="flex flex-col gap-2">
          <h1 className="font-display text-40 font-bold tracking-tight leading-tight">
            Cómo se juega
          </h1>
          <p className="font-sans text-15 text-text-muted leading-relaxed">
            Las reglas de YAJUGÁ: DOMINIO en 10 secciones. La copy de cada
            sección es <em>placeholder</em> — se reemplaza cuando se cierre la
            mecánica final.
          </p>
        </header>

        <ul className="flex flex-col gap-2">
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

        <div className="flex justify-end">
          <Button onClick={() => navigate('/')}>Volver al inicio</Button>
        </div>
      </div>
    </main>
  );
}

/* ---------------------------- AccordionItem --------------------------- */

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
      className={cn(
        'overflow-hidden rounded-8 border border-border bg-bg-elev-1',
        'transition-colors duration-fast ease-out',
        isOpen && 'border-border-strong',
      )}
    >
      <h3>
        <button
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className={cn(
            'flex w-full items-center justify-between gap-4 px-5 py-4',
            'text-left font-display text-16 font-semibold tracking-tight text-text',
            'hover:bg-bg-elev-2 transition-colors duration-fast ease-out',
            'focus-visible:outline focus-visible:outline-2 focus-visible:outline-amber focus-visible:outline-offset-[-2px]',
          )}
        >
          <span className="flex items-center gap-3">
            <span className="font-mono text-13 text-text-muted">
              {String(index + 1).padStart(2, '0')}
            </span>
            <span>{section.title}</span>
          </span>
          <motion.span
            animate={{ rotate: isOpen ? 180 : 0 }}
            transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            className="text-text-muted"
          >
            <ChevronDown size={18} aria-hidden="true" />
          </motion.span>
        </button>
      </h3>
      <AnimatePresence initial={false}>
        {isOpen && (
          <motion.div
            id={panelId}
            role="region"
            aria-labelledby={headerId}
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
            style={{ overflow: 'hidden' }}
          >
            <div className="border-t border-divider px-5 py-4 font-sans text-14 text-text-muted leading-relaxed">
              {section.body}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}
