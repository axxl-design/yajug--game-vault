import type { Config } from 'tailwindcss';

/**
 * Tailwind config para YAJUGÁ: DOMINIO.
 * Los colores y tokens consumen las CSS variables definidas en src/styles/tokens.css
 * (portadas literalmente del handoff bundle). Eso permite que dark/light mode se
 * resuelva por [data-theme] en :root sin recompilar Tailwind.
 */
const config: Config = {
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  darkMode: ['class', '[data-theme="dark"]'],
  theme: {
    extend: {
      colors: {
        // Brand raw (siempre fijos, sin tematizar)
        ink: 'var(--ink)',
        bone: 'var(--bone)',
        coral: {
          DEFAULT: 'var(--coral)',
          700: 'var(--coral-700)',
          300: 'var(--coral-300)',
        },
        amber: {
          DEFAULT: 'var(--amber)',
          700: 'var(--amber-700)',
        },
        // Violet (v3) — reservado para momentos cinematográficos.
        // No usar en HomeScreen, Lobby, Tutorial ni UI cotidiana.
        violet: {
          DEFAULT: 'var(--violet)',
          hover: 'var(--violet-hover)',
          active: 'var(--violet-active)',
          dark: 'var(--violet-dark)',
          light: 'var(--violet-light)',
        },
        carbon: 'var(--carbon)',
        mist: 'var(--mist)',

        // Set colors (cartas de propiedad)
        'set-coral': 'var(--set-coral)',
        'set-vermil': 'var(--set-vermil)',
        'set-verde': 'var(--set-verde)',
        'set-graphite': 'var(--set-graphite)',

        // Semantic (resuelve por tema)
        bg: 'var(--bg)',
        'bg-elev-1': 'var(--bg-elev-1)',
        'bg-elev-2': 'var(--bg-elev-2)',
        surface: 'var(--surface)',
        'surface-2': 'var(--surface-2)',
        border: 'var(--border)',
        'border-strong': 'var(--border-strong)',
        divider: 'var(--divider)',
        text: 'var(--text)',
        'text-muted': 'var(--text-muted)',
        'text-subtle': 'var(--text-subtle)',
        'text-inv': 'var(--text-inv)',
        accent: 'var(--accent)',
        'accent-fg': 'var(--accent-fg)',
        premium: 'var(--premium)',
      },
      fontFamily: {
        display: ['var(--font-display)'],
        sans: ['var(--font-sans)'],
        mono: ['var(--font-mono)'],
      },
      fontSize: {
        '12': 'var(--fs-12)',
        '13': 'var(--fs-13)',
        '14': 'var(--fs-14)',
        '15': 'var(--fs-15)',
        '16': 'var(--fs-16)',
        '18': 'var(--fs-18)',
        '20': 'var(--fs-20)',
        '24': 'var(--fs-24)',
        '28': 'var(--fs-28)',
        '32': 'var(--fs-32)',
        '40': 'var(--fs-40)',
        '48': 'var(--fs-48)',
        '64': 'var(--fs-64)',
        '80': 'var(--fs-80)',
        '104': 'var(--fs-104)',
      },
      borderRadius: {
        '2': 'var(--r-2)',
        '4': 'var(--r-4)',
        '6': 'var(--r-6)',
        '8': 'var(--r-8)',
        '12': 'var(--r-12)',
        '14': 'var(--r-14)',
        '16': 'var(--r-16)',
        card: 'var(--radius-card)',
      },
      boxShadow: {
        sm: 'var(--shadow-sm)',
        md: 'var(--shadow-md)',
        lg: 'var(--shadow-lg)',
        inset: 'var(--shadow-inset)',
      },
      transitionTimingFunction: {
        out: 'var(--ease-out)',
        'in-out': 'var(--ease-in-out)',
      },
      transitionDuration: {
        fast: '150ms',
        base: '220ms',
        slow: '320ms',
      },
    },
  },
  plugins: [],
};

export default config;
