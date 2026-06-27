/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** Base URL for the ResiliaMap API. Default http://localhost:3801. */
  readonly VITE_API_URL?: string;
  /**
   * Production basemap: a licensed/self-hosted MapLibre style URL (MapTiler,
   * Stadia, …). Empty/unset -> the key-free OSM raster fallback (dev only).
   */
  readonly VITE_BASEMAP_STYLE_URL?: string;
}

interface ImportMeta {
  readonly env: ImportMetaEnv;
}
