import type { Alignment } from './role';

/** Full player record as seen by the host grimoire - includes role, alignment, notes. */
export interface Player {
  id: string;
  gameId: string;
  displayName: string;
  hasDevice: boolean;
  seatPosition: number;
  roleId: string | null;
  /** Set only when roleId is the Drunk - the Townsfolk role this player has been
   * secretly told they are. Never sent to the player themselves, host-only. */
  believedRoleId: string | null;
  alignment: Alignment | null;
  alive: boolean;
  hostNotes: string;
  isHost: boolean;
}

/** Player fields safe to broadcast to everyone (public board) - no role/alignment/notes. */
export interface PublicPlayer {
  id: string;
  displayName: string;
  hasDevice: boolean;
  seatPosition: number;
  alive: boolean;
  isHost: boolean;
}

/** What an individual player is told about themselves once a role is assigned. */
export interface OwnRoleReveal {
  roleId: string;
  roleName: string;
  team: string;
  abilityText: string;
  faqText: string;
  /** The player's own current alignment - independent of role's default team (e.g. Recluse). */
  alignment: Alignment;
}

/** Neighbor lookup result for a given seat, used by grimoire + night-order checklist. */
export interface SeatNeighbors {
  left: PublicPlayer | null;
  right: PublicPlayer | null;
}
