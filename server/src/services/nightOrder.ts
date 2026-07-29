import { getNeighbors } from 'shared';
import type { NightOrderItem } from 'shared';
import type { RuntimeState } from '../state/types';

/**
 * Builds the night-order checklist for a given night number: filters the
 * script's full role list down to roles actually present in this game,
 * sorted by firstNightOrder (night 1) or otherNightOrder (night 2+).
 */
export function buildNightOrderChecklist(state: RuntimeState, nightNumber: number): NightOrderItem[] {
  const isFirstNight = nightNumber <= 1;
  const players = [...state.players.values()];
  const items: NightOrderItem[] = [];

  for (const role of state.roles) {
    const order = isFirstNight ? role.firstNightOrder : role.otherNightOrder;
    if (order === null || order === undefined) continue;

    const player = players.find((p) => p.roleId === role.id) ?? null;
    if (!player) continue; // role not in play this game

    const neighbors = getNeighbors(players, player.seatPosition);
    const key = `${nightNumber}:${role.id}`;

    items.push({
      roleId: role.id,
      roleName: role.name,
      order,
      seatPosition: player.seatPosition,
      playerDisplayName: player.displayName,
      reminderText: role.reminderText,
      checked: state.nightOrderProgress.get(key) ?? false,
      neighborLeft: neighbors.left?.displayName ?? null,
      neighborRight: neighbors.right?.displayName ?? null,
    });
  }

  items.sort((a, b) => a.order - b.order);
  return items;
}
