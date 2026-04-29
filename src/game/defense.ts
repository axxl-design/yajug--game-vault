import type {
  Card,
  CardColor,
  DefenseChoice,
  GameState,
  PendingAttackContext,
  PendingDefense,
  Player,
  PropertySet,
} from '@/types/game';
import { GAME_CONFIG } from './constants';
import { applyPlayerUpdate, appendLog, makeLog } from './state-helpers';
import { GameError } from './errors';
import {
  calculateSetRent,
  computeDefaultPayment,
  findCardInSets,
  recomputeSetCompleteness,
} from './rules';
import { isProperty } from './cards';
import { discardCardsToPile } from './deck';
import { hasEffect, findGlobalEffect } from './effects';
import { chargeRoleMeter } from './charge';
import { canAbogadoFreeBlock } from './role-passives';
import { getActiveRentModifiers } from './titulares-effects';
import { startTiempoExtra } from './tiempo-extra';
import { checkVictoryCondition } from './rules';
import type { Rng } from './rng';

const DEFENSE_TIMEOUT_MS = GAME_CONFIG.DEFENSE_TIMEOUT_MS;

/* ------------- Helpers de transferencia para apply ------------- */

interface RemovePropertyResult {
  newPlayer: Player;
  card: Card;
}

function removePropertyFromAnySet(player: Player, cardId: string): RemovePropertyResult | null {
  const loc = findCardInSets(player, cardId);
  if (!loc) return null;
  const set = player.sets[loc.setIndex];
  const card = set.properties[loc.cardIndex];
  const newSet = recomputeSetCompleteness({
    ...set,
    properties: set.properties.filter((_, i) => i !== loc.cardIndex),
  });
  const newSets = player.sets.map((s, i) => (i === loc.setIndex ? newSet : s));
  return { newPlayer: { ...player, sets: newSets }, card };
}

function pruneEmptySets(player: Player, state: GameState): { player: Player; state: GameState } {
  const dropped: Card[] = [];
  const remaining: PropertySet[] = [];
  for (const s of player.sets) {
    if (s.properties.length === 0) {
      dropped.push(...s.buildings);
    } else {
      remaining.push(s);
    }
  }
  if (dropped.length === 0) {
    return { player: { ...player, sets: remaining }, state };
  }
  return {
    player: { ...player, sets: remaining },
    state: discardCardsToPile(state, dropped),
  };
}

function pushPropertyIntoSets(
  sets: PropertySet[],
  card: Card,
  color: CardColor,
  PROPERTY_REQUIREMENTS: Record<CardColor, number>,
): PropertySet[] {
  const idx = sets.findIndex((s) => s.color === color && !s.isComplete);
  if (idx >= 0) {
    const newProps = [...sets[idx].properties, card];
    const updated = recomputeSetCompleteness({ ...sets[idx], properties: newProps });
    return sets.map((s, i) => (i === idx ? updated : s));
  }
  const required = PROPERTY_REQUIREMENTS[color] ?? 0;
  const fresh: PropertySet = {
    color,
    properties: [card],
    buildings: [],
    requiredCount: required,
    isComplete: required > 0 && 1 >= required,
    isMonument: false,
  };
  return [...sets, fresh];
}

import { PROPERTY_REQUIREMENTS } from './constants';

/* ------------- Verificación de inmunidad / pacto ------------- */

/** Retorna true si el ataque debería cancelarse por Inmunidad o Pacto. */
function isAttackCancelledByEffect(state: GameState, defenderId: string): { cancelled: boolean; reason?: string } {
  const defender = state.players.find((p) => p.id === defenderId);
  if (!defender) return { cancelled: false };
  if (hasEffect(defender, 'inmunidad')) {
    return { cancelled: true, reason: `${defenderId} está protegido por Inmunidad Diplomática.` };
  }
  // Pacto Comercial: efecto global, no se permiten ataques.
  if (findGlobalEffect(state, 'pacto_comercial')) {
    return { cancelled: true, reason: 'Pacto Comercial activo: sin ataques.' };
  }
  return { cancelled: false };
}

