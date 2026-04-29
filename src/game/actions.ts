import type {
  Card,
  CardColor,
  GameLogEntry,
  GameLogEntryType,
  GameState,
  PaymentDetail,
  Player,
  PropertySet,
} from '@/types/game';
import { GAME_CONFIG, PROPERTY_REQUIREMENTS } from './constants';
import {
  isAttackAction,
  isBuilding,
  isProperty,
  isRent,
  isWildcard,
  wildcardAcceptsColor,
} from './cards';
import {
  calculateSetRent,
  checkVictoryCondition,
  computeDefaultPayment,
  findCardInBank,
  findCardInHand,
  findCardInSets,
  getPlayerById,
  isPlayerTurn,
  recomputeSetCompleteness,
  validateBuildingPlacement,
  validatePropertyToSet,
  validateRent,
  validateWildcardToSet,
} from './rules';
import { drawCards, discardCardsToPile } from './deck';
import type { Rng } from './rng';

/* ============================ Errors ============================== */

export class GameError extends Error {
  constructor(public reason: string) {
    super(reason);
    this.name = 'GameError';
  }
}

/* ========================= Internal helpers ======================== */

function ts(state: GameState): number {
  return state.log.length;
}

function makeLog(
  state: GameState,
  type: GameLogEntryType,
  humanReadable: string,
  playerId?: string,
  data?: unknown,
): GameLogEntry {
  return { timestamp: ts(state), type, playerId, humanReadable, data };
}

function appendLog(state: GameState, entry: GameLogEntry): GameState {
  return { ...state, log: [...state.log, entry] };
}

function applyPlayerUpdate(state: GameState, updated: Player): GameState {
  return {
    ...state,
    players: state.players.map((p) => (p.id === updated.id ? updated : p)),
  };
}

function requireTurn(state: GameState, playerId: string): void {
  if (!isPlayerTurn(state, playerId)) {
    throw new GameError(`No es turno de ${playerId}.`);
  }
  if (state.phase !== 'playing') {
    throw new GameError(`No se pueden jugar acciones en phase=${state.phase}.`);
  }
}

function requireCanPlayMore(player: Player): void {
  if (player.hasPlayedCardsThisTurn >= GAME_CONFIG.MAX_PLAYS_PER_TURN) {
    throw new GameError(`${player.id} ya jugó las 3 cartas del turno.`);
  }
}

function removeFromHand(player: Player, cardId: string): { player: Player; card: Card } {
  const card = findCardInHand(player, cardId);
  if (!card) throw new GameError(`Carta ${cardId} no está en mano.`);
  return {
    player: { ...player, hand: player.hand.filter((c) => c.id !== cardId) },
    card,
  };
}

