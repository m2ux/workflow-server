#!/usr/bin/env npx tsx
/**
 * The units of the canon that fire on one construct, read at the commit under `--root`.
 *
 * The declarations are parsed by {@link readDeclarations}, the same reader the Fires-on guard uses,
 * so the listing and the guard agree on what a line declares. A unit is listed when it declares the
 * queried id, a prefix of it (its bare kind, or a field the query extends), or `*`. The index is
 * printed and not stored.
 *
 * Run: npx tsx guards/list-fires-on.ts <id> [--root <workflows-dir>]
 *
 * Each line is `path:line unit`, the canon home relative to the corpus root and the heading of the unit.
 */
import { existsSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { CANON_HOMES, formatListing, listUnits, type CanonText } from './check-fires-on-ids.js';
import { defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';

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

function textsAt(root: string): CanonText[] {
  const texts: CanonText[] = [];
  for (const path of CANON_HOMES) {
    const file = join(root, path);
    if (existsSync(file)) texts.push({ path, text: readFileSync(file, 'utf8') });
  }
  return texts;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  const query = queryArg(process.argv.slice(2));
  if (!query) {
    process.stderr.write('usage: list-fires-on <id> [--root <workflows-dir>]\n');
    process.exit(2);
  }
  const root = requireWorkflowsRoot(DEFAULT_ROOT);
  process.stdout.write(formatListing(listUnits(textsAt(root), query)));
}
