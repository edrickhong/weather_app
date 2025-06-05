import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import postcss from './postcss.config.js'; // force it


console.log(">>> VITE CONFIG LOADED");

export default defineConfig({
  plugins: [react()],
  css: {
    postcss,
  },
});

