import type { Role, SetupEffect } from 'shared';

export * from './countDelta';
export * from './duplicateSelf';
export * from './overrideBaseTable';
export * from './precondition';
export * from './deferredAssignment';
export * from './seatingConstraint';

export interface RoleWithEffect {
  role: Role;
  effect: SetupEffect;
}

/** Collects every non-null setupEffect carried by a set of drawn roles. */
export function collectSetupEffects(drawnRoles: Role[]): RoleWithEffect[] {
  const result: RoleWithEffect[] = [];
  for (const role of drawnRoles) {
    if (role.setupEffect) {
      result.push({ role, effect: role.setupEffect });
    }
  }
  return result;
}
