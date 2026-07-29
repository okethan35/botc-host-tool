import { useLayoutEffect, useRef, useState } from 'react';
import type { RefCallback } from 'react';
import {
  DndContext,
  closestCenter,
  PointerSensor,
  useSensor,
  useSensors,
  type DragEndEvent,
} from '@dnd-kit/core';
import {
  SortableContext,
  arrayMove,
  useSortable,
  verticalListSortingStrategy,
} from '@dnd-kit/sortable';
import { CSS } from '@dnd-kit/utilities';
import type { Player, Role } from 'shared';
import { sortBySeat } from 'shared';
import { RoleIcon } from '../shared/RoleIcon';
import { RingLayout } from '../ring/RingLayout';
import { Seat } from '../ring/Seat';

interface SeatOrderEditorProps {
  players: Player[];
  roles: Role[];
  onReorder: (orderedPlayerIds: string[]) => void;
}

function mergeRefs<T>(...refs: (RefCallback<T> | null | undefined)[]): RefCallback<T> {
  return (node) => {
    for (const ref of refs) {
      ref?.(node);
    }
  };
}

/**
 * Drag-to-reorder seating list (spec feature 4) - writes seatPosition via
 * seats:reorder. Two things were confusing about the original version: the
 * whole row was a drag target (no visible affordance for *what* was
 * draggable, and dragging is imprecise on touch), and there was no visual
 * tie back to the physical circle the order actually describes. Now: a
 * dedicated drag handle, explicit up/down buttons as a precise alternative,
 * and a live ring preview next to the list - and both the row list and the
 * ring preview animate rows/seats sliding to their new spot when the arrow
 * buttons are used (drag already animates natively via dnd-kit).
 */
export function SeatOrderEditor({ players, roles, onReorder }: SeatOrderEditorProps) {
  const [order, setOrder] = useState<string[]>(() => sortBySeat(players).map((p) => p.id));
  const byId = new Map(players.map((p) => [p.id, p]));
  const roleById = new Map(roles.map((r) => [r.id, r]));
  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 4 } }));

  // Keep local order in sync if the roster changes (join/remove) from outside.
  const knownIds = new Set(players.map((p) => p.id));
  const effectiveOrder = order.filter((id) => knownIds.has(id));
  for (const p of sortBySeat(players)) {
    if (!effectiveOrder.includes(p.id)) effectiveOrder.push(p.id);
  }

  // moveBy/handleDragEnd must compute "next order" from the truly-latest
  // order, not from `effectiveOrder` as captured by this render's closure -
  // if the arrows are clicked again before React has re-rendered from the
  // previous click, a closure-captured value is stale, and the second call
  // silently computes its result from the pre-first-click order, discarding
  // the first move when setOrder is called. Symptom: the wrong tile ends up
  // moved, and the tile that should have visibly moved shows no net
  // position change for the FLIP effect to animate, so it just snaps.
  // orderRef sidesteps this by being updated imperatively and synchronously
  // on every commit, independent of when React actually re-renders.
  const orderRef = useRef(effectiveOrder);
  orderRef.current = effectiveOrder;

  // FLIP animation for the row list: dnd-kit already animates drag-triggered
  // reorders via its own transform/transition, but a reorder triggered by
  // the arrow buttons is just a plain state update with no positional
  // continuity - this manually measures each row before/after the reorder
  // and animates the delta away, so rows visibly slide to their new spot.
  const rowRefs = useRef(new Map<string, HTMLLIElement>());
  const prevRects = useRef(new Map<string, DOMRect>());
  const animateNextRef = useRef(false);
  // Bumped once per animation cycle so a stale requestAnimationFrame
  // callback from an earlier click can tell it's been superseded by a
  // newer one and bail out, instead of touching rows a later click already
  // has its own freeze-transform set up on. Without this, rapid clicking
  // could produce runs where a callback belonging to an *older* cycle fires
  // after a *newer* cycle has started, resetting things out of order.
  const generationRef = useRef(0);

  useLayoutEffect(() => {
    // Clear any leftover transform/transition from a still-settling
    // previous animation before measuring anything. Two bugs this fixes
    // together: (1) without this, a reorder that lands before the previous
    // one's requestAnimationFrame has fired measures that row's mid-flight
    // *visual* position instead of its true layout position; (2) the old
    // version captured `prevRects` (the baseline for the *next* comparison)
    // by re-measuring *after* applying this cycle's own freeze-transform -
    // which reads back the OLD position, not the settled new one - so every
    // subsequent move of the same row compounded on top of leftover
    // displacement from every previous move instead of measuring cleanly
    // from where it actually is. That compounding is exactly "the more you
    // move it, the more items shift". Measuring every row's true settled
    // position once, up front, and reusing that single measurement for both
    // this cycle's delta *and* next cycle's baseline avoids both problems.
    rowRefs.current.forEach((el) => {
      el.style.transition = 'none';
      el.style.transform = '';
    });
    const nextRects = new Map<string, DOMRect>();
    rowRefs.current.forEach((el, id) => nextRects.set(id, el.getBoundingClientRect()));

    if (animateNextRef.current) {
      const generation = ++generationRef.current;
      // Only the rows that actually have a delta this cycle - never the
      // full rowRefs map - so this cycle's rAF can only ever touch rows it
      // itself is responsible for, regardless of what any other pending
      // callback from an overlapping click does.
      const animating: HTMLLIElement[] = [];
      rowRefs.current.forEach((el, id) => {
        const prev = prevRects.current.get(id);
        const next = nextRects.get(id);
        if (!prev || !next) return;
        const dx = prev.left - next.left;
        const dy = prev.top - next.top;
        if (dx !== 0 || dy !== 0) {
          el.style.transform = `translate(${dx}px, ${dy}px)`;
          animating.push(el);
        }
      });
      if (animating.length > 0) {
        animating.forEach((el) => el.getBoundingClientRect()); // force reflow before animating away
        requestAnimationFrame(() => {
          if (generationRef.current !== generation) return; // superseded by a newer cycle - the newer cycle's own effect already re-measured cleanly
          animating.forEach((el) => {
            el.style.transition = 'transform 300ms ease';
            el.style.transform = '';
          });
        });
      }
      animateNextRef.current = false;
    }

    prevRects.current = nextRects;
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [effectiveOrder.join('|')]);

  function commit(next: string[]) {
    orderRef.current = next;
    setOrder(next);
    onReorder(next);
  }

  function handleDragEnd(event: DragEndEvent) {
    const { active, over } = event;
    if (!over || active.id === over.id) return;
    const current = orderRef.current;
    const oldIndex = current.indexOf(String(active.id));
    const newIndex = current.indexOf(String(over.id));
    commit(arrayMove(current, oldIndex, newIndex));
  }

  function moveBy(id: string, delta: number) {
    const current = orderRef.current;
    const index = current.indexOf(id);
    const target = index + delta;
    if (target < 0 || target >= current.length) return;
    const next = [...current];
    next.splice(index, 1);
    next.splice(target, 0, id);
    animateNextRef.current = true;
    commit(next);
  }

  const previewPlayers = effectiveOrder
    .map((id, index) => {
      const player = byId.get(id);
      return player ? { ...player, seatPosition: index } : null;
    })
    .filter((p): p is Player => p !== null);

  return (
    <div className="grid gap-6 md:grid-cols-[minmax(0,1fr)_auto]">
      <div>
        <p className="mb-2 text-xs text-ink/65">Drag the handle, or use the arrows, to reorder seats.</p>
        <DndContext sensors={sensors} collisionDetection={closestCenter} onDragEnd={handleDragEnd}>
          <SortableContext items={effectiveOrder} strategy={verticalListSortingStrategy}>
            <ul className="flex flex-col gap-2">
              {effectiveOrder.map((id, index) => {
                const player = byId.get(id);
                if (!player) return null;
                const role = player.roleId ? roleById.get(player.roleId) : undefined;
                return (
                  <SeatRow
                    key={id}
                    id={id}
                    index={index}
                    displayName={player.displayName}
                    roleName={role?.name}
                    isFirst={index === 0}
                    isLast={index === effectiveOrder.length - 1}
                    onMoveUp={() => moveBy(id, -1)}
                    onMoveDown={() => moveBy(id, 1)}
                    registerNode={(el) => {
                      if (el) rowRefs.current.set(id, el);
                      else rowRefs.current.delete(id);
                    }}
                  />
                );
              })}
            </ul>
          </SortableContext>
        </DndContext>
      </div>

      {previewPlayers.length > 0 ? (
        <div className="flex flex-col items-center gap-2">
          <p className="text-xs text-ink/65">Live preview</p>
          <RingLayout
            players={previewPlayers}
            totalSeats={previewPlayers.length}
            seatFootprint={92}
            renderSeat={(player) => <Seat label={player.displayName} sublabel={`Seat ${player.seatPosition + 1}`} />}
          />
        </div>
      ) : null}
    </div>
  );
}

