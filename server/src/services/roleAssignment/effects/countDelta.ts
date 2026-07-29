import type { SetupEffect, TeamComposition } from 'shared';

type CountDeltaEffect = Extract<SetupEffect, { type: 'countDelta' }>;

/**
 * Applies a fixed (non-host-chosen) countDelta: `targetTeam` += delta,
 * `offsetTeam` -= delta. For non-`hostChoosable` effects, the fixed delta is
 * taken to be `params.max` (the convention for this effect type when
 * min === max, i.e. there is only one possible value).
 */
export function applyFixedCountDelta(
  composition: TeamComposition,
  effect: CountDeltaEffect,
): TeamComposition {
  const delta = effect.params.max;
  return applyChosenCountDelta(composition, effect, delta);
}

/** Applies a host-chosen delta (already clamped to [min, max] by the caller). */
export function applyChosenCountDelta(
  composition: TeamComposition,
  effect: CountDeltaEffect,
  delta: number,
): TeamComposition {
  const next = { ...composition };
  next[effect.params.targetTeam] += delta;
  next[effect.params.offsetTeam] -= delta;
  return next;
}
