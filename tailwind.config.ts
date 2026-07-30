import type { Config } from 'tailwindcss';

const config: Config = {
  content: ['./app/**/*.{ts,tsx}', './components/**/*.{ts,tsx}'],
  theme: {
    extend: {
      colors: {
        cream: '#F7F1E6',
        offwhite: '#FCFAF5',
        beige: '#EEE3D0',
        gold: '#B08D4F',
        golddeep: '#8A6B39',
        goldlight: '#D8BE8C',
        charcoal: '#2A241C',
        charcoal2: '#4A4136',
        line: '#E1D3B8',
      },
      fontFamily: {
        display: ['var(--font-fraunces)', 'Georgia', 'serif'],
        body: ['var(--font-inter)', 'system-ui', 'sans-serif'],
      },
      borderRadius: {
        xl2: '1.25rem',
      },
      boxShadow: {
        soft: '0 8px 30px rgba(42, 36, 28, 0.08)',
        softer: '0 2px 12px rgba(42, 36, 28, 0.06)',
      },
      keyframes: {
        drawline: {
          '0%': { strokeDashoffset: '600' },
          '100%': { strokeDashoffset: '0' },
        },
        fadeup: {
          '0%': { opacity: '0', transform: 'translateY(14px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
      },
      animation: {
        drawline: 'drawline 1.8s ease-out forwards',
        fadeup: 'fadeup 0.7s ease-out forwards',
      },
    },
  },
  plugins: [],
};

export default config;
