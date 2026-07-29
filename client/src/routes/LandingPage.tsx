import { useState } from 'react';
import { useNavigate } from 'react-router';
import { createGame } from '../lib/api';
import { saveSession } from '../lib/session';
import { Button } from '../components/shared/Button';
import { Card } from '../components/shared/Card';

export function LandingPage() {
  const navigate = useNavigate();
  const [creating, setCreating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleCreate() {
    setCreating(true);
    setError(null);
    try {
      const { gameId, hostToken } = await createGame();
      saveSession({ role: 'host', gameId, hostToken });
      navigate(`/host/${gameId}`);
    } catch (err) {
      setError((err as Error).message);
    } finally {
      setCreating(false);
    }
  }

  return (
    <div className="mx-auto flex max-w-lg flex-col items-center gap-6 p-8 text-center">
      <div>
        <h1 className="text-3xl font-bold text-ink">Blood on the Clocktower</h1>
        <p className="mt-1 text-lg text-neutral">Host Companion</p>
      </div>
      <p className="text-sm text-ink/70">
        A host-facing tool for running games in person - tracks roles, seating, and phase state live, and produces a
        printable grimoire reference.
      </p>
      <div className="flex flex-col items-center gap-3">
        <Card className="flex flex-col items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/70">Storyteller</h2>
          <Button onClick={handleCreate} disabled={creating}>
            {creating ? 'Creating…' : 'Create a game'}
          </Button>
          {error ? <p className="text-sm text-evil">{error}</p> : null}
        </Card>
        <Card className="flex flex-col items-center gap-3">
          <h2 className="text-sm font-semibold uppercase tracking-wide text-ink/70">Player</h2>
          <Button variant="secondary" onClick={() => navigate('/join')}>
            Join a game
          </Button>
        </Card>
      </div>
    </div>
  );
}
