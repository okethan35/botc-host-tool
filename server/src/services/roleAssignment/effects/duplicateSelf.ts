import type { Role, SetupEffect } from 'shared';

type DuplicateSelfEffect = Extract<SetupEffect, { type: 'duplicateSelf' }>;

/**
 * Not exercised by any Trouble Brewing role in v1 (no TB role duplicates
 * itself) — implemented so a future script's role carrying this effect needs
 * no pipeline changes. Returns the max number of *extra* copies (beyond the
 * first) the draw step is allowed to include for this role.
 */
export function maxExtraCopiesFor(role: Role): number {
  if (!role.setupEffect || role.setupEffect.type !== 'duplicateSelf') return 0;
  const effect = role.setupEffect as DuplicateSelfEffect;
  return effect.params.maxExtraCopies;
}
