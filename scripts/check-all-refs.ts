/**
 * Cross-workflow technique-reference check. For every workflow, collect the
 * technique references its activities (and workflow.yaml) declare — the flat
 * `techniques[]` list — and resolve them through the real loader. Reports any
 * that do not resolve (the broken/unwired refs to fix). Generalises the
 * work-package Layer 2 lint to the whole repo.
 *
 *   npx tsx scripts/check-all-refs.ts
 *   npx tsx scripts/check-all-refs.ts --root /path/to/worktree/workflows
 */
import { resolve } from 'node:path';
import { listWorkflows, loadWorkflow } from '../src/loaders/workflow-loader.js';
import { resolveTechniques } from '../src/loaders/technique-loader.js';
import { resolveWorkflowsRoot } from './workflows-root.js';

// Defaults to the repo's own ../workflows; pass `--root <path>` or set WORKFLOWS_DIR to
// validate a dedicated worktree's workflows instead (issue #160 follow-up #1).
const WF_DIR = resolveWorkflowsRoot(resolve(import.meta.dirname, '../workflows'));

interface ActivityLike { id: string; techniques?: string[] }

async function main() {
  const summaries = await listWorkflows(WF_DIR);
  let totalUnresolved = 0;

  for (const s of summaries) {
    const wfId = (s as { id: string }).id;
    const res = await loadWorkflow(WF_DIR, wfId);
    if (!res.success) { process.stdout.write(`\n[${wfId}] FAILED TO LOAD: ${String(res.error)}\n`); continue; }
    const wf = res.value as { techniques?: { workflow?: string[]; activity?: string[] }; activities?: ActivityLike[] };

    // Per-ref → which activity declared it (for actionable output).
    const refSites = new Map<string, string[]>();
    const addRefs = (site: string, t?: string[]) => {
      const refs = t ?? [];
      for (const r of refs) {
        if (!refSites.has(r)) refSites.set(r, []);
        refSites.get(r)!.push(site);
      }
    };
    addRefs('workflow.yaml (techniques.workflow)', wf.techniques?.workflow);
    addRefs('workflow.yaml (techniques.activity)', wf.techniques?.activity);
    for (const a of wf.activities ?? []) addRefs(a.id, a.techniques);

    const allRefs = [...refSites.keys()];
    if (allRefs.length === 0) { process.stdout.write(`\n[${wfId}] (no technique refs)\n`); continue; }
    const resolved = await resolveTechniques(allRefs, WF_DIR, wfId);
    const unresolved = resolved.filter(r => r.type === 'not-found');

    if (unresolved.length === 0) {
      process.stdout.write(`\n[${wfId}] OK — ${allRefs.length} refs all resolve\n`);
    } else {
      process.stdout.write(`\n[${wfId}] ${unresolved.length} UNRESOLVED of ${allRefs.length}:\n`);
      for (const u of unresolved) {
        process.stdout.write(`   - ${u.ref}   (in: ${(refSites.get(u.ref) ?? []).join(', ')})\n`);
        totalUnresolved++;
      }
    }
  }
  process.stdout.write(`\n==== total unresolved across all workflows: ${totalUnresolved} ====\n`);
}

main().catch(e => { process.stderr.write(`check failed: ${e?.stack ?? e}\n`); process.exit(1); });