function pushPropertyIntoSets(
  sets: PropertySet[],
  card: Card,
  color: CardColor,
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

function checkAndApplyVictory(state: GameState, player: Player): GameState {
  if (state.winner) return state;
  if (!checkVictoryCondition(player)) return state;
  return appendLog(
    {
      ...state,
      winner: player.id,
      phase: 'game_over',
    },
    makeLog(state, 'game_won', `${player.id} ganó la partida.`, player.id),
  );
}

/* ----------------------- Property transfer ------------------------- */

interface RemovePropertyResult {
  newPlayer: Player;
  card: Card;
  setBroken: boolean;
}

function removePropertyFromAnySet(player: Player, cardId: string): RemovePropertyResult | null {
  const loc = findCardInSets(player, cardId);
  if (!loc) return null;
  const set = player.sets[loc.setIndex];
  const card = set.properties[loc.cardIndex];
  const wasComplete = set.isComplete;
  const newSet = recomputeSetCompleteness({
    ...set,
    properties: set.properties.filter((_, i) => i !== loc.cardIndex),
  });
  const newSets = player.sets.map((s, i) => (i === loc.setIndex ? newSet : s));
  return {
    newPlayer: { ...player, sets: newSets },
    card,
    setBroken: wasComplete && !newSet.isComplete,
  };
}

/* ============================== Pago =============================== */

function executePayment(
  state: GameState,
  payerId: string,
  receiverId: string,
  payments: PaymentDetail[],
): GameState {
  const payerStart = getPlayerById(state, payerId);
  const receiverStart = getPlayerById(state, receiverId);
  if (!payerStart || !receiverStart) {
    throw new GameError('Payer o receiver no existe.');
  }

  let payer = payerStart;
  let s = state;
  const transferred: Card[] = [];

  for (const p of payments) {
    if (p.fromBank) {
      const card = findCardInBank(payer, p.cardId);
      if (!card) continue;
      payer = { ...payer, bank: payer.bank.filter((c) => c.id !== p.cardId) };
      transferred.push(card);
    } else {
      const result = removePropertyFromAnySet(payer, p.cardId);
      if (!result) continue;
      payer = result.newPlayer;
      transferred.push(result.card);
    }
  }

  // Prune sets vacíos en payer; si quedaron buildings huérfanos van al descarte.
  const pruned = pruneEmptySets(payer, s);
  payer = pruned.player;
  s = pruned.state;

  s = applyPlayerUpdate(s, payer);

  const receiver = getPlayerById(s, receiverId);
  if (receiver) {
    const newReceiver = { ...receiver, bank: [...receiver.bank, ...transferred] };
    s = applyPlayerUpdate(s, newReceiver);
  }

  s = appendLog(
    s,
    makeLog(
      s,
      'pay_processed',
      `${payerId} pagó ${transferred.reduce((sum, c) => sum + c.value, 0)}M a ${receiverId} (${transferred.length} cartas).`,
      payerId,
      { receiverId, transferredIds: transferred.map((c) => c.id) },
    ),
  );

  return s;
}

function processForcedPayment(
  state: GameState,
  payerId: string,
  receiverId: string,
  amount: number,
): GameState {
  const payer = getPlayerById(state, payerId);
  if (!payer) throw new GameError(`Payer ${payerId} no existe.`);
  const payments = computeDefaultPayment(payer, amount);
  return executePayment(state, payerId, receiverId, payments);
}

/* ============================== Acciones ============================ */

export function playCardAsMoney(
  state: GameState,
  playerId: string,
  cardId: string,
): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  requireCanPlayMore(player);

  const { player: p1, card } = removeFromHand(player, cardId);
  const updated: Player = {
    ...p1,
    bank: [...p1.bank, card],
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  };
  let s = applyPlayerUpdate(state, updated);
  s = appendLog(
    s,
    makeLog(s, 'card_played_money', `${playerId} jugó ${card.name} al banco.`, playerId, {
      cardId,
    }),
  );
  return s;
}

export function playPropertyToSet(
  state: GameState,
  playerId: string,
  cardId: string,
  setColor: CardColor,
): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  requireCanPlayMore(player);

  const v = validatePropertyToSet(player, cardId, setColor);
  if (!v.ok) throw new GameError(v.reason ?? 'Validación falló.');

  const { player: p1, card } = removeFromHand(player, cardId);
  const newSets = pushPropertyIntoSets(p1.sets, card, setColor);
  const updated: Player = {
    ...p1,
    sets: newSets,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  };
  let s = applyPlayerUpdate(state, updated);
  s = appendLog(
    s,
    makeLog(s, 'card_played_property', `${playerId} jugó ${card.name} a set ${setColor}.`, playerId, {
      cardId,
      setColor,
    }),
  );
  // Detectar set completion
  const newSet = updated.sets.find((x) => x.color === setColor);
  if (newSet?.isComplete && newSet.properties.length === newSet.requiredCount) {
    s = appendLog(
      s,
      makeLog(s, 'set_completed', `${playerId} completó set ${setColor}.`, playerId, { setColor }),
    );
  }
  return checkAndApplyVictory(s, updated);
}

export function playWildcardToSet(
  state: GameState,
  playerId: string,
  cardId: string,
  chosenColor: CardColor,
): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  requireCanPlayMore(player);

  const v = validateWildcardToSet(player, cardId, chosenColor);
  if (!v.ok) throw new GameError(v.reason ?? 'Validación falló.');

  const { player: p1, card } = removeFromHand(player, cardId);
  const newSets = pushPropertyIntoSets(p1.sets, card, chosenColor);
  const updated: Player = {
    ...p1,
    sets: newSets,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  };
  let s = applyPlayerUpdate(state, updated);
  s = appendLog(
    s,
    makeLog(s, 'wildcard_placed', `${playerId} colocó ${card.name} como ${chosenColor}.`, playerId, {
      cardId,
      chosenColor,
    }),
  );
  return checkAndApplyVictory(s, updated);
}

