import type { Player, Role } from 'shared';
import { RosterList } from './RosterList';
import { PhantomPlayerForm } from './PhantomPlayerForm';
import { RoleAssignButton } from './RoleAssignButton';

interface GrimoireViewProps {
  players: Player[];
  roles: Role[];
  onAddPhantom: (displayName: string) => void;
  onSelectPlayer: (player: Player) => void;
  onAssignRoles: () => void;
}

/** Roster tab: full list view (name, role, alignment, alive/dead, seat) - spec feature 2/3. */
export function GrimoireView({ players, roles, onAddPhantom, onSelectPlayer, onAssignRoles }: GrimoireViewProps) {
  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-end justify-between gap-3">
        <PhantomPlayerForm onAdd={onAddPhantom} />
        <RoleAssignButton onAssign={onAssignRoles} playerCount={players.length} />
      </div>

      <RosterList players={players} roles={roles} onSelect={onSelectPlayer} />
    </div>
  );
}
