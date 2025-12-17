import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  build: {
    outDir: '../assets',
    emptyOutDir: true,
    manifest: true,
    rollupOptions: {
      input: './src/main.tsx',
      output: {
        entryFileNames: 'javascripts/dashboard.js',
        chunkFileNames: 'javascripts/dashboard-[hash].js',
        assetFileNames: (assetInfo) => {
          if (assetInfo.name && assetInfo.name.endsWith('.css')) {
            return 'stylesheets/dashboard.css';
          }
          return 'javascripts/[name]-[hash][extname]';
        },
      },
    },
  },
  base: './', // Use relative paths
})
