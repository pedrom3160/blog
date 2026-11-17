/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gptclone: {
          purple: '#8b5cf6',
          'purple-dark': '#7c3aed',
          'purple-light': '#a78bfa',
          aurora: {
            50: '#f0f9ff',
            100: '#e0f2fe',
            200: '#bae6fd',
            300: '#93c5fd',
            400: '#60a5fa',
            500: '#3b82f6',
            600: '#2563eb',
            700: '#1d4ed8',
            800: '#1e40af',
            900: '#1e3a8a',
          },
          slate: {
            900: '#0f172a',
            950: '#020617',
          },
        },
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', 'sans-serif'],
        serif: ['"Source Serif 4"', 'Georgia', 'serif'],
        mono: ['"Fira Code"', 'monospace'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#334155',
            'h1, h2, h3, h4, h5, h6': {
              color: '#0f172a',
              fontWeight: '700',
              letterSpacing: '-0.02em',
            },
            h1: { fontSize: '2.25rem', lineHeight: '1.2' },
            h2: { fontSize: '1.875rem', lineHeight: '1.33' },
            h3: { fontSize: '1.5rem', lineHeight: '1.4' },
            'a': { color: '#8b5cf6', textDecoration: 'underline', fontWeight: '600' },
            'code::before': { content: '""' },
            'code::after': { content: '""' },
            pre: { backgroundColor: '#0f172a', color: '#e2e8f0' },
          },
        },
        invert: {
          css: {
            color: '#e2e8f0',
            'h1, h2, h3, h4, h5, h6': { color: '#f8fafc' },
            'a': { color: '#a78bfa' },
            pre: { backgroundColor: '#020617', color: '#e2e8f0' },
          },
        },
      },
      animation: {
        'fade-in': 'fadeIn 0.5s ease-out forwards',
        'slide-up': 'slideUp 0.6s ease-out forwards',
        'pulse-soft': 'pulseSoft 4s infinite ease-in-out',
      },
      keyframes: {
        fadeIn: {
          '0%': { opacity: '0' },
          '100%': { opacity: '1' },
        },
        slideUp: {
          '0%': { opacity: '0', transform: 'translateY(20px)' },
          '100%': { opacity: '1', transform: 'translateY(0)' },
        },
        pulseSoft: {
          '0%, 100%': { opacity: '1' },
          '50%': { opacity: '0.7' },
        },
      },
    },
  },
  plugins: [],
}