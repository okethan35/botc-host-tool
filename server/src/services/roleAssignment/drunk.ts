import type { Role } from 'shared';
import type { RuntimeState } from '../../state/types';

/**
 * Picks the Townsfolk role a Drunk player is secretly told they are. Per the
 * real rule, this should be a Townsfolk that's NOT in play this game (the
 * Drunk's presence is what displaced it); `excludeRoleIds` is normally the
 * set of roles actually drawn/assigned this game. Falls back to any
 * Townsfolk role if every Townsfolk on the script happens to be in play.
 */
export function pickBelievedRoleForDrunk(state: RuntimeState, excludeRoleIds: Set<string>): Role | null {
  const townsfolk = state.roles.filter((r) => r.team === 'townsfolk');
  const notInPlay = townsfolk.filter((r) => !excludeRoleIds.has(r.id));
  const pool = notInPlay.length > 0 ? notInPlay : townsfolk;
  if (pool.length === 0) return null;
  return pool[Math.floor(Math.random() * pool.length)] ?? null;
}
