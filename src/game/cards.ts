import type {
  ActionCardName,
  Card,
  CardColor,
  CardType,
} from '@/types/game';
import type { IdFactory } from './ids';
import {
  ACTION_VALUES,
  PROPERTY_VALUES,
  RENT_MULTICOLOR_VALUE,
  RENT_PAIR_VALUE,
  WILDCARD_PAIR_VALUE,
  WILDCARD_UNIVERSAL_VALUE,
} from './constants';

/* ------------------------- Predicates ------------------------- */

export const isProperty = (c: Card): boolean => c.type === 'property';
export const isMoney = (c: Card): boolean => c.type === 'money';
export const isAction = (c: Card): boolean => c.type === 'action';
export const isRent = (c: Card): boolean => c.type === 'rent';
export const isBuilding = (c: Card): boolean => c.type === 'building';
export const isWildcard = (c: Card): boolean => c.type === 'wildcard';
export const isTitular = (c: Card): boolean => c.type === 'event';

/** Acciones que disparan Defense (Phase 7). En Phase 4 se aplican directo
 *  pero se deja log entry para que la UI futura pueda mostrar el flow. */
const ATTACK_ACTIONS = new Set<ActionCardName>([
  'confiscacion',
  'trato_sucio',
  'trueque_forzado',
  'factura',
  'cuota',
]);

export function isAttackAction(c: Card): boolean {
  if (c.type === 'action' && c.actionName) {
    return ATTACK_ACTIONS.has(c.actionName);
  }
  return c.type === 'rent';
}

/** Wildcard universal = el comodín multicolor "cualquier color". */
export function isUniversalWildcard(c: Card): boolean {
  return isWildcard(c) && (!c.colors || c.colors.length === 0);
}

/** Determina si un wildcard puede asignarse a un color dado. */
export function wildcardAcceptsColor(c: Card, color: CardColor): boolean {
  if (!isWildcard(c)) return false;
  if (color === 'comodin') return false;
  if (isUniversalWildcard(c)) return true;
  return (c.colors ?? []).includes(color);
}

/** Determina si una carta de renta aplica a un color dado. */
export function rentAppliesToColor(c: Card, color: CardColor): boolean {
  if (!isRent(c)) return false;
  if (color === 'comodin') return false;
  // Multicolor rent (colors vacío) aplica a cualquiera.
  if (!c.colors || c.colors.length === 0) return true;
  return c.colors.includes(color);
}

/* -------------------------- Factories -------------------------- */

export function createPropertyCard(color: CardColor, ids: IdFactory, suffix?: string): Card {
  const name = `Propiedad ${color}${suffix ? ` ${suffix}` : ''}`;
  return {
    id: ids.next(),
    type: 'property',
    name,
    value: PROPERTY_VALUES[color],
    color,
    imageKey: `property/${color}/${suffix ?? '1'}`,
  };
}

export function createWildcardCard(colors: CardColor[], ids: IdFactory): Card {
  const isUniversal = colors.length === 0;
  return {
    id: ids.next(),
    type: 'wildcard',
    name: isUniversal ? 'Comodín Universal' : `Comodín ${colors.join('/')}`,
    value: isUniversal ? WILDCARD_UNIVERSAL_VALUE : WILDCARD_PAIR_VALUE,
    colors,
    imageKey: `wildcard/${isUniversal ? 'universal' : colors.join('-')}`,
  };
}

export function createMoneyCard(value: number, ids: IdFactory): Card {
  return {
    id: ids.next(),
    type: 'money',
    name: `Dinero $${value}M`,
    value,
    imageKey: `money/${value}`,
  };
}

export function createActionCard(name: ActionCardName, ids: IdFactory): Card {
  // Edificio y Torre técnicamente son `type: 'building'` aunque comparten
  // el espacio de nombre con acciones (sec 5 brief).
  const type: CardType = name === 'edificio' || name === 'torre' ? 'building' : 'action';
  const display: Record<ActionCardName, string> = {
    bloqueo: 'Bloqueo',
    confiscacion: 'Confiscación',
    trato_sucio: 'Trato Sucio',
    trueque_forzado: 'Trueque Forzado',
    factura: 'Factura',
    cuota: 'Cuota',
    movida_extra: 'Movida Extra',
    sobrecargo: 'Sobrecargo',
    edificio: 'Edificio',
    torre: 'Torre',
  };
  return {
    id: ids.next(),
    type,
    name: display[name],
    value: ACTION_VALUES[name],
    actionName: name,
    imageKey: `action/${name}`,
  };
}

export function createRentCard(colors: CardColor[], ids: IdFactory): Card {
  const isMulticolor = colors.length === 0;
  return {
    id: ids.next(),
    type: 'rent',
    name: isMulticolor ? 'Renta Multicolor' : `Renta ${colors.join('/')}`,
    value: isMulticolor ? RENT_MULTICOLOR_VALUE : RENT_PAIR_VALUE,
    colors,
    imageKey: `rent/${isMulticolor ? 'multicolor' : colors.join('-')}`,
  };
}

export function createTitularCard(
  key: string,
  name: string,
  description: string,
  ids: IdFactory,
): Card {
  return {
    id: ids.next(),
    type: 'event',
    name,
    description,
    value: 0,
    imageKey: `titular/${key}`,
  };
}
