/**
 * Identifier-qualification guard — AP-60 sub-rule (3), markdown surface.
 *
 * Every technique top-level I/O id — a `###` heading under `## Inputs` / `## Outputs` — MUST be a
 * qualified noun phrase, never a bare single word. YAML `variables[]` names are the schema's job:
 * `VariableNameSchema` (src/schema/workflow.schema.ts) enforces the same rule with the same
 * exemption list at validation time, so this guard covers only the ids that live in markdown
 * headings, which no document schema can see.
 *
 * (`####` sub-field descriptors — e.g. the pervasive `#### artifact` filename convention — are a
 * separate, finer-grained AP-60 cleanup and are intentionally out of this guard's scope.)
 *
 * A bare single word (`target`, `summary`, `scope`) names a category, not a concept —
 * the reader cannot tell which target or whose summary is meant. Qualify it with its
 * parent/concept (`analysis_target`, `completion_summary`, `audit_scope`).
 *
 * Exemptions live in src/schema/identifiers.ts (EXEMPT_DATA_IDS), shared with the schema so both
 * surfaces apply one list.
 *
 * Scope: DATA identifiers only. Structural ids (activity / step / checkpoint-option ids) are
 * out of scope — they are not values bound through the variable bag.
 *
 * Hard-zero rule (no baseline): every flagged id is either fixed (qualified) or added to
 * EXEMPT_DATA_IDS with its reason. Run:
 *   npx tsx scripts/check-identifier-qualification.ts
 */
import { readFileSync, readdirSync, existsSync, statSync, writeFileSync } from 'node:fs';
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EXEMPT_DATA_ID_SET as EXEMPT, isSingleWord } from '../src/schema/identifiers.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
// Defaults to ../workflows; --root <path> or WORKFLOWS_DIR redirects to a worktree (issue #160 #1).
const ROOT = resolveWorkflowsRoot(join(DIR, '..', 'workflows'));

/**
 * Accepted pre-existing flagged ids, snapshotted in identifier-qualification-baseline.json. The guard
 * fails on any id ABSENT from the baseline (new bare-word identifiers). The corpus has now been fully
 * qualified, so the baseline is EMPTY — every bare data id is a failure. Regenerate after an
 * intentional, reviewed qualification/exemption with `--update-baseline`.
 */
const BASELINE = join(DIR, 'identifier-qualification-baseline.json');

type Hit = { id: string; where: string };
const hits: Hit[] = [];

/** Record every `###`/`####` heading under `## Inputs` / `## Outputs` in a technique file. */
function scanTechnique(path: string, rel: string): void {
  const lines = readFileSync(path, 'utf-8').split('\n');
  let inIO = false;
  lines.forEach((line, i) => {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) { inIO = ['Inputs', 'Outputs'].includes(h2[1].trim()); return; }
    if (!inIO) return;
    const h = /^###\s+(\S+)\s*$/.exec(line);
    if (h) {
      const id = h[1].trim();
      if (isSingleWord(id) && !EXEMPT.has(id)) hits.push({ id, where: `${rel}:${i + 1}` });
    }
  });
}

function scanTechniqueDir(dir: string, wf: string): void {
  if (!existsSync(dir)) return;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry); const st = statSync(p);
    if (st.isFile() && entry.endsWith('.md')) scanTechnique(p, relative(ROOT, p));
    else if (st.isDirectory()) scanTechniqueDir(p, wf);
  }
}

const workflows = readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory());
for (const wf of workflows) {
  scanTechniqueDir(join(ROOT, wf, 'techniques'), wf);
}

/* ----------------------------- report ----------------------------- */
const byId = new Map<string, string[]>();
for (const h of hits) {
  if (!byId.has(h.id)) byId.set(h.id, []);
  byId.get(h.id)!.push(h.where);
}
const flaggedIds = [...byId.keys()].sort();

/** Compare current flagged ids to the committed baseline. `added` = NEW bare-word ids (drift). */
export function diffBaseline(): { added: string[]; fixed: string[]; total: number; baselined: number } {
  const baseline: string[] = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf-8')) : [];
  const baseSet = new Set(baseline);
  const curSet = new Set(flaggedIds);
  return {
    added: flaggedIds.filter((id) => !baseSet.has(id)),
    fixed: baseline.filter((id) => !curSet.has(id)),
    total: flaggedIds.length,
    baselined: baseline.length,
  };
}

/* --------------------------------- CLI runner --------------------------------- */
const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  if (process.argv.includes('--update-baseline')) {
    writeFileSync(BASELINE, JSON.stringify(flaggedIds, null, 2) + '\n');
    process.stdout.write(`baseline updated: ${flaggedIds.length} accepted pre-existing bare-word id(s)\n`);
    process.exit(0);
  }
  const { added, fixed, total, baselined } = diffBaseline();
  process.stdout.write(`identifier-qualification: ${total} flagged, ${baselined} baselined, ${added.length} NEW, ${fixed.length} qualified\n`);
  if (fixed.length) process.stdout.write(`  ${fixed.length} baselined id(s) no longer bare — run --update-baseline to shrink the baseline\n`);
  if (added.length) {
    process.stdout.write(`\nNEW bare single-word data id(s) — qualify each (>=2-word noun phrase), or add to EXEMPT with its AP-60 reason:\n`);
    for (const id of added) {
      const where = byId.get(id)!;
      process.stdout.write(`  ${id}  (${where.length})  e.g. ${where.slice(0, 3).join(', ')}${where.length > 3 ? ' …' : ''}\n`);
    }
    process.exit(1);
  }
  process.stdout.write('OK — no new bare-word data ids\n');
}
