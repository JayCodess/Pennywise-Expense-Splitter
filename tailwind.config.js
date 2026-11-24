/** @type {import('tailwindcss').Config} */
export default {
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx}'],
  theme: {
    extend: {
      colors: {
        background: 'var(--color-bg)',
        surface: 'var(--color-surface)',
        border: 'var(--color-border)',
        'text-base': 'var(--color-text)',
        'text-muted': 'var(--color-text-muted)',
        accent: 'var(--color-accent)',
        'accent-hover': 'var(--color-accent-hover)',
        'accent-text': 'var(--color-accent-text)',
        positive: 'var(--color-positive)',
        'positive-text': 'var(--color-positive-text)',
        negative: 'var(--color-negative)',
        'negative-text': 'var(--color-negative-text)',
      },
      fontFamily: {
        display: ['"Pirata One"', 'serif', 'cursive'],
        sans: ['Inter', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        card: '16px',
      },
      keyframes: {
        bob: {
          '0%, 100%': { transform: 'translateY(0) rotate(0deg)' },
          '50%': { transform: 'translateY(-6px) rotate(1.5deg)' },
        },
        titleFlicker: {
          '0%, 88%, 92%, 100%': { opacity: '1', filter: 'drop-shadow(0 0 0 rgba(193, 18, 31, 0))' },
          '89%': { opacity: '0.7', filter: 'drop-shadow(0 0 8px rgba(193, 18, 31, 0.4))' },
          '90%': { opacity: '0.9', filter: 'drop-shadow(0 0 2px rgba(193, 18, 31, 0.2))' },
          '91%': { opacity: '0.55', filter: 'drop-shadow(0 0 10px rgba(193, 18, 31, 0.6))' },
        },
        cardIn: {
          '0%': { opacity: '0', filter: 'blur(4px)', transform: 'translateY(6px)' },
          '100%': { opacity: '1', filter: 'blur(0)', transform: 'translateY(0)' },
        },
        clownBreathe: {
          '0%, 100%': { transform: 'scale(1)' },
          '50%': { transform: 'scale(1.018, 0.985)' },
        },
        drainBlink: {
          '0%, 94%, 98%, 100%': { opacity: '0.85' },
          '96%': { opacity: '0' },
        },
        floatAway: {
          '0%': { transform: 'translateY(0) scale(1)', opacity: '0.9' },
          '100%': { transform: 'translateY(-90px) scale(0.65)', opacity: '0' },
        },
        fogDrift: {
          '0%': { transform: 'translateX(-3%)' },
          '100%': { transform: 'translateX(3%)' },
        },
        btnBalloon: {
          '0%': { transform: 'translateY(0) scale(0.6)', opacity: '0.9' },
          '100%': { transform: 'translateY(-55px) scale(1.1)', opacity: '0' },
        },
        dripGrow: {
          '0%': { transform: 'scaleY(0)', transformOrigin: 'top' },
          '100%': { transform: 'scaleY(1)', transformOrigin: 'top' },
        },
        dripCreep: {
          '0%, 100%': { transform: 'translateY(0)' },
          '50%': { transform: 'translateY(2px)' },
        },
        gutterBlink1: {
          '0%, 95%, 98%, 100%': { opacity: '0.22' },
          '96.5%': { opacity: '0' },
        },
        gutterBlink2: {
          '0%, 96%, 98.5%, 100%': { opacity: '0.18' },
          '97.2%': { opacity: '0' },
        },
      },
      animation: {
        bob: 'bob 4.5s ease-in-out infinite',
        'title-flicker': 'titleFlicker 8s ease-in-out infinite',
        'card-in': 'cardIn 0.35s ease-out forwards',
        'clown-breathe': 'clownBreathe 6s ease-in-out infinite',
        'drain-blink': 'drainBlink 10s ease-in-out infinite',
        'float-away': 'floatAway 2.8s ease-in forwards',
        'fog-drift': 'fogDrift 22s ease-in-out infinite alternate',
        'btn-balloon': 'btnBalloon 1.2s ease-out forwards',
        'drip-grow': 'dripGrow 2.8s ease-out forwards',
        'drip-creep': 'dripCreep 25s ease-in-out infinite alternate',
        'gutter-blink-1': 'gutterBlink1 26s ease-in-out infinite',
        'gutter-blink-2': 'gutterBlink2 36s ease-in-out infinite',
      },
    },
  },
  plugins: [],
};
