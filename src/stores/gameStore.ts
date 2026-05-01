import { create } from 'zustand';
import { immer } from 'zustand/middleware/immer';
import type {
  CardColor,
  DefenseChoice,
  ExpansionInput,
  GameState,
  PlayerAction,
} from '@/types/game';
import { applyAction, createInitialGameState, type PlayerSeed } from '@/game/game';
import { GameError } from '@/game/actions';
import { defaultRng, type Rng } from '@/game/rng';
import { createIdFactory, type IdFactory } from '@/game/ids';
import type { GamePreferences } from '@/types/game';

/**
 * Store global de partida. Envuelve la lógica pura de `src/game/` —
 * todos los métodos delegan a `applyAction` o `createInitialGameState`.
 *
 * `rng` y `ids` viven fuera del `GameState` porque son sources de
 * aleatoriedad / unicidad, no parte serializable del estado del juego
 * (importante para multijugador en Fase 11: se broadcastea `gameState`,
 * no la rng).
 */

export interface InitGameOptions {
  gameId: string;
  hostId: string;
  playerSeeds: PlayerSeed[];
  rng?: Rng;
  ids?: IdFactory;
  prefs?: Partial<GamePreferences>;
}

export interface GameStoreState {
  gameState: GameState | null;
  /** Última GameError registrada (para que la UI pueda mostrar feedback). */
  lastError: string | null;

  /* Init / lifecycle */
  initGame: (opts: InitGameOptions) => void;
  /** Reemplaza el state entero — útil cuando el host broadcastea STATE_UPDATE. */
  setGameState: (state: GameState) => void;
  reset: () => void;
  clearError: () => void;

  /* Dispatch genérico — type-safe via discriminated union. */
  dispatch: (playerId: string, action: PlayerAction) => void;

  /* Convenience methods — sugar sobre dispatch para cada PlayerAction. */
  playCardAsMoney: (playerId: string, cardId: string) => void;
  playPropertyToSet: (playerId: string, cardId: string, setColor: CardColor) => void;
  playWildcardToSet: (playerId: string, cardId: string, chosenColor: CardColor) => void;
  moveWildcard: (playerId: string, cardId: string, toColor: CardColor) => void;
  playRent: (
    playerId: string,
    rentCardId: string,
    targetSetColor: CardColor,
    targetPlayerId: string,
  ) => void;
  playBuilding: (playerId: string, buildingCardId: string, targetSetColor: CardColor) => void;
  playSobrecargo: (playerId: string) => void;
  confiscate: (
    playerId: string,
    actionCardId: string,
    targetPlayerId: string,
    setColor: CardColor,
  ) => void;
  stealProperty: (
    playerId: string,
    actionCardId: string,
    targetPlayerId: string,
    cardId: string,
  ) => void;
  forceTrade: (
    playerId: string,
    actionCardId: string,
    ownCardId: string,
    targetPlayerId: string,
    targetCardId: string,
  ) => void;
  collectDebt: (playerId: string, actionCardId: string, targetPlayerId: string) => void;
  collectTribute: (playerId: string, actionCardId: string) => void;
  drawExtra: (playerId: string, actionCardId: string) => void;
  discard: (playerId: string, cardIds: string[]) => void;
  endTurn: (playerId: string) => void;
  buyFromMarket: (playerId: string, cardId: string) => void;
  resolveDefense: (defenderId: string, choice: DefenseChoice) => void;
  activateExpansion: (playerId: string, payload: ExpansionInput) => void;
}

interface InternalRefs {
  rng: Rng;
  ids: IdFactory;
}

// `rng` e `ids` viven fuera del store reactivo — no queremos que cada
// invocación los recree, ni que un re-render los observe.
const refs: InternalRefs = {
  rng: defaultRng,
  ids: createIdFactory(),
};

