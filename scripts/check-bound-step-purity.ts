/**
 * check-bound-step-purity — deterministic guard for anti-pattern AP-64.
 *
 * A step (bound or a control step) must carry ONLY `id` + (`technique` when bound — whose structured
 * `inputs`/`outputs` maps carry any deviations) + structural fields (`actions`, `checkpoint`, `when`,
 * `loops`, and `required` ONLY when false). It must NOT carry
 * a `name` or `description`: WHAT the step does is the bound operation's `## Capability`, HOW it does
 * it is that operation's `## Protocol`, and a control step's `actions` (with their own descriptions)
 * carry its meaning. A `name`/`description` surviving on a step is the AP-64 defect — either a
 * bound-redundant description duplicating the technique's protocol, or procedure masquerading as a
 * step summary. A step-level `required: true` is also flagged: it is the schema default and the engine
 * does not read step-level `required`, so it is pure noise — declare `required` only when `false` (a
 * worker-facing optional-step hint). This is a hard-zero rule (no baseline): every violation must be fixed.
 *
 * `name`/`description` remain LEGITIMATE on non-step constructs — activities, options, artifacts,
 * decisions, and action targets — so this walks `steps[]` arrays specifically. In the unified model a
 * loop is a `kind: loop` step; its `name` (labelling the iteration) is exempt, but no other kind may
 * carry `name`/`description`.
 *
 * Run:
 *   npx tsx scripts/check-bound-step-purity.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree (issue #160 #1).
const ROOT = resolveWorkflowsRoot(join(DIR, '..', 'workflows'));

export interface StepPurityViolation { site: string; detail: string }

/** Recursively walk every `steps[]` array; flag any element carrying `name` or `description`. */
function walk(node: unknown, file: string, out: StepPurityViolation[]): void {
  if (Array.isArray(node)) { for (const n of node) walk(n, file, out); return; }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'steps' && Array.isArray(v)) {
      for (const step of v) {
        if (step && typeof step === 'object' && !Array.isArray(step)) {
          const s = step as Record<string, unknown>;
          const kind = typeof s.kind === 'string' ? s.kind : undefined;
          // A loop-kind step legitimately carries `name` (it labels the iteration — a structural
          // construct, not a bound operation). Every other kind (technique/action/checkpoint/legacy)
          // is id + technique + structural only: WHAT/HOW lives in the bound technique. `description`
          // is never a step field on any kind.
          const bad = (['name', 'description'] as const).filter((f) => f in s && !(f === 'name' && kind === 'loop'));
          if (bad.length) out.push({ site: `${file}[${s.id ?? '?'}]`, detail: `step carries ${bad.join(', ')} — a step is id + technique + structural fields only (AP-64)` });
          // `required` defaults to true and the engine does not read step-level required — declare it
          // ONLY when false (a worker-facing optional-step hint); `required: true` is default noise (AP-64).
          if (s.required === true) out.push({ site: `${file}[${s.id ?? '?'}]`, detail: `step declares 'required: true' — that is the default (and the engine ignores step-level required); omit it. Declare 'required' only when false (AP-64)` });
        }
      }
    }
    walk(v, file, out);
  }
}

export function collectStepPurityViolations(): StepPurityViolation[] {
  const out: StepPurityViolation[] = [];
  const wfs = readdirSync(ROOT).filter((d) => {
    const p = join(ROOT, d);
    return statSync(p).isDirectory() && existsSync(join(p, 'activities'));
  });
  for (const wf of wfs.sort()) {
    const adir = join(ROOT, wf, 'activities');
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.yaml'))) {
      const rel = relative(ROOT, join(adir, f));
      try { walk(parseDefinition(readFileSync(join(adir, f), 'utf-8')), rel, out); }
      catch { /* malformed YAML is validate-workflow-yaml's job, not this guard's */ }
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectStepPurityViolations();
  if (violations.length) {
    process.stdout.write(`bound-step purity: ${violations.length} step impurity(ies) — name/description, or a redundant 'required: true' (AP-64) — remove them:\n`);
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) process.stdout.write(`  ${v.site} — ${v.detail}\n`);
    process.exit(1);
  }
  process.stdout.write('bound-step purity: OK — every step is id + technique + structural fields only\n');
}
