/**
 * Artifact-description guard — AP-65.
 *
 * An activity `artifacts[]` entry is the WHERE of an output: `id`, `name`, `location` — nothing
 * more. WHAT the artifact contains is owned by the `## Outputs` of the technique the producing step
 * binds, reached by provenance (artifact → producing step → its technique → that technique's
 * `## Outputs`). A `description` on the artifact duplicates that output declaration and drifts from
 * it (the artifact-block instance of AP-36 / AP-43). This guard flags any `artifacts[]` entry that
 * carries a `description`.
 *
 * Hard-zero (no baseline): every artifact description is removed; the producing technique's output
 * is the single source of truth for artifact content.
 *
 * Run: npx tsx scripts/check-artifact-description.ts
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { decodeToonRaw } from '../src/utils/toon.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const ROOT = join(DIR, '..', 'workflows');

export interface ArtifactHit { where: string; id: string }

export function collectArtifactDescriptions(): ArtifactHit[] {
  const hits: ArtifactHit[] = [];
  for (const wf of readdirSync(ROOT).filter((d) => statSync(join(ROOT, d)).isDirectory())) {
    const adir = join(ROOT, wf, 'activities');
    if (!existsSync(adir)) continue;
    for (const f of readdirSync(adir).filter((x) => x.endsWith('.toon'))) {
      let parsed: { artifacts?: Array<{ id?: string; description?: string }> };
      try {
        parsed = decodeToonRaw(readFileSync(join(adir, f), 'utf-8')) as typeof parsed;
      } catch { continue; /* structural errors are validate-workflow-toon's job */ }
      for (const a of parsed.artifacts ?? []) {
        if (a && typeof a.description === 'string') hits.push({ where: `${wf}/activities/${f}`, id: a.id ?? '?' });
      }
    }
  }
  return hits;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const hits = collectArtifactDescriptions();
  if (hits.length === 0) {
    process.stdout.write('artifact-description: OK — no artifact carries a description (AP-65)\n');
    process.exit(0);
  }
  process.stdout.write(`artifact-description: ${hits.length} artifact(s) carry a description — remove it (AP-65); the producing technique's ## Outputs owns the content:\n`);
  for (const h of hits) process.stdout.write(`  ${h.where}  [${h.id}]\n`);
  process.exit(1);
}
