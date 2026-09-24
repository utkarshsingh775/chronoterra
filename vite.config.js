import { defineConfig } from 'vite';
import compression from 'compression';

// Gzip everything served by `vite dev` / `vite preview` (border data shrinks ~3x on the wire).
const gzip = () => ({
  name: 'gzip-middleware',
  configureServer: (server) => void server.middlewares.use(compression()),
  configurePreviewServer: (server) => void server.middlewares.use(compression()),
});

export default defineConfig({
  plugins: [gzip()],
  build: {
    target: 'es2020',
    chunkSizeWarningLimit: 1200,
    rollupOptions: {
      output: {
        // Heavy, rarely-changing libraries get their own long-cacheable chunks.
        manualChunks: (id) => {
          if (id.includes('node_modules/three/')) return 'three';
          if (id.includes('node_modules')) return 'vendor';
        },
      },
    },
  },
});
