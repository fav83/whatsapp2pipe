/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx,mdx}",
  ],
  theme: {
    extend: {
      colors: {
        'indigo': {
          50: '#eef2ff',
          100: '#e0e7ff',
          200: '#c7d2fe',
          300: '#a5b4fc',
          400: '#818cf8',
          450: '#665F98',
          500: '#4F39F6',
          600: '#4531E0',
          700: '#3D2BC8',
          800: '#3730a3',
          900: '#312e81',
          DEFAULT: '#4F39F6',
          hover: '#4531E0',
          active: '#3D2BC8',
        },
        'button-primary': '#665F98',
        'button-primary-hover': '#4f4775',
        'button-primary-active': '#483F70',
        'gray-secondary': '#66748d',
        'gray-light': '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
      typography: {
        DEFAULT: {
          css: {
            maxWidth: 'none',
            color: '#475569', // slate-600 - matches front page body text
            a: {
              color: '#4F39F6',
              '&:hover': {
                color: '#4531E0',
              },
            },
            h1: {
              color: '#334155', // slate-700 - matches front page headings
            },
            h2: {
              color: '#334155', // slate-700
            },
            h3: {
              color: '#334155', // slate-700
            },
            h4: {
              color: '#334155', // slate-700
            },
            strong: {
              color: '#334155', // slate-700
            },
            code: {
              color: '#111827',
              backgroundColor: '#f3f4f6',
              padding: '0.25rem 0.375rem',
              borderRadius: '0.25rem',
              fontWeight: '400',
            },
            'code::before': {
              content: '""',
            },
            'code::after': {
              content: '""',
            },
          },
        },
      },
    },
  },
  plugins: [
    require('@tailwindcss/typography'),
  ],
}
