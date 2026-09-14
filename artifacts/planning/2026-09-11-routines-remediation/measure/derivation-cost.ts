/** What the derivation costs on top of a load, per workflow — the price of moving it into the loader. */
import { readdirSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { loadWorkflowWithDiagnostics } from '../../../../../src/loaders/workflow-loader.js';
import { deriveActivityContract } from '../../../../../src/utils/activity-variables.js';

const root = process.argv[2]!;
const workflows = readdirSync(root)
  .filter((e) => statSync(join(root, e)).isDirectory() && existsSync(join(root, e, 'workflow.yaml')))
  .sort();

let loadMs = 0, deriveMs = 0, activities = 0;
const per: Array<[string, number, number, number]> = [];
for (const wf of workflows) {
  const t0 = performance.now();
  const loaded = await loadWorkflowWithDiagnostics(root, wf);
  const t1 = performance.now();
  if (!loaded.success) { console.log('load failed', wf); continue; }
  const ns = new Set((loaded.value.workflow.variables ?? []).map((v) => v.name));
  const acts = loaded.value.workflow.activities ?? [];
  const t2 = performance.now();
  for (const a of acts) {
    await deriveActivityContract({
      activity: a, workflowDir: root,
      scopeWorkflowId: loaded.value.activitySourceWorkflow.get(a.id) ?? wf, namespace: ns,
    });
  }
  const t3 = performance.now();
  loadMs += t1 - t0; deriveMs += t3 - t2; activities += acts.length;
  per.push([wf, acts.length, t1 - t0, t3 - t2]);
}
console.log('workflows: %d   activities: %d', workflows.length, activities);
console.log('load total   : %s ms', loadMs.toFixed(1));
console.log('derive total : %s ms   (%sx the load)', deriveMs.toFixed(1), (deriveMs / loadMs).toFixed(1));
console.log();
console.log('%-32s %6s %10s %10s %8s', 'workflow', 'acts', 'load ms', 'derive ms', 'ratio');
for (const [wf, n, l, d] of per.sort((a, b) => b[3] - a[3])) {
  console.log('%-32s %6d %10s %10s %8s', wf, n, l.toFixed(1), d.toFixed(1), (d / l).toFixed(1));
}
