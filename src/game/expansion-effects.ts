import type {
  Card,
  CardColor,
  ExpansionInput,
  GameState,
  Player,
  PropertySet,
} from '@/types/game';
import { applyPlayerUpdate, appendLog, makeLog } from './state-helpers';
import { GameError } from './errors';
import { addEffectToPlayer, addGlobalEffect, makeEffect, hasEffect } from './effects';
import { discardCardsToPile } from './deck';
import type { Rng } from './rng';
import { findCardInSets, recomputeSetCompleteness } from './rules';
import { isProperty } from './cards';
import { PROPERTY_REQUIREMENTS } from './constants';

/**
 * Punto de entrada único para activar Expansiones. La UI junta todos los
 * inputs (selección de jugadores, montos de pujas, etc.) y los pasa acá.
 *
 * Implementaciones simplificadas para hot-seat MVP — algunos efectos como
 * Doble Identidad / El Truco no tienen full UI (no hay vista per-player en
 * hot-seat), se aplican como efecto + log y queda documentado en
 * DECISIONS.md.
 */
export function activateExpansion(
  state: GameState,
  playerId: string,
  payload: ExpansionInput,
  rng: Rng,
): GameState {
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new GameError(`Jugador ${playerId} no existe.`);
  if (player.expansionUsed) throw new GameError(`${playerId} ya usó su Expansión.`);
  if (player.expansionCharge < 100) {
    throw new GameError(`Medidor en ${player.expansionCharge}% — necesita 100%.`);
  }
  if (state.players[state.currentPlayerIndex]?.id !== playerId) {
    throw new GameError(`No es turno de ${playerId}.`);
  }
  if (player.expansion !== payload.type) {
    throw new GameError(`La Expansión activada (${payload.type}) no coincide con la del jugador (${player.expansion}).`);
  }

  // Marcar expansión como usada de entrada
  let s = applyPlayerUpdate(state, { ...player, expansionUsed: true });
  s = appendLog(
    s,
    makeLog(s, 'expansion_activated', `${playerId} activa ${payload.type}.`, playerId, { type: payload.type }),
  );

  const expiresAtTurn = s.turnsPlayed + s.players.length;

  switch (payload.type) {
    case 'tribunal_dominio':
      s = applyTribunal(s, playerId, payload, rng, expiresAtTurn);
      break;
    case 'inmunidad_diplomatica':
      s = applyInmunidad(s, playerId, payload, expiresAtTurn);
      break;
    case 'subasta_siglo':
      s = applySubasta(s, playerId, payload, expiresAtTurn);
      break;
    case 'pacto_comercial':
      s = applyPacto(s, playerId, expiresAtTurn);
      break;
    case 'el_truco':
      void rng;
      s = applyTruco(s, playerId, expiresAtTurn);
      break;
    case 'doble_identidad':
      s = applyDobleIdentidad(s, playerId, payload, expiresAtTurn);
      break;
    case 'auditoria_forzada':
      s = applyAuditoria(s, playerId, expiresAtTurn);
      break;
    case 'prestamo_forzado':
      s = applyPrestamo(s, playerId);
      break;
    case 'trueque_imperial':
      s = applyTruequeImperial(s, playerId, payload, expiresAtTurn);
      break;
    case 'camara_archivo':
      s = applyCamara(s, playerId, payload, expiresAtTurn);
      break;
    case 'rascacielos':
      s = applyRascacielos(s, playerId, payload);
      break;
    case 'reordenamiento_urbano':
      s = applyReordenamiento(s, playerId, expiresAtTurn);
      break;
  }

  s = appendLog(
    s,
    makeLog(s, 'expansion_resolved', `Expansión ${payload.type} resuelta.`, playerId),
  );
  return s;
}

/* ============================ Implementaciones ============================ */