/* --------------- Request: encolar attack en pendingDefense --------------- */

export function requestAttack(
  state: GameState,
  attackerId: string,
  cardPlayed: Card,
  defenderId: string,
  context: PendingAttackContext,
  log?: string,
): GameState {
  const cancel = isAttackCancelledByEffect(state, defenderId);
  if (cancel.cancelled) {
    let s = appendLog(state, makeLog(state, 'defense_resolved', cancel.reason ?? 'Ataque cancelado.', attackerId, { cancelled: true }));
    // La carta de ataque ya fue removida de la mano por el handler request*; mandala al descarte.
    s = discardCardsToPile(s, [cardPlayed]);
    return s;
  }

  const pending: PendingDefense = {
    attackerId,
    defenderId,
    cardPlayed,
    context,
    timeoutAt: Date.now() + DEFENSE_TIMEOUT_MS,
  };
  let s: GameState = { ...state, phase: 'defense_pending', pendingDefense: pending };
  s = appendLog(
    s,
    makeLog(s, 'defense_pending', log ?? `Defense pending: ${attackerId} → ${defenderId}.`, attackerId, {
      defenderId,
      contextType: context.type,
    }),
  );
  return s;
}

/* ----------- Apply: aplicar el ataque computado en pendingDefense ----------- */

