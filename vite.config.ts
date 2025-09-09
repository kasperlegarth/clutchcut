// vite.config.ts
import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import { resolve } from 'node:path'
import electron from 'vite-plugin-electron' // hvis du bruger electron via vite

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    electron({
      main: { entry: '../electron/main.ts' },
      preload: { input: { preload: '../electron/preload.ts' } },
      renderer: {}, // din Vite-renderer
    }),
  ],
  server: {
    port: 1337,
  },
  resolve: {
    alias: { '@': resolve(__dirname, 'src') },
  },
})
