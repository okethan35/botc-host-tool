import type { OwnRoleReveal } from 'shared';
import type { RuntimePlayer, RuntimeState } from '../state/types';

/**
 * What a player is told about themselves once a role is assigned - never
 * their neighbors'. If the player's real role is the Drunk, this reveals
 * their *believed* Townsfolk role instead - the player is never told they
 * are the Drunk, only the host sees both (via the full `Player.roleId` +
 * `Player.believedRoleId` pair).
 */
export function buildOwnRoleReveal(state: RuntimeState, player: RuntimePlayer): OwnRoleReveal | null {
  const revealRoleId = player.believedRoleId ?? player.roleId;
  if (!revealRoleId) return null;
  const role = state.roles.find((r) => r.id === revealRoleId);
  if (!role) return null;
  return {
    roleId: role.id,
    roleName: role.name,
    team: role.team,
    abilityText: role.abilityText,
    faqText: role.faqText,
    // Falls back to the role's default team alignment only if a per-player
    // alignment hasn't been set yet (shouldn't normally happen post-assignment).
    alignment: player.alignment ?? (role.team === 'minion' || role.team === 'demon' ? 'evil' : 'good'),
  };
}
