import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  darkMode: 'class',
  theme: {
    extend: {
      fontFamily: {
        // Retro Scoreboard
        orbitron: ['var(--font-orbitron)', 'sans-serif'],
        'share-tech': ['var(--font-share-tech)', 'monospace'],
        // Midnight Court
        oswald: ['var(--font-oswald)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
        // Hardwood Classic
        teko: ['var(--font-teko)', 'sans-serif'],
        archivo: ['var(--font-archivo)', 'sans-serif'],
        // Dynamic (set by theme)
        display: ['var(--font-display)', 'sans-serif'],
        mono: ['var(--font-mono)', 'monospace'],
        body: ['var(--font-body)', 'sans-serif'],
      },
      colors: {
        gold: '#FFD700',
        silver: '#C0C0C0',
        bronze: '#CD7F32',
        // Theme "LED" tokens (see globals.css). Scoreboard themes give each its
        // own hue; Risograph maps all four to the league's primary ink. Use
        // these for UI accents so every theme can restyle them; Tailwind's own
        // palette (amber-500 etc.) is untouched and stays theme-independent.
        'led-amber': 'hsl(var(--led-amber) / <alpha-value>)',
        'led-red': 'hsl(var(--led-red) / <alpha-value>)',
        'led-green': 'hsl(var(--led-green) / <alpha-value>)',
        'led-purple': 'hsl(var(--led-purple) / <alpha-value>)',
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        primary: {
          DEFAULT: 'hsl(var(--primary))',
          foreground: 'hsl(var(--primary-foreground))',
        },
        secondary: {
          DEFAULT: 'hsl(var(--secondary))',
          foreground: 'hsl(var(--secondary-foreground))',
        },
        accent: {
          DEFAULT: 'hsl(var(--accent))',
          foreground: 'hsl(var(--accent-foreground))',
        },
        muted: {
          DEFAULT: 'hsl(var(--muted))',
          foreground: 'hsl(var(--muted-foreground))',
        },
        card: {
          DEFAULT: 'hsl(var(--card))',
          foreground: 'hsl(var(--card-foreground))',
        },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [],
}
export default config
