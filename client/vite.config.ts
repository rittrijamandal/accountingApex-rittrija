import { defineConfig, type Plugin } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

/** In dev, deep links like /login must serve index.html (same as production Express). */
function spaShellFallback(): Plugin {
  return {
    name: "spa-shell-fallback",
    configureServer(server) {
      server.middlewares.use((req, _res, next) => {
        if (req.method !== "GET" && req.method !== "HEAD") return next();
        const raw = req.url?.split("?")[0] ?? "";
        if (raw.includes(".")) return next();
        if (
          raw === "/login" ||
          raw.startsWith("/admin") ||
          raw.startsWith("/expert") ||
          raw.startsWith("/grader")
        ) {
          const qs = req.url?.includes("?") ? "?" + req.url.split("?").slice(1).join("?") : "";
          req.url = "/" + qs;
        }
        next();
      });
    },
  };
}

export default defineConfig({
  plugins: [react(), spaShellFallback()],
  resolve: {
    alias: {
      "@": path.resolve(__dirname, "./src"),
    },
  },
  build: {
    outDir: "../dist-client",
    emptyOutDir: true,
  },
  server: {
    port: 5173,
    proxy: {
      "/api": "http://localhost:3001",
      "/expert-world.html": "http://localhost:3001",
      "/viewer.html": "http://localhost:3001",
      "/expert.css": "http://localhost:3001",
      "/styles.css": "http://localhost:3001",
      "/grader-browse.css": "http://localhost:3001",
      "/data.js": "http://localhost:3001",
      "/js": "http://localhost:3001",
    },
  },
});
