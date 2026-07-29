import { SOCKET_EVENTS } from 'shared';
import { prisma } from '../../db/prisma';
import { buildNightOrderChecklist } from '../../services/nightOrder';
import { hostRoom } from '../rooms';
import { requireHostState } from './guards';
import type { TypedServer, TypedSocket } from '../types';

/** Night-order checklist (spec feature 6) - filtered/sorted list + per-role checkbox state. */
export function registerNightOrderHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.NIGHT_ORDER_GET, () => {
    const state = requireHostState(socket);
    if (!state) return;
    const items = buildNightOrderChecklist(state, state.game.nightNumber);
    socket.emit(SOCKET_EVENTS.NIGHT_ORDER_LIST, { nightNumber: state.game.nightNumber, items });
  });

  socket.on(SOCKET_EVENTS.NIGHT_ORDER_CHECK, async ({ roleId, checked }) => {
    const state = requireHostState(socket);
    if (!state) return;

    const nightNumber = state.game.nightNumber;
    state.nightOrderProgress.set(`${nightNumber}:${roleId}`, checked);

    await prisma.nightOrderProgress.upsert({
      where: { gameId_nightNumber_roleId: { gameId: state.game.id, nightNumber, roleId } },
      update: { checked },
      create: { gameId: state.game.id, nightNumber, roleId, checked },
    });

    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.NIGHT_ORDER_ITEM_UPDATED, { roleId, checked });
  });
}
