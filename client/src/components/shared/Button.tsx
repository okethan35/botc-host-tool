import type { ButtonHTMLAttributes } from 'react';

interface ButtonProps extends ButtonHTMLAttributes<HTMLButtonElement> {
  variant?: 'primary' | 'secondary' | 'danger' | 'ghost';
}

const VARIANT_CLASSES: Record<NonNullable<ButtonProps['variant']>, string> = {
  primary: 'bg-neutral text-cream hover:bg-neutral/90 disabled:bg-neutral/40',
  secondary: 'border border-gold/50 bg-gold/15 text-ink hover:bg-gold/25 disabled:opacity-40',
  danger: 'bg-evil text-cream hover:bg-evil/90 disabled:bg-evil/40',
  ghost: 'bg-transparent text-ink hover:bg-paper-deep disabled:opacity-40',
};

export function Button({ variant = 'primary', className = '', ...rest }: ButtonProps) {
  return (
    <button
      className={`inline-flex items-center justify-center gap-2 rounded-lg px-3 py-2 text-sm font-medium tracking-wide transition-colors disabled:cursor-not-allowed ${VARIANT_CLASSES[variant]} ${className}`}
      {...rest}
    />
  );
}
