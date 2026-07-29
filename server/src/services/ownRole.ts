import type { Alignment, OwnRoleReveal } from 'shared';
import type { RuntimeState } from '../state/types';

/** What a player is told about themselves once a role is assigned — never their neighbors'. */
export function buildOwnRoleReveal(
  state: RuntimeState,
  roleId: string,
  alignment: Alignment | null,
): OwnRoleReveal | null {
  const role = state.roles.find((r) => r.id === roleId);
  if (!role) return null;
  return {
    roleId: role.id,
    roleName: role.name,
    team: role.team,
    abilityText: role.abilityText,
    faqText: role.faqText,
    // Falls back to the role's default team alignment only if a per-player
    // alignment hasn't been set yet (shouldn't normally happen post-assignment).
    alignment: alignment ?? (role.team === 'minion' || role.team === 'demon' ? 'evil' : 'good'),
  };
}
