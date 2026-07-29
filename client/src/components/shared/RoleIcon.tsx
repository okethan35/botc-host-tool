import { getRoleIconPath } from 'shared';

interface RoleIconProps {
  roleName: string;
  size?: number;
  className?: string;
}

/** Renders nothing if no icon is mapped for this role (e.g. future non-TB scripts) — never a broken-image box. */
export function RoleIcon({ roleName, size = 32, className = '' }: RoleIconProps) {
  const path = getRoleIconPath(roleName);
  if (!path) return null;

  return (
    <img
      src={path}
      alt=""
      width={size}
      height={size}
      className={`shrink-0 rounded-full border border-gold/40 bg-paper-deep object-cover ${className}`}
    />
  );
}
