import { SOCKET_EVENTS } from 'shared';
import { prisma } from '../../db/prisma';
import { toPublicGame } from '../../services/publicBoard';
import { buildNightOrderChecklist } from '../../services/nightOrder';
import { gameRoom, hostRoom } from '../rooms';
import { requireHostState } from './guards';
import type { TypedServer, TypedSocket } from '../types';

/** Phase control (spec feature 5) — lobby -> night -> day -> night... broadcast to everyone. */
export function registerPhaseHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.PHASE_CHANGE, async ({ phase }) => {
    const state = requireHostState(socket);
    if (!state) return;

    const enteringNight = phase === 'night' && state.game.phase !== 'night';
    const nightNumber = enteringNight ? state.game.nightNumber + 1 : state.game.nightNumber;

    state.game.phase = phase;
    state.game.nightNumber = nightNumber;
    await prisma.game.update({ where: { id: state.game.id }, data: { phase, nightNumber } });

    if (enteringNight) {
      // Reset NightOrderProgress for the new night number.
      await prisma.nightOrderProgress.deleteMany({ where: { gameId: state.game.id, nightNumber } });
      for (const key of [...state.nightOrderProgress.keys()]) {
        if (key.startsWith(`${nightNumber}:`)) state.nightOrderProgress.delete(key);
      }
    }

    io.to(gameRoom(state.game.id)).emit(SOCKET_EVENTS.PHASE_CHANGED, { game: toPublicGame(state) });

    if (enteringNight) {
      const items = buildNightOrderChecklist(state, nightNumber);
      io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.NIGHT_ORDER_LIST, { nightNumber, items });
    }
  });
}
