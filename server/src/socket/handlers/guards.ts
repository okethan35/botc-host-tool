import { SOCKET_EVENTS } from 'shared';
import { getCachedGameState } from '../../state/gameStore';
import type { RuntimeState } from '../../state/types';
import type { TypedSocket } from '../types';

/** Verifies the socket authenticated as the host of a loaded game; emits `error` and returns null otherwise. */
export function requireHostState(socket: TypedSocket): RuntimeState | null {
  if (socket.data.role !== 'host' || !socket.data.gameId) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Host authority required for this action.', code: 'NOT_HOST' });
    return null;
  }
  const state = getCachedGameState(socket.data.gameId);
  if (!state) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game state not loaded.', code: 'STATE_MISSING' });
    return null;
  }
  return state;
}

export interface PlayerContext {
  state: RuntimeState;
  playerId: string;
}

/** Verifies the socket authenticated as a player of a loaded game; emits `error` and returns null otherwise. */
export function requirePlayerState(socket: TypedSocket): PlayerContext | null {
  if (socket.data.role !== 'player' || !socket.data.gameId || !socket.data.playerId) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Player session required for this action.', code: 'NOT_PLAYER' });
    return null;
  }
  const state = getCachedGameState(socket.data.gameId);
  if (!state) {
    socket.emit(SOCKET_EVENTS.ERROR, { message: 'Game state not loaded.', code: 'STATE_MISSING' });
    return null;
  }
  return { state, playerId: socket.data.playerId };
}
