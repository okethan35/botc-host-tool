import type { Alignment, GamePhase, Role } from 'shared';

/** Server-internal full game record - includes hostToken, never sent to clients directly. */
export interface RuntimeGame {
  id: string;
  code: string;
  hostToken: string;
  scriptId: string;
  phase: GamePhase;
  nightNumber: number;
  createdAt: string;
}

/** Server-internal full player record - includes sessionToken/socketId, never broadcast as-is. */
export interface RuntimePlayer {
  id: string;
  gameId: string;
  displayName: string;
  hasDevice: boolean;
  socketId: string | null;
  sessionToken: string;
  seatPosition: number;
  roleId: string | null;
  believedRoleId: string | null;
  alignment: Alignment | null;
  alive: boolean;
  hostNotes: string;
  isHost: boolean;
}

/** In-memory runtime state for a single game, lazily hydrated from Postgres. */
export interface RuntimeState {
  game: RuntimeGame;
  players: Map<string, RuntimePlayer>;
  /** Full role list for the game's script - static, cached once per game. */
  roles: Role[];
  /** Night-order checkbox progress, key `${nightNumber}:${roleId}`. */
  nightOrderProgress: Map<string, boolean>;
}