/** Mover wildcard YA colocado a otro set propio. Acción libre (no cuenta). */
export function moveWildcard(
  state: GameState,
  playerId: string,
  cardId: string,
  toColor: CardColor,
): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  const result = removePropertyFromAnySet(player, cardId);
  if (!result) throw new GameError(`Comodín ${cardId} no está en ningún set.`);
  if (!isWildcard(result.card)) {
    throw new GameError(`${cardId} no es un comodín.`);
  }
  if (!wildcardAcceptsColor(result.card, toColor)) {
    throw new GameError(`El comodín no acepta el color ${toColor}.`);
  }
  const pruned = pruneEmptySets(result.newPlayer, state);
  const newSets = pushPropertyIntoSets(pruned.player.sets, result.card, toColor);
  const updated: Player = { ...pruned.player, sets: newSets };
  let s = applyPlayerUpdate(pruned.state, updated);
  s = appendLog(
    s,
    makeLog(s, 'wildcard_moved', `${playerId} movió comodín a ${toColor}.`, playerId, {
      cardId,
      toColor,
    }),
  );
  return checkAndApplyVictory(s, updated);
}

export function playBuilding(
  state: GameState,
  playerId: string,
  cardId: string,
  setColor: CardColor,
): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  requireCanPlayMore(player);

  const v = validateBuildingPlacement(player, cardId, setColor);
  if (!v.ok) throw new GameError(v.reason ?? 'Validación falló.');

  const { player: p1, card } = removeFromHand(player, cardId);
  const newSets = p1.sets.map((s) =>
    s.color === setColor && s.isComplete
      ? { ...s, buildings: [...s.buildings, card] }
      : s,
  );
  const updated: Player = {
    ...p1,
    sets: newSets,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  };
  let s = applyPlayerUpdate(state, updated);
  s = appendLog(
    s,
    makeLog(s, 'building_played', `${playerId} jugó ${card.name} en set ${setColor}.`, playerId, {
      cardId,
      setColor,
    }),
  );
  return s;
}

export function playRent(
  state: GameState,
  playerId: string,
  rentCardId: string,
  targetSetColor: CardColor,
  targetPlayerId: string,
): GameState {
  requireTurn(state, playerId);
  const attacker = getPlayerById(state, playerId)!;
  requireCanPlayMore(attacker);
  const v = validateRent(attacker, rentCardId, targetSetColor);
  if (!v.ok) throw new GameError(v.reason ?? 'Validación falló.');
  if (targetPlayerId === playerId) {
    throw new GameError('No te podés cobrar renta a vos mismo.');
  }
  const target = getPlayerById(state, targetPlayerId);
  if (!target) throw new GameError(`Target ${targetPlayerId} no existe.`);

  const { player: p1, card: rentCard } = removeFromHand(attacker, rentCardId);
  const set = p1.sets.find((s) => s.color === targetSetColor)!;
  const amount = calculateSetRent(set);

  let s = applyPlayerUpdate(state, {
    ...p1,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
    lastRentInTurn: { amount, targetIds: [targetPlayerId], rentCardId: rentCard.id },
  });
  s = discardCardsToPile(s, [rentCard]);
  s = appendLog(
    s,
    makeLog(
      s,
      'defense_would_trigger',
      `Renta dirigida a ${targetPlayerId} dispararía Defense (Fase 7).`,
      playerId,
      { rentCardId, targetPlayerId, amount },
    ),
  );
  s = processForcedPayment(s, targetPlayerId, playerId, amount);
  s = appendLog(
    s,
    makeLog(s, 'rent_collected', `${playerId} cobró renta de ${amount}M a ${targetPlayerId}.`, playerId, {
      amount,
      from: targetPlayerId,
    }),
  );
  return s;
}

/** Sobrecargo — duplica retroactivamente la última Renta del turno. */
export function playSobrecargo(state: GameState, playerId: string): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  requireCanPlayMore(player);

  if (!player.lastRentInTurn) {
    throw new GameError('Sobrecargo necesita una Renta previa en el mismo turno.');
  }

  // Buscar carta sobrecargo en mano
  const sobre = player.hand.find((c) => c.actionName === 'sobrecargo');
  if (!sobre) throw new GameError('No tenés Sobrecargo en mano.');

  const { player: p1, card } = removeFromHand(player, sobre.id);
  const { amount, targetIds } = player.lastRentInTurn;

  let s = applyPlayerUpdate(state, {
    ...p1,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
    lastRentInTurn: null, // consumido
  });
  s = discardCardsToPile(s, [card]);
  for (const tid of targetIds) {
    s = processForcedPayment(s, tid, playerId, amount);
  }
  s = appendLog(
    s,
    makeLog(s, 'sobrecargo_applied', `${playerId} duplicó la última renta (+${amount}M).`, playerId, {
      amount,
    }),
  );
  return s;
}

