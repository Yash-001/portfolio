import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { visualizer } from 'rollup-plugin-visualizer'
import { fileURLToPath, URL } from 'node:url'
import { sitemapPlugin } from './plugins/sitemap'

export default defineConfig({
  plugins: [
    vue(),
    visualizer({ open: false, filename: 'stats.html', gzipSize: true }),
    sitemapPlugin(),
  ],
  optimizeDeps: {
    include: ['@vercel/analytics/vue', 'vue-router'],
  },
  resolve: {
    dedupe: ['vue', 'vue-router'],
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      '@components': fileURLToPath(new URL('./src/components', import.meta.url)),
      '@pages': fileURLToPath(new URL('./src/pages', import.meta.url)),
      '@layouts': fileURLToPath(new URL('./src/layouts', import.meta.url)),
      '@stores': fileURLToPath(new URL('./src/stores', import.meta.url)),
      '@services': fileURLToPath(new URL('./src/services', import.meta.url)),
      '@composables': fileURLToPath(new URL('./src/composables', import.meta.url)),
      '@animations': fileURLToPath(new URL('./src/animations', import.meta.url)),
      '@types': fileURLToPath(new URL('./src/types', import.meta.url)),
      '@constants': fileURLToPath(new URL('./src/constants', import.meta.url)),
      '@utils': fileURLToPath(new URL('./src/utils', import.meta.url)),
      '@styles': fileURLToPath(new URL('./src/styles', import.meta.url)),
      '@assets': fileURLToPath(new URL('./src/assets', import.meta.url)),
      '@config': fileURLToPath(new URL('./src/config', import.meta.url)),
      '@content': fileURLToPath(new URL('./src/content', import.meta.url)),
    },
  },
  build: {
    target: 'esnext',
    minify: 'esbuild',
    cssCodeSplit: true,
    outDir: 'dist',
    // hljs is ~940kB but loaded lazily (only when AI chat opens) — not on initial load
    chunkSizeWarningLimit: 1000,
    rollupOptions: {
      output: {
        manualChunks: {
          'vue-vendor':      ['vue', 'vue-router', 'pinia'],
          'primevue-vendor': ['primevue'],
          'gsap-vendor':     ['gsap'],
          'utils-vendor':    ['@vueuse/core'],
          'markdown-vendor': ['marked'],
          // highlight.js is lazy-loaded inside AiChatMessage — do NOT pin it here
          // so Rollup keeps it as a separate async chunk loaded on demand.
        },
      },
    },
  },
  css: {
    devSourcemap: true,
  },
  server: {
    port: 5173,
    open: true,
  },
})
