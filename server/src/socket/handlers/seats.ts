import { SOCKET_EVENTS } from 'shared';
import { prisma } from '../../db/prisma';
import { buildBoardUpdate, toHostPlayer } from '../../services/publicBoard';
import { checkSeatingConstraints } from '../../services/roleAssignment/effects/seatingConstraint';
import { gameRoom, hostRoom } from '../rooms';
import { requireHostState } from './guards';
import type { TypedServer, TypedSocket } from '../types';

/** Seat drag-reorder (spec feature 4) — rewrites all seatPositions in one transaction. */
export function registerSeatsHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.SEATS_REORDER, async ({ orderedPlayerIds }) => {
    const state = requireHostState(socket);
    if (!state) return;

    const currentIds = new Set(state.players.keys());
    const incomingIds = new Set(orderedPlayerIds);
    const validPayload =
      orderedPlayerIds.length === currentIds.size && [...currentIds].every((id) => incomingIds.has(id));

    if (!validPayload) {
      socket.emit(SOCKET_EVENTS.ERROR, {
        message: 'seats:reorder payload must include every current player exactly once.',
        code: 'INVALID_SEAT_ORDER',
      });
      return;
    }

    await prisma.$transaction(
      orderedPlayerIds.map((playerId, index) =>
        prisma.player.update({ where: { id: playerId }, data: { seatPosition: index } }),
      ),
    );

    orderedPlayerIds.forEach((playerId, index) => {
      const player = state.players.get(playerId);
      if (player) player.seatPosition = index;
    });

    io.to(gameRoom(state.game.id)).emit(SOCKET_EVENTS.BOARD_UPDATE, buildBoardUpdate(state));
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
      players: [...state.players.values()].map(toHostPlayer),
    });

    // Non-blocking re-check for any in-play role carrying a seatingConstraint effect.
    const warnings = checkSeatingConstraints(state);
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.SEATING_WARNING, { warnings });
  });
}
