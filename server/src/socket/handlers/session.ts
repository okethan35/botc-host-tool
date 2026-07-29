import { SOCKET_EVENTS } from 'shared';
import { prisma } from '../../db/prisma';
import { getCachedGameState, loadGameState } from '../../state/gameStore';
import { toHostPlayer, toPublicGame, toPublicPlayer } from '../../services/publicBoard';
import { buildOwnRoleReveal } from '../../services/ownRole';
import { gameRoom, hostRoom } from '../rooms';
import type { TypedServer, TypedSocket } from '../types';

/**
 * Handles `session:auth` (host or player reconnect) and the disconnect
 * cleanup. Lazily rehydrates the in-memory gameStore from Postgres if this
 * is the first touch since a server restart - that rehydration *is* the
 * reconnect-resilience mechanism (see build plan section 6).
 */
export function registerSessionHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.SESSION_AUTH, async (payload) => {
    try {
      const state = await loadGameState(payload.gameId);
      if (!state) {
        socket.emit(SOCKET_EVENTS.SESSION_INVALID, { reason: 'Game not found.' });
        return;
      }

      if (payload.role === 'host') {
        if (payload.hostToken !== state.game.hostToken) {
          socket.emit(SOCKET_EVENTS.SESSION_INVALID, { reason: 'Invalid host token.' });
          return;
        }
        socket.data.gameId = state.game.id;
        socket.data.role = 'host';
        await socket.join(gameRoom(state.game.id));
        await socket.join(hostRoom(state.game.id));

        socket.emit(SOCKET_EVENTS.SESSION_RESUMED, {
          role: 'host',
          game: {
            id: state.game.id,
            code: state.game.code,
            scriptId: state.game.scriptId,
            phase: state.game.phase,
            nightNumber: state.game.nightNumber,
            createdAt: state.game.createdAt,
          },
          players: [...state.players.values()].map(toHostPlayer),
          roles: state.roles,
        });
        return;
      }

      const player = state.players.get(payload.playerId);
      if (!player || player.sessionToken !== payload.sessionToken) {
        socket.emit(SOCKET_EVENTS.SESSION_INVALID, { reason: 'Invalid session token.' });
        return;
      }

      player.socketId = socket.id;
      await prisma.player.update({ where: { id: player.id }, data: { socketId: socket.id } });

      socket.data.gameId = state.game.id;
      socket.data.role = 'player';
      socket.data.playerId = player.id;
      await socket.join(gameRoom(state.game.id));

      const ownRole = player.roleId ? buildOwnRoleReveal(state, player) : null;
      socket.emit(SOCKET_EVENTS.SESSION_RESUMED, {
        role: 'player',
        game: toPublicGame(state),
        players: [...state.players.values()].map(toPublicPlayer),
        self: toPublicPlayer(player),
        ownRole,
      });
    } catch (err) {
      socket.emit(SOCKET_EVENTS.SESSION_INVALID, { reason: (err as Error).message });
    }
  });

  socket.on('disconnect', () => {
    void handleDisconnect(socket);
  });
}

async function handleDisconnect(socket: TypedSocket): Promise<void> {
  const { gameId, role, playerId } = socket.data;
  if (role !== 'player' || !playerId || !gameId) return;

  const state = getCachedGameState(gameId);
  const player = state?.players.get(playerId);
  if (!player) return;

  player.socketId = null;
  try {
    await prisma.player.update({ where: { id: player.id }, data: { socketId: null } });
  } catch {
    // Player row may have been removed concurrently - non-fatal.
  }
}
