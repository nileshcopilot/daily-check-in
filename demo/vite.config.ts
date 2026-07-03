import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { fileURLToPath } from 'node:url'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react()],
  resolve: {
    alias: {
      // Point straight at the library source for instant HMR + TS debugging.
      // Remove this alias to test the built dist/ output instead.
      'daily-checkin-popup': fileURLToPath(
        new URL('../src/index.ts', import.meta.url),
      ),
    },
    dedupe: ['react', 'react-dom'],
  },
})
