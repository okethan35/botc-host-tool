interface HostNotesFieldProps {
  value: string;
  onChange: (value: string) => void;
}

export function HostNotesField({ value, onChange }: HostNotesFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink/80">
      Host notes (private)
      <textarea
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={4}
        className="rounded-lg border border-ink/40 bg-paper px-3 py-2 text-ink focus:border-neutral focus:outline-none"
        placeholder="Private notes only you can see…"
      />
    </label>
  );
}
