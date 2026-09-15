/**
 * What a second copy of every activity costs per load — the price of the loader returning the
 * authored form beside the materialised one.
 *
 * Run from a server checkout with the corpus root as the first argument:
 *   npx tsx <this file> .worktrees/workflows/corpus
 *
 * Three figures per workflow: the load, the structured clone of its activities, and the retained
 * size of that clone. The clone is taken over the activity array alone, because that is the only
 * thing materialisation mutates. Discovery is depth-agnostic — a workflow.yaml at any depth is a
 * workflow — so the nested specimen tree is measured with the rest.
 */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadWorkflowWithDiagnostics } from '../../../../../src/loaders/workflow-loader.js';

const root = process.argv[2]!;
const REPEATS = 5;

/** Every directory under the root holding a workflow.yaml, at any depth. */
function discover(dir: string): string[] {
  const found: string[] = [];
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry);
    if (!statSync(path).isDirectory()) continue;
    if (existsSync(join(path, 'workflow.yaml'))) found.push(entry);
    else found.push(...discover(path));
  }
  return found;
}

const countSteps = (list: unknown): number => {
  let n = 0;
  for (const step of (list ?? []) as Array<Record<string, unknown>>) {
    n += 1;
    if (step['kind'] === 'loop') n += countSteps(step['steps']);
  }
  return n;
};

const pad = (value: string | number, width: number): string =>
  width < 0 ? String(value).padEnd(-width) : String(value).padStart(width);

const workflows = discover(root).sort();

let loadMs = 0, cloneMs = 0, bytes = 0, activities = 0, steps = 0;
const per: Array<{ id: string; acts: number; steps: number; load: number; clone: number; bytes: number }> = [];

for (const id of workflows) {
  const t0 = performance.now();
  const loaded = await loadWorkflowWithDiagnostics(root, id);
  const t1 = performance.now();
  if (!loaded.success) { console.error('load failed', id); continue; }

  const acts = loaded.value.workflow.activities ?? [];
  const t2 = performance.now();
  for (let i = 0; i < REPEATS; i++) structuredClone(acts);
  const clone = (performance.now() - t2) / REPEATS;

  const size = Buffer.byteLength(JSON.stringify(acts));
  const stepCount = acts.reduce((n, a) => n + countSteps(a.steps), 0);

  loadMs += t1 - t0; cloneMs += clone; bytes += size; activities += acts.length; steps += stepCount;
  per.push({ id, acts: acts.length, steps: stepCount, load: t1 - t0, clone, bytes: size });
}

console.error('');
console.log('workflows: %d   activities: %d   steps: %d', per.length, activities, steps);
console.log('load total  : %s ms', loadMs.toFixed(1));
console.log('clone total : %s ms   (%s%% of the load)', cloneMs.toFixed(2), ((cloneMs / loadMs) * 100).toFixed(1));
console.log('clone size  : %s KiB across every workflow', (bytes / 1024).toFixed(1));
console.log('');
console.log([pad('workflow', -32), pad('acts', 5), pad('steps', 6), pad('load ms', 9), pad('clone ms', 9), pad('KiB', 8), pad('%load', 7)].join(' '));
for (const row of per.sort((a, b) => b.clone - a.clone)) {
  console.log([
    pad(row.id, -32), pad(row.acts, 5), pad(row.steps, 6),
    pad(row.load.toFixed(1), 9), pad(row.clone.toFixed(2), 9),
    pad((row.bytes / 1024).toFixed(1), 8), pad(((row.clone / row.load) * 100).toFixed(1), 7),
  ].join(' '));
}
