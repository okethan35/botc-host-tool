export function ConnectionStatus({ connected }: { connected: boolean }) {
  return (
    <span className="inline-flex items-center gap-1.5 text-xs text-ink/70">
      <span className={`h-2 w-2 rounded-full ${connected ? 'bg-emerald-600' : 'bg-ink/40'}`} />
      {connected ? 'Connected' : 'Connecting…'}
    </span>
  );
}
