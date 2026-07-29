import { MAX_PLAYERS, SOCKET_EVENTS } from 'shared';
import { prisma } from '../../db/prisma';
import { generateSessionToken } from '../../services/session';
import { buildBoardUpdate, toHostPlayer } from '../../services/publicBoard';
import { buildOwnRoleReveal } from '../../services/ownRole';
import { gameRoom, hostRoom } from '../rooms';
import { requireHostState } from './guards';
import type { RuntimeState } from '../../state/types';
import type { TypedServer, TypedSocket } from '../types';

function broadcastRoster(io: TypedServer, state: RuntimeState): void {
  io.to(gameRoom(state.game.id)).emit(SOCKET_EVENTS.BOARD_UPDATE, buildBoardUpdate(state));
  io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
    players: [...state.players.values()].map(toHostPlayer),
  });
}

/** Host-only player-roster mutations (spec features 1, 3, 7) + phantom conversion (spec feature 8/session). */
export function registerPlayerHandlers(io: TypedServer, socket: TypedSocket): void {
  socket.on(SOCKET_EVENTS.PLAYER_ADD_PHANTOM, async ({ displayName }) => {
    const state = requireHostState(socket);
    if (!state) return;

    const name = displayName?.trim();
    if (!name) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: 'Display name is required.' });
      return;
    }
    if (state.players.size >= MAX_PLAYERS) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: `Game is full (max ${MAX_PLAYERS} players).` });
      return;
    }
    const nameTaken = [...state.players.values()].some((p) => p.displayName.toLowerCase() === name.toLowerCase());
    if (nameTaken) {
      socket.emit(SOCKET_EVENTS.ERROR, { message: `"${name}" is already taken in this game.` });
      return;
    }

    const sessionToken = generateSessionToken();
    const seatPosition = state.players.size;
    const player = await prisma.player.create({
      data: {
        gameId: state.game.id,
        displayName: name,
        hasDevice: false,
        sessionToken,
        seatPosition,
        alive: true,
        hostNotes: '',
        isHost: false,
      },
    });

    state.players.set(player.id, {
      id: player.id,
      gameId: player.gameId,
      displayName: player.displayName,
      hasDevice: player.hasDevice,
      socketId: null,
      sessionToken: player.sessionToken,
      seatPosition: player.seatPosition,
      roleId: player.roleId,
      alignment: player.alignment,
      alive: player.alive,
      hostNotes: player.hostNotes,
      isHost: player.isHost,
    });

    broadcastRoster(io, state);
  });

  socket.on(SOCKET_EVENTS.PLAYER_REMOVE, async ({ playerId }) => {
    const state = requireHostState(socket);
    if (!state || !state.players.has(playerId)) return;

    state.players.delete(playerId);
    await prisma.player.delete({ where: { id: playerId } }).catch(() => undefined);
    broadcastRoster(io, state);
  });

  socket.on(SOCKET_EVENTS.PLAYER_UPDATE_NOTES, async ({ playerId, hostNotes }) => {
    const state = requireHostState(socket);
    const player = state?.players.get(playerId);
    if (!state || !player) return;

    player.hostNotes = hostNotes;
    await prisma.player.update({ where: { id: playerId }, data: { hostNotes } });
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
      players: [...state.players.values()].map(toHostPlayer),
    });
  });

  socket.on(SOCKET_EVENTS.PLAYER_SET_ALIVE, async ({ playerId, alive }) => {
    const state = requireHostState(socket);
    const player = state?.players.get(playerId);
    if (!state || !player) return;

    player.alive = alive;
    await prisma.player.update({ where: { id: playerId }, data: { alive } });
    broadcastRoster(io, state);
  });

  socket.on(SOCKET_EVENTS.PLAYER_SET_ALIGNMENT, async ({ playerId, alignment }) => {
    const state = requireHostState(socket);
    const player = state?.players.get(playerId);
    if (!state || !player) return;

    player.alignment = alignment;
    await prisma.player.update({ where: { id: playerId }, data: { alignment } });
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
      players: [...state.players.values()].map(toHostPlayer),
    });
  });

  socket.on(SOCKET_EVENTS.PLAYER_SET_ROLE, async ({ playerId, roleId }) => {
    const state = requireHostState(socket);
    const player = state?.players.get(playerId);
    if (!state || !player) return;

    player.roleId = roleId;
    await prisma.player.update({ where: { id: playerId }, data: { roleId } });
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
      players: [...state.players.values()].map(toHostPlayer),
    });

    if (roleId && player.socketId) {
      const reveal = buildOwnRoleReveal(state, roleId, player.alignment);
      if (reveal) io.to(player.socketId).emit(SOCKET_EVENTS.PLAYER_ROLE_ASSIGNED, reveal);
    }
  });

  socket.on(SOCKET_EVENTS.PLAYER_CONVERT_TO_REAL, async ({ playerId }) => {
    const state = requireHostState(socket);
    const player = state?.players.get(playerId);
    if (!state || !player) return;

    // Issues a *new* session token, invalidating any old one, delivered as a claim link/QR.
    const sessionToken = generateSessionToken();
    player.sessionToken = sessionToken;
    player.hasDevice = true;
    await prisma.player.update({ where: { id: playerId }, data: { sessionToken, hasDevice: true } });

    const clientOrigin = process.env.CLIENT_ORIGIN ?? 'http://localhost:5173';
    const claimUrl = `${clientOrigin}/claim/${state.game.id}/${playerId}/${sessionToken}`;
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.PLAYER_CONVERSION_READY, { playerId, claimUrl, sessionToken });
    broadcastRoster(io, state);
  });
}
