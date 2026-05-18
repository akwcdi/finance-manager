import { defineConfig } from 'vitest/config';
import react from '@vitejs/plugin-react';
import tsconfigPaths from 'vite-tsconfig-paths';

export default defineConfig({
  plugins: [react(), tsconfigPaths()],
  test: {
    globals: true,
    environment: 'node',
    environmentMatchGlobs: [
      ['src/client/**', 'happy-dom'],
      ['src/components/**', 'happy-dom'],
      ['src/app/**', 'happy-dom'],
    ],
    setupFiles: ['./vitest.setup.ts'],
  },
});
