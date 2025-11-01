/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SENTRY_DSN: string
  readonly VITE_SENTRY_ENABLED: string
  readonly VITE_ENV: 'development' | 'production'
  readonly VITE_BACKEND_URL: string
  readonly VITE_SHOW_DEV_INDICATOR: string
  readonly DEV: boolean
  readonly PROD: boolean
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
