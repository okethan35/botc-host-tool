import { useEffect, useState } from 'react';
import type { Alignment, Player, Role } from 'shared';
import { Modal } from '../shared/Modal';
import { Button } from '../shared/Button';
import { HostNotesField } from './HostNotesField';
import { ConvertPhantomButton } from './ConvertPhantomButton';

interface PlayerEditModalProps {
  player: Player | null;
  roles: Role[];
  claimUrl?: string;
  onClose: () => void;
  onUpdateNotes: (playerId: string, notes: string) => void;
  onSetAlive: (playerId: string, alive: boolean) => void;
  onSetAlignment: (playerId: string, alignment: Alignment) => void;
  onSetRole: (playerId: string, roleId: string | null) => void;
  onRemove: (playerId: string) => void;
  onConvertToReal: (playerId: string) => void;
}

export function PlayerEditModal({
  player,
  roles,
  claimUrl,
  onClose,
  onUpdateNotes,
  onSetAlive,
  onSetAlignment,
  onSetRole,
  onRemove,
  onConvertToReal,
}: PlayerEditModalProps) {
  const [notes, setNotes] = useState(player?.hostNotes ?? '');

  useEffect(() => {
    setNotes(player?.hostNotes ?? '');
  }, [player?.id, player?.hostNotes]);

  if (!player) return null;

  const believedRole = player.believedRoleId ? roles.find((r) => r.id === player.believedRoleId) : undefined;

  return (
    <Modal open={Boolean(player)} onClose={onClose} title={player.displayName}>
      <div className="flex flex-col gap-4">
        <div className="flex flex-wrap gap-2">
          <Button
            variant={player.alive ? 'secondary' : 'primary'}
            onClick={() => onSetAlive(player.id, !player.alive)}
          >
            Mark {player.alive ? 'dead' : 'alive'}
          </Button>
          <Button
            variant="secondary"
            onClick={() => onSetAlignment(player.id, player.alignment === 'good' ? 'evil' : 'good')}
          >
            Set {player.alignment === 'good' ? 'evil' : 'good'}
          </Button>
        </div>

        <label className="flex flex-col gap-1 text-sm text-ink/80">
          Role
          <select
            value={player.roleId ?? ''}
            onChange={(e) => onSetRole(player.id, e.target.value || null)}
            className="rounded-lg border border-ink/40 bg-paper px-3 py-2 text-ink focus:border-neutral focus:outline-none"
          >
            <option value="">(none)</option>
            {roles.map((role) => (
              <option key={role.id} value={role.id}>
                {role.name} ({role.team})
              </option>
            ))}
          </select>
          {believedRole ? (
            <span className="text-xs text-ink/70">
              This player has been told they are the <strong>{believedRole.name}</strong> - only you can see that
              it's actually the Drunk.
            </span>
          ) : null}
        </label>

        <HostNotesField value={notes} onChange={setNotes} />
        <Button variant="secondary" onClick={() => onUpdateNotes(player.id, notes)}>
          Save notes
        </Button>

        {!player.hasDevice || claimUrl ? (
          <ConvertPhantomButton player={player} claimUrl={claimUrl} onConvert={onConvertToReal} />
        ) : null}

        <div className="mt-2 border-t border-ink/30 pt-3">
          <Button variant="danger" onClick={() => onRemove(player.id)}>
            Remove player
          </Button>
        </div>
      </div>
    </Modal>
  );
}
