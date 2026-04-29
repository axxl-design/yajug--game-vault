import type { ChargeRule, Role, RoleId } from '@/types/game';

/**
 * Definiciones de los 6 roles. Las habilidades pasivas que aplican
 * en gameplay (e.g. condición de victoria del Coleccionista) se
 * implementan en `rules.ts` consultando estos datos cuando hace falta.
 *
 * La carga de medidor (chargeRule) está acá para que en Fase 9 (cuando
 * implementemos el sistema completo de Expansiones) ya tengamos los
 * triggers y montos cableados.
 */

interface RoleChargeMap {
  [key: string]: ChargeRule;
}

/** Trigger de carga del medidor por rol — sec 13 brief. */
export const ROLE_CHARGE_RULES: RoleChargeMap = {
  abogado: { trigger: 'attacked', amount: 25 },
  corredor: { trigger: 'rent_collected', amount: 20 },
  estafador: { trigger: 'card_discarded', amount: 15 },
  banquero: { trigger: 'money_received', amount: 10 },
  coleccionista: { trigger: 'property_added', amount: 20 },
  arquitecto: { trigger: 'building_played', amount: 33 },
};

export const ROLE_DEFINITIONS: Record<RoleId, Role> = {
  abogado: {
    id: 'abogado',
    name: 'Abogado',
    description: 'Maestro de las leyes y la inmunidad.',
    passiveAbility: 'Recibe +25% de carga cuando es atacado.',
    expansions: ['tribunal_dominio', 'inmunidad_diplomatica'],
    imageKey: 'role/abogado',
  },
  corredor: {
    id: 'corredor',
    name: 'Corredor',
    description: 'Especialista en mercados y subastas.',
    passiveAbility: 'Recibe +20% de carga cuando cobra renta.',
    expansions: ['subasta_siglo', 'pacto_comercial'],
    imageKey: 'role/corredor',
  },
  estafador: {
    id: 'estafador',
    name: 'Estafador',
    description: 'Engaño, suplantación, descarte forzado.',
    passiveAbility: 'Recibe +15% de carga cuando alguien descarta una carta.',
    expansions: ['el_truco', 'doble_identidad'],
    imageKey: 'role/estafador',
  },
  banquero: {
    id: 'banquero',
    name: 'Banquero',
    description: 'Domina el flujo de dinero y los préstamos.',
    passiveAbility: 'Recibe +10% de carga cuando otro recibe dinero.',
    expansions: ['auditoria_forzada', 'prestamo_forzado'],
    imageKey: 'role/banquero',
  },
  coleccionista: {
    id: 'coleccionista',
    name: 'Coleccionista',
    description: 'Coleccionar piezas vale tanto como completar sets.',
    passiveAbility:
      'Gana con 2 sets completos + 1 propiedad suelta (en lugar de 3 sets).',
    expansions: ['trueque_imperial', 'camara_archivo'],
    imageKey: 'role/coleccionista',
  },
  arquitecto: {
    id: 'arquitecto',
    name: 'Arquitecto',
    description: 'Construye monumentos y reordena la ciudad.',
    passiveAbility: 'Recibe +33% de carga cuando juega un Edificio o Torre.',
    expansions: ['rascacielos', 'reordenamiento_urbano'],
    imageKey: 'role/arquitecto',
  },
};

export const ALL_ROLE_IDS: RoleId[] = [
  'abogado',
  'corredor',
  'estafador',
  'banquero',
  'coleccionista',
  'arquitecto',
];
