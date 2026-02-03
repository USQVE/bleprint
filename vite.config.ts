import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: false,
    allowedHosts: [
      '*.csb.app',
      '*.replit.dev',
      'localhost',
      '127.0.0.1',
      '::1'
    ]
  },
  build: {
    outDir: 'dist',
    sourcemap: true
  }
})
