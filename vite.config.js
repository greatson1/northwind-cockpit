import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  // Inline an empty PostCSS config so Vite doesn't walk up the directory tree
  // and pick up an unrelated postcss.config.js from a parent folder.
  css: { postcss: {} },
});
