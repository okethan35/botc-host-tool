import type { GamePhase } from 'shared';
import { Button } from '../shared/Button';

interface PhaseControlsProps {
  phase: GamePhase;
  nightNumber: number;
  onChange: (phase: GamePhase) => void;
}

function nextPhase(phase: GamePhase): GamePhase {
  return phase === 'night' ? 'day' : 'night';
}

function nextLabel(phase: GamePhase, nightNumber: number): string {
  if (phase === 'lobby') return 'Start Night 1';
  if (phase === 'night') return 'Advance to Day';
  return `Start Night ${nightNumber + 1}`;
}

/**
 * A single forward action (lobby -> night -> day -> night -> ...) instead of
 * three always-clickable phase buttons - the old version let the host jump
 * to any phase in any order, which read as arbitrary rather than guided.
 * "Reset to lobby" is kept as an explicit, confirmed escape hatch for
 * mistakes rather than a first-class option in the normal flow.
 */
export function PhaseControls({ phase, nightNumber, onChange }: PhaseControlsProps) {
  return (
    <div className="flex items-center gap-3">
      <Button onClick={() => onChange(nextPhase(phase))}>{nextLabel(phase, nightNumber)}</Button>
      {phase !== 'lobby' ? (
        <Button
          variant="ghost"
          className="text-xs"
          onClick={() => {
            if (window.confirm('Reset this game back to the lobby? This does not remove players or roles.')) {
              onChange('lobby');
            }
          }}
        >
          Reset to lobby
        </Button>
      ) : null}
    </div>
  );
}