export function confiscate(
  state: GameState,
  playerId: string,
  actionCardId: string,
  targetPlayerId: string,
  setColor: CardColor,
): GameState {
  requireTurn(state, playerId);
  const attacker = getPlayerById(state, playerId)!;
  requireCanPlayMore(attacker);
  if (targetPlayerId === playerId) {
    throw new GameError('No podés confiscarte a vos mismo.');
  }
  const target = getPlayerById(state, targetPlayerId);
  if (!target) throw new GameError(`Target ${targetPlayerId} no existe.`);
  const setIdx = target.sets.findIndex((s) => s.color === setColor && s.isComplete);
  if (setIdx < 0) {
    throw new GameError(`${targetPlayerId} no tiene set completo de ${setColor}.`);
  }

  const { player: p1, card: actionCard } = removeFromHand(attacker, actionCardId);
  if (actionCard.actionName !== 'confiscacion') {
    throw new GameError('Carta no es Confiscación.');
  }

  const stolenSet = target.sets[setIdx];
  const newTarget: Player = {
    ...target,
    sets: target.sets.filter((_, i) => i !== setIdx),
  };
  // Attacker recibe el set (potencialmente "duplicado" si ya tenía uno completo de ese color).
  const newAttacker: Player = {
    ...p1,
    sets: [...p1.sets, { ...stolenSet }],
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  };
  let s = applyPlayerUpdate(state, newAttacker);
  s = applyPlayerUpdate(s, newTarget);
  s = discardCardsToPile(s, [actionCard]);
  s = appendLog(
    s,
    makeLog(
      s,
      'defense_would_trigger',
      `Confiscación contra ${targetPlayerId} dispararía Defense (Fase 7).`,
      playerId,
      { setColor, targetPlayerId },
    ),
  );
  s = appendLog(
    s,
    makeLog(s, 'set_confiscated', `${playerId} confiscó set ${setColor} a ${targetPlayerId}.`, playerId, {
      setColor,
      targetPlayerId,
    }),
  );
  return checkAndApplyVictory(s, newAttacker);
}

export function stealProperty(
  state: GameState,
  playerId: string,
  actionCardId: string,
  targetPlayerId: string,
  cardId: string,
): GameState {
  requireTurn(state, playerId);
  const attacker = getPlayerById(state, playerId)!;
  requireCanPlayMore(attacker);
  if (targetPlayerId === playerId) {
    throw new GameError('No podés robarte a vos mismo.');
  }
  const target = getPlayerById(state, targetPlayerId);
  if (!target) throw new GameError(`Target ${targetPlayerId} no existe.`);

  // La propiedad debe estar en un set INCOMPLETO.
  const loc = findCardInSets(target, cardId);
  if (!loc) throw new GameError(`Propiedad ${cardId} no está en sets de ${targetPlayerId}.`);
  const set = target.sets[loc.setIndex];
  if (set.isComplete) throw new GameError('No se puede robar de set completo.');

  const stolen = set.properties[loc.cardIndex];
  const { player: p1, card: actionCard } = removeFromHand(attacker, actionCardId);
  if (actionCard.actionName !== 'trato_sucio') {
    throw new GameError('Carta no es Trato Sucio.');
  }

  // Quitar propiedad del target
  const newTargetSet = recomputeSetCompleteness({
    ...set,
    properties: set.properties.filter((_, i) => i !== loc.cardIndex),
  });
  const newTargetSets = target.sets.map((s, i) => (i === loc.setIndex ? newTargetSet : s));
  const targetPruned = pruneEmptySets({ ...target, sets: newTargetSets }, state);

  // Decidir color para colocar en attacker:
  //  - si es property: usa su color.
  //  - si es wildcard: usa el color del set del que la sacaste.
  const placeColor: CardColor = isProperty(stolen) ? stolen.color! : set.color;
  const newAttackerSets = pushPropertyIntoSets(p1.sets, stolen, placeColor);
  const newAttacker: Player = {
    ...p1,
    sets: newAttackerSets,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  };

  let s = targetPruned.state;
  s = applyPlayerUpdate(s, targetPruned.player);
  s = applyPlayerUpdate(s, newAttacker);
  s = discardCardsToPile(s, [actionCard]);
  s = appendLog(
    s,
    makeLog(
      s,
      'defense_would_trigger',
      `Trato Sucio contra ${targetPlayerId} dispararía Defense (Fase 7).`,
      playerId,
      { targetPlayerId, cardId },
    ),
  );
  s = appendLog(
    s,
    makeLog(s, 'property_stolen', `${playerId} le robó ${stolen.name} a ${targetPlayerId}.`, playerId, {
      targetPlayerId,
      cardId: stolen.id,
    }),
  );
  return checkAndApplyVictory(s, newAttacker);
}

