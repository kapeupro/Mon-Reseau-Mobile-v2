// ============================================================================
// ResiliaMap web — src/main.tsx
// ----------------------------------------------------------------------------
// React root + TanStack Query provider + global styles. Mounts <App/> into the
// #root node declared in index.html.
//
// License: AGPL-3.0-or-later. See README.ResiliaMap.md.
// ============================================================================
import React from "react";
import ReactDOM from "react-dom/client";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import "maplibre-gl/dist/maplibre-gl.css";
import "./styles.css";

const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      refetchOnWindowFocus: false,
      retry: 1,
    },
  },
});

const rootEl = document.getElementById("root");
if (!rootEl) {
  throw new Error("ResiliaMap: #root introuvable dans index.html");
}

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <App />
    </QueryClientProvider>
  </React.StrictMode>,
);
