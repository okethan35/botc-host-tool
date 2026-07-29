export interface SeatedEntity {
  seatPosition: number;
}

export interface Neighbors<T> {
  left: T | null;
  right: T | null;
}

/**
 * Computes the left/right physical neighbors of the player at `seatPosition`,
 * wrapping around the circle. `players` need not be pre-sorted.
 *
 * "Left" = previous seat position in the ring, "right" = next seat position -
 * pure seat-index adjacency, no assumption about facing direction.
 */
export function getNeighbors<T extends SeatedEntity>(
  players: T[],
  seatPosition: number,
): Neighbors<T> {
  const sorted = [...players].sort((a, b) => a.seatPosition - b.seatPosition);
  const index = sorted.findIndex((p) => p.seatPosition === seatPosition);
  if (index === -1 || sorted.length < 2) {
    return { left: null, right: null };
  }
  const leftIndex = (index - 1 + sorted.length) % sorted.length;
  const rightIndex = (index + 1) % sorted.length;
  const left = sorted[leftIndex];
  const right = sorted[rightIndex];
  return {
    left: leftIndex === index ? null : (left ?? null),
    right: rightIndex === index ? null : (right ?? null),
  };
}

/** Returns `players` sorted ascending by seatPosition. */
export function sortBySeat<T extends SeatedEntity>(players: T[]): T[] {
  return [...players].sort((a, b) => a.seatPosition - b.seatPosition);
}
