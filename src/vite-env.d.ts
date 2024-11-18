/// <reference types="vite/client" />

interface ImportMetaEnv {
  readonly VITE_SUPABASE_URL: string
  readonly VITE_SUPABASE_ANON_KEY: string
}

interface ImportMeta {
  readonly env: ImportMetaEnv
}

// Global type augmentation
declare global {
  interface Window {
    global: typeof globalThis;
  }
  var global: typeof globalThis;
}