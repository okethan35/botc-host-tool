import type { Alignment, Team } from './types/role';
import type { GamePhase, PublicGame } from './types/game';
import type { OwnRoleReveal, Player, PublicPlayer } from './types/player';
import type { NightOrderItem } from './types/nightOrder';

/**
 * Socket.io event name constants. Single namespace; sockets join room
 * `game:{gameId}`, host sockets additionally join `game:{gameId}:host`.
 * Client -> server events only ack for error signaling — success flows
 * through the broadcasts below, never duplicated in the ack payload.
 */
export const SOCKET_EVENTS = {
  // Session / reconnect
  SESSION_AUTH: 'session:auth',
  SESSION_RESUMED: 'session:resumed',
  SESSION_INVALID: 'session:invalid',

  // Player management (host-only mutations)
  PLAYER_ADD_PHANTOM: 'player:addPhantom',
  PLAYER_REMOVE: 'player:remove',
  PLAYER_UPDATE_NOTES: 'player:updateNotes',
  PLAYER_SET_ALIVE: 'player:setAlive',
  PLAYER_SET_ALIGNMENT: 'player:setAlignment',
  PLAYER_SET_ROLE: 'player:setRole',
  PLAYER_CONVERT_TO_REAL: 'player:convertToReal',
  PLAYER_CONVERSION_READY: 'player:conversionReady',
  PLAYER_ROLE_ASSIGNED: 'player:roleAssigned',

  // Broadcasts
  GRIMOIRE_UPDATE: 'grimoire:update',
  BOARD_UPDATE: 'board:update',

  // Seating
  SEATS_REORDER: 'seats:reorder',
  SEATING_WARNING: 'seating:warning',

  // Role assignment
  ROLES_ASSIGN: 'roles:assign',
  ROLES_SETUP_CHOICE_REQUIRED: 'roles:setupChoiceRequired',
  ROLES_SETUP_CHOICE_ANSWER: 'roles:setupChoiceAnswer',

  // Phase
  PHASE_CHANGE: 'phase:change',
  PHASE_CHANGED: 'phase:changed',

  // Night order
  NIGHT_ORDER_GET: 'nightOrder:get',
  NIGHT_ORDER_LIST: 'nightOrder:list',
  NIGHT_ORDER_CHECK: 'nightOrder:check',
  NIGHT_ORDER_ITEM_UPDATED: 'nightOrder:itemUpdated',

  // Generic
  ERROR: 'error',
} as const;

// ---------------------------------------------------------------------------
// Payload interfaces
// ---------------------------------------------------------------------------

export type SessionAuthPayload =
  | { role: 'host'; gameId: string; hostToken: string }
  | { role: 'player'; gameId: string; playerId: string; sessionToken: string };

export interface SessionResumedHostPayload {
  role: 'host';
  game: import('./types/game').Game;
  players: Player[];
  roles: import('./types/role').Role[];
}

export interface SessionResumedPlayerPayload {
  role: 'player';
  game: PublicGame;
  players: PublicPlayer[];
  self: PublicPlayer;
  ownRole: OwnRoleReveal | null;
}

export type SessionResumedPayload = SessionResumedHostPayload | SessionResumedPlayerPayload;

export interface SessionInvalidPayload {
  reason: string;
}

export interface PlayerAddPhantomPayload {
  displayName: string;
}

export interface PlayerRemovePayload {
  playerId: string;
}

export interface PlayerUpdateNotesPayload {
  playerId: string;
  hostNotes: string;
}

export interface PlayerSetAlivePayload {
  playerId: string;
  alive: boolean;
}

export interface PlayerSetAlignmentPayload {
  playerId: string;
  alignment: Alignment;
}

export interface PlayerSetRolePayload {
  playerId: string;
  roleId: string | null;
}

export interface PlayerConvertToRealPayload {
  playerId: string;
}

export interface PlayerConversionReadyPayload {
  playerId: string;
  claimUrl: string;
  sessionToken: string;
}

export interface GrimoireUpdatePayload {
  players: Player[];
}

export interface BoardUpdatePayload {
  game: PublicGame;
  players: PublicPlayer[];
}

export interface SeatsReorderPayload {
  orderedPlayerIds: string[];
}

export interface SeatingWarningItem {
  roleId: string;
  roleName: string;
  message: string;
}

export interface SeatingWarningPayload {
  warnings: SeatingWarningItem[];
}

// No fields — host triggers assignment for the current roster.
export type RolesAssignPayload = Record<string, never>;

export interface PendingSetupChoice {
  roleId: string;
  roleName: string;
  effectType: 'countDelta' | 'duplicateSelf' | 'overrideBaseTable' | 'precondition' | 'deferredAssignment';
  min: number;
  max: number;
  offsetTeam: Team;
}

export interface RolesSetupChoiceRequiredPayload {
  pending: PendingSetupChoice[];
}

export interface RolesSetupChoiceAnswerPayload {
  roleId: string;
  chosenValue: number;
}

export interface PhaseChangePayload {
  phase: GamePhase;
}

export interface PhaseChangedPayload {
  game: PublicGame;
}

// No fields — requests the current checklist.
export type NightOrderGetPayload = Record<string, never>;

export interface NightOrderListPayload {
  nightNumber: number;
  items: NightOrderItem[];
}

export interface NightOrderCheckPayload {
  roleId: string;
  checked: boolean;
}

export interface NightOrderItemUpdatedPayload {
  roleId: string;
  checked: boolean;
}

export interface ErrorPayload {
  message: string;
  code?: string;
}

// ---------------------------------------------------------------------------
// Typed event maps for socket.io Server<C2S, S2C> / socket.io-client
// ---------------------------------------------------------------------------

export interface ClientToServerEvents {
  'session:auth': (payload: SessionAuthPayload) => void;
  'player:addPhantom': (payload: PlayerAddPhantomPayload) => void;
  'player:remove': (payload: PlayerRemovePayload) => void;
  'player:updateNotes': (payload: PlayerUpdateNotesPayload) => void;
  'player:setAlive': (payload: PlayerSetAlivePayload) => void;
  'player:setAlignment': (payload: PlayerSetAlignmentPayload) => void;
  'player:setRole': (payload: PlayerSetRolePayload) => void;
  'player:convertToReal': (payload: PlayerConvertToRealPayload) => void;
  'seats:reorder': (payload: SeatsReorderPayload) => void;
  'roles:assign': (payload: RolesAssignPayload) => void;
  'roles:setupChoiceAnswer': (payload: RolesSetupChoiceAnswerPayload) => void;
  'phase:change': (payload: PhaseChangePayload) => void;
  'nightOrder:get': (payload: NightOrderGetPayload) => void;
  'nightOrder:check': (payload: NightOrderCheckPayload) => void;
}

export interface ServerToClientEvents {
  'session:resumed': (payload: SessionResumedPayload) => void;
  'session:invalid': (payload: SessionInvalidPayload) => void;
  'player:conversionReady': (payload: PlayerConversionReadyPayload) => void;
  'player:roleAssigned': (payload: OwnRoleReveal) => void;
  'grimoire:update': (payload: GrimoireUpdatePayload) => void;
  'board:update': (payload: BoardUpdatePayload) => void;
  'seating:warning': (payload: SeatingWarningPayload) => void;
  'roles:setupChoiceRequired': (payload: RolesSetupChoiceRequiredPayload) => void;
  'phase:changed': (payload: PhaseChangedPayload) => void;
  'nightOrder:list': (payload: NightOrderListPayload) => void;
  'nightOrder:itemUpdated': (payload: NightOrderItemUpdatedPayload) => void;
  error: (payload: ErrorPayload) => void;
}
