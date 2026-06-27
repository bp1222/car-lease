import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

// Served from https://bp1222.github.io/car-calc/ on GitHub Pages, so the asset
// base path must match the repo name in production. Dev keeps the root base.
export default defineConfig(({ command }) => ({
  base: command === 'build' ? '/car-calc/' : '/',
  plugins: [react()],
}));