export function applyPendingAttack(state: GameState, _rng: Rng): GameState {
  if (!state.pendingDefense) return state;
  const { attackerId, defenderId, cardPlayed, context } = state.pendingDefense;
  let s = state;

  switch (context.type) {
    case 'confiscate': {
      const target = s.players.find((p) => p.id === defenderId)!;
      const setIdx = target.sets.findIndex((x) => x.color === context.setColor && x.isComplete);
      if (setIdx >= 0) {
        const stolen = target.sets[setIdx];
        s = applyPlayerUpdate(s, {
          ...target,
          sets: target.sets.filter((_, i) => i !== setIdx),
        });
        const attacker = s.players.find((p) => p.id === attackerId)!;
        s = applyPlayerUpdate(s, { ...attacker, sets: [...attacker.sets, { ...stolen }] });
        s = appendLog(s, makeLog(s, 'set_confiscated', `${attackerId} confiscó ${context.setColor} a ${defenderId}.`, attackerId));
        // Trigger property_added cargas (potencial)
        for (const _ of stolen.properties) {
          s = chargeRoleMeter(s, attackerId, 'property_added');
        }
      }
      s = discardCardsToPile(s, [cardPlayed]);
      break;
    }
    case 'steal_property': {
      const target = s.players.find((p) => p.id === defenderId)!;
      const loc = findCardInSets(target, context.cardId);
      if (loc) {
        const set = target.sets[loc.setIndex];
        if (!set.isComplete) {
          const stolen = set.properties[loc.cardIndex];
          const newTargetSet = recomputeSetCompleteness({
            ...set,
            properties: set.properties.filter((_, i) => i !== loc.cardIndex),
          });
          let newTarget: Player = {
            ...target,
            sets: target.sets.map((x, i) => (i === loc.setIndex ? newTargetSet : x)),
          };
          const pruned = pruneEmptySets(newTarget, s);
          newTarget = pruned.player;
          s = pruned.state;
          s = applyPlayerUpdate(s, newTarget);

          const attacker = s.players.find((p) => p.id === attackerId)!;
          const placeColor: CardColor = isProperty(stolen) ? stolen.color! : set.color;
          const newAttSets = pushPropertyIntoSets(attacker.sets, stolen, placeColor, PROPERTY_REQUIREMENTS);
          s = applyPlayerUpdate(s, { ...attacker, sets: newAttSets });
          s = appendLog(s, makeLog(s, 'property_stolen', `${attackerId} robó ${stolen.name} a ${defenderId}.`, attackerId));
          s = chargeRoleMeter(s, attackerId, 'property_added');
        }
      }
      s = discardCardsToPile(s, [cardPlayed]);
      break;
    }
    case 'force_trade': {
      const target = s.players.find((p) => p.id === defenderId)!;
      const attacker = s.players.find((p) => p.id === attackerId)!;
      const attLoc = findCardInSets(attacker, context.ownCardId);
      const tgtLoc = findCardInSets(target, context.targetCardId);
      if (attLoc && tgtLoc && !attacker.sets[attLoc.setIndex].isComplete && !target.sets[tgtLoc.setIndex].isComplete) {
        const ownCard = attacker.sets[attLoc.setIndex].properties[attLoc.cardIndex];
        const tgtCard = target.sets[tgtLoc.setIndex].properties[tgtLoc.cardIndex];
        const ownColor = attacker.sets[attLoc.setIndex].color;
        const tgtColor = target.sets[tgtLoc.setIndex].color;

        const attRem = removePropertyFromAnySet(attacker, context.ownCardId)!;
        const tgtRem = removePropertyFromAnySet(target, context.targetCardId)!;

        const placeForAtt: CardColor = isProperty(tgtCard) ? tgtCard.color! : ownColor;
        const placeForTgt: CardColor = isProperty(ownCard) ? ownCard.color! : tgtColor;

        const attWith: Player = {
          ...attRem.newPlayer,
          sets: pushPropertyIntoSets(attRem.newPlayer.sets, tgtCard, placeForAtt, PROPERTY_REQUIREMENTS),
        };
        const tgtWith: Player = {
          ...tgtRem.newPlayer,
          sets: pushPropertyIntoSets(tgtRem.newPlayer.sets, ownCard, placeForTgt, PROPERTY_REQUIREMENTS),
        };

        const attPruned = pruneEmptySets(attWith, s);
        s = attPruned.state;
        const tgtPruned = pruneEmptySets(tgtWith, s);
        s = tgtPruned.state;
        s = applyPlayerUpdate(s, attPruned.player);
        s = applyPlayerUpdate(s, tgtPruned.player);
        s = appendLog(s, makeLog(s, 'property_traded', `${attackerId} cambió ${ownCard.name} por ${tgtCard.name} con ${defenderId}.`, attackerId));
      }
      s = discardCardsToPile(s, [cardPlayed]);
      break;
    }
    case 'collect_debt':
    case 'rent': {
      // Usar default payment policy
      const payer = s.players.find((p) => p.id === defenderId)!;
      const payments = computeDefaultPayment(payer, context.amount);
      s = executePayment(s, defenderId, attackerId, payments);
      // Para rent, cargar trigger del corredor / banquero.
      if (context.type === 'rent') {
        s = chargeRoleMeter(s, attackerId, 'rent_collected');
        s = appendLog(s, makeLog(s, 'rent_collected', `${attackerId} cobró ${context.amount}M de ${defenderId}.`, attackerId, { amount: context.amount }));
        // Discard rent card (cardPlayed)
        s = discardCardsToPile(s, [cardPlayed]);
      } else {
        s = appendLog(s, makeLog(s, 'debt_collected', `${attackerId} facturó ${context.amount}M a ${defenderId}.`, attackerId, { amount: context.amount }));
        s = discardCardsToPile(s, [cardPlayed]);
      }
      // Trigger money_received: el atacante recibió cartas → carga banquero.
      s = chargeRoleMeter(s, attackerId, 'money_received');
      break;
    }
    case 'collect_tribute': {
      const payer = s.players.find((p) => p.id === defenderId)!;
      const payments = computeDefaultPayment(payer, context.amount);
      s = executePayment(s, defenderId, attackerId, payments);
      s = chargeRoleMeter(s, attackerId, 'money_received');
      // No descartamos cardPlayed acá — la Cuota se descarta cuando termina la cadena.
      // Pasar al siguiente defender o cerrar.
      s = appendLog(s, makeLog(s, 'pay_processed', `${defenderId} pagó Cuota a ${attackerId}.`, defenderId));
      break;
    }
  }

  // Limpiar pendingDefense (excepto Cuota con remaining defenders — manejado abajo).
  return s;
}