export const useGameStore = create<GameStoreState>()(
  immer((set, get) => {
    const tryDispatch = (playerId: string, action: PlayerAction): void => {
      const current = get().gameState;
      if (!current) {
        set((draft) => {
          draft.lastError = 'No hay partida en curso.';
        });
        return;
      }
      try {
        const next = applyAction(current, playerId, action, refs.rng);
        set((draft) => {
          draft.gameState = next;
          draft.lastError = null;
        });
      } catch (err) {
        const reason =
          err instanceof GameError ? err.reason : err instanceof Error ? err.message : String(err);
        set((draft) => {
          draft.lastError = reason;
        });
      }
    };

    return {
      gameState: null,
      lastError: null,

      initGame: (opts) => {
        refs.rng = opts.rng ?? defaultRng;
        refs.ids = opts.ids ?? createIdFactory();
        try {
          const initial = createInitialGameState({
            gameId: opts.gameId,
            hostId: opts.hostId,
            playerSeeds: opts.playerSeeds,
            rng: refs.rng,
            ids: refs.ids,
            prefs: opts.prefs,
          });
          // eslint-disable-next-line no-console
          console.info('[gameStore] initGame OK', {
            gameId: opts.gameId,
            hostId: opts.hostId,
            seeds: opts.playerSeeds.map((s) => s.id),
            playerCount: opts.playerSeeds.length,
            phase: initial.phase,
          });
          set((draft) => {
            draft.gameState = initial;
            draft.lastError = null;
          });
        } catch (err) {
          const reason =
            err instanceof GameError ? err.reason : err instanceof Error ? err.message : String(err);
          // eslint-disable-next-line no-console
          console.error('[gameStore] initGame FAILED', {
            reason,
            gameId: opts.gameId,
            hostId: opts.hostId,
            seeds: opts.playerSeeds,
            err,
          });
          set((draft) => {
            draft.lastError = `No se pudo iniciar la partida: ${reason}`;
          });
        }
      },

      setGameState: (gameState) => {
        set((draft) => {
          draft.gameState = gameState;
          draft.lastError = null;
        });
      },

      reset: () => {
        refs.rng = defaultRng;
        refs.ids = createIdFactory();
        set((draft) => {
          draft.gameState = null;
          draft.lastError = null;
        });
      },

      clearError: () => {
        set((draft) => {
          draft.lastError = null;
        });
      },

      dispatch: tryDispatch,

      playCardAsMoney: (playerId, cardId) =>
        tryDispatch(playerId, { type: 'PLAY_CARD_AS_MONEY', cardId }),
      playPropertyToSet: (playerId, cardId, setColor) =>
        tryDispatch(playerId, { type: 'PLAY_PROPERTY_TO_SET', cardId, setColor }),
      playWildcardToSet: (playerId, cardId, chosenColor) =>
        tryDispatch(playerId, { type: 'PLAY_WILDCARD_TO_SET', cardId, chosenColor }),
      moveWildcard: (playerId, cardId, toColor) =>
        tryDispatch(playerId, { type: 'MOVE_WILDCARD', cardId, toColor }),
      playRent: (playerId, rentCardId, targetSetColor, targetPlayerId) =>
        tryDispatch(playerId, {
          type: 'PLAY_RENT',
          rentCardId,
          targetSetColor,
          targetPlayerId,
        }),
      playBuilding: (playerId, buildingCardId, targetSetColor) =>
        tryDispatch(playerId, {
          type: 'PLAY_BUILDING',
          buildingCardId,
          targetSetColor,
        }),
      playSobrecargo: (playerId) => tryDispatch(playerId, { type: 'PLAY_SOBRECARGO' }),
      confiscate: (playerId, actionCardId, targetPlayerId, setColor) =>
        tryDispatch(playerId, {
          type: 'CONFISCATE',
          actionCardId,
          targetPlayerId,
          setColor,
        }),
      stealProperty: (playerId, actionCardId, targetPlayerId, cardId) =>
        tryDispatch(playerId, {
          type: 'STEAL_PROPERTY',
          actionCardId,
          targetPlayerId,
          cardId,
        }),
      forceTrade: (playerId, actionCardId, ownCardId, targetPlayerId, targetCardId) =>
        tryDispatch(playerId, {
          type: 'FORCE_TRADE',
          actionCardId,
          ownCardId,
          targetPlayerId,
          targetCardId,
        }),
      collectDebt: (playerId, actionCardId, targetPlayerId) =>
        tryDispatch(playerId, {
          type: 'COLLECT_DEBT',
          actionCardId,
          targetPlayerId,
        }),
      collectTribute: (playerId, actionCardId) =>
        tryDispatch(playerId, { type: 'COLLECT_TRIBUTE', actionCardId }),
      drawExtra: (playerId, actionCardId) =>
        tryDispatch(playerId, { type: 'DRAW_EXTRA', actionCardId }),
      discard: (playerId, cardIds) =>
        tryDispatch(playerId, { type: 'DISCARD', cardIds }),
      endTurn: (playerId) => tryDispatch(playerId, { type: 'END_TURN' }),
      buyFromMarket: (playerId, cardId) =>
        tryDispatch(playerId, { type: 'BUY_FROM_MARKET', cardId }),
      resolveDefense: (defenderId, choice) =>
        tryDispatch(defenderId, { type: 'RESOLVE_DEFENSE', choice }),
      activateExpansion: (playerId, payload) =>
        tryDispatch(playerId, { type: 'ACTIVATE_EXPANSION', payload }),
    };
  }),
);

/* --------------------------- Selectors --------------------------- */

export const selectCurrentPlayer = (s: GameStoreState) => {
  if (!s.gameState) return null;
  return s.gameState.players[s.gameState.currentPlayerIndex] ?? null;
};

export const selectIsMyTurn = (myId: string) => (s: GameStoreState) => {
  return selectCurrentPlayer(s)?.id === myId;
};

export const selectPlayerById = (id: string) => (s: GameStoreState) => {
  return s.gameState?.players.find((p) => p.id === id) ?? null;
};

export const selectWinner = (s: GameStoreState) => s.gameState?.winner ?? null;
export const selectPhase = (s: GameStoreState) => s.gameState?.phase ?? null;
