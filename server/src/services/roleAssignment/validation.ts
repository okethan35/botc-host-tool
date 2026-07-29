import type { TeamComposition } from 'shared';

/** Thrown by the pipeline when a round's validation pass fails; caller emits `error` and aborts. */
export class RoleAssignmentError extends Error {}

/** Cross-round constraint check: composition must sum to playerCount and stay non-negative. */
export function validateComposition(composition: TeamComposition, playerCount: number): string[] {
  const errors: string[] = [];
  const total = composition.townsfolk + composition.outsider + composition.minion + composition.demon;
  if (total !== playerCount) {
    errors.push(`Role composition totals ${total}, expected ${playerCount} players.`);
  }
  for (const [team, count] of Object.entries(composition) as [keyof TeamComposition, number][]) {
    if (count < 0) {
      errors.push(`${team} count went negative (${count}) after applying setup effects.`);
    }
  }
  return errors;
}

/** Per-round draw-count check: exact number of roles must have been drawn, no accidental duplicates. */
export function validateDrawCount(
  drawn: { id: string }[],
  expectedCount: number,
  label: string,
  allowDuplicates: boolean,
): string[] {
  const errors: string[] = [];
  if (drawn.length !== expectedCount) {
    errors.push(`Drew ${drawn.length} ${label} role(s), expected ${expectedCount}.`);
  }
  if (!allowDuplicates) {
    const seen = new Set<string>();
    for (const role of drawn) {
      if (seen.has(role.id)) {
        errors.push(`${label} role drawn more than once without a duplicateSelf setup effect.`);
      }
      seen.add(role.id);
    }
  }
  return errors;
}

/**
 * Named precondition rules, interpreted server-side for roles carrying a
 * `precondition` setup effect. No Trouble Brewing role triggers this in v1 —
 * the switch exists so a future script needs no pipeline changes, only a
 * new case here.
 */
export function runPreconditionRule(rule: string, _ctx: { playerCount: number }): string | null {
  switch (rule) {
    default:
      return null;
  }
}
