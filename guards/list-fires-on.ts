#!/usr/bin/env npx tsx
/**
 * The units of the canon that fire on one construct, read at the commit under `--root`.
 *
 * The homes are read by {@link readHomes} and their declarations parsed by {@link readDeclarations},
 * the same readers the Fires-on guard uses, so the listing and the guard agree both on which files
 * the canon is and on what a line in them declares. A unit is listed when it declares the queried
 * id, a prefix of it (its bare kind, or a field the query extends), or `*`. The index is printed
 * and not stored.
 *
 * A corpus holding no home is refused rather than listed as empty: a listing that read nothing
 * prints exactly what one where no unit fires prints, and the caller would take the silence for an
 * answer.
 *
 * Run: npx tsx guards/list-fires-on.ts <id> [--root <workflows-dir>]
 *
 * Each line is `path:line unit`, the canon home relative to the corpus root and the heading of the unit.
 */
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { formatListing, listUnits, readHomes } from './check-fires-on-ids.js';
import { assertScanned, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/** The construct id on the command line, skipping `--root` and its value. */
export function queryArg(argv: readonly string[]): string | undefined {
  const skip = new Set<number>();
  argv.forEach((arg, index) => {
    if (arg === '--root') skip.add(index + 1);
    if (arg.startsWith('--')) skip.add(index);
  });
  return argv.find((arg, index) => !skip.has(index) && arg !== '');
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const query = queryArg(process.argv.slice(2));
  if (!query) {
    process.stderr.write('usage: list-fires-on <id> [--root <workflows-dir>]\n');
    process.exit(2);
  }
  const root = requireWorkflowsRoot(DEFAULT_ROOT);
  const { texts } = readHomes(root);
  try {
    assertScanned(texts.length, 'canon homes', root);
  } catch (error) {
    process.stderr.write(`${(error as Error).message}\n`);
    process.exit(2);
  }
  process.stdout.write(formatListing(listUnits(texts, query)));
}
