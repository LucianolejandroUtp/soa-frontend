import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'
import AutoImport from 'unplugin-auto-import/vite'
import Components from 'unplugin-vue-components/vite'
import { ElementPlusResolver } from 'unplugin-vue-components/resolvers'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
    AutoImport({
      resolvers: [ElementPlusResolver()],
    }),
    Components({
      resolvers: [ElementPlusResolver()],
    }),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
    },
  },
  server: {
    port: 5173,
    proxy: {
      // API de usuarios y roles (puerto 2221)
      '/api/users': {
        target: 'http://localhost:2221',
        changeOrigin: true,
        secure: false,
      },
      '/api/roles': {
        target: 'http://localhost:2221',
        changeOrigin: true,
        secure: false,
      },
      // API de eventos y ubicaciones (puerto 2222)
      '/api/events': {
        target: 'http://localhost:2222',
        changeOrigin: true,
        secure: false,
      },
      '/api/locations': {
        target: 'http://localhost:2222',
        changeOrigin: true,
        secure: false,
      },
      '/api/event-locations': {
        target: 'http://localhost:2222',
        changeOrigin: true,
        secure: false,
      },
      // Fallback para otros endpoints /api/* (por defecto usuarios)
      '/api': {
        target: 'http://localhost:2221',
        changeOrigin: true,
        secure: false,
      },
    },
  },
})
