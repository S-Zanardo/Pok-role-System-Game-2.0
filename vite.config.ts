import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig(({ mode }) => ({
  plugins: [react()],
  // Important for GitHub Pages: usually '/repo-name/' or './'
  // Using './' handles most cases automatically without knowing your repo name
  base: mode === 'production' ? '/Pok-role-System-Game-2.0/' : '/',
  build: {
    outDir: 'dist',
  },
  server: {
    port: 5173,
    headers: {
      "Cross-Origin-Opener-Policy": "same-origin-allow-popups",
    },
  },
}));