import type { SetupEffect } from 'shared';

type DeferredAssignmentEffect = Extract<SetupEffect, { type: 'deferredAssignment' }>;

/**
 * Marks a slot (demon/minion) as intentionally unfilled rather than drawing
 * a role into it - e.g. a future script's "no demon this game" mechanic. Not
 * exercised by any Trouble Brewing role in v1.
 */
export function deferredSlotFor(effect: DeferredAssignmentEffect): 'demon' | 'minion' {
  return effect.params.slot;
}
