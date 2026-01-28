import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'
import react from '@vitejs/plugin-react'

// https://vite.dev/config/
export default defineConfig({
  // Load env vars from the repo root so we can re-use the existing .env
  envDir: '..',
  // Expose both Vite-standard VITE_* and the existing API_* variables
  envPrefix: ['VITE_', 'API_'],
  plugins: [
    tailwindcss(),
    react(),
  ],
  server: {
        allowedHosts: ['manu.byteme.pro'], //!!!For somwreason env varible wasn't working here, please change this to match your deployed frontend host
      },
})