function applyTribunal(
  state: GameState,
  abogadoId: string,
  payload: Extract<ExpansionInput, { type: 'tribunal_dominio' }>,
  rng: Rng,
  expiresAtTurn: number,
): GameState {
  void rng;
  const acusado = state.players.find((p) => p.id === payload.acusadoId);
  const acusador = state.players.find((p) => p.id === payload.acusadorId);
  if (!acusado || !acusador) throw new GameError('Acusado/acusador no existe.');
  if (payload.acusadoId === payload.acusadorId) {
    throw new GameError('Acusado y acusador deben ser distintos.');
  }
  let s = state;
  // Simplificación: el acusador descarta hasta 3 cartas (las primeras 3 de su mano).
  const toDiscardCount = Math.min(3, acusador.hand.length);
  const discarded = acusador.hand.slice(0, toDiscardCount);
  s = applyPlayerUpdate(s, {
    ...acusador,
    hand: acusador.hand.slice(toDiscardCount),
  });
  s = discardCardsToPile(s, discarded);

  // Por cada carta descartada, el acusado entrega 2M (simplificación: monto fijo,
  // pasamos por la default payment policy del acusado).
  const totalDue = toDiscardCount * 2;
  if (totalDue > 0) {
    const acusadoCurrent = s.players.find((p) => p.id === payload.acusadoId)!;
    const { computeDefaultPayment } = require('./rules') as typeof import('./rules');
    const payments = computeDefaultPayment(acusadoCurrent, totalDue);
    s = executeDirectPayment(s, payload.acusadoId, abogadoId, payments);
  }
  // Costo de salida: próximo turno no puede jugar acciones.
  s = addEffectToPlayer(
    s,
    abogadoId,
    makeEffect('tribunal_no_actions', abogadoId, expiresAtTurn),
  );
  s = appendLog(
    s,
    makeLog(s, 'expansion_resolved', `Tribunal: ${payload.acusadorId} descartó ${toDiscardCount}, ${payload.acusadoId} pagó ${totalDue}M.`, abogadoId),
  );
  return s;
}

function applyInmunidad(
  state: GameState,
  abogadoId: string,
  payload: Extract<ExpansionInput, { type: 'inmunidad_diplomatica' }>,
  expiresAtTurn: number,
): GameState {
  const protectedPlayer = state.players.find((p) => p.id === payload.protectedId);
  if (!protectedPlayer) throw new GameError('Protegido no existe.');
  let s = addEffectToPlayer(
    state,
    payload.protectedId,
    makeEffect('inmunidad', abogadoId, expiresAtTurn),
  );
  // Costo: próximo turno el abogado no puede atacar.
  s = addEffectToPlayer(s, abogadoId, makeEffect('inmunidad_no_attacks', abogadoId, expiresAtTurn));
  return s;
}

function applySubasta(
  state: GameState,
  corredorId: string,
  payload: Extract<ExpansionInput, { type: 'subasta_siglo' }>,
  expiresAtTurn: number,
): GameState {
  let s = state;
  // Ejecutar asignaciones: para cada propId, transferir la propiedad al ganador
  // (o dejarla con su dueño si null). Cobrar todas las pujas al corredor.
  for (const propId of payload.propertyIds) {
    const winnerId = payload.assignments[propId];
    if (winnerId) {
      // Buscar la propiedad en cualquier jugador y moverla
      for (const owner of s.players) {
        const loc = findCardInSets(owner, propId);
        if (loc) {
          const set = owner.sets[loc.setIndex];
          const card = set.properties[loc.cardIndex];
          const newSet = recomputeSetCompleteness({
            ...set,
            properties: set.properties.filter((_, i) => i !== loc.cardIndex),
          });
          s = applyPlayerUpdate(s, {
            ...owner,
            sets: owner.sets.map((x, i) => (i === loc.setIndex ? newSet : x)),
          });
          // Agregar al winner
          const winner = s.players.find((p) => p.id === winnerId);
          if (winner) {
            const placeColor = isProperty(card) ? card.color! : set.color;
            const newWinnerSets = pushPropToSets(winner.sets, card, placeColor);
            s = applyPlayerUpdate(s, { ...winner, sets: newWinnerSets });
          }
          break;
        }
      }
    }
  }
  // Cobrar pujas (sumar todas) al corredor: pasa por banks de los pujadores.
  const totalBidByPlayer: Record<string, number> = {};
  for (const [bidder, bids] of Object.entries(payload.bids)) {
    let sum = 0;
    for (const bid of Object.values(bids)) sum += bid;
    totalBidByPlayer[bidder] = sum;
  }
  for (const [bidder, amount] of Object.entries(totalBidByPlayer)) {
    if (amount <= 0) continue;
    const { computeDefaultPayment } = require('./rules') as typeof import('./rules');
    const payer = s.players.find((p) => p.id === bidder);
    if (!payer) continue;
    const payments = computeDefaultPayment(payer, amount);
    s = executeDirectPayment(s, bidder, corredorId, payments);
  }
  // Costo: próximo turno no puede cobrar rentas.
  s = addEffectToPlayer(s, corredorId, makeEffect('auditoria_no_rents', corredorId, expiresAtTurn));
  return s;
}

