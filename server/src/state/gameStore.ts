import type { Game as PrismaGame, Player as PrismaPlayer, Role as PrismaRole } from '@prisma/client';
import type { Role, SetupEffect } from 'shared';
import { prisma } from '../db/prisma';
import type { RuntimeGame, RuntimePlayer, RuntimeState } from './types';

/** In-memory Map<gameId, RuntimeState> — the single source of truth while the process is up. */
const store = new Map<string, RuntimeState>();

function toRuntimeGame(game: PrismaGame): RuntimeGame {
  return {
    id: game.id,
    code: game.code,
    hostToken: game.hostToken,
    scriptId: game.scriptId,
    phase: game.phase,
    nightNumber: game.nightNumber,
    createdAt: game.createdAt.toISOString(),
  };
}

function toRuntimePlayer(player: PrismaPlayer): RuntimePlayer {
  return {
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
  };
}

function toSharedRole(role: PrismaRole): Role {
  return {
    id: role.id,
    scriptId: role.scriptId,
    name: role.name,
    team: role.team,
    abilityText: role.abilityText,
    faqText: role.faqText,
    firstNightOrder: role.firstNightOrder,
    otherNightOrder: role.otherNightOrder,
    reminderText: role.reminderText,
    setupEffect: (role.setupEffect as unknown as SetupEffect | null) ?? null,
  };
}

/** Returns cached state without touching the DB, or undefined if not hydrated yet. */
export function getCachedGameState(gameId: string): RuntimeState | undefined {
  return store.get(gameId);
}

export function putGameState(state: RuntimeState): void {
  store.set(state.game.id, state);
}

/** Loads (and caches) a game's full runtime state from Postgres by id. */
export async function loadGameState(gameId: string): Promise<RuntimeState | null> {
  const cached = store.get(gameId);
  if (cached) return cached;

  const game = await prisma.game.findUnique({ where: { id: gameId }, include: { players: true } });
  if (!game) return null;

  const [roles, progress] = await Promise.all([
    prisma.role.findMany({ where: { scriptId: game.scriptId } }),
    prisma.nightOrderProgress.findMany({ where: { gameId } }),
  ]);

  const state: RuntimeState = {
    game: toRuntimeGame(game),
    players: new Map(game.players.map((p) => [p.id, toRuntimePlayer(p)])),
    roles: roles.map(toSharedRole),
    nightOrderProgress: new Map(progress.map((p) => [`${p.nightNumber}:${p.roleId}`, p.checked])),
  };
  store.set(gameId, state);
  return state;
}

/** Loads (and caches) a game's full runtime state from Postgres by join code. */
export async function loadGameStateByCode(code: string): Promise<RuntimeState | null> {
  for (const state of store.values()) {
    if (state.game.code === code) return state;
  }
  const game = await prisma.game.findUnique({ where: { code } });
  if (!game) return null;
  return loadGameState(game.id);
}

export function removeGameState(gameId: string): void {
  store.delete(gameId);
}
