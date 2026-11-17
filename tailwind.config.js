/** @type {import('tailwindcss').Config} */
export default {
  darkMode: 'class',
  content: [
    './src/**/*.{astro,html,js,jsx,md,mdx,svelte,ts,tsx,vue}',
    './src/content/**/*.{md,mdx}',
  ],
  theme: {
    extend: {
      colors: {
        gptclone: {
          purple: '#7047D7',
          'purple-100': '#F5F3FF',
          'purple-200': '#EDE9FE',
          'purple-300': '#D8C9FD',
          'purple-400': '#A66BFF',
          'purple-500': '#7047D7',
          'purple-600': '#5B21B2',
          'purple-700': '#4C1D95',
          'purple-900': '#2E054E',
          'purple-dark': '#5B21B2',
          'purple-light': '#A66BFF',
          bg: '#242044',
          surface: '#39416D',
          text: '#F2EEFF',
          'bg-light': '#F0F9FF',
          'surface-light': '#E0F2FE',
          'text-light': '#1b1836',
          'text-light-secondary': '#39416D',
          'text-light-muted': '#64748b',
          aurora: {
            50: '#F0F9FF',
            100: '#E0F2FE',
            200: '#BAE6FD',
            300: '#93C5FD',
            400: '#60A5FA',
            500: '#16C9D8',
            600: '#0FB5C4',
            700: '#0A94A1',
            800: '#08727C',
            900: '#065A62',
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