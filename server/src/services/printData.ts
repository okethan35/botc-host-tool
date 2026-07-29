import { sortBySeat } from 'shared';
import type { RuntimeState } from '../state/types';

export interface PrintSeat {
  seatPosition: number;
  displayName: string;
  roleName: string | null;
}

export interface PrintData {
  code: string;
  totalSeats: number;
  seats: PrintSeat[];
}

/** Pre-filled data for the printable grimoire reference (route: GET /api/games/:gameId/print). */
export function buildPrintData(state: RuntimeState): PrintData {
  const players = sortBySeat([...state.players.values()]);
  const roleById = new Map(state.roles.map((r) => [r.id, r]));

  return {
    code: state.game.code,
    totalSeats: players.length,
    seats: players.map((p) => ({
      seatPosition: p.seatPosition,
      displayName: p.displayName,
      roleName: p.roleId ? (roleById.get(p.roleId)?.name ?? null) : null,
    })),
  };
}
