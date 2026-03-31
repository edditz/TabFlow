/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_DEV?: string
  readonly VITE_AI_ENABLED?: string
  readonly VITE_AI_ENDPOINT?: string
  readonly VITE_AI_API_KEY?: string
  readonly VITE_AI_MODEL?: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}
