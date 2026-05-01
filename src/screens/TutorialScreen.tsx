import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { ArrowLeft, ChevronDown } from 'lucide-react';
import { Button, SoundToggle, ThemeToggle } from '@/components/ui';

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
    <main className="relative" style={{ minHeight: '100vh' }}>
      <header className="flex items-center justify-between">
        <Link to="/" className="inline-flex items-center">
          <ArrowLeft size={16} aria-hidden="true" />
          Volver al inicio
        </Link>
        <div>
          YAJUGÁ <span>/ Cómo se juega</span>
        </div>
        <div className="flex items-center">
          <SoundToggle />
          <ThemeToggle />
        </div>
      </header>

      <div className="mx-auto flex flex-col">
        <header className="flex flex-col">
          <h1>Cómo se juega</h1>
          <p>
            Las reglas de YAJUGÁ: DOMINIO en 10 secciones. La copy de cada
            sección es <em>placeholder</em> — se reemplaza cuando se cierre la
            mecánica final.
          </p>
        </header>

        <ul className="flex flex-col">
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
    <div data-open={isOpen || undefined}>
      <h3>
        <button
          id={headerId}
          type="button"
          aria-expanded={isOpen}
          aria-controls={panelId}
          onClick={onToggle}
          className="flex w-full items-center justify-between text-left"
        >
          <span className="flex items-center">
            <span>{String(index + 1).padStart(2, '0')}</span>
            <span>{section.title}</span>
          </span>
          <span>
            <ChevronDown size={18} aria-hidden="true" />
          </span>
        </button>
      </h3>
      {isOpen && (
        <div id={panelId} role="region" aria-labelledby={headerId}>
          {section.body}
        </div>
      )}
    </div>
  );
}
