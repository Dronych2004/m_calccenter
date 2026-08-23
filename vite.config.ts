import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// Конфигурация сборщика Vite
// - React плагин для поддержки JSX/TSX
// - Tailwind CSS плагин для утилитарных стилей
export default defineConfig({
  plugins: [
    react(),
    tailwindcss(),
  ],
})
