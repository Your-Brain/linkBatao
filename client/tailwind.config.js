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
        brand: {
          50: '#f5f3ff',
          100: '#ede9fe',
          200: '#ddd6fe',
          300: '#c4b5fd',
          400: '#a78bfa',
          500: '#8b5cf6',
          600: '#7c3aed',
          700: '#6d28d9',
          800: '#5b21b6',
          900: '#4c1d95',
          950: '#2e1065'
        },
        surface: {
          base: '#07040f',
          card: '#0d081e',
          panel: '#130c2c',
          border: '#1f1344',
          hover: '#261754',
          highlight: '#321e6e'
        },
        dark: {
          950: '#07040f',
          900: '#0d081e',
          850: '#130c2c',
          800: '#1a103c',
          750: '#22154e',
          700: '#2a1a60',
          600: '#3b2586',
          500: '#5234ba'
        }
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        display: ['Space Grotesk', 'Inter', 'system-ui', 'sans-serif'],
        mono: ['JetBrains Mono', 'monospace']
      },
      boxShadow: {
        'purple-glow': '0 0 25px -4px rgba(139, 92, 246, 0.35)',
        'purple-glow-lg': '0 0 45px -5px rgba(124, 58, 237, 0.45)',
        'purple-glow-sm': '0 0 15px -3px rgba(167, 139, 250, 0.25)',
        glass: '0 8px 32px 0 rgba(0, 0, 0, 0.55)',
        'tech-card': '0 4px 20px -2px rgba(0, 0, 0, 0.6), inset 0 1px 0 rgba(255, 255, 255, 0.06)'
      },
      animation: {
        'pulse-slow': 'pulse 4s cubic-bezier(0.4, 0, 0.6, 1) infinite',
        'float': 'float 6s ease-in-out infinite',
        'glow-pulse': 'glowPulse 3s ease-in-out infinite',
        'shimmer': 'shimmer 2.5s linear infinite'
      },
      keyframes: {
        float: {
          '0%, 100%': { transform: 'translateY(0px)' },
          '50%': { transform: 'translateY(-8px)' }
        },
        glowPulse: {
          '0%, 100%': { opacity: '0.6', transform: 'scale(1)' },
          '50%': { opacity: '1', transform: 'scale(1.02)' }
        },
        shimmer: {
          '0%': { backgroundPosition: '-200% 0' },
          '100%': { backgroundPosition: '200% 0' }
        }
      }
    }
  },
  plugins: []
};
