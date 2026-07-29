import type { NextFunction, Request, Response } from 'express';
import { loadGameState } from '../state/gameStore';
import type { RuntimeState } from '../state/types';

export interface HostAuthedRequest extends Request {
  gameState?: RuntimeState;
}

/**
 * REST-only guard for the print route (`GET /api/games/:gameId/print?token=`)
 * — a query-param token since print opens via `window.open`, which can't
 * carry a socket identity. Every other mutation goes over the socket.
 */
export async function requireHostToken(
  req: HostAuthedRequest,
  res: Response,
  next: NextFunction,
): Promise<void> {
  const { gameId } = req.params;
  const token = req.query.token;

  if (!gameId || typeof token !== 'string') {
    res.status(403).json({ error: 'Missing game id or host token.' });
    return;
  }

  const state = await loadGameState(gameId);
  if (!state || token !== state.game.hostToken) {
    res.status(403).json({ error: 'Invalid host token.' });
    return;
  }

  req.gameState = state;
  next();
}
