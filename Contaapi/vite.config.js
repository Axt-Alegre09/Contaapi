import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  server: {
    port: 3000,
    open: true
  },
  resolve: {
    alias: {
      '@': '/src',
      '@componentes': '/src/componentes',
      '@paginas': '/src/paginas',
      '@servicios': '/src/servicios',
      '@utilidades': '/src/utilidades',
      '@hooks': '/src/hooks',
      '@configuracion': '/src/configuracion'
    }
  }
})