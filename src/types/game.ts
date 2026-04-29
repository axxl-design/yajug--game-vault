/* ============================================================
   Tipos del dominio de juego — YAJUGÁ: DOMINIO
   Portados de la sección 5 del brief v3 con limpieza menor:
   - `data: any` → `unknown` para no perder type-safety.
   - Forward-refs ordenados antes de uso.
   - Algunos campos optional fueron concretados según uso real.
   ============================================================ */

export type CardColor =
  | 'rojo'
  | 'naranja'
  | 'amarillo'
  | 'verde'
  | 'turquesa'
  | 'azul'
  | 'morado'
  | 'rosa'
  | 'marron'
  | 'gris'
  | 'comodin';

export type CardType =
  | 'property'
  | 'money'
  | 'action'
  | 'rent'
  | 'building'
  | 'wildcard'
  | 'event';

export type ActionCardName =
  | 'bloqueo'
  | 'confiscacion'
  | 'trato_sucio'
  | 'trueque_forzado'
  | 'factura'
  | 'cuota'
  | 'movida_extra'
  | 'sobrecargo'
  | 'edificio'
  | 'torre';

export interface Card {
  id: string;
  type: CardType;
  name: string;
  description?: string;
  /** Valor monetario al jugarse al banco / al pagar. */
  value: number;
  /** Color principal: para propiedades de un solo color. */
  color?: CardColor;
  /** Para wildcards (2+ colores) y rentas por par.
   *  Array vacío = "cualquier color" (multicolor universal). */
  colors?: CardColor[];
  actionName?: ActionCardName;
  imageKey: string;
}

export type RoleId =
  | 'abogado'
  | 'corredor'
  | 'estafador'
  | 'banquero'
  | 'coleccionista'
  | 'arquitecto';

export type ExpansionId =
  | 'tribunal_dominio'
  | 'inmunidad_diplomatica'
  | 'subasta_siglo'
  | 'pacto_comercial'
  | 'el_truco'
  | 'doble_identidad'
  | 'auditoria_forzada'
  | 'prestamo_forzado'
  | 'trueque_imperial'
  | 'camara_archivo'
  | 'rascacielos'
  | 'reordenamiento_urbano';

export interface ChargeRule {
  trigger:
    | 'attacked'
    | 'rent_collected'
    | 'card_discarded'
    | 'money_received'
    | 'property_added'
    | 'building_played';
  amount: number;
}

export interface Role {
  id: RoleId;
  name: string;
  description: string;
  passiveAbility: string;
  expansions: [ExpansionId, ExpansionId];
  imageKey: string;
}

export interface Expansion {
  id: ExpansionId;
  roleId: RoleId;
  name: string;
  description: string;
  chargeCondition: string;
  chargeRule: ChargeRule;
  effect: string;
  exitCost: string;
  duration: 'one_round' | 'instant' | 'permanent';
}

export interface PropertySet {
  color: CardColor;
  properties: Card[]; // Incluye wildcards asignadas a este color.
  buildings: Card[]; // Edificio / Torre.
  isComplete: boolean;
  requiredCount: number;
  isMonument: boolean; // Reservado para Fase 9 (Rascacielos).
}

export type ActiveEffectType =
  | 'inmunidad'
  | 'pacto_comercial'
  | 'doble_identidad'
  | 'prestamo_forzado'
  | 'audit_freeze'
  | 'rentas_canceladas'
  | 'rentas_dobles'
  | 'rentas_triples'
  | 'mano_publica'
  | 'titular_active';

export interface ActiveEffect {
  id: string;
  type: ActiveEffectType;
  sourcePlayerId: string;
  durationRounds: number;
  data?: unknown;
}

export interface Player {
  id: string;
  nickname: string;
  role: RoleId;
  expansion: ExpansionId;
  expansionCharge: number; // 0-100
  expansionUsed: boolean;
  passiveUsed: boolean;
  hand: Card[];
  bank: Card[];
  sets: PropertySet[];
  hasFinishedTurn: boolean;
  isConnected: boolean;
  hasPlayedCardsThisTurn: number; // 0-3
  effects: ActiveEffect[];
  /** Última Renta cobrada en el turno — necesario para Sobrecargo. */
  lastRentInTurn: { amount: number; targetIds: string[]; rentCardId: string } | null;
  /** Phase 9+: deuda con Banquero (Préstamo Forzado). */
  bankerDebt: number;
}

