import type { SetupEffect, TeamComposition } from 'shared';

type OverrideBaseTableEffect = Extract<SetupEffect, { type: 'overrideBaseTable' }>;

/**
 * Replaces the working composition outright rather than delta-adjusting it.
 * Not exercised by any Trouble Brewing role in v1.
 */
export function applyOverrideBaseTable(
  effect: OverrideBaseTableEffect,
  playerCount: number,
  fallback: TeamComposition,
): TeamComposition {
  const override = effect.params.table[playerCount];
  return override ? { ...override } : fallback;
}
