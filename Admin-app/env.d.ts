/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly APP_DATABASE_URL: string
  readonly APP_DATABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
