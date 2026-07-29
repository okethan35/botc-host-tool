import { useState } from 'react';
import { useNavigate, useParams } from 'react-router';
import { joinGame } from '../lib/api';
import { saveSession } from '../lib/session';
import { JoinForm } from '../components/player/JoinForm';

export function JoinPage() {
  const { code } = useParams<{ code?: string }>();
  const navigate = useNavigate();
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleJoin(joinCode: string, displayName: string) {
    setSubmitting(true);
    setError(null);
    try {
      const { gameId, playerId, sessionToken } = await joinGame(joinCode, displayName);
      saveSession({ role: 'player', gameId, playerId, sessionToken });
      navigate(`/play/${gameId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-sm flex-col gap-6 p-8">
      <h1 className="text-xl font-semibold text-ink">Join a game</h1>
      <JoinForm initialCode={code ?? ''} submitting={submitting} errorMessage={error} onJoin={handleJoin} />
    </div>
  );
}
