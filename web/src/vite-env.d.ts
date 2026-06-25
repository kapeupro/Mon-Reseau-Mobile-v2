/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the ResiliaMap API. Default http://localhost:3010. */
  readonly VITE_API_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
