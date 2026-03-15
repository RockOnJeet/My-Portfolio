import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

const basePath = process.env.BASE_URL ?? "/";
const port = Number(process.env.PORT ?? 5173);

export default defineConfig({
  base: basePath,
  plugins: [react(), tailwindcss()],
  esbuild: {
    // Strip runtime debug artifacts from production bundles.
    drop: ["console", "debugger"],
  },
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "src"),
    },
    dedupe: ["react", "react-dom"],
  },
  root: path.resolve(import.meta.dirname),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    sourcemap: false,
  },
  server: {
    port,
    host: "0.0.0.0",
    open: true,
  },
  preview: {
    port,
    host: "0.0.0.0",
  },
});
