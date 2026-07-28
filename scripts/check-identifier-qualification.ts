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
 * A bare id is also unbindable from a workflow variable, because `VariableNameSchema` rejects the
 * same spelling on the producing side — so an unqualified input can never be seeded by name and
 * reads as an orphan for the life of the corpus.
 *
 * Exemptions live in src/schema/identifiers.ts (EXEMPT_DATA_IDS), shared with the schema so both
 * surfaces apply one list. Each entry carries the reason it stays bare — that reasoned list is the
 * only accepted exception; the guard is hard zero and carries no baseline (issue #327 R5).
 *
 *   npx tsx scripts/check-identifier-qualification.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { EXEMPT_DATA_ID_SET as EXEMPT, isSingleWord } from '../src/schema/identifiers.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

export type Hit = { id: string; where: string };

/** Record every bare `###` heading under `## Inputs` / `## Outputs` in a technique file. */
function scanTechnique(path: string, rel: string, hits: Hit[]): void {
  const lines = readFileSync(path, 'utf-8').split('\n');
  let inIO = false;
  lines.forEach((line, i) => {
    const h2 = /^##\s+(.+?)\s*$/.exec(line);
    if (h2) { inIO = ['Inputs', 'Outputs'].includes(h2[1]!.trim()); return; }
    if (!inIO) return;
    const h = /^###\s+(\S+)\s*$/.exec(line);
    if (h) {
      const id = h[1]!.trim();
      if (isSingleWord(id) && !EXEMPT.has(id)) hits.push({ id, where: `${rel}:${i + 1}` });
    }
  });
}

function scanTechniqueDir(dir: string, root: string, hits: Hit[]): number {
  if (!existsSync(dir)) return 0;
  let scanned = 0;
  for (const entry of readdirSync(dir)) {
    const p = join(dir, entry); const st = statSync(p);
    if (st.isFile() && entry.endsWith('.md')) { scanTechnique(p, relative(root, p), hits); scanned++; }
    else if (st.isDirectory()) scanned += scanTechniqueDir(p, root, hits);
  }
  return scanned;
}

export function collectHits(root: string = DEFAULT_ROOT): Hit[] {
  const hits: Hit[] = [];
  let scanned = 0;
  for (const wf of readdirSync(root).filter((d) => statSync(join(root, d)).isDirectory())) {
    scanned += scanTechniqueDir(join(root, wf, 'techniques'), root, hits);
  }
  assertScanned(scanned, 'technique files', root);
  return hits;
}

/** One finding per bare id, listing every site that declares it. */
export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const byId = new Map<string, string[]>();
  for (const h of collectHits(root)) {
    if (!byId.has(h.id)) byId.set(h.id, []);
    byId.get(h.id)!.push(h.where);
  }
  return [...byId.entries()].sort(([a], [b]) => a.localeCompare(b)).map(([id, where]) => ({
    check: 'bare-data-id',
    site: where[0]!,
    detail: `I/O id '${id}' is a bare single word, declared at ${where.length} site(s): ${where.join(', ')}`
      + ` — qualify it (>=2-word noun phrase) or add it to EXEMPT_DATA_IDS with its AP-60 reason`,
  }));
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('identifier-qualification', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every technique I/O id is a qualified noun phrase',
    remedy: 'qualify each id, or exempt it in src/schema/identifiers.ts with its reason',
  });
}