export function forceTrade(
  state: GameState,
  playerId: string,
  actionCardId: string,
  ownCardId: string,
  targetPlayerId: string,
  targetCardId: string,
): GameState {
  requireTurn(state, playerId);
  const attacker = getPlayerById(state, playerId)!;
  requireCanPlayMore(attacker);
  if (targetPlayerId === playerId) {
    throw new GameError('No podés intercambiar con vos mismo.');
  }
  const target = getPlayerById(state, targetPlayerId);
  if (!target) throw new GameError(`Target ${targetPlayerId} no existe.`);

  // Ambas propiedades deben estar en sets INCOMPLETOS.
  const attLoc = findCardInSets(attacker, ownCardId);
  const tgtLoc = findCardInSets(target, targetCardId);
  if (!attLoc || attacker.sets[attLoc.setIndex].isComplete) {
    throw new GameError('Tu propiedad no está suelta.');
  }
  if (!tgtLoc || target.sets[tgtLoc.setIndex].isComplete) {
    throw new GameError('Propiedad del oponente no está suelta.');
  }

  const ownCard = attacker.sets[attLoc.setIndex].properties[attLoc.cardIndex];
  const tgtCard = target.sets[tgtLoc.setIndex].properties[tgtLoc.cardIndex];
  const ownColor = attacker.sets[attLoc.setIndex].color;
  const tgtColor = target.sets[tgtLoc.setIndex].color;

  // Quitar de cada uno
  const attRemoved = removePropertyFromAnySet(attacker, ownCardId)!;
  const tgtRemoved = removePropertyFromAnySet(target, targetCardId)!;

  // Colocar en el oponente
  const placeForAtt: CardColor = isProperty(tgtCard) ? tgtCard.color! : ownColor;
  const placeForTgt: CardColor = isProperty(ownCard) ? ownCard.color! : tgtColor;

  const attWithIncoming: Player = {
    ...attRemoved.newPlayer,
    sets: pushPropertyIntoSets(attRemoved.newPlayer.sets, tgtCard, placeForAtt),
  };
  const tgtWithIncoming: Player = {
    ...tgtRemoved.newPlayer,
    sets: pushPropertyIntoSets(tgtRemoved.newPlayer.sets, ownCard, placeForTgt),
  };

  // Quitar action card de la mano del attacker
  const { player: attFinal, card: actionCard } = removeFromHand(attWithIncoming, actionCardId);
  if (actionCard.actionName !== 'trueque_forzado') {
    throw new GameError('Carta no es Trueque Forzado.');
  }
  const attFinal2: Player = {
    ...attFinal,
    hasPlayedCardsThisTurn: attFinal.hasPlayedCardsThisTurn + 1,
  };

  let s = pruneEmptySets(attFinal2, state).state;
  const attPruned = pruneEmptySets(attFinal2, state);
  const tgtPruned = pruneEmptySets(tgtWithIncoming, attPruned.state);
  s = tgtPruned.state;
  s = applyPlayerUpdate(s, attPruned.player);
  s = applyPlayerUpdate(s, tgtPruned.player);
  s = discardCardsToPile(s, [actionCard]);
  s = appendLog(
    s,
    makeLog(s, 'defense_would_trigger', `Trueque dispararía Defense (Fase 7).`, playerId, {
      targetPlayerId,
    }),
  );
  s = appendLog(
    s,
    makeLog(
      s,
      'property_traded',
      `${playerId} cambió ${ownCard.name} por ${tgtCard.name} con ${targetPlayerId}.`,
      playerId,
      { ownCardId, targetCardId, targetPlayerId },
    ),
  );
  return checkAndApplyVictory(s, attPruned.player);
}

