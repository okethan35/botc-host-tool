import type { Player, Role } from 'shared';
import { sortBySeat } from 'shared';
import { ColorBadge } from '../shared/ColorBadge';
import { RoleIcon } from '../shared/RoleIcon';

interface RosterListProps {
  players: Player[];
  roles: Role[];
  onSelect: (player: Player) => void;
}

export function RosterList({ players, roles, onSelect }: RosterListProps) {
  const roleById = new Map(roles.map((r) => [r.id, r]));
  const sorted = sortBySeat(players);

  if (sorted.length === 0) {
    return <p className="text-sm text-ink/70">No players have joined yet. Share the join code to get started.</p>;
  }

  return (
    <ul className="flex flex-col gap-2">
      {sorted.map((player) => {
        const role = player.roleId ? roleById.get(player.roleId) : undefined;
        const believedRole = player.believedRoleId ? roleById.get(player.believedRoleId) : undefined;
        return (
          <li key={player.id}>
            <button
              type="button"
              onClick={() => onSelect(player)}
              className="flex w-full items-center justify-between gap-3 rounded-lg border border-ink/30 bg-paper-panel/60 px-3 py-2 text-left hover:border-neutral"
            >
              <div className="flex items-center gap-3">
                <span className="w-6 shrink-0 text-center text-xs text-ink/65">#{player.seatPosition + 1}</span>
                {role ? <RoleIcon roleName={role.name} size={28} /> : null}
                <div className="flex flex-col">
                  <span className="font-medium text-ink">
                    {player.displayName}
                    {player.isHost ? <span className="ml-1 text-xs text-neutral">(host)</span> : null}
                    {!player.hasDevice ? <span className="ml-1 text-xs text-ink/65">(phantom)</span> : null}
                  </span>
                  <span className="text-xs text-ink/70">
                    {role?.name ?? 'No role assigned'}
                    {believedRole ? ` (believes: ${believedRole.name})` : ''}
                  </span>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <ColorBadge alignment={player.alignment} />
                <span className={`text-xs font-medium ${player.alive ? 'text-good' : 'text-ink/65'}`}>
                  {player.alive ? 'Alive' : 'Dead'}
                </span>
              </div>
            </button>
          </li>
        );
      })}
    </ul>
  );
}
