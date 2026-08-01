/**
 * check-when-expression — authoring guard for inline `when:` step gates.
 *
 * Rejects expressions that fail to parse under the reference dialect, and
 * rejects bare mixed `&&`/`||` at the same nesting depth (parentheses required).
 *
 * Run:
 *   npx tsx scripts/check-when-expression.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { assertWhenAuthoring } from '../src/schema/when-expression.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = resolveWorkflowsRoot(join(DIR, '..', 'workflows'));

export interface WhenExpressionViolation {
  site: string;
  detail: string;
}

function checkStep(step: Record<string, unknown>, file: string, out: WhenExpressionViolation[]): void {
  const when = step.when;
  if (typeof when !== 'string' || !when.trim()) return;
  const r = assertWhenAuthoring(when);
  if (!r.ok) {
    out.push({
      site: `${file}[${String(step.id ?? '?')}]`,
      detail: `when: ${JSON.stringify(when)} — ${r.error}`,
    });
  }
}

function walk(node: unknown, file: string, out: WhenExpressionViolation[]): void {
  if (Array.isArray(node)) {
    for (const n of node) walk(n, file, out);
    return;
  }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'steps' && Array.isArray(v)) {
      for (const step of v) {
        if (step && typeof step === 'object' && !Array.isArray(step)) {
          checkStep(step as Record<string, unknown>, file, out);
        }
      }
    }
    walk(v, file, out);
  }
}

export function collectWhenExpressionViolations(): WhenExpressionViolation[] {
  const out: WhenExpressionViolation[] = [];
  const wfs = readdirSync(ROOT).filter((d) => {
    const p = join(ROOT, d);
    return statSync(p).isDirectory() && existsSync(join(p, 'activities'));
  });
  for (const wf of wfs.sort()) {
    const adir = join(ROOT, wf, 'activities');
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.yaml'))) {
      const rel = relative(ROOT, join(adir, f));
      try {
        walk(parseDefinition(readFileSync(join(adir, f), 'utf-8')), rel, out);
      } catch {
        /* malformed YAML is validate-workflow-yaml's job */
      }
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectWhenExpressionViolations();
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
