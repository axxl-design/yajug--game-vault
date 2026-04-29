import type { Card, GameState } from '@/types/game';
import { GAME_CONFIG, MARKET_PRICES } from './constants';
import { applyPlayerUpdate, appendLog, makeLog } from './state-helpers';
import { GameError } from './actions';
import { ensureDeckHasCards } from './deck';
import { defaultRng, type Rng } from './rng';

export function getMarketPrice(card: Card): number {
  return MARKET_PRICES[card.type];
}

export function buyFromMarket(
  state: GameState,
  playerId: string,
  cardId: string,
  rng: Rng = defaultRng,
): GameState {
  if (state.phase !== 'playing') {
    throw new GameError(`No se puede comprar en phase=${state.phase}.`);
  }
  if (state.players[state.currentPlayerIndex]?.id !== playerId) {
    throw new GameError(`No es turno de ${playerId}.`);
  }
  const player = state.players.find((p) => p.id === playerId);
  if (!player) throw new GameError(`Jugador ${playerId} no existe.`);
  if (player.hasBoughtFromMarket) {
    throw new GameError(`${playerId} ya compró del mercado este turno.`);
  }
  const card = state.marketCards.find((c) => c.id === cardId);
  if (!card) throw new GameError(`Carta ${cardId} no está en el Mercado.`);
  const price = getMarketPrice(card);
  const bankTotal = player.bank.reduce((sum, c) => sum + c.value, 0);
  if (bankTotal < price) {
    throw new GameError(`No tenés suficiente dinero ($${price}M).`);
  }

  // Pagar: descontar cartas del banco lowest-first hasta cubrir el precio.
  const sortedBank = [...player.bank].sort(
    (a, b) => a.value - b.value || a.id.localeCompare(b.id),
  );
  const paid: Card[] = [];
  let remaining = price;
  for (const c of sortedBank) {
    if (remaining <= 0) break;
    paid.push(c);
    remaining -= c.value;
  }
  const paidIds = new Set(paid.map((c) => c.id));
  const newBank = player.bank.filter((c) => !paidIds.has(c.id));

  // Sacar la carta del Mercado, agregarla a la mano del jugador.
  const newMarket = state.marketCards.filter((c) => c.id !== cardId);
  let s: GameState = {
    ...state,
    marketCards: newMarket,
    discardPile: [...state.discardPile, ...paid],
  };
  s = applyPlayerUpdate(s, {
    ...player,
    bank: newBank,
    hand: [...player.hand, card],
    hasBoughtFromMarket: true,
  });
  s = appendLog(
    s,
    makeLog(s, 'market_bought', `${playerId} compró ${card.name} por $${price}M.`, playerId, {
      cardId,
      price,
    }),
  );

  // Refill del Mercado desde el deck principal.
  s = ensureDeckHasCards(s, rng, s.log.length);
  if (s.deck.length > 0) {
    const next = s.deck[0];
    s = {
      ...s,
      marketCards: [...s.marketCards, next],
      deck: s.deck.slice(1),
    };
    s = appendLog(
      s,
      makeLog(s, 'market_refilled', `Mercado se reabasteció con ${next.name}.`),
    );
  }

  // Trigger de carga: cualquier "money_received" del banquero por las cartas pagadas
  // no aplica (acá el banco sale, no entra). Pero el comprador agregó carta a su mano,
  // lo cual NO está en los triggers definidos. Sin charge.
  return s;
}

/** Inicializa el Mercado con las primeras N cartas del deck. */
export function initMarket(state: GameState): GameState {
  const size = Math.min(GAME_CONFIG.MARKET_SIZE, state.deck.length);
  return {
    ...state,
    marketCards: state.deck.slice(0, size),
    deck: state.deck.slice(size),
  };
}
