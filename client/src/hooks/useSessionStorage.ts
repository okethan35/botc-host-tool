import { useCallback, useState } from 'react';
import { clearSession, loadSession, saveSession } from '../lib/session';
import type { StoredSession } from '../lib/session';

export function useSessionStorage(gameId: string) {
  const [session, setSessionState] = useState<StoredSession | null>(() => loadSession(gameId));

  const save = useCallback((next: StoredSession) => {
    saveSession(next);
    setSessionState(next);
  }, []);

  const clear = useCallback(() => {
    clearSession(gameId);
    setSessionState(null);
  }, [gameId]);

  return { session, save, clear };
}
