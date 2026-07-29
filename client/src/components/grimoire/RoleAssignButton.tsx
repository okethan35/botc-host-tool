import { Button } from '../shared/Button';

interface RoleAssignButtonProps {
  onAssign: () => void;
  disabled?: boolean;
  playerCount: number;
}

export function RoleAssignButton({ onAssign, disabled, playerCount }: RoleAssignButtonProps) {
  const outOfRange = playerCount < 5 || playerCount > 15;
  return (
    <div className="flex flex-col items-start gap-1">
      <Button onClick={onAssign} disabled={disabled || outOfRange}>
        Assign roles ({playerCount} players)
      </Button>
      {outOfRange ? (
        <p className="text-xs text-evil">Trouble Brewing supports 5–15 players.</p>
      ) : (
        <p className="text-xs text-ink/65">Shuffles and assigns roles to every seated player.</p>
      )}
    </div>
  );
}
