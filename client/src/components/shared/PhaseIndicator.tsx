import type { GamePhase } from 'shared';

const LABELS: Record<GamePhase, string> = {
  lobby: 'Lobby',
  night: 'Night',
  day: 'Day',
};

export function PhaseIndicator({ phase, nightNumber }: { phase: GamePhase; nightNumber: number }) {
  return (
    <span className="inline-flex items-center gap-2 rounded-full border border-neutral/40 bg-neutral/15 px-3 py-1 text-sm font-semibold text-neutral">
      {LABELS[phase]}
      {phase !== 'lobby' && nightNumber > 0 ? <span className="opacity-80">{nightNumber}</span> : null}
    </span>
  );
}
