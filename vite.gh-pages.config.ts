/**
 * GitHub Pages Build Configuration
 * =================================
 * Use this config to build for GitHub Pages deployment.
 *
 * HOW TO BUILD FOR GITHUB PAGES:
 *   1. Set GITHUB_REPO_NAME to your repository name if it's NOT at the root
 *      e.g. for "https://yourusername.github.io/my-portfolio/" set it to "/my-portfolio/"
 *      For "https://yourusername.github.io/" (root) leave it as "/"
 *
 *   2. Run:  pnpm --filter @workspace/portfolio run build:gh-pages
 *
 *   3. The output will be in: artifacts/portfolio/dist/gh-pages/
 *      Upload that folder's contents to your GitHub Pages branch (gh-pages).
 *
 * QUICK DEPLOY via GitHub Actions:
 *   Copy the file at .github/workflows/deploy-portfolio.yml into your GitHub repo.
 */

import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import tailwindcss from "@tailwindcss/vite";
import path from "path";

// Set this to your repo name if deploying to a sub-path, e.g. "/my-portfolio/"
// Leave as "/" if deploying to the root (yourusername.github.io)
const ghPagesBase = process.env.GITHUB_REPO_NAME ?? "/";

export default defineConfig({
  base: ghPagesBase,
  plugins: [react(), tailwindcss()],
  assetsInclude: ["**/*.heic", "**/*.HEIC"],
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
    outDir: path.resolve(import.meta.dirname, "dist/gh-pages"),
    emptyOutDir: true,
    sourcemap: false,
  },
});
