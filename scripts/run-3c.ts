/**
 * Standalone, inspectable Layer 3c run. Drives a single deterministic
 * robot-worker walk of the work-package workflow and prints a readable
 * transcript — per activity: steps executed, checkpoints fired, artifact stubs
 * written, manifest status, unresolved refs — then lists the files actually
 * created on disk. The workspace is kept for inspection.
 *
 *   npx tsx scripts/run-3c.ts [--policy=full-workflow] [--workflow=work-package]
 */
import { readdirSync, statSync } from 'node:fs';
import { mkdtempSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join, relative } from 'node:path';
import { createHarness } from '../tests/e2e/harness.js';
import { walk, type Policy } from '../tests/e2e/walker.js';
import {
  defaultPolicy, skipOptionalPolicy, fullWorkflowPolicy,
  researchOnlyPolicy, elicitationOnlyPolicy, reviewModePolicy,
} from '../tests/e2e/policies.js';

const POLICIES: Record<string, Policy> = {
  'default': defaultPolicy,
  'skip-optional': skipOptionalPolicy,
  'full-workflow': fullWorkflowPolicy,
  'research-only': researchOnlyPolicy,
  'elicitation-only': elicitationOnlyPolicy,
  'review-mode': reviewModePolicy,
};

const args = process.argv.slice(2);
const getArg = (k: string, def: string) => {
  const m = args.find(a => a.startsWith(`--${k}=`));
  return m ? m.slice(k.length + 3) : def;
};
const policyName = getArg('policy', 'full-workflow');
const workflowId = getArg('workflow', 'work-package');
const policy = POLICIES[policyName];
if (!policy) { process.stderr.write(`unknown policy "${policyName}" (have: ${Object.keys(POLICIES).join(', ')})\n`); process.exit(1); }

function listFiles(dir: string, base: string, out: string[] = []): string[] {
  let entries: string[] = [];
  try { entries = readdirSync(dir); } catch { return out; }
  for (const e of entries) {
    const p = join(dir, e);
    if (statSync(p).isDirectory()) listFiles(p, base, out);
    else out.push(relative(base, p));
  }
  return out;
}

function pad(s: string, n: number): string { return (s + ' '.repeat(n)).slice(0, n); }

async function main() {
  const workspace = mkdtempSync(join(tmpdir(), 'wf-3c-'));
  const h = await createHarness({ workspaceDir: workspace }); // workspace kept (caller-owned)
  try {
    const r = await walk(h, workflowId, policy); // robot mode (default)

    process.stdout.write(`\n3c robot walk — workflow=${workflowId} policy=${policy.name}\n`);
    process.stdout.write(`status=${r.finalStatus}  session=${r.sessionIndex}  activities=${r.steps.length}\n`);
    process.stdout.write(`path: ${r.path.join(' → ')}\n\n`);

    process.stdout.write(`${pad('ACTIVITY', 26)} ${pad('STEPS', 6)} ${pad('CHECKPOINTS (fired)', 40)} ARTIFACTS / MANIFEST\n`);
    for (const s of r.steps) {
      const cps = s.checkpoints.map(c => `${c.checkpointId}=${c.optionId}`).join(', ') || '-';
      const arts = s.artifactsWritten.join(', ') || '-';
      process.stdout.write(`${pad(s.activityId, 26)} ${pad(String(s.stepsExecuted.length), 6)} ${pad(cps, 40)} ${arts} [${s.manifestStatus ?? '-'}]\n`);
      if (s.unresolved.length) process.stdout.write(`${' '.repeat(26)} unresolved: ${s.unresolved.join(', ')}\n`);
      if (s.orphanCheckpoints.length) process.stdout.write(`${' '.repeat(26)} step-unbound checkpoints: ${s.orphanCheckpoints.join(', ')}\n`);
    }

    const planningFolder = join(workspace, '.engineering/artifacts/planning', r.planningSlug);
    const files = listFiles(planningFolder, planningFolder).sort();
    process.stdout.write(`\nfiles created in planning folder (${files.length}):\n`);
    for (const f of files) process.stdout.write(`  ${f}\n`);
    process.stdout.write(`\nworkspace kept for inspection:\n  ${workspace}\n`);
  } finally {
    await h.close(); // workspace was caller-supplied → not deleted
  }
}

main().catch(e => { process.stderr.write(`run-3c failed: ${e?.stack ?? e}\n`); process.exit(1); });
