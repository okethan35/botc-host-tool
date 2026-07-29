/** A single row on the night-order checklist, already filtered to roles in play. */
export interface NightOrderItem {
  roleId: string;
  roleName: string;
  order: number;
  seatPosition: number | null;
  playerDisplayName: string | null;
  reminderText: string;
  checked: boolean;
  neighborLeft: string | null;
  neighborRight: string | null;
}

export interface NightOrderProgress {
  gameId: string;
  nightNumber: number;
  roleId: string;
  checked: boolean;
}
