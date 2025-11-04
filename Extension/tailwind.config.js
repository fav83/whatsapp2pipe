/** @type {import('tailwindcss').Config} */
export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: {
    extend: {
      colors: {
        brand: {
          primary: 'var(--brand-primary)',
          secondary: 'var(--brand-secondary)',
          hover: 'var(--brand-hover)',
        },
        text: {
          primary: 'var(--text-primary)',
          secondary: 'var(--text-secondary)',
          tertiary: 'var(--text-tertiary)',
          link: 'var(--text-link)',
          'link-hover': 'var(--text-link-hover)',
          'avatar-hover': 'var(--text-avatar-hover)',
        },
        background: {
          main: 'var(--background-main)',
          secondary: 'var(--background-secondary)',
          tertiary: 'var(--background-tertiary)',
          hover: 'var(--background-hover)',
        },
        border: {
          primary: 'var(--border-primary)',
          secondary: 'var(--border-secondary)',
        },
        button: {
          primary: {
            bg: 'var(--button-primary-bg)',
            'bg-hover': 'var(--button-primary-bg-hover)',
            text: 'var(--button-primary-text)',
          },
          secondary: {
            bg: 'var(--button-secondary-bg)',
            'bg-hover': 'var(--button-secondary-bg-hover)',
            text: 'var(--button-secondary-text)',
          },
        },
        loading: {
          spinner: 'var(--loading-spinner)',
        },
        dev: {
          background: 'var(--dev-bg)',
          border: 'var(--dev-border)',
          'badge-background': 'var(--dev-badge-bg)',
          'badge-text': 'var(--dev-badge-text)',
          'button-background': 'var(--dev-button-bg)',
          'button-border': 'var(--dev-button-border)',
        },
        error: {
          text: 'var(--error-text)',
          'text-hover': 'var(--error-text-hover)',
          background: 'var(--error-background)',
          border: 'var(--error-border)',
        },
        warning: {
          background: 'var(--warning-background)',
          border: 'var(--warning-border)',
          icon: 'var(--warning-icon)',
        },
        success: {
          background: 'var(--success-background)',
          border: 'var(--success-border)',
        },
      },
    },
  },
  plugins: [],
}
