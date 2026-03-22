import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],

  build: {
    // Raise warning limit — Firebase is large but lazy-loaded
    chunkSizeWarningLimit: 600,

    rollupOptions: {
      output: {
        // Manual chunk splitting — keeps initial load tiny
        manualChunks: {
          // React core — loads first, cached forever
          'vendor-react': ['react', 'react-dom'],

          // Firebase — lazy loaded only when user has Firebase keys
          'vendor-firebase': [
            'firebase/app',
            'firebase/firestore',
          ],
        },
      },
    },

    // Enable minification
    minify: 'esbuild',

    // Source maps off in production (smaller build)
    sourcemap: false,
  },

  // Optimize deps pre-bundling
  optimizeDeps: {
    include: ['react', 'react-dom'],
    exclude: ['firebase'],  // Firebase is lazy — don't pre-bundle
  },
})