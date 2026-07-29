import type { HTMLAttributes } from 'react';

export function Card({ className = '', ...rest }: HTMLAttributes<HTMLDivElement>) {
  return (
    <div
      className={`rounded-xl border border-ink/30 bg-paper-panel/70 p-4 shadow-sm ${className}`}
      {...rest}
    />
  );
}
