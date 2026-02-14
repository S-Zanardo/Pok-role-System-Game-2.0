import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  // Important for GitHub Pages: usually '/repo-name/' or './'
  // Using './' handles most cases automatically without knowing your repo name
  base: './', 
  build: {
    outDir: 'dist',
  }
});