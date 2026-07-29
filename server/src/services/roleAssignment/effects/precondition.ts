import type { SetupEffect } from 'shared';
import { runPreconditionRule } from '../validation';

type PreconditionEffect = Extract<SetupEffect, { type: 'precondition' }>;

/**
 * Runs a role's named precondition rule and returns an error message if
 * unmet (aborting the draw), or null if satisfied. No Trouble Brewing role
 * triggers this in v1 — exercised only by future scripts.
 */
export function checkPrecondition(effect: PreconditionEffect, playerCount: number): string | null {
  return runPreconditionRule(effect.params.rule, { playerCount });
}