export function collectDebt(
  state: GameState,
  playerId: string,
  actionCardId: string,
  targetPlayerId: string,
): GameState {
  requireTurn(state, playerId);
  const attacker = getPlayerById(state, playerId)!;
  requireCanPlayMore(attacker);
  if (targetPlayerId === playerId) {
    throw new GameError('No te podés facturar a vos mismo.');
  }
  const target = getPlayerById(state, targetPlayerId);
  if (!target) throw new GameError(`Target ${targetPlayerId} no existe.`);

  const { player: p1, card: actionCard } = removeFromHand(attacker, actionCardId);
  if (actionCard.actionName !== 'factura') {
    throw new GameError('Carta no es Factura.');
  }
  let s = applyPlayerUpdate(state, {
    ...p1,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  });
  s = discardCardsToPile(s, [actionCard]);
  s = appendLog(
    s,
    makeLog(s, 'defense_would_trigger', `Factura dispararía Defense (Fase 7).`, playerId, {
      targetPlayerId,
    }),
  );
  s = processForcedPayment(s, targetPlayerId, playerId, GAME_CONFIG.FACTURA_AMOUNT);
  s = appendLog(
    s,
    makeLog(s, 'debt_collected', `${playerId} facturó ${GAME_CONFIG.FACTURA_AMOUNT}M a ${targetPlayerId}.`, playerId, {
      amount: GAME_CONFIG.FACTURA_AMOUNT,
      targetPlayerId,
    }),
  );
  return s;
}

export function collectTribute(
  state: GameState,
  playerId: string,
  actionCardId: string,
): GameState {
  requireTurn(state, playerId);
  const attacker = getPlayerById(state, playerId)!;
  requireCanPlayMore(attacker);

  const { player: p1, card: actionCard } = removeFromHand(attacker, actionCardId);
  if (actionCard.actionName !== 'cuota') {
    throw new GameError('Carta no es Cuota.');
  }
  let s = applyPlayerUpdate(state, {
    ...p1,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  });
  s = discardCardsToPile(s, [actionCard]);

  // Cobrar 2M a cada otro jugador conectado.
  for (const other of state.players) {
    if (other.id === playerId) continue;
    if (!other.isConnected) continue;
    s = appendLog(
      s,
      makeLog(s, 'defense_would_trigger', `Cuota a ${other.id} dispararía Defense.`, playerId, {
        targetPlayerId: other.id,
      }),
    );
    s = processForcedPayment(s, other.id, playerId, GAME_CONFIG.CUOTA_AMOUNT);
  }
  s = appendLog(
    s,
    makeLog(s, 'tribute_collected', `${playerId} cobró Cuota de ${GAME_CONFIG.CUOTA_AMOUNT}M a todos.`, playerId, {
      amount: GAME_CONFIG.CUOTA_AMOUNT,
    }),
  );
  return s;
}

export function drawExtra(
  state: GameState,
  playerId: string,
  actionCardId: string,
  rng: Rng,
): GameState {
  requireTurn(state, playerId);
  const player = getPlayerById(state, playerId)!;
  requireCanPlayMore(player);

  const { player: p1, card: actionCard } = removeFromHand(player, actionCardId);
  if (actionCard.actionName !== 'movida_extra') {
    throw new GameError('Carta no es Movida Extra.');
  }
  let s = applyPlayerUpdate(state, {
    ...p1,
    hasPlayedCardsThisTurn: p1.hasPlayedCardsThisTurn + 1,
  });
  s = discardCardsToPile(s, [actionCard]);
  s = drawCards(s, playerId, 2, rng, ts(s));
  s = appendLog(
    s,
    makeLog(s, 'extra_drawn', `${playerId} usó Movida Extra y robó 2 cartas.`, playerId),
  );
  return s;
}

/** Descarte explícito (forzado o voluntario). NO incrementa hasPlayedCardsThisTurn. */
export function discardFromHand(
  state: GameState,
  playerId: string,
  cardIds: string[],
): GameState {
  const player = getPlayerById(state, playerId);
  if (!player) throw new GameError(`Jugador ${playerId} no existe.`);

  const cards: Card[] = [];
  let newHand = [...player.hand];
  for (const id of cardIds) {
    const idx = newHand.findIndex((c) => c.id === id);
    if (idx < 0) throw new GameError(`Carta ${id} no está en mano.`);
    cards.push(newHand[idx]);
    newHand = newHand.filter((_, i) => i !== idx);
  }
  let s = applyPlayerUpdate(state, { ...player, hand: newHand });
  s = discardCardsToPile(s, cards);
  s = appendLog(
    s,
    makeLog(s, 'cards_discarded', `${playerId} descartó ${cards.length} carta(s).`, playerId, {
      cardIds,
    }),
  );
  return s;
}

/* ---------- Re-exporto predicates para uso desde game.ts ----------- */
export { isAttackAction, isBuilding, isProperty, isRent, isWildcard };
