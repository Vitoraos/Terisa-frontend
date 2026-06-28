import type { Config } from 'tailwindcss'

const config: Config = {
  content: [
    './src/pages/**/*.{js,ts,jsx,tsx,mdx}',
    './src/components/**/*.{js,ts,jsx,tsx,mdx}',
    './src/app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        'horizon-blue': '#0052CC',
        'bg-0': '#09090B',
        'bg-1': '#111318',
        'bg-2': '#1C2030',
        'surface': '#0D1421',
        'surface-border': '#1C2A3A',
        'text-primary': '#FAFAFA',
        'text-muted': 'rgba(250, 250, 250, 0.45)',
        'text-secondary': 'rgba(250, 250, 250, 0.85)',
        'success': '#00C48C',
        'error': '#FF3B5C',
        'warning': '#F5A623',
        'electric-cyan': '#00D4FF',
        'deep-space': '#080C14',
      },
      fontFamily: {
        sans: ['var(--font-inter)', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['var(--font-jetbrains-mono)', 'JetBrains Mono', 'monospace'],
      },
      spacing: {
        '1': '4px',
        '2': '8px',
        '3': '12px',
        '4': '16px',
        '5': '24px',
        '6': '32px',
        '7': '48px',
        '8': '64px',
      },
      borderRadius: {
        'sm': '6px',
        'md': '10px',
        'lg': '16px',
        'full': '9999px',
      },
    },
  },
  plugins: [],
}

export default config
