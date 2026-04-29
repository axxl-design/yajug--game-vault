import type {
  Card,
  CardColor,
  GameState,
  PaymentDetail,
  Player,
  PropertySet,
} from '@/types/game';
import {
  GAME_CONFIG,
  PROPERTY_RENT_VALUES,
  PROPERTY_REQUIREMENTS,
} from './constants';
import {
  isAttackAction,
  isBuilding,
  isProperty,
  isRent,
  isWildcard,
  wildcardAcceptsColor,
} from './cards';

/* ------------------------------ Players ----------------------------- */

export function getPlayerById(state: GameState, id: string): Player | undefined {
  return state.players.find((p) => p.id === id);
}

export function getCurrentPlayer(state: GameState): Player {
  const p = state.players[state.currentPlayerIndex];
  if (!p) throw new Error(`No hay jugador en index ${state.currentPlayerIndex}`);
  return p;
}

export function isPlayerTurn(state: GameState, playerId: string): boolean {
  return state.players[state.currentPlayerIndex]?.id === playerId;
}

export function canPlayMoreCards(player: Player): boolean {
  return player.hasPlayedCardsThisTurn < GAME_CONFIG.MAX_PLAYS_PER_TURN;
}

/* ------------------------------ Cards ------------------------------- */

export function findCardInHand(player: Player, cardId: string): Card | undefined {
  return player.hand.find((c) => c.id === cardId);
}

export function findCardInBank(player: Player, cardId: string): Card | undefined {
  return player.bank.find((c) => c.id === cardId);
}

/** Retorna el set + index donde vive una propiedad/wildcard del jugador, o null. */
export function findCardInSets(
  player: Player,
  cardId: string,
): { setIndex: number; cardIndex: number } | null {
  for (let i = 0; i < player.sets.length; i++) {
    const s = player.sets[i];
    const idx = s.properties.findIndex((c) => c.id === cardId);
    if (idx >= 0) return { setIndex: i, cardIndex: idx };
  }
  return null;
}

/* ------------------------------ Sets ------------------------------- */

export function isSetCompleteByCount(color: CardColor, count: number): boolean {
  const required = PROPERTY_REQUIREMENTS[color] ?? 0;
  return required > 0 && count >= required;
}

export function recomputeSetCompleteness(set: PropertySet): PropertySet {
  return {
    ...set,
    isComplete: isSetCompleteByCount(set.color, set.properties.length),
  };
}

/** Cuántos colores DISTINTOS tiene el jugador con al menos un set completo. */
export function distinctCompletedSetColors(player: Player): CardColor[] {
  const out = new Set<CardColor>();
  for (const s of player.sets) {
    if (s.isComplete) out.add(s.color);
  }
  return Array.from(out);
}

export function hasStrayProperty(player: Player): boolean {
  for (const s of player.sets) {
    if (!s.isComplete && s.properties.length > 0) return true;
  }
  return false;
}

export function getStrayProperties(player: Player): Card[] {
  const out: Card[] = [];
  for (const s of player.sets) {
    if (!s.isComplete) out.push(...s.properties);
  }
  return out;
}

export function getCompletedSetProperties(player: Player): Card[] {
  const out: Card[] = [];
  for (const s of player.sets) {
    if (s.isComplete) out.push(...s.properties);
  }
  return out;
}

/* ----------------------------- Victoria ----------------------------- */

/**
 * Checkea condición de victoria. Coleccionista = 2 sets completos + ≥1
 * propiedad suelta. Resto = 3 sets completos.
 *
 * Phase 9 va a sumar la regla del Set Monumento (cuenta como 2 sets).
 */
export function checkVictoryCondition(player: Player): boolean {
  const completed = distinctCompletedSetColors(player);
  if (player.role === 'coleccionista') {
    return (
      completed.length >= GAME_CONFIG.COLECCIONISTA_SETS_NEEDED &&
      hasStrayProperty(player)
    );
  }
  return completed.length >= GAME_CONFIG.SETS_NEEDED_TO_WIN;
}

/* ------------------------------ Renta ------------------------------ */

export function calculateBaseRent(setColor: CardColor, propertyCount: number): number {
  const values = PROPERTY_RENT_VALUES[setColor];
  if (!values || values.length === 0 || propertyCount <= 0) return 0;
  const idx = Math.min(propertyCount - 1, values.length - 1);
  return values[idx];
}

export function calculateSetRent(set: PropertySet): number {
  let total = calculateBaseRent(set.color, set.properties.length);
  for (const b of set.buildings) {
    if (b.actionName === 'edificio') total += GAME_CONFIG.EDIFICIO_RENT_BONUS;
    else if (b.actionName === 'torre') total += GAME_CONFIG.TORRE_RENT_BONUS;
  }
  return total;
}

