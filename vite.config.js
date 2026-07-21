import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

/**
 * Vite Configuration for ONE8 Premium Performance Wear Website.
 * Configured for maximum performance, efficient bundle splitting,
 * and high-speed asset delivery.
 */
export default defineConfig({
  // Deployment base path (set to root directory '/')
  base: '/',

  // Plugins integration: React plugin with Fast Refresh support
  plugins: [react()],

  // Dev server settings: custom port and access enabled for local network devices (host: true)
  server: {
    port: 5173,
    host: true
  },

  // Production build optimizations
  build: {
    // Enable esbuild minification for faster builds and higher execution speed
    minify: 'esbuild',
    // Disable sourcemaps in production to minimize build size and protect source code integrity
    sourcemap: false,
    
    // Rollup build-specific configuration
    rollupOptions: {
      output: {
        /**
         * Manual chunk splitting strategy:
         * Isolates large, stable dependencies (like React and GSAP) into separate chunks.
         * This allows the browser to cache these libraries separately, ensuring that
         * standard app updates only require the client to re-download the main app code bundle.
         * 
         * @param {string} id - The absolute module path
         */
        manualChunks(id) {
          if (id.includes('node_modules')) {
            // Group GSAP animations engine separately
            if (id.includes('gsap')) {
              return 'vendor-gsap';
            }
            // Group core React runtime separately
            if (id.includes('react')) {
              return 'vendor-react';
            }
            // Group all other third-party libraries into standard vendor chunk
            return 'vendor';
          }
        }
      }
    }
  },

  // Esbuild compression/compilation configuration
  esbuild: {
    // Automatically drop all console logs and debugger lines in production for clean, optimized runtime execution
    drop: ['console', 'debugger']
  }
});

