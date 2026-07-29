import type { OwnRoleReveal } from 'shared';
import { Card } from '../shared/Card';
import { ColorBadge } from '../shared/ColorBadge';
import { RoleIcon } from '../shared/RoleIcon';

interface RoleCardProps {
  ownRole: OwnRoleReveal | null;
}

/**
 * Shows the player's own role, current alignment, and paraphrased
 * ability/FAQ text only — never anyone else's. Alignment is the player's
 * own current `alignment` (via ColorBadge, the only alignment->color
 * mapper), not derived from the role's default team.
 */
export function RoleCard({ ownRole }: RoleCardProps) {
  if (!ownRole) {
    return (
      <Card>
        <p className="text-sm text-ink/70">The host hasn&apos;t assigned your role yet.</p>
      </Card>
    );
  }

  return (
    <Card className="flex flex-col items-center gap-3 text-center">
      <RoleIcon roleName={ownRole.roleName} size={160} className="border-2 shadow-lg" />
      <div>
        <p className="text-xs uppercase tracking-wide text-ink/65">{ownRole.team}</p>
        <h2 className="text-2xl font-semibold text-ink">{ownRole.roleName}</h2>
      </div>
      <ColorBadge alignment={ownRole.alignment} />
      <div className="w-full text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/65">Ability</p>
        <p className="text-sm text-ink">{ownRole.abilityText}</p>
      </div>
      <div className="w-full text-left">
        <p className="text-xs font-semibold uppercase tracking-wide text-ink/65">FAQ</p>
        <p className="text-sm text-ink">{ownRole.faqText}</p>
      </div>
    </Card>
  );
}
