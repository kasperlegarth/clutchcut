import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import tailwindcss from '@tailwindcss/vite'
import electron from 'vite-plugin-electron'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = dirname(fileURLToPath(import.meta.url))

export default defineConfig({
  plugins: [
    vue(),
    tailwindcss(),
    electron([
      // MAIN (ESM)
      {
        entry: 'electron/main.ts',
        onstart({ startup }) { startup() },
        vite: {
          build: {
            outDir: 'dist-electron',
            target: 'node20',
            rollupOptions: {
              output: {
                entryFileNames: 'main.js',     // ESM
                chunkFileNames: '[name].js',
                assetFileNames: '[name][extname]',
                format: 'esm',
              },
            },
          },
        },
      },
      // PRELOAD (CJS)
      {
        entry: 'electron/preload.ts',
        onstart({ reload }) { reload() },
        vite: {
          build: {
            outDir: 'dist-electron',
            target: 'node20',
            rollupOptions: {
              output: {
                entryFileNames: 'preload.cjs', // CJS!
                chunkFileNames: '[name].cjs',
                assetFileNames: '[name][extname]',
                format: 'cjs',
              },
            },
          },
        },
      },
    ]),
  ],
  server: { port: 1337 },
  resolve: { alias: { '@': resolve(__dirname, 'src') } },
})
