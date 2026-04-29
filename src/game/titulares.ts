/**
 * Titulares — sec 12 brief. 8 cartas, mazo separado.
 *
 * En Fase 4 sólo definimos las cartas como datos. Los efectos
 * (rent_modifier, rent_canceled, etc.) se implementan en Fase 8.
 * Las cartas existen para que el deck builder pueda construir el
 * `titularDeck` de la partida.
 */
export interface TitularDefinition {
  key: string;
  name: string;
  description: string;
}

export const TITULAR_DEFINITIONS: ReadonlyArray<TitularDefinition> = [
  {
    key: 'boom_inmobiliario',
    name: 'Boom Inmobiliario',
    description: 'Todas las rentas valen +1M esta ronda.',
  },
  {
    key: 'recesion',
    name: 'Recesión',
    description: 'Las rentas se cancelan esta ronda.',
  },
  {
    key: 'auditoria',
    name: 'Auditoría',
    description: 'Todos muestran sus manos esta ronda.',
  },
  {
    key: 'especulacion_salvaje',
    name: 'Especulación Salvaje',
    description: 'Las rentas se duplican esta ronda.',
  },
  {
    key: 'crisis_bancaria',
    name: 'Crisis Bancaria',
    description: 'Cada jugador descarta 1M del banco.',
  },
  {
    key: 'reforma_urbana',
    name: 'Reforma Urbana',
    description: 'Cada jugador puede mover 1 propiedad entre sets esta ronda.',
  },
  {
    key: 'filtracion',
    name: 'Filtración',
    description: 'Cada jugador muestra 2 cartas a su izquierda.',
  },
  {
    key: 'noche_de_gala',
    name: 'Noche de Gala',
    description: 'Todos roban 2 cartas extra esta ronda.',
  },
];
