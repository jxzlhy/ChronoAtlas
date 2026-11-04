import { defineConfig } from 'vite'

export default defineConfig({
  server: { port: 5173, host: '127.0.0.1' },
  build: {
    chunkSizeWarningLimit: 1500,
    rollupOptions: {
      output: {
        // vendor 拆分：three/gsap 独立 chunk，业务改动不破坏其浏览器缓存
        manualChunks: {
          three: ['three'],
          gsap: ['gsap'],
          zustand: ['zustand'],
        },
      },
    },
  },
})
