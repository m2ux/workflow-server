import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    // The e2e walks replay full multi-activity workflow sessions against the live corpus; their
    // duration scales with corpus size, so the 5s vitest default is too tight. A GitHub runner is
    // roughly 4x slower than a local machine, and a single walk sits near 30s there — see
    // tests/e2e/budgets.ts, which owns the per-walk budget the multi-walk hooks derive from.
    testTimeout: 60_000,
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/index.ts'],
    },
  },
});
