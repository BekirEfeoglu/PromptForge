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
        manualChunks(id) {
          if (!id.includes('node_modules')) return undefined;
          const normalized = id.replaceAll('\\', '/');
          const codemirrorPackage = normalized.match(/node_modules\/((?:@codemirror|@lezer|@uiw)\/[^/]+)/)?.[1];
          if (codemirrorPackage) return codemirrorPackage.replace('@', '').replace('/', '-');
          if (id.includes('handlebars')) return 'handlebars';
          return undefined;
        },
      },
    },
  },
})
