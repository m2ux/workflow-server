/**
 * Moved to the server tree for reuse:
 *   scripts/run-token-benchmark.ts
 *   npm run bench:token
 *
 * This stub re-exports the canonical entry so older planning docs keep working
 * when invoked as `npx tsx <this-file> ...` from a server checkout.
 */
import { pathToFileURL } from 'node:url';
import { join, resolve } from 'node:path';

const serverRoot = resolve(
  process.argv.find((a) => a.startsWith('--server-root='))?.slice('--server-root='.length)
    ?? process.cwd(),
);
await import(pathToFileURL(join(serverRoot, 'scripts/run-token-benchmark.ts')).href);
