import type { PublicGame, PublicPlayer } from 'shared';
import { sortBySeat } from 'shared';
import { PhaseIndicator } from '../shared/PhaseIndicator';
import { Card } from '../shared/Card';

interface PublicBoardProps {
  game: PublicGame;
  players: PublicPlayer[];
}

/** Alive/dead status for all players + phase/night - genuinely public info, never role/alignment. */
export function PublicBoard({ game, players }: PublicBoardProps) {
  const sorted = sortBySeat(players);
  return (
    <Card className="flex flex-col gap-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-ink/80">Table</h2>
        <PhaseIndicator phase={game.phase} nightNumber={game.nightNumber} />
      </div>
      <ul className="flex flex-col gap-1">
        {sorted.map((player) => (
          <li key={player.id} className="flex items-center justify-between text-sm">
            <span className="text-ink">
              #{player.seatPosition + 1} {player.displayName}
            </span>
            <span className={player.alive ? 'text-good' : 'text-ink/65'}>{player.alive ? 'Alive' : 'Dead'}</span>
          </li>
        ))}
      </ul>
    </Card>
  );
}
