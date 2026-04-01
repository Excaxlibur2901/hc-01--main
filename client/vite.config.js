import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,

    proxy: {
      '/api': {
        target: 'https://hospital-queue-backend-e99o.onrender.com',
        changeOrigin: true,
      },
      '/socket.io': {
        target: 'https://hospital-queue-backend-e99o.onrender.com',
        ws: true,
        changeOrigin: true,
      }
    }
  },
})
