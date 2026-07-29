import type { ReactNode } from 'react';
import type { Alignment } from 'shared';

interface ColorBadgeProps {
  alignment: Alignment | null | undefined;
  children?: ReactNode;
  className?: string;
}

/**
 * The ONLY component allowed to map alignment -> color. Always reads from
 * `Player.alignment`, never from `Role.team` — this is what makes
 * Recluse-style registration flips (evil-registering good players, etc.)
 * work correctly everywhere the badge is used.
 */
export function ColorBadge({ alignment, children, className = '' }: ColorBadgeProps) {
  const classes =
    alignment === 'good'
      ? 'bg-good/15 text-good border-good/40'
      : alignment === 'evil'
        ? 'bg-evil/15 text-evil border-evil/40'
        : 'bg-neutral/15 text-neutral border-neutral/40';

  return (
    <span
      className={`inline-flex items-center gap-1 rounded-full border px-2 py-0.5 text-xs font-medium ${classes} ${className}`}
    >
      {children ?? (alignment ?? 'unknown')}
    </span>
  );
}
