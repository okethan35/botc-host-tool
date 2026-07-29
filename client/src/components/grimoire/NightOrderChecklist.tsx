import type { NightOrderItem } from 'shared';

interface NightOrderChecklistProps {
  nightNumber: number;
  items: NightOrderItem[];
  onToggle: (roleId: string, checked: boolean) => void;
}

/** Night-order reminder checklist (spec feature 6) — filtered to roles in play, resets each night. */
export function NightOrderChecklist({ nightNumber, items, onToggle }: NightOrderChecklistProps) {
  if (items.length === 0) {
    return <p className="text-sm text-ink/70">No night-order roles are in play yet.</p>;
  }

  return (
    <div className="flex flex-col gap-2">
      <h3 className="text-sm font-semibold text-ink/80">Night {nightNumber} order</h3>
      <ul className="flex flex-col gap-2">
        {items.map((item) => (
          <li
            key={item.roleId}
            className={`flex items-start gap-3 rounded-lg border px-3 py-2 ${
              item.checked ? 'border-emerald-600/40 bg-emerald-500/5' : 'border-ink/30 bg-paper-panel/60'
            }`}
          >
            <input
              type="checkbox"
              checked={item.checked}
              onChange={(e) => onToggle(item.roleId, e.target.checked)}
              className="mt-1 h-4 w-4"
            />
            <div className="flex flex-col">
              <span className="font-medium text-ink">
                {item.order}. {item.roleName}
                {item.playerDisplayName ? (
                  <span className="ml-2 text-xs text-ink/70">
                    seat {item.seatPosition !== null ? item.seatPosition + 1 : '?'} — {item.playerDisplayName}
                  </span>
                ) : null}
              </span>
              {(item.neighborLeft || item.neighborRight) && (
                <span className="text-xs text-ink/65">
                  Neighbors: {item.neighborLeft ?? '—'} / {item.neighborRight ?? '—'}
                </span>
              )}
              <span className="mt-1 text-sm text-ink/80">{item.reminderText}</span>
            </div>
          </li>
        ))}
      </ul>
    </div>
  );
}
