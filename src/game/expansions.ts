import type { Expansion, ExpansionId } from '@/types/game';
import { ROLE_CHARGE_RULES } from './roles';

/**
 * Definiciones de las 12 Expansiones de Dominio.
 *
 * Phase 4 sólo expone los datos: efectos, costos de salida e interacciones
 * concretas se implementan en Phase 9 (sec 13 brief).
 */
export const EXPANSION_DEFINITIONS: Record<ExpansionId, Expansion> = {
  tribunal_dominio: {
    id: 'tribunal_dominio',
    roleId: 'abogado',
    name: 'Tribunal del Dominio',
    description:
      'El acusador descarta hasta 3 cartas; por cada una, el acusado entrega 1 propiedad / 2M / 1 carta al Abogado.',
    chargeCondition: 'Cada vez que el Abogado es atacado.',
    chargeRule: ROLE_CHARGE_RULES.abogado,
    effect: 'Tribunal — descarte forzado y entrega.',
    exitCost: 'Próximo turno: no puede jugar cartas de acción.',
    duration: 'instant',
  },
  inmunidad_diplomatica: {
    id: 'inmunidad_diplomatica',
    roleId: 'abogado',
    name: 'Inmunidad Diplomática',
    description:
      'Un jugador a elección queda inmune a Confiscación / Trato Sucio / Trueque / Factura / Renta dirigida.',
    chargeCondition: 'Cada vez que el Abogado es atacado.',
    chargeRule: ROLE_CHARGE_RULES.abogado,
    effect: 'Inmunidad por una ronda. 30% de las ganancias del protegido va al Abogado.',
    exitCost: 'Próximo turno: no puede atacar a nadie.',
    duration: 'one_round',
  },
  subasta_siglo: {
    id: 'subasta_siglo',
    roleId: 'corredor',
    name: 'Subasta del Siglo',
    description:
      'El Corredor pone 3 propiedades en subasta secreta. Asigna a discreción y se queda con todo el dinero pujado.',
    chargeCondition: 'Cada vez que el Corredor cobra renta.',
    chargeRule: ROLE_CHARGE_RULES.corredor,
    effect: 'Subasta secreta de 3 propiedades.',
    exitCost: 'Próximo turno: no puede cobrar rentas.',
    duration: 'instant',
  },
  pacto_comercial: {
    id: 'pacto_comercial',
    roleId: 'corredor',
    name: 'Pacto Comercial',
    description:
      'Sin ataques durante una ronda. Las rentas se duplican; el Corredor cobra 25% de cada una.',
    chargeCondition: 'Cada vez que el Corredor cobra renta.',
    chargeRule: ROLE_CHARGE_RULES.corredor,
    effect: 'Tregua + rentas dobles + 25% al Corredor.',
    exitCost: 'Ronda siguiente: nadie cobra rentas.',
    duration: 'one_round',
  },
  el_truco: {
    id: 'el_truco',
    roleId: 'estafador',
    name: 'El Truco',
    description:
      'El Estafador roba 1 propiedad de cada otro jugador, las mezcla con cartas-trampa, y los demás eligen a ciegas.',
    chargeCondition: 'Cada vez que se descarta una carta.',
    chargeRule: ROLE_CHARGE_RULES.estafador,
    effect: 'Trileo de propiedades con trampas.',
    exitCost: 'Próximo turno: la mano del Estafador es pública.',
    duration: 'instant',
  },
  doble_identidad: {
    id: 'doble_identidad',
    roleId: 'estafador',
    name: 'Doble Identidad',
    description:
      'Por una ronda, las acciones del Estafador se atribuyen a otro jugador en el log y notificaciones.',
    chargeCondition: 'Cada vez que se descarta una carta.',
    chargeRule: ROLE_CHARGE_RULES.estafador,
    effect: 'Suplantación de identidad por una ronda.',
    exitCost: 'Al expirar, todos descubren que era el Estafador.',
    duration: 'one_round',
  },
  auditoria_forzada: {
    id: 'auditoria_forzada',
    roleId: 'banquero',
    name: 'Auditoría Forzada',
    description:
      'Cada otro jugador entrega la mitad de su banco al Banquero. Todo el dinero entrante de la ronda se desvía al Banquero.',
    chargeCondition: 'Cada vez que el Banquero recibe dinero.',
    chargeRule: ROLE_CHARGE_RULES.banquero,
    effect: 'Confiscación bancaria + freeze de dinero.',
    exitCost: 'Ronda siguiente: el Banquero no puede cobrar rentas.',
    duration: 'one_round',
  },
  prestamo_forzado: {
    id: 'prestamo_forzado',
    roleId: 'banquero',
    name: 'Préstamo Forzado',
    description:
      'El Banquero presta 5M a cada otro jugador; cada uno le debe 10M. Sin pagar deuda no se puede ganar.',
    chargeCondition: 'Cada vez que el Banquero recibe dinero.',
    chargeRule: ROLE_CHARGE_RULES.banquero,
    effect: 'Deudas obligatorias para todos.',
    exitCost: 'El Banquero pierde 5M por turno hasta que todas las deudas se paguen.',
    duration: 'permanent',
  },
  trueque_imperial: {
    id: 'trueque_imperial',
    roleId: 'coleccionista',
    name: 'Trueque Imperial',
    description:
      'El Coleccionista intercambia 1 propiedad con cada otro jugador. Los oponentes no pueden rechazar.',
    chargeCondition: 'Cada vez que el Coleccionista agrega una propiedad.',
    chargeRule: ROLE_CHARGE_RULES.coleccionista,
    effect: 'Intercambio forzado simultáneo.',
    exitCost: 'Ronda siguiente: no puede atacar a nadie.',
    duration: 'instant',
  },
  camara_archivo: {
    id: 'camara_archivo',
    roleId: 'coleccionista',
    name: 'Cámara del Archivo',
    description:
      'Por una ronda, las propiedades del color elegido pasan al Coleccionista. La pieza original se queda permanentemente.',
    chargeCondition: 'Cada vez que el Coleccionista agrega una propiedad.',
    chargeRule: ROLE_CHARGE_RULES.coleccionista,
    effect: 'Apropiación temporal por color + 1 pieza permanente.',
    exitCost: 'Próximo turno: no puede recibir nuevas propiedades.',
    duration: 'one_round',
  },
  rascacielos: {
    id: 'rascacielos',
    roleId: 'arquitecto',
    name: 'Rascacielos',
    description:
      'Convierte un set propio en Set Monumento. Renta triple, inmune a robos directos, cuenta doble para victoria.',
    chargeCondition: 'Cada vez que el Arquitecto juega un Edificio o Torre.',
    chargeRule: ROLE_CHARGE_RULES.arquitecto,
    effect: 'Set Monumento permanente.',
    exitCost: 'No puede declarar más Monumentos. Ronda siguiente: no recibe cartas nuevas.',
    duration: 'permanent',
  },
  reordenamiento_urbano: {
    id: 'reordenamiento_urbano',
    roleId: 'arquitecto',
    name: 'Reordenamiento Urbano',
    description:
      'Por una ronda, el Arquitecto puede mover propiedades entre jugadores e intercambiar con el Mercado.',
    chargeCondition: 'Cada vez que el Arquitecto juega un Edificio o Torre.',
    chargeRule: ROLE_CHARGE_RULES.arquitecto,
    effect: 'Modo planificador urbano.',
    exitCost: 'Ronda siguiente: no puede modificar sus propios sets.',
    duration: 'one_round',
  },
};

export const ALL_EXPANSION_IDS: ExpansionId[] = Object.keys(
  EXPANSION_DEFINITIONS,
) as ExpansionId[];
