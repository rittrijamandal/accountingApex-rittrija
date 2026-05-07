import { defineConfig } from "vite";
import react from "@vitejs/plugin-react-swc";
import path from "path";

export default defineConfig({
  plugins: [react()],
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
