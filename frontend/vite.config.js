import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import svgr from 'vite-plugin-svgr';

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(), svgr()],
  server: {
    host: '0.0.0.0',
    proxy: {
      '/api': {
        target: process.env.DOCKER_ENV === 'true' 
          ? 'http://backend:4000' 
          : 'http://localhost:4000',
        changeOrigin: true,
        secure: false,
      },
    },
  },
});
