/**
 * Persistent purple masthead - the "general app chrome / layout shell" the
 * product spec calls out as purple. Page-specific headers (game code, phase,
 * etc.) still live inside each route's own content area below this.
 */
export function TopBar() {
  return (
    <header className="border-b border-gold/30 bg-chrome">
      <div className="mx-auto flex max-w-4xl items-center gap-2 px-4 py-3">
        <span className="text-lg leading-none text-gold-light" aria-hidden>
          ⏱
        </span>
        <span className="font-display text-sm font-semibold uppercase tracking-[0.2em] text-cream">
          Blood on the Clocktower
        </span>
        <span className="hidden text-xs uppercase tracking-widest text-cream/60 sm:inline">
          - Host Companion
        </span>
      </div>
    </header>
  );
}
