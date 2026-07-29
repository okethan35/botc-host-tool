import type { ReactNode } from 'react';

interface SeatProps {
  label: string;
  sublabel?: string;
  onClick?: () => void;
  dimmed?: boolean;
  badge?: ReactNode;
  icon?: ReactNode;
}

/** Default seat bubble used by GrimoireView's interactive ring renderer. */
export function Seat({ label, sublabel, onClick, dimmed, badge, icon }: SeatProps) {
  const Tag = onClick ? 'button' : 'div';
  return (
    <Tag
      type={onClick ? 'button' : undefined}
      onClick={onClick}
      className={`flex w-24 flex-col items-center gap-1 rounded-lg border border-ink/40 bg-paper-panel px-2 py-2 text-center shadow-sm transition-colors ${
        onClick ? 'hover:border-neutral' : ''
      } ${dimmed ? 'opacity-50' : ''}`}
    >
      {icon}
      <span className="max-w-full truncate text-xs font-semibold text-ink">{label}</span>
      {sublabel ? <span className="max-w-full truncate text-[10px] text-ink/70">{sublabel}</span> : null}
      {badge}
    </Tag>
  );
}
