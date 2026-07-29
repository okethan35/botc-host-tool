export type GamePhase = 'lobby' | 'night' | 'day';

/** Full game record as seen by the host (never sent to non-host players). */
export interface Game {
  id: string;
  code: string;
  scriptId: string;
  phase: GamePhase;
  nightNumber: number;
  createdAt: string;
}

/** Subset of Game fields safe to broadcast to every connected player. */
export interface PublicGame {
  id: string;
  code: string;
  phase: GamePhase;
  nightNumber: number;
}
