import { getNeighbors } from 'shared';
import type { SeatingWarningItem } from 'shared';
import type { RuntimeState } from '../../../state/types';

/**
 * Re-run after every `seats:reorder` (see socket/handlers/seats.ts) for any
 * in-play role carrying a `seatingConstraint` setup effect. Non-blocking —
 * returns warnings, never repositions players automatically. No Trouble
 * Brewing role uses this in v1; the rule names below (`adjacentToDemon`,
 * `evilContiguousCentered`) are documented conventions for future scripts
 * (e.g. Marionette, Lord of Typhon) so they need no pipeline changes.
 */
export function checkSeatingConstraints(state: RuntimeState): SeatingWarningItem[] {
  const players = [...state.players.values()];
  const warnings: SeatingWarningItem[] = [];

  for (const role of state.roles) {
    if (!role.setupEffect || role.setupEffect.type !== 'seatingConstraint') continue;
    const player = players.find((p) => p.roleId === role.id);
    if (!player) continue; // role not in play this game

    const rule = role.setupEffect.params.rule;
    if (rule === 'adjacentToDemon') {
      const demonRole = state.roles.find((r) => r.team === 'demon');
      const demonPlayer = demonRole ? players.find((p) => p.roleId === demonRole.id) : undefined;
      if (demonPlayer) {
        const { left, right } = getNeighbors(players, player.seatPosition);
        const isAdjacent = left?.id === demonPlayer.id || right?.id === demonPlayer.id;
        if (!isAdjacent) {
          warnings.push({
            roleId: role.id,
            roleName: role.name,
            message: `${role.name} must be seated next to the Demon — currently not adjacent.`,
          });
        }
      }
    } else if (rule === 'evilContiguousCentered') {
      // Placeholder for future scripts requiring evil to sit in a contiguous
      // block centered on the demon — not needed by any TB role.
    }
  }

  return warnings;
}
