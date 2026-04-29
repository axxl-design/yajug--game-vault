import { beforeEach, describe, expect, test } from 'vitest';
import {
  selectCanStart,
  selectConnectedCount,
  selectIsLocalHost,
  selectLobbyHost,
  useLobbyStore,
} from './lobbyStore';
import { GAME_CONFIG } from '@/game/constants';

beforeEach(() => {
  useLobbyStore.getState().reset();
});

describe('lobbyStore — init', () => {
  test('initLobby crea sala con el local como único jugador', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'ABC123',
      localPlayerId: 'p1',
      localNickname: 'Alice',
      isHost: true,
    });
    const s = useLobbyStore.getState();
    expect(s.gameId).toBe('ABC123');
    expect(s.localPlayerId).toBe('p1');
    expect(s.players.length).toBe(1);
    expect(s.players[0]).toMatchObject({
      id: 'p1',
      nickname: 'Alice',
      isHost: true,
      isConnected: true,
    });
  });

  test('reset limpia todo', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p1',
      localNickname: 'A',
      isHost: true,
    });
    useLobbyStore.getState().reset();
    const s = useLobbyStore.getState();
    expect(s.gameId).toBeNull();
    expect(s.players).toEqual([]);
  });
});

describe('lobbyStore — players', () => {
  beforeEach(() => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p1',
      localNickname: 'A',
      isHost: true,
    });
  });

  test('addPlayer agrega un jugador nuevo', () => {
    useLobbyStore.getState().addPlayer({
      id: 'p2',
      nickname: 'B',
      isHost: false,
      isConnected: true,
    });
    expect(useLobbyStore.getState().players.length).toBe(2);
  });

  test('addPlayer ignora duplicados por id', () => {
    useLobbyStore.getState().addPlayer({
      id: 'p1', // ya existe
      nickname: 'duplicado',
      isHost: false,
      isConnected: true,
    });
    expect(useLobbyStore.getState().players.length).toBe(1);
  });

  test('addPlayer ignora si ya hay MAX_PLAYERS', () => {
    for (let i = 2; i <= GAME_CONFIG.MAX_PLAYERS; i++) {
      useLobbyStore.getState().addPlayer({
        id: `p${i}`,
        nickname: `P${i}`,
        isHost: false,
        isConnected: true,
      });
    }
    // Agregar uno más debe ser ignorado
    useLobbyStore.getState().addPlayer({
      id: 'extra',
      nickname: 'no-entro',
      isHost: false,
      isConnected: true,
    });
    expect(useLobbyStore.getState().players.length).toBe(GAME_CONFIG.MAX_PLAYERS);
  });

  test('removePlayer quita por id', () => {
    useLobbyStore.getState().addPlayer({
      id: 'p2',
      nickname: 'B',
      isHost: false,
      isConnected: true,
    });
    useLobbyStore.getState().removePlayer('p2');
    expect(useLobbyStore.getState().players.length).toBe(1);
  });

  test('setConnected cambia el flag', () => {
    useLobbyStore.getState().addPlayer({
      id: 'p2',
      nickname: 'B',
      isHost: false,
      isConnected: true,
    });
    useLobbyStore.getState().setConnected('p2', false);
    expect(useLobbyStore.getState().players.find((p) => p.id === 'p2')?.isConnected).toBe(false);
  });

  test('setNickname actualiza el nickname', () => {
    useLobbyStore.getState().setNickname('p1', 'NuevoNick');
    expect(useLobbyStore.getState().players.find((p) => p.id === 'p1')?.nickname).toBe('NuevoNick');
  });
});

describe('lobbyStore — selectors', () => {
  test('selectLobbyHost devuelve el host', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p1',
      localNickname: 'A',
      isHost: true,
    });
    expect(selectLobbyHost(useLobbyStore.getState())?.id).toBe('p1');
  });

  test('selectIsLocalHost true cuando local === host', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p1',
      localNickname: 'A',
      isHost: true,
    });
    expect(selectIsLocalHost(useLobbyStore.getState())).toBe(true);
  });

  test('selectIsLocalHost false cuando local no es host', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p2',
      localNickname: 'B',
      isHost: false,
    });
    useLobbyStore.getState().addPlayer({
      id: 'host',
      nickname: 'H',
      isHost: true,
      isConnected: true,
    });
    expect(selectIsLocalHost(useLobbyStore.getState())).toBe(false);
  });

  test('selectConnectedCount excluye desconectados', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p1',
      localNickname: 'A',
      isHost: true,
    });
    useLobbyStore.getState().addPlayer({
      id: 'p2',
      nickname: 'B',
      isHost: false,
      isConnected: true,
    });
    useLobbyStore.getState().setConnected('p2', false);
    expect(selectConnectedCount(useLobbyStore.getState())).toBe(1);
  });

  test('selectCanStart respeta MIN/MAX', () => {
    useLobbyStore.getState().initLobby({
      gameId: 'X',
      localPlayerId: 'p1',
      localNickname: 'A',
      isHost: true,
    });
    expect(selectCanStart(useLobbyStore.getState())).toBe(false); // 1 jugador
    useLobbyStore.getState().addPlayer({
      id: 'p2',
      nickname: 'B',
      isHost: false,
      isConnected: true,
    });
    expect(selectCanStart(useLobbyStore.getState())).toBe(true); // 2 conectados
  });
});
