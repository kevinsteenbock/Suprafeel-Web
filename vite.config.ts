import { fileURLToPath, URL } from 'node:url'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Sitio de proyecto en GitHub Pages: https://kevinsteenbock.github.io/Suprafeel-Web/
export default defineConfig({
  base: '/Suprafeel-Web/',
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: { '@': fileURLToPath(new URL('./src', import.meta.url)) },
  },
})
