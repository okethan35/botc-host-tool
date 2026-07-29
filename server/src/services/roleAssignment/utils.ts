import type { Role, Team } from 'shared';

/** Fisher-Yates shuffle, non-mutating. */
export function shuffle<T>(items: T[]): T[] {
  const result = [...items];
  for (let i = result.length - 1; i > 0; i -= 1) {
    const j = Math.floor(Math.random() * (i + 1));
    const tmp = result[i]!;
    result[i] = result[j]!;
    result[j] = tmp;
  }
  return result;
}

/** Draws `count` distinct roles at random from `pool` (no replacement). */
export function drawRandom(pool: Role[], count: number): Role[] {
  return shuffle(pool).slice(0, Math.max(0, count));
}

export function groupByTeam(roles: Role[]): Record<Team, Role[]> {
  const result: Record<Team, Role[]> = { townsfolk: [], outsider: [], minion: [], demon: [] };
  for (const role of roles) {
    result[role.team].push(role);
  }
  return result;
}

export function clamp(value: number, min: number, max: number): number {
  return Math.min(max, Math.max(min, value));
}
