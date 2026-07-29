export interface HostSession {
  role: 'host';
  gameId: string;
  hostToken: string;
}

export interface PlayerSession {
  role: 'player';
  gameId: string;
  playerId: string;
  sessionToken: string;
}

export type StoredSession = HostSession | PlayerSession;

const keyFor = (gameId: string) => `botc:session:${gameId}`;

export function saveSession(session: StoredSession): void {
  localStorage.setItem(keyFor(session.gameId), JSON.stringify(session));
}

export function loadSession(gameId: string): StoredSession | null {
  const raw = localStorage.getItem(keyFor(gameId));
  if (!raw) return null;
  try {
    return JSON.parse(raw) as StoredSession;
  } catch {
    return null;
  }
}

export function clearSession(gameId: string): void {
  localStorage.removeItem(keyFor(gameId));
}
