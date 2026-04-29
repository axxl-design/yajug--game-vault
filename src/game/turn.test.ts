import { describe, expect, test } from 'vitest';
import { endTurn, startTurn } from './turn';
import { createMoneyCard, createTitularCard } from './cards';
import { buildTestState, newIds, seededRng } from './test-helpers';
import { GAME_CONFIG } from './constants';
import type { Card } from '@/types/game';

describe('startTurn', () => {
  test('NO roba en el primer turno del jugador (turnsPlayed < players.length)', () => {
    const ids = newIds();
    const c1 = createMoneyCard(1, ids);
    const state = buildTestState({
      players: [{ id: 'p1', hand: [c1] }, { id: 'p2' }],
      turnsPlayed: 0,
      deck: [createMoneyCard(2, ids), createMoneyCard(3, ids)],
    });
    const after = startTurn(state, seededRng());
    expect(after.players[0].hand.length).toBe(1); // sin cambios
  });

  test('roba 2 cartas en turnos posteriores', () => {
    const ids = newIds();
    const state = buildTestState({
      players: [{ id: 'p1', hand: [createMoneyCard(1, ids)] }, { id: 'p2' }],
      turnsPlayed: 2, // ambos jugadores ya jugaron 1 vez
      deck: [createMoneyCard(2, ids), createMoneyCard(3, ids), createMoneyCard(4, ids)],
    });
    const after = startTurn(state, seededRng());
    expect(after.players[0].hand.length).toBe(3);
  });

  test('roba 5 cartas si la mano está vacía', () => {
    const ids = newIds();
    const deck: Card[] = [];
    for (let i = 0; i < 6; i++) deck.push(createMoneyCard(1, ids));
    const state = buildTestState({
      players: [{ id: 'p1' }, { id: 'p2' }],
      turnsPlayed: 2,
      deck,
    });
    const after = startTurn(state, seededRng());
    expect(after.players[0].hand.length).toBe(GAME_CONFIG.CARDS_DRAWN_IF_EMPTY_HAND);
  });

  test('reset de hasPlayedCardsThisTurn y lastRentInTurn', () => {
    const ids = newIds();
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [createMoneyCard(1, ids)], hasPlayedCardsThisTurn: 2 },
      ],
      turnsPlayed: 0,
    });
    const after = startTurn(state, seededRng());
    expect(after.players[0].hasPlayedCardsThisTurn).toBe(0);
    expect(after.players[0].lastRentInTurn).toBeNull();
  });

  test('voltea Titular cuando turnsPlayed múltiplo de 5 y enableTitulares=true', () => {
    const ids = newIds();
    const titular = createTitularCard('boom', 'Boom', 'desc', ids);
    const state = buildTestState({
      players: [{ id: 'p1' }, { id: 'p2' }],
      turnsPlayed: 5,
      enableTitulares: true,
    });
    const stateWithTitulares = { ...state, titularDeck: [titular] };
    const after = startTurn(stateWithTitulares, seededRng());
    expect(after.activeTitular?.name).toBe('Boom');
    expect(after.titularDeck.length).toBe(0);
  });

  test('NO voltea Titular si enableTitulares=false', () => {
    const ids = newIds();
    const titular = createTitularCard('boom', 'Boom', 'desc', ids);
    const state = buildTestState({
      players: [{ id: 'p1' }, { id: 'p2' }],
      turnsPlayed: 5,
      enableTitulares: false,
    });
    const stateWithTitulares = { ...state, titularDeck: [titular] };
    const after = startTurn(stateWithTitulares, seededRng());
    expect(after.activeTitular).toBeNull();
  });
});

describe('endTurn', () => {
  test('forced discard si hand > 7', () => {
    const ids = newIds();
    const hand: Card[] = [];
    for (let i = 0; i < 9; i++) hand.push(createMoneyCard(i + 1, ids));
    const state = buildTestState({
      players: [{ id: 'p1', hand }, { id: 'p2' }],
      turnsPlayed: 0,
    });
    const after = endTurn(state, seededRng());
    // El jugador que TERMINÓ (índice 0 antes del avance) debe quedar con 7 en mano.
    const ended = after.players.find((p) => p.id === 'p1')!;
    expect(ended.hand.length).toBeLessThanOrEqual(GAME_CONFIG.MAX_HAND_SIZE);
    // Las 2 cartas descartadas son las de menor valor (1 y 2).
    const discardedValues = after.discardPile.map((c) => c.value).sort();
    expect(discardedValues).toEqual([1, 2]);
  });

  test('avanza currentPlayerIndex e incrementa turnsPlayed', () => {
    const state = buildTestState({
      players: [{ id: 'p1' }, { id: 'p2' }],
      turnsPlayed: 0,
    });
    const after = endTurn(state, seededRng());
    expect(after.currentPlayerIndex).toBe(1);
    expect(after.turnsPlayed).toBe(1);
  });

  test('wrap del index al final', () => {
    const state = buildTestState({
      players: [{ id: 'p1' }, { id: 'p2' }],
      currentPlayerIndex: 1,
      turnsPlayed: 1,
    });
    const after = endTurn(state, seededRng());
    expect(after.currentPlayerIndex).toBe(0);
    expect(after.turnsPlayed).toBe(2);
  });

  test('si winner ya está seteado, no avanza', () => {
    const state = buildTestState({
      players: [{ id: 'p1' }, { id: 'p2' }],
    });
    const stateWithWinner = { ...state, winner: 'p1' };
    const after = endTurn(stateWithWinner, seededRng());
    expect(after.currentPlayerIndex).toBe(0);
    expect(after.turnsPlayed).toBe(0);
  });

  test('endTurn dispara startTurn del siguiente jugador (drawing si corresponde)', () => {
    const ids = newIds();
    const state = buildTestState({
      players: [
        { id: 'p1', hand: [createMoneyCard(1, ids)] },
        { id: 'p2', hand: [createMoneyCard(1, ids)] },
      ],
      turnsPlayed: 1, // p2 está terminando su primer turno; al avanzar, p1 entra en su 2do turno y SÍ roba.
      currentPlayerIndex: 1,
      deck: [createMoneyCard(2, ids), createMoneyCard(3, ids)],
    });
    const after = endTurn(state, seededRng());
    // p1 (ahora actual) robó 2.
    expect(after.players[0].hand.length).toBe(3);
    expect(after.currentPlayerIndex).toBe(0);
  });
});
