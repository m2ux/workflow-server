/**
 * Authored-artifact guard — AP-65 (superseded/extended).
 *
 * Activities do NOT declare `artifacts[]`. An activity's artifact contract is SYNTHESIZED by the
 * server (`get_activity`) from the `## Outputs` of the techniques its steps bind — the technique
 * `## Outputs` is the single source of truth for artifact identity (AP-43). A hand-authored
 * `artifacts[]` block on an activity duplicates that, drifts from it, and is forbidden.
 *
 * Hard-zero: no activity `.toon` may contain an `artifacts` block.
 *
 * Run: npx tsx scripts/check-artifact-description.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { decodeToonRaw } from '../src/utils/toon.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(DIR, '..', 'workflows');

export interface ArtifactHit { where: string; count: number }

export function collectAuthoredArtifacts(): ArtifactHit[] {
  const hits: ArtifactHit[] = [];
  for (const wf of readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory())) {
    const adir = join(ROOT, wf, 'activities');
    if (!existsSync(adir)) continue;
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.toon'))) {
      let parsed: { artifacts?: unknown[] };
      try {
        parsed = decodeToonRaw(readFileSync(join(adir, f), 'utf-8')) as typeof parsed;
      } catch { continue; /* structural errors are validate-workflow-toon's job */ }
      if (Array.isArray(parsed.artifacts) && parsed.artifacts.length > 0) {
        hits.push({ where: `${wf}/activities/${f}`, count: parsed.artifacts.length });
      }
    }
  }
  return hits;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const hits = collectAuthoredArtifacts();
  if (hits.length === 0) {
    process.stdout.write('authored-artifacts: OK — no activity declares artifacts[] (synthesized from technique outputs; AP-65)\n');
    process.exit(0);
  }
  process.stdout.write(`authored-artifacts: ${hits.length} activity(ies) declare artifacts[] — remove it (AP-65); the contract is synthesized from the bound techniques' ## Outputs:\n`);
  for (const h of hits) process.stdout.write(`  ${h.where}  (${h.count})\n`);
  process.exit(1);
}
