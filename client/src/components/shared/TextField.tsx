import type { InputHTMLAttributes } from 'react';

interface TextFieldProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string;
}

export function TextField({ label, id, className = '', ...rest }: TextFieldProps) {
  return (
    <label className="flex flex-col gap-1 text-sm text-ink/80" htmlFor={id}>
      {label}
      <input
        id={id}
        className={`rounded-lg border border-ink/30 bg-paper px-3 py-2 text-ink placeholder:text-ink/40 focus:border-neutral focus:outline-none ${className}`}
        {...rest}
      />
    </label>
  );
}
