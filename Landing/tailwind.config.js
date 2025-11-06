/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
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
        'button-primary-hover': '#574F85',
        'button-primary-active': '#483F70',
        'gray-secondary': '#66748d',
        'gray-light': '#e2e8f0',
      },
      fontFamily: {
        sans: ['Inter', 'system-ui', '-apple-system', 'sans-serif'],
      },
    },
  },
  plugins: [],
}
