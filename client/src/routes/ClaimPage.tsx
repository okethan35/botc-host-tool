import { useEffect } from 'react';
import { useNavigate, useParams } from 'react-router';
import { saveSession } from '../lib/session';

/** Phantom -> real conversion claim link: writes localStorage, redirects to /play/:gameId. */
export function ClaimPage() {
  const { gameId, playerId, sessionToken } = useParams<{
    gameId: string;
    playerId: string;
    sessionToken: string;
  }>();
  const navigate = useNavigate();

  useEffect(() => {
    if (!gameId || !playerId || !sessionToken) return;
    saveSession({ role: 'player', gameId, playerId, sessionToken });
    navigate(`/play/${gameId}`, { replace: true });
  }, [gameId, playerId, sessionToken, navigate]);

  return <p className="p-8 text-center text-ink/70">Claiming your seat…</p>;
}