/* ------------------------------ Banco ------------------------------ */

export function getBankTotal(player: Player): number {
  return player.bank.reduce((sum, c) => sum + c.value, 0);
}

/**
 * Default payment policy: cubre `amount` con cartas del banco (lowest
 * first) → propiedades sueltas (lowest first) → propiedades de set
 * completo (lowest first, rompe sets). Si no llega, paga lo que tenga.
 */
export function computeDefaultPayment(payer: Player, amount: number): PaymentDetail[] {
  if (amount <= 0) return [];
  const out: PaymentDetail[] = [];
  let remaining = amount;

  const tryFrom = (cards: Card[], fromBank: boolean) => {
    const sorted = [...cards].sort((a, b) => a.value - b.value || a.id.localeCompare(b.id));
    for (const c of sorted) {
      if (remaining <= 0) break;
      out.push({ cardId: c.id, fromBank });
      remaining -= c.value;
    }
  };

  tryFrom(payer.bank, true);
  if (remaining > 0) tryFrom(getStrayProperties(payer), false);
  if (remaining > 0) tryFrom(getCompletedSetProperties(payer), false);
  return out;
}

/* ----------------------- Validaciones de jugada --------------------- */

export interface ValidationResult {
  ok: boolean;
  reason?: string;
}

export function validateCardInHand(player: Player, cardId: string): ValidationResult {
  if (!findCardInHand(player, cardId)) {
    return { ok: false, reason: `Carta ${cardId} no está en la mano de ${player.id}.` };
  }
  return { ok: true };
}

export function validatePropertyToSet(
  player: Player,
  cardId: string,
  setColor: CardColor,
): ValidationResult {
  const card = findCardInHand(player, cardId);
  if (!card) return { ok: false, reason: 'Carta no está en mano.' };
  if (!isProperty(card)) return { ok: false, reason: 'No es una propiedad.' };
  if (card.color !== setColor) {
    return { ok: false, reason: `La propiedad es ${card.color}, no ${setColor}.` };
  }
  return { ok: true };
}

export function validateWildcardToSet(
  player: Player,
  cardId: string,
  chosenColor: CardColor,
): ValidationResult {
  const card = findCardInHand(player, cardId);
  if (!card) return { ok: false, reason: 'Carta no está en mano.' };
  if (!isWildcard(card)) return { ok: false, reason: 'No es un comodín.' };
  if (!wildcardAcceptsColor(card, chosenColor)) {
    return { ok: false, reason: `El comodín no acepta el color ${chosenColor}.` };
  }
  return { ok: true };
}

export function validateBuildingPlacement(
  player: Player,
  buildingCardId: string,
  setColor: CardColor,
): ValidationResult {
  const card = findCardInHand(player, buildingCardId);
  if (!card) return { ok: false, reason: 'Carta no está en mano.' };
  if (!isBuilding(card)) return { ok: false, reason: 'No es Edificio ni Torre.' };
  const set = player.sets.find((s) => s.color === setColor && s.isComplete);
  if (!set) return { ok: false, reason: `No hay set completo de ${setColor}.` };
  if (card.actionName === 'torre') {
    const hasEdif = set.buildings.some((b) => b.actionName === 'edificio');
    if (!hasEdif) return { ok: false, reason: 'Necesitás Edificio antes de Torre.' };
    const hasTorre = set.buildings.some((b) => b.actionName === 'torre');
    if (hasTorre) return { ok: false, reason: 'Ya hay una Torre en este set.' };
  } else if (card.actionName === 'edificio') {
    const hasEdif = set.buildings.some((b) => b.actionName === 'edificio');
    if (hasEdif) return { ok: false, reason: 'Ya hay un Edificio en este set.' };
  }
  return { ok: true };
}

export function validateRent(
  player: Player,
  rentCardId: string,
  targetSetColor: CardColor,
): ValidationResult {
  const card = findCardInHand(player, rentCardId);
  if (!card) return { ok: false, reason: 'Carta no está en mano.' };
  if (!isRent(card)) return { ok: false, reason: 'No es carta de Renta.' };
  // El cobrador necesita al menos 1 propiedad del color objetivo.
  const set = player.sets.find((s) => s.color === targetSetColor);
  if (!set || set.properties.length === 0) {
    return { ok: false, reason: `No tenés propiedades de ${targetSetColor} para cobrar renta.` };
  }
  return { ok: true };
}

/** Re-exporto para uso desde actions/turn. */
export { isAttackAction };
