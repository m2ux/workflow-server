/**
 * check-activity-technique-overlap — deterministic guard for anti-pattern AP-69.
 *
 * An activity's top-level `techniques[]` list is for the cross-cutting STRATEGY/capability
 * techniques (e.g. `variable-binding`, `scatter-gather`) that support the agent across the WHOLE
 * activity. It must NOT re-list a technique that one of the activity's own steps already binds via
 * `step.technique` — that technique's authoritative declaration is the step binding, and duplicating
 * it at the activity level is redundant (and drifts). This flags any activity-level `techniques[]`
 * entry whose reference also appears as a `step.technique` binding anywhere in the activity (top-level
 * steps or loop steps). Hard-zero rule (no baseline): every overlap must be removed from the
 * activity-level list (drop the whole block if it becomes empty); the step binding stays.
 *
 * Run:
 *   npx tsx guards/check-activity-technique-overlap.ts
 */
import { readFileSync, existsSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { corpusWorkflows, defaultCorpusDest, definitionsUnder, resolveWorkflowsRoot } from './workflows-root.js';
import { requireRootOrExit } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree (issue #160 #1).
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));
const ROOT = resolveWorkflowsRoot(DEFAULT_ROOT);

export interface ActivityTechniqueOverlapViolation { site: string; detail: string }

/** Resolve a `technique` field (bare string or `{ name }` object) to its reference string. */
function techName(t: unknown): string | undefined {
  if (typeof t === 'string') return t;
  if (t && typeof t === 'object' && !Array.isArray(t)) {
    const n = (t as Record<string, unknown>).name;
    if (typeof n === 'string') return n;
  }
  return undefined;
}

/** Collect every `step.technique` reference in an activity (top-level steps + loop steps). */
function stepBound(node: unknown, acc: Set<string>): void {
  if (Array.isArray(node)) { for (const n of node) stepBound(n, acc); return; }
  if (!node || typeof node !== 'object') return;
  for (const [k, v] of Object.entries(node as Record<string, unknown>)) {
    if (k === 'steps' && Array.isArray(v)) {
      for (const s of v) {
        if (s && typeof s === 'object' && !Array.isArray(s)) {
          const n = techName((s as Record<string, unknown>).technique);
          if (n) acc.add(n);
        }
      }
    }
    stepBound(v, acc);
  }
}

export function collectActivityTechniqueOverlapViolations(root: string = ROOT): ActivityTechniqueOverlapViolation[] {
  const out: ActivityTechniqueOverlapViolation[] = [];
  const wfs = corpusWorkflows(root).filter(({ dir }) => existsSync(join(dir, 'activities')));
  for (const { dir } of wfs) {
    const adir = join(dir, 'activities');
    for (const { path } of definitionsUnder(adir)) {
      const rel = relative(root, path);
      let doc: unknown;
      try { doc = parseDefinition(readFileSync(path, 'utf-8')); } catch { continue; }
      if (!doc || typeof doc !== 'object') continue;
      const actTech = (doc as Record<string, unknown>).techniques;
      if (!Array.isArray(actTech) || !actTech.length) continue;
      const bound = new Set<string>();
      stepBound(doc, bound);
      for (const t of actTech) {
        const name = techName(t);
        if (name && bound.has(name)) out.push({ site: rel, detail: `activity-level techniques[] lists '${name}', which a step already binds via step.technique — remove it from the activity list (AP-69)` });
      }
    }
  }
  return out;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const violations = collectActivityTechniqueOverlapViolations(requireRootOrExit('activity-technique-overlap', DEFAULT_ROOT));
  if (violations.length) {
    process.stdout.write(`activity/step technique overlap: ${violations.length} duplicate entr(ies) (AP-69) — remove from the activity-level list:\n`);
    for (const v of violations.sort((a, b) => a.site.localeCompare(b.site))) process.stdout.write(`  ${v.site} — ${v.detail}\n`);
    process.exit(1);
  }
  process.stdout.write('activity/step technique overlap: OK — no activity-level technique duplicates a step binding\n');
}
