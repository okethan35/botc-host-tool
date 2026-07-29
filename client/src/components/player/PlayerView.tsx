import type { OwnRoleReveal, PublicGame, PublicPlayer } from 'shared';
import { RoleCard } from './RoleCard';
import { PublicBoard } from './PublicBoard';

interface PlayerViewProps {
  game: PublicGame;
  players: PublicPlayer[];
  ownRole: OwnRoleReveal | null;
}

export function PlayerView({ game, players, ownRole }: PlayerViewProps) {
  return (
    <div className="mx-auto flex max-w-md flex-col gap-4 p-4">
      <RoleCard ownRole={ownRole} />
      <PublicBoard game={game} players={players} />
    </div>
  );
}
