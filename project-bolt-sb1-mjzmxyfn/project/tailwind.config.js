/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        bg: {
          primary: '#0B0F19',
          secondary: '#111827',
          card: '#162032',
          hover: '#1E293B',
        },
        text: {
          primary: '#F8FAFC',
          secondary: '#94A3B8',
          muted: '#64748B',
        },
        accent: {
          DEFAULT: '#F59E0B',
          hover: '#FBBF24',
          soft: 'rgba(245, 158, 11, 0.14)',
        },
        border: {
          DEFAULT: '#1E293B',
          subtle: '#141D2E',
          strong: '#334155',
        },
        status: {
          success: '#10B981',
          warning: '#F59E0B',
          error: '#F43F5E',
          info: '#38BDF8',
        },
      },
      fontFamily: {
        heading: ['Manrope', 'system-ui', 'sans-serif'],
        body: ['Inter', 'system-ui', 'sans-serif'],
        editorial: ['Cormorant Garamond', 'Georgia', 'serif'],
      },
      fontSize: {
        '2xs': ['0.6875rem', { lineHeight: '1rem' }],
        '3xs': ['0.625rem', { lineHeight: '0.85rem' }],
        '4xs': ['0.5625rem', { lineHeight: '0.75rem' }],
      },
      letterSpacing: {
        tightest: '-0.03em',
        wider: '0.08em',
        widest: '0.14em',
      },
      spacing: {
        18: '4.5rem',
      },
      transitionDuration: {
        150: '150ms',
      },
      keyframes: {
        'fade-in': {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        'slide-up': {
          '0%': { opacity: '0', transform: 'translateY(8px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        'scale-in': {
          '0%': { opacity: '0', transform: 'scale(0.96)' },
          '100%': { opacity: '1', transform: 'scale(1)' },
        },
      },
      animation: {
        'fade-in': 'fade-in 200ms ease-out',
        'slide-up': 'slide-up 250ms ease-out',
        'scale-in': 'scale-in 180ms ease-out',
      },
    },
  },
  plugins: [],
};
