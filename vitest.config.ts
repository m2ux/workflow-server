import { defineConfig } from 'vitest/config';
import { basename, dirname, join, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const REPO = fileURLToPath(new URL('.', import.meta.url));

export default defineConfig({
  test: {
    globals: true,
    environment: 'node',
    include: ['tests/**/*.test.ts'],
    setupFiles: ['tests/vitest-key-dir.ts'],
    // The e2e walks replay full multi-activity workflow sessions against the live corpus; their
    // duration scales with corpus size, so the 5s vitest default is too tight. A GitHub runner is
    // roughly 4x slower than a local machine, and a single walk sits near 30s there; a hook that
    // performs several walks up front carries its own timeout.
    testTimeout: 60_000,
    resolveSnapshotPath: (testPath, snapExtension) => {
      const normalised = testPath.replaceAll('\\', '/');
      if (normalised.endsWith('tests/e2e/snapshot.test.ts')) {
        const root = process.env.WORKFLOWS_DIR
          ? resolve(process.env.WORKFLOWS_DIR)
          : join(REPO, 'workflows');
        return join(root, 'walks', `snapshot.test.ts${snapExtension}`);
      }
      return join(dirname(testPath), '__snapshots__', `${basename(testPath)}${snapExtension}`);
    },
    coverage: {
      provider: 'v8',
      reporter: ['text', 'json', 'html'],
      include: ['src/**/*.ts'],
      exclude: ['src/types/**', 'src/index.ts'],
    },
  },
});
