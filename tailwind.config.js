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
      },
      animation: {
        bob: 'bob 4.5s ease-in-out infinite',
        'title-flicker': 'titleFlicker 8s ease-in-out infinite',
        'card-in': 'cardIn 0.35s ease-out forwards',
      },
    },
  },
  plugins: [],
};