function executePayment(
  state: GameState,
  payerId: string,
  receiverId: string,
  payments: { cardId: string; fromBank: boolean }[],
): GameState {
  const payer0 = state.players.find((p) => p.id === payerId);
  const receiver0 = state.players.find((p) => p.id === receiverId);
  if (!payer0 || !receiver0) return state;

  let payer: Player = payer0;
  let s = state;
  const transferred: Card[] = [];

  for (const p of payments) {
    if (p.fromBank) {
      const card = payer.bank.find((c) => c.id === p.cardId);
      if (!card) continue;
      payer = { ...payer, bank: payer.bank.filter((c) => c.id !== p.cardId) };
      transferred.push(card);
    } else {
      const r = removePropertyFromAnySet(payer, p.cardId);
      if (!r) continue;
      payer = r.newPlayer;
      transferred.push(r.card);
    }
  }

  const pruned = pruneEmptySets(payer, s);
  payer = pruned.player;
  s = pruned.state;
  s = applyPlayerUpdate(s, payer);
  const receiver = s.players.find((p) => p.id === receiverId);
  if (receiver) {
    s = applyPlayerUpdate(s, { ...receiver, bank: [...receiver.bank, ...transferred] });
  }
  return s;
}

/* ----------- Resolve: el defender (o timeout) elige qué hacer ----------- */

