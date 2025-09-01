import { defineConfig } from "vite";
import vue from "@vitejs/plugin-vue";

export default defineConfig({
  plugins: [vue()],
  root: ".",                // default
  base: "./",               // god idé for Electron build
  build: {
    outDir: "dist",
    emptyOutDir: true
  },
  server: {
    port: 1337,
    strictPort: true
  }
});
