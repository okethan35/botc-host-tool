const API_BASE = import.meta.env.VITE_SERVER_URL ?? 'http://localhost:4000';

async function request<T>(path: string, options?: RequestInit): Promise<T> {
  const res = await fetch(`${API_BASE}/api${path}`, {
    headers: { 'Content-Type': 'application/json' },
    ...options,
  });
  if (!res.ok) {
    const body = (await res.json().catch(() => ({}))) as { error?: string };
    throw new Error(body.error ?? `Request failed with status ${res.status}`);
  }
  return res.json() as Promise<T>;
}

export interface CreateGameResponse {
  gameId: string;
  code: string;
  hostToken: string;
}

export function createGame(): Promise<CreateGameResponse> {
  return request<CreateGameResponse>('/games', { method: 'POST', body: JSON.stringify({}) });
}

export interface GameLookupResponse {
  gameId: string;
  code: string;
  phase: string;
  playerCount: number;
}

export function lookupGame(code: string): Promise<GameLookupResponse> {
  return request<GameLookupResponse>(`/games/${code}`);
}

export interface JoinGameResponse {
  gameId: string;
  playerId: string;
  sessionToken: string;
}

export function joinGame(code: string, displayName: string): Promise<JoinGameResponse> {
  return request<JoinGameResponse>(`/games/${code}/join`, {
    method: 'POST',
    body: JSON.stringify({ displayName }),
  });
}

/** Direct download URL for the server-generated PDF grimoire reference (not a fetch — used as a link/window.open target). */
export function pdfDownloadUrl(gameId: string, hostToken: string): string {
  return `${API_BASE}/api/games/${gameId}/pdf?token=${encodeURIComponent(hostToken)}`;
}

export function healthCheck(): Promise<{ status: string }> {
  return request<{ status: string }>('/health');
}
