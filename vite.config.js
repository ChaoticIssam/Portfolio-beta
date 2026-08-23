import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig(({ mode }) => ({
  plugins: [
    react(),
    tailwindcss()
  ],
  build: {
    outDir: 'dist',
    chunkSizeWarningLimit: 1600,
    // Strip all console.* calls and debugger statements in production
    minify: 'esbuild',
    terserOptions: mode === 'production' ? {
      compress: {
        drop_console: true,
        drop_debugger: true,
        pure_funcs: ['console.log', 'console.warn', 'console.error', 'console.info', 'console.debug']
      }
    } : {}
  },
  esbuild: {
    // Drop console and debugger in esbuild minification (production)
    drop: mode === 'production' ? ['console', 'debugger'] : []
  }
}));