function applyPacto(state: GameState, corredorId: string, expiresAtTurn: number): GameState {
  let s = addGlobalEffect(state, makeEffect('pacto_comercial', corredorId, expiresAtTurn));
  // Mientras dura: rentas se duplican (rentas_dobles).
  s = addGlobalEffect(s, makeEffect('rentas_dobles', corredorId, expiresAtTurn));
  // Costo: próxima ronda nadie cobra rentas.
  s = addGlobalEffect(s, makeEffect('pacto_no_rents', corredorId, expiresAtTurn + state.players.length));
  return s;
}

function applyTruco(
  state: GameState,
  estafadorId: string,
  expiresAtTurn: number,
): GameState {
  let s = state;
  const others = s.players.filter((p) => p.id !== estafadorId);
  if (others.length < 2) {
    // Fallback: con < 2 oponentes el efecto es trivial — sólo log + costo.
    s = addEffectToPlayer(s, estafadorId, makeEffect('truco_mano_publica', estafadorId, expiresAtTurn));
    return s;
  }
  // Cada otro jugador "pierde" 2M al estafador (simplificación de la trampa).
  for (const o of others) {
    const { computeDefaultPayment } = require('./rules') as typeof import('./rules');
    const cur = s.players.find((p) => p.id === o.id)!;
    const payments = computeDefaultPayment(cur, 2);
    s = executeDirectPayment(s, o.id, estafadorId, payments);
  }
  // Costo: próximo turno mano del estafador es pública.
  s = addEffectToPlayer(s, estafadorId, makeEffect('truco_mano_publica', estafadorId, expiresAtTurn));
  return s;
}

function applyDobleIdentidad(
  state: GameState,
  estafadorId: string,
  payload: Extract<ExpansionInput, { type: 'doble_identidad' }>,
  expiresAtTurn: number,
): GameState {
  // En hot-seat, la suplantación visual no aplica. Lo modelamos como log + flag.
  return addEffectToPlayer(
    state,
    estafadorId,
    makeEffect('doble_identidad', estafadorId, expiresAtTurn, { suplantadoId: payload.suplantadoId }),
  );
}

function applyAuditoria(state: GameState, banqueroId: string, expiresAtTurn: number): GameState {
  let s = state;
  // Cada otro jugador entrega la mitad (redondeo arriba) de su banco al banquero.
  for (const p of s.players) {
    if (p.id === banqueroId) continue;
    const totalBank = p.bank.reduce((sum, c) => sum + c.value, 0);
    const due = Math.ceil(totalBank / 2);
    if (due <= 0) continue;
    const { computeDefaultPayment } = require('./rules') as typeof import('./rules');
    const cur = s.players.find((x) => x.id === p.id)!;
    const payments = computeDefaultPayment(cur, due);
    s = executeDirectPayment(s, p.id, banqueroId, payments);
  }
  // Audit freeze global por una ronda
  s = addGlobalEffect(s, makeEffect('audit_freeze', banqueroId, expiresAtTurn));
  // Mano pública por una ronda
  s = addGlobalEffect(s, makeEffect('mano_publica', banqueroId, expiresAtTurn));
  // Costo: ronda siguiente el banquero no cobra rentas.
  s = addEffectToPlayer(s, banqueroId, makeEffect('auditoria_no_rents', banqueroId, expiresAtTurn + state.players.length));
  return s;
}

