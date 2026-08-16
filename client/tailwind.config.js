/** @type {import('tailwindcss').Config} */
export default {
  content: [
    './index.html',
    './src/**/*.{js,ts,jsx,tsx}'
  ],
  darkMode: 'class',
  theme: {
    extend: {
      colors: {
        dark: {
          950: '#03050a',
          900: '#050811',
          850: '#090d1c',
          800: '#0d1326',
          750: '#111933',
          700: '#16203f',
          600: '#1e2b52',
          500: '#2a3b6e'
        },
        space: {
          base: '#050811',
          card: '#090e1d',
          surface: '#0e1529',
          border: '#1a233d',
          hover: '#1f2a47',
          cyan: '#06b6d4',
          sky: '#0ea5e9',
          neon: '#22d3ee',
          violet: '#8b5cf6'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        glow: '0 0 20px -3px rgba(6, 182, 212, 0.25)',
        'glow-lg': '0 0 35px -5px rgba(14, 165, 233, 0.35)',
        'glow-violet': '0 0 25px -4px rgba(139, 92, 246, 0.3)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.45)',
        'tech-card': '0 4px 20px -2px rgba(0, 0, 0, 0.5), inset 0 1px 0 rgba(255, 255, 255, 0.05)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-10px)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: 0.6, transform: 'scale(1)' },
          '50%': { opacity: 1, transform: 'scale(1.03)' }
        }
      }
    }
  },
  plugins: []
};
