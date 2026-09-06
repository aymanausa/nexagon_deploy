import type { Config } from 'tailwindcss'

const config: Config = {
  darkMode: 'class',
  content: [
    './pages/**/*.{js,ts,jsx,tsx,mdx}',
    './components/**/*.{js,ts,jsx,tsx,mdx}',
    './app/**/*.{js,ts,jsx,tsx,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        ews: {
          navy: '#0B1628',
          dark: '#080e1a',
          card: '#0f1d2f',
          accent: '#c8a45c',
          success: '#16a34a',
          warning: '#d97706',
          danger: '#dc2626',
          info: '#0d8a5f',
          purple: '#7c3aed',
        },
      },
      fontFamily: {
        orbitron: ['Orbitron', 'sans-serif'],
        rajdhani: ['Rajdhani', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
export default config