function applyPrestamo(state: GameState, banqueroId: string): GameState {
  let s = state;
  const banquero = s.players.find((p) => p.id === banqueroId);
  if (!banquero) return s;
  const otherIds = s.players.filter((p) => p.id !== banqueroId).map((p) => p.id);
  for (const oid of otherIds) {
    // Sacar 5M del banco del banquero — toma cartas hasta cubrir 5M (lowest first).
    const banqAhora = s.players.find((p) => p.id === banqueroId)!;
    const sortedBank = [...banqAhora.bank].sort((a, b) => a.value - b.value);
    let remaining = 5;
    const toTransfer: Card[] = [];
    for (const c of sortedBank) {
      if (remaining <= 0) break;
      toTransfer.push(c);
      remaining -= c.value;
    }
    if (toTransfer.length > 0) {
      const ids = new Set(toTransfer.map((c) => c.id));
      s = applyPlayerUpdate(s, { ...banqAhora, bank: banqAhora.bank.filter((c) => !ids.has(c.id)) });
      const recipient = s.players.find((p) => p.id === oid)!;
      s = applyPlayerUpdate(s, {
        ...recipient,
        bank: [...recipient.bank, ...toTransfer],
        bankerDebt: recipient.bankerDebt + 10,
      });
    }
  }
  return s;
}

function applyTruequeImperial(
  state: GameState,
  coleccionistaId: string,
  payload: Extract<ExpansionInput, { type: 'trueque_imperial' }>,
  expiresAtTurn: number,
): GameState {
  let s = state;
  for (const swap of payload.swaps) {
    const other = s.players.find((p) => p.id === swap.otherPlayerId);
    const colec = s.players.find((p) => p.id === coleccionistaId);
    if (!other || !colec) continue;
    const otherLoc = findCardInSets(other, swap.takeCardId);
    const colecLoc = findCardInSets(colec, swap.giveCardId);
    if (!otherLoc || !colecLoc) continue;
    const takeCard = other.sets[otherLoc.setIndex].properties[otherLoc.cardIndex];
    const giveCard = colec.sets[colecLoc.setIndex].properties[colecLoc.cardIndex];
    const otherColor = other.sets[otherLoc.setIndex].color;
    const colecColor = colec.sets[colecLoc.setIndex].color;

    // Quitar de cada uno
    const newOther = removeProp(other, swap.takeCardId);
    const newColec = removeProp(colec, swap.giveCardId);
    if (!newOther || !newColec) continue;

    const placeForColec = isProperty(takeCard) ? takeCard.color! : colecColor;
    const placeForOther = isProperty(giveCard) ? giveCard.color! : otherColor;

    s = applyPlayerUpdate(s, {
      ...newOther,
      sets: pushPropToSets(newOther.sets, giveCard, placeForOther),
    });
    s = applyPlayerUpdate(s, {
      ...newColec,
      sets: pushPropToSets(newColec.sets, takeCard, placeForColec),
    });
  }
  s = addEffectToPlayer(s, coleccionistaId, makeEffect('trueque_no_attacks', coleccionistaId, expiresAtTurn));
  return s;
}

function applyCamara(
  state: GameState,
  coleccionistaId: string,
  payload: Extract<ExpansionInput, { type: 'camara_archivo' }>,
  expiresAtTurn: number,
): GameState {
  let s = state;
  // Buscar la pieza en su dueño actual
  const owner = s.players.find((p) => p.id === payload.pieceOwnerId);
  if (!owner) throw new GameError('Owner de la pieza no existe.');
  const loc = findCardInSets(owner, payload.pieceCardId);
  if (!loc) throw new GameError('Pieza no encontrada.');
  const piece = owner.sets[loc.setIndex].properties[loc.cardIndex];
  const pieceColor = owner.sets[loc.setIndex].color;
  // Mover la pieza al coleccionista permanentemente
  const newOwner = removeProp(owner, payload.pieceCardId);
  if (newOwner) s = applyPlayerUpdate(s, newOwner);
  const colec = s.players.find((p) => p.id === coleccionistaId)!;
  const placeColor = isProperty(piece) ? piece.color! : pieceColor;
  s = applyPlayerUpdate(s, { ...colec, sets: pushPropToSets(colec.sets, piece, placeColor) });
  // Costo: próximo turno no recibe nuevas propiedades.
  s = addEffectToPlayer(s, coleccionistaId, makeEffect('camara_no_property', coleccionistaId, expiresAtTurn));
  return s;
}

