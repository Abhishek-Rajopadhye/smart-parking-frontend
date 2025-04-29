import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    environment: 'jsdom',
    globals: true,
    setupFiles: './vitest.setup.js', // create this file for global test setup (e.g. jest-dom)
    coverage: {
      reporter: ['text', 'html'],
    },
  },
});