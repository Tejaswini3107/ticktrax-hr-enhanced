import { defineConfig } from 'vite';
import vue from '@vitejs/plugin-vue';
import path from 'path';

export default defineConfig({
  plugins: [vue()],
  css: {
    postcss: './postcss.config.js',
  },
  resolve: {
    alias: {
      '@': path.resolve(__dirname, './src'),
      'vue': 'vue/dist/vue.esm-bundler.js',
    },
  },
  build: {
    target: 'esnext',
    // Output to Cordova's www folder so the mobile project can serve the built files
    outDir: 'www',
    sourcemap: true,
  },
  server: {
    port: 3000,
    open: true,
    // Proxy API calls in development to avoid CORS and preflight issues
    proxy: {
      // Proxy any request starting with /api to the production API server
      // This prevents the browser from enforcing CORS in development.
      '/api': {
        target: 'https://batman-api-a20b3a37aa3c.herokuapp.com',
        changeOrigin: true,
        secure: true,
        // Keep the /api prefix; backend expects /api paths
        rewrite: (path) => path,
        // Disable websocket proxying for now
        ws: false,
      }
    }
  },
});
