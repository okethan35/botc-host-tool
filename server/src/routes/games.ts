import { Router } from 'express';
import { MAX_PLAYERS, SOCKET_EVENTS, TROUBLE_BREWING_SCRIPT_ID } from 'shared';
import { prisma } from '../db/prisma';
import { generateUniqueJoinCode } from '../services/joinCode';
import { generateHostToken, generateSessionToken } from '../services/session';
import { buildBoardUpdate, toHostPlayer } from '../services/publicBoard';
import { getCachedGameState, loadGameStateByCode, putGameState } from '../state/gameStore';
import type { RuntimeState } from '../state/types';
import { getIO } from '../socket/ioInstance';
import { gameRoom, hostRoom } from '../socket/rooms';

export const gamesRouter = Router();

/** POST /api/games - host creates a game, gets back a join code + hostToken. */
gamesRouter.post('/games', async (req, res) => {
  try {
    const scriptId = typeof req.body?.scriptId === 'string' ? req.body.scriptId : TROUBLE_BREWING_SCRIPT_ID;

    const script = await prisma.script.findUnique({ where: { id: scriptId } });
    if (!script) {
      res.status(400).json({ error: `Unknown scriptId "${scriptId}".` });
      return;
    }

    const code = await generateUniqueJoinCode();
    const hostToken = generateHostToken();

    const game = await prisma.game.create({
      data: { code, hostToken, scriptId, phase: 'lobby', nightNumber: 0 },
    });

    const roles = await prisma.role.findMany({ where: { scriptId } });
    const state: RuntimeState = {
      game: {
        id: game.id,
        code: game.code,
        hostToken: game.hostToken,
        scriptId: game.scriptId,
        phase: game.phase,
        nightNumber: game.nightNumber,
        createdAt: game.createdAt.toISOString(),
      },
      players: new Map(),
      roles: roles.map((r) => ({
        id: r.id,
        scriptId: r.scriptId,
        name: r.name,
        team: r.team,
        abilityText: r.abilityText,
        faqText: r.faqText,
        firstNightOrder: r.firstNightOrder,
        otherNightOrder: r.otherNightOrder,
        reminderText: r.reminderText,
        setupEffect: (r.setupEffect as never) ?? null,
      })),
      nightOrderProgress: new Map(),
    };
    putGameState(state);

    res.status(201).json({ gameId: game.id, code: game.code, hostToken: game.hostToken });
  } catch (err) {
    res.status(500).json({ error: (err as Error).message });
  }
});

/** GET /api/games/:code - public lookup used by the join page to validate a code. */
gamesRouter.get('/games/:code', async (req, res) => {
  const code = req.params.code?.toUpperCase() ?? '';
  const state = await loadGameStateByCode(code);
  if (!state) {
    res.status(404).json({ error: 'Game not found.' });
    return;
  }
  res.json({
    gameId: state.game.id,
    code: state.game.code,
    phase: state.game.phase,
    playerCount: state.players.size,
  });
});

/** POST /api/games/:code/join - player joins with a display name, gets a session token. */
gamesRouter.post('/games/:code/join', async (req, res) => {
  const code = req.params.code?.toUpperCase() ?? '';
  const displayName = typeof req.body?.displayName === 'string' ? req.body.displayName.trim() : '';

  if (!displayName) {
    res.status(400).json({ error: 'displayName is required.' });
    return;
  }

  const state = await loadGameStateByCode(code);
  if (!state) {
    res.status(404).json({ error: 'Game not found.' });
    return;
  }

  if (state.game.phase !== 'lobby') {
    res.status(400).json({ error: 'This game has already started - ask the host to add you as a player.' });
    return;
  }

  if (state.players.size >= MAX_PLAYERS) {
    res.status(400).json({ error: `Game is full (max ${MAX_PLAYERS} players).` });
    return;
  }

  const nameTaken = [...state.players.values()].some(
    (p) => p.displayName.toLowerCase() === displayName.toLowerCase(),
  );
  if (nameTaken) {
    res.status(400).json({ error: `"${displayName}" is already taken in this game - pick another name.` });
    return;
  }

  const sessionToken = generateSessionToken();
  const seatPosition = state.players.size;

  const player = await prisma.player.create({
    data: {
      gameId: state.game.id,
      displayName,
      hasDevice: true,
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
    socketId: player.socketId,
    sessionToken: player.sessionToken,
    seatPosition: player.seatPosition,
    roleId: player.roleId,
    alignment: player.alignment,
    alive: player.alive,
    hostNotes: player.hostNotes,
    isHost: player.isHost,
  });
  // Ensure the cache is keyed correctly even if loadGameStateByCode hydrated fresh.
  const cached = getCachedGameState(state.game.id) ?? state;
  putGameState(cached);

  try {
    const io = getIO();
    io.to(gameRoom(state.game.id)).emit(SOCKET_EVENTS.BOARD_UPDATE, buildBoardUpdate(cached));
    io.to(hostRoom(state.game.id)).emit(SOCKET_EVENTS.GRIMOIRE_UPDATE, {
      players: [...cached.players.values()].map(toHostPlayer),
    });
  } catch {
    // Socket.io not initialized (shouldn't happen once the server is up) - non-fatal for the REST response.
  }

  res.status(201).json({ gameId: state.game.id, playerId: player.id, sessionToken });
});
