import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Use repo name for GitHub Pages so asset URLs resolve when served from /JakesCarCare/
  base: '/JakesCarCare/',
  plugins: [react()],
  server: {
    host: '0.0.0.0',
    port: 5173
  }
})
