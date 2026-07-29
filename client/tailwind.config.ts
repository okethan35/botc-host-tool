import type { Config } from 'tailwindcss';

export default {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // rgb(var(--x) / <alpha-value>) — NOT a plain var() reference — is
        // required for Tailwind's opacity modifiers (e.g. text-ink/60) to
        // work at all; the CSS variables hold space-separated RGB channels
        // to match. See src/styles/index.css for the values.
        good: 'rgb(var(--color-good) / <alpha-value>)',
        evil: 'rgb(var(--color-evil) / <alpha-value>)',
        neutral: 'rgb(var(--color-neutral) / <alpha-value>)',
        // Aged-paper + royal-purple theme, inspired by bloodontheclocktower.com's
        // deep violet chrome against cream parchment content, with gold accents.
        // Alignment badges keep the good/evil/neutral blue/red/purple accents
        // above untouched — this palette is only for general site chrome/surfaces.
        paper: {
          DEFAULT: 'rgb(var(--color-paper) / <alpha-value>)',
          panel: 'rgb(var(--color-paper-panel) / <alpha-value>)',
          deep: 'rgb(var(--color-paper-deep) / <alpha-value>)',
        },
        ink: 'rgb(var(--color-ink) / <alpha-value>)',
        chrome: {
          DEFAULT: 'rgb(var(--color-chrome) / <alpha-value>)',
          deep: 'rgb(var(--color-chrome-deep) / <alpha-value>)',
        },
        cream: 'rgb(var(--color-cream) / <alpha-value>)',
        gold: {
          DEFAULT: 'rgb(var(--color-gold) / <alpha-value>)',
          light: 'rgb(var(--color-gold-light) / <alpha-value>)',
        },
      },
      fontFamily: {
        display: ['Cinzel', '"Trajan Pro"', 'Georgia', 'serif'],
        serif: ['"EB Garamond"', 'Palatino', 'Georgia', '"Times New Roman"', 'serif'],
      },
    },
  },
  plugins: [],
} satisfies Config;
