#!/usr/bin/env npx tsx
/**
 * Control-character guard over the repo's own text sources.
 *
 * A C0 control character written literally into a source file makes that file binary to every text
 * tool, and each tool fails differently and quietly:
 *
 *   - `grep` prints nothing and exits 1, so a search for a symbol that IS present reports absence.
 *   - `git` sniffs the first 8000 bytes; a control character inside that window makes every diff of
 *     the file render as "Binary files differ", so the file cannot be reviewed line by line.
 *
 * Neither failure announces itself, and whether the second one bites depends on the byte's offset —
 * so the same defect is invisible in one file and blocks review in the next.
 *
 * The remedy is spelling, not avoidance: a delimiter or sentinel written as an escape (`\u0000`,
 * `\x1f`) has the identical runtime value and leaves the source readable.
 *
 * Scope is this repo's own sources. The `workflows` corpus is a separate submodule read by the
 * corpus-scope guards, and is not walked here.
 */
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { report, type Finding } from './guard-protocol.js';

const ROOT = resolve(import.meta.dirname, '..');

const TEXT_EXTENSIONS = new Set([
  '.ts', '.tsx', '.js', '.mjs', '.cjs', '.json', '.md', '.yaml', '.yml',
  '.css', '.html', '.svg', '.sh', '.txt',
]);

/** Directories that hold generated output, dependencies, or another git tree. */
const SKIP_DIRS = new Set(['node_modules', 'dist', 'coverage', '.git', '.worktrees', 'workflows']);

/** Tab, line feed and carriage return are the control characters text files legitimately carry. */
const ALLOWED = new Set([0x09, 0x0a, 0x0d]);

/** `0x00` -> `NUL (U+0000)`, so a finding names the byte rather than rendering it. */
function describe(byte: number): string {
  return `U+${byte.toString(16).toUpperCase().padStart(4, '0')}`;
}

function collect(): Finding[] {
  const findings: Finding[] = [];
  const walk = (dir: string): void => {
    for (const entry of readdirSync(dir)) {
      if (SKIP_DIRS.has(entry)) continue;
      const p = join(dir, entry);
      if (statSync(p).isDirectory()) { walk(p); continue; }
      const dot = entry.lastIndexOf('.');
      if (dot < 0 || !TEXT_EXTENSIONS.has(entry.slice(dot))) continue;
      const buf = readFileSync(p);
      // One finding per (file, control character kind) — a delimiter appears once per field, and N
      // findings for one bad spelling would just repeat the same remedy.
      const seen = new Map<number, number>();
      let line = 1;
      for (const byte of buf) {
        if (byte === 0x0a) { line += 1; continue; }
        if (byte < 0x20 && !ALLOWED.has(byte) && !seen.has(byte)) seen.set(byte, line);
        else if (byte === 0x7f && !seen.has(byte)) seen.set(byte, line);
      }
      for (const [byte, at] of seen) {
        findings.push({
          check: 'control-character',
          site: `${relative(ROOT, p)}:${at}`,
          detail: `literal ${describe(byte)} in a text source makes the file binary to grep and git — write it as an escape instead`,
        });
      }
    }
  };
  walk(ROOT);
  return findings;
}

report('source-encoding', collect(), {
  okMessage: 'no text source carries a literal control character',
  root: ROOT,
  remedy: 'replace each literal control character with its escape sequence',
});