function SeatRow({
  id,
  index,
  displayName,
  roleName,
  isFirst,
  isLast,
  onMoveUp,
  onMoveDown,
  registerNode,
}: {
  id: string;
  index: number;
  displayName: string;
  roleName?: string;
  isFirst: boolean;
  isLast: boolean;
  onMoveUp: () => void;
  onMoveDown: () => void;
  registerNode: RefCallback<HTMLLIElement>;
}) {
  const { attributes, listeners, setNodeRef, transform, transition, isDragging } = useSortable({ id });
  const style = {
    transform: CSS.Transform.toString(transform),
    transition,
    opacity: isDragging ? 0.6 : 1,
  };

  return (
    <li
      ref={mergeRefs(setNodeRef, registerNode)}
      style={style}
      className="flex items-center gap-2 rounded-lg border border-ink/30 bg-paper-panel/60 py-2 pl-1 pr-2"
    >
      <button
        type="button"
        {...attributes}
        {...listeners}
        className="cursor-grab touch-none rounded px-2 py-1 text-base text-ink/50 hover:bg-paper-deep hover:text-ink active:cursor-grabbing"
        aria-label={`Drag ${displayName} to reorder`}
        title="Drag to reorder"
      >
        ⠿
      </button>
      <span className="w-6 shrink-0 text-center text-xs text-ink/65">#{index + 1}</span>
      {roleName ? <RoleIcon roleName={roleName} size={26} /> : null}
      <div className="flex flex-1 flex-col">
        <span className="font-medium text-ink">{displayName}</span>
        {roleName ? <span className="text-xs text-ink/70">{roleName}</span> : null}
      </div>
      <div className="flex flex-col">
        <button
          type="button"
          onClick={onMoveUp}
          disabled={isFirst}
          className="px-1.5 leading-none text-ink/60 hover:text-ink disabled:opacity-25"
          aria-label={`Move ${displayName} up one seat`}
        >
          ▲
        </button>
        <button
          type="button"
          onClick={onMoveDown}
          disabled={isLast}
          className="px-1.5 leading-none text-ink/60 hover:text-ink disabled:opacity-25"
          aria-label={`Move ${displayName} down one seat`}
        >
          ▼
        </button>
      </div>
    </li>
  );
}