export function resolveDefense(
  state: GameState,
  choice: DefenseChoice,
  rng: Rng,
): GameState {
  if (state.phase !== 'defense_pending' || !state.pendingDefense) {
    throw new GameError('No hay Defense pendiente.');
  }
  const pending = state.pendingDefense;
  const defender = state.players.find((p) => p.id === pending.defenderId);
  const attacker = state.players.find((p) => p.id === pending.attackerId);
  if (!defender || !attacker) throw new GameError('Defender o attacker no existe.');

  let s = state;
  // El trigger 'attacked' carga al defender SIEMPRE que recibió ataque (incluso si lo bloqueó).
  s = chargeRoleMeter(s, defender.id, 'attacked');

  switch (choice.type) {
    case 'block': {
      // Necesita carta de Bloqueo o pasiva Abogado.
      const bloqueo = defender.hand.find((c) => c.actionName === 'bloqueo');
      const usePasiva = !bloqueo && canAbogadoFreeBlock(defender);
      if (!bloqueo && !usePasiva) {
        throw new GameError('No tenés carta de Bloqueo (ni pasiva disponible).');
      }
      if (bloqueo) {
        s = applyPlayerUpdate(s, {
          ...defender,
          hand: defender.hand.filter((c) => c.id !== bloqueo.id),
        });
        s = discardCardsToPile(s, [bloqueo]);
      } else {
        s = applyPlayerUpdate(s, { ...defender, passiveUsed: true });
      }
      // La carta de ataque vuelve a la mano del atacante (excepto cuota — sigue).
      if (pending.context.type !== 'collect_tribute') {
        const att = s.players.find((p) => p.id === attacker.id)!;
        s = applyPlayerUpdate(s, { ...att, hand: [...att.hand, pending.cardPlayed] });
      }
      s = appendLog(
        s,
        makeLog(s, 'defense_blocked', `${defender.id} bloqueó el ataque de ${attacker.id}.`, defender.id),
      );
      break;
    }

    case 'counter': {
      // Aplicar ataque + robar 1 carta random al atacante para el defender.
      s = applyPendingAttack(s, rng);
      const attAfter = s.players.find((p) => p.id === attacker.id);
      if (attAfter && attAfter.hand.length > 0) {
        const idx = rng.int(attAfter.hand.length);
        const taken = attAfter.hand[idx];
        s = applyPlayerUpdate(s, { ...attAfter, hand: attAfter.hand.filter((_, i) => i !== idx) });
        const def = s.players.find((p) => p.id === defender.id)!;
        s = applyPlayerUpdate(s, { ...def, hand: [...def.hand, taken] });
        s = appendLog(
          s,
          makeLog(s, 'defense_countered', `${defender.id} contraatacó y robó una carta a ${attacker.id}.`, defender.id),
        );
      } else {
        s = appendLog(s, makeLog(s, 'defense_countered', `${defender.id} contraatacó.`, defender.id));
      }
      break;
    }

    case 'negotiate': {
      // Simplificación MVP: el defender propone pagar `choice.amount` (clamped 0..context.amount).
      // Atacante "acepta" automáticamente — en hot-seat el flow de aceptación es secuencial y
      // costoso de modelar; en multiplayer real lo añadimos.
      if (pending.context.type === 'rent' || pending.context.type === 'collect_debt' || pending.context.type === 'collect_tribute') {
        const amount = Math.max(0, Math.min(choice.amount, pending.context.amount));
        const negotiatedContext: PendingAttackContext = { ...pending.context, amount };
        s = { ...s, pendingDefense: { ...pending, context: negotiatedContext } };
        s = applyPendingAttack(s, rng);
        s = appendLog(s, makeLog(s, 'defense_negotiated', `${defender.id} negoció pagar ${amount}M.`, defender.id));
      } else {
        // Para ataques no monetarios, negotiate simplificado = block.
        return resolveDefense(s, { type: 'block' }, rng);
      }
      break;
    }

    case 'accept': {
      s = applyPendingAttack(s, rng);
      s = appendLog(s, makeLog(s, 'defense_resolved', `${defender.id} aceptó el ataque.`, defender.id));
      break;
    }
  }

  // Cuota: si quedan más defenders, encolar el siguiente.
  const ctx = pending.context;
  if (ctx.type === 'collect_tribute' && ctx.remainingDefenders.length > 0) {
    const [next, ...rest] = ctx.remainingDefenders;
    const nextContext: PendingAttackContext = { ...ctx, remainingDefenders: rest };
    s = {
      ...s,
      phase: 'defense_pending',
      pendingDefense: {
        attackerId: pending.attackerId,
        defenderId: next,
        cardPlayed: pending.cardPlayed,
        context: nextContext,
        timeoutAt: Date.now() + DEFENSE_TIMEOUT_MS,
      },
    };
    return s;
  }

  // Limpiar pendingDefense y volver a playing (si la Cuota era la última, también descartamos la carta).
  if (ctx.type === 'collect_tribute') {
    s = discardCardsToPile(s, [pending.cardPlayed]);
  }
  s = { ...s, phase: 'playing', pendingDefense: null };
  s = appendLog(s, makeLog(s, 'defense_resolved', `Defense resuelta.`, defender.id));

  // Después de cada resolución, chequear victoria (puede haber cambiado por confiscate/steal).
  s = checkVictoryAfterDefense(s);
  return s;
}

function checkVictoryAfterDefense(state: GameState): GameState {
  if (state.winner || state.phase === 'tiempo_extra' || state.phase === 'game_over') return state;
  for (const p of state.players) {
    if (checkVictoryCondition(p)) {
      return startTiempoExtra(state, p.id);
    }
  }
  return state;
}

/* ------ Helper para construir el `amount` de Renta con modificadores ------ */
export function computeRentAmount(
  state: GameState,
  attacker: Player,
  set: PropertySet,
): { amount: number; canceled: boolean } {
  const mods = getActiveRentModifiers(state);
  if (mods.canceled) return { amount: 0, canceled: true };
  const base = calculateSetRent(set);
  const corredor = attacker.role === 'corredor' ? 1 : 0;
  const amount = Math.max(0, (base + mods.add + corredor) * mods.multiply);
  return { amount, canceled: false };
}
