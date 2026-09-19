import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// VITE_BASE lo define el workflow de GitHub Pages (/nombre-del-repo/).
// En desarrollo y en otros hostings queda en la raíz.
export default defineConfig({
  base: process.env.VITE_BASE || '/',
  plugins: [react()],
  server: {
    port: 5199,
  },
});
