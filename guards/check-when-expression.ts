/**
 * check-when-expression — authoring guard for inline `when:` gates.
 *
 * Rejects expressions that fail to parse under the reference dialect, and
 * rejects bare mixed `&&`/`||` at the same nesting depth (parentheses required).
 * Step gates and exit selections share the dialect, so both are checked, in
 * `activities/` and `routines/` alike.
 *
 * Run:
 *   npx tsx guards/check-when-expression.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertWhenAuthoring } from '../src/schema/when-expression.js';
import { corpusWorkflows, defaultCorpusDest, definitionsUnder, resolveWorkflowsRoot } from './workflows-root.js';
import { requireRootOrExit } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);

export interface WhenExpressionViolation {
  site: string;
  detail: string;
}

/** The members of a list that carry a `when` gate: steps, or an activity's exits. */
const GATED_LISTS: Record<string, (item: Record<string, unknown>) => string> = {
  steps: (step) => String(step.id ?? '?'),
  exits: (exit) => `exit ${String(exit.id ?? '?')}`,
};

function checkGate(item: Record<string, unknown>, site: string, out: WhenExpressionViolation[]): void {
  const when = item.when;
  if (typeof when !== 'string' || !when.trim()) return;
  const r = assertWhenAuthoring(when);
  if (!r.ok) out.push({ site, detail: `when: ${JSON.stringify(when)} — ${r.error}` });
}

function walk(node: unknown, file: string, out: WhenExpressionViolation[]): void {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, file, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    const label = GATED_LISTS[k];
    if (label && Array.isArray(v)) {
      for (const item of v) {
        if (item && typeof item === 'object' && !Array.isArray(item)) {
          const gated = item as Record<string, unknown>;
          checkGate(gated, `${file}[${label(gated)}]`, out);
        }
      }
    }
    walk(v, file, out);
  }
}

export function collectWhenExpressionViolations(root: string = ROOT): WhenExpressionViolation[] {
  const out: WhenExpressionViolation[] = [];
  for (const { dir } of corpusWorkflows(root)) {
    // A routine body carries steps of its own, beside the activities.
    const files: string[] = [];
    for (const sub of ['activities', 'routines']) {
      const owned = join(dir, sub);
      if (existsSync(owned)) files.push(...definitionsUnder(owned).map(({ path }) => path));
    }
    for (const path of files) {
      try {
        walk(parseDefinition(readFileSync(path, 'utf-8')), relative(root, path), out);
      } catch {
        /* malformed YAML is validate-workflow-yaml's job */
      }
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectWhenExpressionViolations(requireRootOrExit('when-expression', DEFAULT_ROOT));
  if (violations.length) {
    process.stdout.write(
      `when-expression: ${violations.length} invalid when: gate(s) — fix parse errors or parenthesize mixed &&/||:\n`,
    );
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) {
      process.stdout.write(`  ${v.site} — ${v.detail}\n`);
    }
    process.exit(1);
  }
  process.stdout.write('when-expression: OK — all when: gates parse and honor mixed-ops parentheses\n');
}
