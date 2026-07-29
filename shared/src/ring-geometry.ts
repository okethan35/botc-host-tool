export interface Point {
  x: number;
  y: number;
}

/**
 * Converts a seat index into an (x, y) offset from the ring's center, with
 * seat 0 placed at the top and seats proceeding clockwise. Pure math, reused
 * by both the live grimoire ring and the print ring.
 */
export function polarToCartesian(seatIndex: number, totalSeats: number, radius: number): Point {
  if (totalSeats <= 0) {
    return { x: 0, y: 0 };
  }
  const angleRad = (seatIndex / totalSeats) * 2 * Math.PI - Math.PI / 2;
  return {
    x: radius * Math.cos(angleRad),
    y: radius * Math.sin(angleRad),
  };
}
