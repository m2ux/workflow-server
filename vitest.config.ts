import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The e2e walks replay full multi-activity workflow sessions against the live corpus; their
    // duration scales with corpus size, so the 5s vitest default is too tight. A GitHub runner is
    // roughly 4x slower than a local machine, and a single walk sits near 30s there; a hook that
    // performs several walks up front carries its own timeout.
    testTimeout: 60_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/index.ts'],
    },
  },
});
