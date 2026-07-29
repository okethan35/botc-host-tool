import type { ReactNode } from 'react';
import { polarToCartesian } from 'shared';

export interface RingSeat {
  id: string;
  seatPosition: number;
}

interface RingLayoutProps<T extends RingSeat> {
  players: T[];
  totalSeats: number;
  renderSeat: (player: T, index: number) => ReactNode;
  /** Arc length (px) to reserve per seat so bubbles don't overlap as the table grows. */
  seatFootprint?: number;
}

const MIN_RADIUS = 150;

/**
 * Pure/presentational ring layout: positions seats in a circle via
 * shared/src/ring-geometry.ts (seat 0 at top, clockwise). Used by the live
 * grimoire's Ring tab and the seat-order editor's live preview — only
 * `renderSeat` differs between them. The server-generated PDF renders its
 * own ring independently (see server/src/services/pdf.ts) since it isn't
 * React, but shares this same `polarToCartesian` geometry function.
 *
 * Radius grows with seat count (rather than a fixed size) so large tables
 * (12+ players) get more circumference instead of cramming seats together.
 *
 * Seats are keyed by player `id`, not `seatPosition` — keying by position
 * would make React reuse a slot's DOM node for whichever player now sits
 * there instead of moving that player's own node, which both breaks the
 * "this player's tile flies to its new spot" animation and is the wrong
 * mental model (the player moved, the slot didn't). The `transform`
 * transition below is what actually produces that flying motion whenever a
 * seat's computed position changes for any reason — reorder via drag,
 * reorder via the seating tab's arrow buttons, or a role/roster update.
 */
export function RingLayout<T extends RingSeat>({
  players,
  totalSeats,
  renderSeat,
  seatFootprint = 108,
}: RingLayoutProps<T>) {
  const radius = totalSeats > 0 ? Math.max(MIN_RADIUS, (totalSeats * seatFootprint) / (2 * Math.PI)) : MIN_RADIUS;
  const size = radius * 2 + seatFootprint + 40;
  const center = size / 2;
  // Sorted by a stable key (id), NOT seatPosition: visual position comes
  // entirely from the `transform` below, so DOM order doesn't need to match
  // seat order. If it did, React would physically move nodes in the DOM
  // every time seats reorder, and that move landing in the same commit as
  // the transform change is enough to make some browsers skip the CSS
  // transition instead of animating it — sorting by id keeps DOM order
  // stable so only `transform` ever changes, which is what actually
  // animates reliably.
  const seated = [...players].sort((a, b) => a.id.localeCompare(b.id));

  return (
    <div className="mx-auto overflow-x-auto">
      <div className="relative mx-auto" style={{ width: size, height: size }}>
        <div
          className="absolute rounded-full border-2 border-dashed border-gold/50"
          style={{ left: center - radius, top: center - radius, width: radius * 2, height: radius * 2 }}
        />
        {seated.map((player, index) => {
          const { x, y } = polarToCartesian(player.seatPosition, totalSeats, radius);
          return (
            <div
              key={player.id}
              className="absolute transition-transform duration-300 ease-in-out"
              style={{ transform: `translate(${center + x}px, ${center + y}px) translate(-50%, -50%)` }}
            >
              {renderSeat(player, index)}
            </div>
          );
        })}
      </div>
    </div>
  );
}