export type GamePhase =
  | 'lobby'
  | 'role_assignment'
  | 'playing'
  | 'defense_pending'
  | 'expansion_active'
  | 'tiempo_extra'
  | 'titular_active'
  | 'game_over';

export interface PendingDefense {
  attackerId: string;
  defenderId: string;
  cardPlayed: Card;
  context: unknown;
  timeoutAt: number;
}

export interface ActiveExpansion {
  playerId: string;
  expansionId: ExpansionId;
  state: unknown;
  endsAtTurn: number;
}

export interface TiempoExtraState {
  triggeringPlayerId: string;
  remainingPlayers: string[];
  turnsRemaining: number;
}

export type GameLogEntryType =
  | 'game_started'
  | 'turn_started'
  | 'turn_ended'
  | 'card_drawn'
  | 'card_played_money'
  | 'card_played_property'
  | 'card_played_action'
  | 'wildcard_placed'
  | 'wildcard_moved'
  | 'building_played'
  | 'rent_collected'
  | 'sobrecargo_applied'
  | 'property_stolen'
  | 'set_confiscated'
  | 'property_traded'
  | 'debt_collected'
  | 'tribute_collected'
  | 'extra_drawn'
  | 'pay_processed'
  | 'cards_discarded'
  | 'set_completed'
  | 'set_broken'
  | 'deck_reshuffled'
  | 'game_won'
  | 'defense_would_trigger'; // Marcador de Fase 4 — Defense real va en Fase 7.

export interface GameLogEntry {
  timestamp: number;
  type: GameLogEntryType;
  playerId?: string;
  data?: unknown;
  humanReadable: string;
}

export interface GamePreferences {
  enableTitulares: boolean;
  enableSounds: boolean;
  enableAnimations: boolean;
}

export interface GameState {
  gameId: string;
  hostId: string;
  phase: GamePhase;
  players: Player[];
  currentPlayerIndex: number;
  turnsPlayed: number;
  deck: Card[];
  discardPile: Card[];
  marketCards: Card[];
  marketDeck: Card[];
  titularDeck: Card[];
  activeTitular: Card | null;
  pendingDefense: PendingDefense | null;
  activeExpansion: ActiveExpansion | null;
  tiempoExtraState: TiempoExtraState | null;
  winner: string | null;
  log: GameLogEntry[];
  prefs: GamePreferences;
}

export interface PaymentDetail {
  cardId: string;
  fromBank: boolean;
}

export type PlayerAction =
  | { type: 'PLAY_CARD_AS_MONEY'; cardId: string }
  | { type: 'PLAY_PROPERTY_TO_SET'; cardId: string; setColor: CardColor }
  | { type: 'PLAY_WILDCARD_TO_SET'; cardId: string; chosenColor: CardColor }
  | { type: 'MOVE_WILDCARD'; cardId: string; toColor: CardColor }
  | { type: 'PLAY_RENT'; rentCardId: string; targetSetColor: CardColor; targetPlayerId?: string }
  | { type: 'PLAY_BUILDING'; buildingCardId: string; targetSetColor: CardColor }
  | { type: 'PLAY_SOBRECARGO' }
  | { type: 'CONFISCATE'; actionCardId: string; targetPlayerId: string; setColor: CardColor }
  | { type: 'STEAL_PROPERTY'; actionCardId: string; targetPlayerId: string; cardId: string }
  | {
      type: 'FORCE_TRADE';
      actionCardId: string;
      ownCardId: string;
      targetPlayerId: string;
      targetCardId: string;
    }
  | { type: 'COLLECT_DEBT'; actionCardId: string; targetPlayerId: string }
  | { type: 'COLLECT_TRIBUTE'; actionCardId: string }
  | { type: 'DRAW_EXTRA'; actionCardId: string }
  | { type: 'DISCARD'; cardIds: string[] }
  | { type: 'END_TURN' };
