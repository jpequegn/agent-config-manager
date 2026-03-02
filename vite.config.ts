import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import path from 'path'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), tailwindcss()],
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
    },
  },
  build: {
    rollupOptions: {
      output: {
        manualChunks: {
          // Core React runtime
          'vendor-react': ['react', 'react-dom'],
          // Charting library (heavy)
          'vendor-recharts': ['recharts'],
          // Monaco editor (very heavy)
          'vendor-monaco': ['@monaco-editor/react'],
          // Radix UI primitives
          'vendor-radix': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-dropdown-menu',
            '@radix-ui/react-slot',
          ],
          // Virtualization
          'vendor-virtual': ['@tanstack/react-virtual'],
          // Markdown rendering
          'vendor-markdown': ['react-markdown', 'remark-gfm'],
        },
      },
    },
  },
})
