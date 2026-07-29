import { useEffect, useState } from 'react';
import type { SeatingWarningItem } from 'shared';

interface SeatingConstraintWarningProps {
  warnings: SeatingWarningItem[];
}

/** Non-blocking, dismissible-but-persistent banner — reappears if the warning set changes. */
export function SeatingConstraintWarning({ warnings }: SeatingConstraintWarningProps) {
  const key = warnings.map((w) => `${w.roleId}:${w.message}`).join('|');
  const [dismissedKey, setDismissedKey] = useState<string | null>(null);

  useEffect(() => {
    if (warnings.length === 0) setDismissedKey(null);
  }, [warnings.length]);

  if (warnings.length === 0 || dismissedKey === key) return null;

  return (
    <div className="flex items-start justify-between gap-3 rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2 text-sm text-amber-300">
      <ul className="flex flex-col gap-1">
        {warnings.map((w) => (
          <li key={`${w.roleId}-${w.message}`}>{w.message}</li>
        ))}
      </ul>
      <button
        type="button"
        onClick={() => setDismissedKey(key)}
        className="shrink-0 rounded px-2 py-0.5 text-amber-300 hover:bg-amber-500/20"
      >
        Dismiss
      </button>
    </div>
  );
}