function applyRascacielos(
  state: GameState,
  arquitectoId: string,
  payload: Extract<ExpansionInput, { type: 'rascacielos' }>,
): GameState {
  const arq = state.players.find((p) => p.id === arquitectoId);
  if (!arq) throw new GameError('Arquitecto no existe.');
  const setIdx = arq.sets.findIndex((s) => s.color === payload.setColor && s.isComplete);
  if (setIdx < 0) throw new GameError(`No hay set completo de ${payload.setColor}.`);
  if (arq.sets.some((s) => s.isMonument)) {
    throw new GameError('Sólo se permite 1 Set Monumento por Arquitecto.');
  }
  const newSets = arq.sets.map((s, i) => (i === setIdx ? { ...s, isMonument: true } : s));
  let s = applyPlayerUpdate(state, { ...arq, sets: newSets });
  s = appendLog(s, makeLog(s, 'monument_declared', `${arquitectoId} declaró Monumento en ${payload.setColor}.`, arquitectoId));
  // Permanente — no expiresAtTurn aplicable.
  s = addEffectToPlayer(s, arquitectoId, makeEffect('rascacielos_no_draw', arquitectoId, state.turnsPlayed + state.players.length));
  return s;
}

function applyReordenamiento(state: GameState, arquitectoId: string, expiresAtTurn: number): GameState {
  // En hot-seat, este "modo god" implica una UI separada. Simplificación: log
  // + flag de "puede modificar" y costo de salida. La UI puede usar un modo
  // especial que invoca acciones libres durante este turno.
  let s = addEffectToPlayer(state, arquitectoId, makeEffect('reforma_movible', arquitectoId, expiresAtTurn));
  // Costo: próxima ronda no puede modificar sus propios sets.
  s = addEffectToPlayer(s, arquitectoId, makeEffect('reordenamiento_no_modify', arquitectoId, expiresAtTurn + state.players.length));
  return s;
}

/* ============================ Helpers compartidos ============================ */

function executeDirectPayment(
  state: GameState,
  payerId: string,
  receiverId: string,
  payments: { cardId: string; fromBank: boolean }[],
): GameState {
  let s = state;
  const payer0 = s.players.find((p) => p.id === payerId);
  if (!payer0) return s;
  let payer: Player = payer0;
  const transferred: Card[] = [];

  for (const p of payments) {
    if (p.fromBank) {
      const card = payer.bank.find((c) => c.id === p.cardId);
      if (!card) continue;
      payer = { ...payer, bank: payer.bank.filter((c) => c.id !== p.cardId) };
      transferred.push(card);
    } else {
      const removed = removeProp(payer, p.cardId);
      if (!removed) continue;
      const before = payer.sets.flatMap((x) => x.properties).find((x) => x.id === p.cardId);
      if (before) transferred.push(before);
      payer = removed;
    }
  }
  // Pruning de sets vacíos
  const droppedBuildings: Card[] = [];
  payer = {
    ...payer,
    sets: payer.sets.filter((x) => {
      if (x.properties.length === 0) {
        droppedBuildings.push(...x.buildings);
        return false;
      }
      return true;
    }),
  };
  if (droppedBuildings.length > 0) s = discardCardsToPile(s, droppedBuildings);
  s = applyPlayerUpdate(s, payer);
  const receiver = s.players.find((p) => p.id === receiverId);
  if (receiver) {
    s = applyPlayerUpdate(s, { ...receiver, bank: [...receiver.bank, ...transferred] });
  }
  return s;
}

function removeProp(player: Player, cardId: string): Player | null {
  const loc = findCardInSets(player, cardId);
  if (!loc) return null;
  const set = player.sets[loc.setIndex];
  const newSet = recomputeSetCompleteness({
    ...set,
    properties: set.properties.filter((_, i) => i !== loc.cardIndex),
  });
  return {
    ...player,
    sets: player.sets.map((s, i) => (i === loc.setIndex ? newSet : s)),
  };
}

function pushPropToSets(sets: PropertySet[], card: Card, color: CardColor): PropertySet[] {
  const idx = sets.findIndex((s) => s.color === color && !s.isComplete);
  if (idx >= 0) {
    const newProps = [...sets[idx].properties, card];
    const updated = recomputeSetCompleteness({ ...sets[idx], properties: newProps });
    return sets.map((s, i) => (i === idx ? updated : s));
  }
  const required = PROPERTY_REQUIREMENTS[color] ?? 0;
  return [
    ...sets,
    {
      color,
      properties: [card],
      buildings: [],
      requiredCount: required,
      isComplete: required > 0 && 1 >= required,
      isMonument: false,
    },
  ];
}

/* Usage helper para que defense.ts pueda checkear inmunidad/pacto desde fuera. */
export { hasEffect };
