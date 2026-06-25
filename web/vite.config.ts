// ============================================================================
// ResiliaMap web — vite.config.ts
// ----------------------------------------------------------------------------
// React + Vite. Build output -> web/dist (served by nginx in the compose stack).
//
// Env (all build-time, VITE_ prefixed so they reach the browser bundle):
//   VITE_API_URL       Base URL for the ResiliaMap API. Default in code:
//                      http://localhost:3010 (matches api/ default port).
//                      In compose it is "/api" (nginx proxies to the api svc).
//
// A dev proxy is provided so `bun run dev` can talk to a local API on :3010
// without CORS headaches when VITE_API_URL is left as a relative "/api".
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

export default defineConfig({
  plugins: [react()],
  build: {
    outDir: "dist",
    sourcemap: true,
  },
  server: {
    port: 5173,
    host: true,
    // Dev convenience: forward /api to a locally running API on :3010 so the
    // frontend can use a relative base URL during development if desired.
    proxy: {
      "/api": {
        target: process.env.VITE_DEV_API_PROXY ?? "http://localhost:3010",
        changeOrigin: true,
      },
    },
  },
  preview: {
    port: 4173,
    host: true,
  },
});
