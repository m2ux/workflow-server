/**
 * Cross-workflow technique-reference check. For every workflow, collect the
 * technique references its activities (and workflow.yaml) declare — the flat
 * `techniques[]` list — and resolve them through the real loader. Reports any
 * that do not resolve (the broken/unwired refs to fix). Generalises the
 * work-package Layer 2 lint to the whole repo.
 *
 *   npx tsx scripts/check-all-refs.ts [--root /path/to/worktree/workflows] [--json]
 */
import { resolve } from 'node:path';
import { listWorkflows, loadWorkflow } from '../src/loaders/workflow-loader.js';
import { resolveTechniques } from '../src/loaders/technique-loader.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

// Defaults to the repo's own ../workflows; pass `--root <path>` or set WORKFLOWS_DIR to
// validate a dedicated worktree's workflows instead (issue #160 follow-up #1).
const DEFAULT_ROOT = resolve(import.meta.dirname, '../workflows');

interface ActivityLike { id: string; techniques?: string[] }

/**
 * Every unresolved reference, plus every workflow that would not load at all. Until #327 this guard
 * printed a `total unresolved` count and then exited 0, so a broken ref was reported and passed in
 * the same breath.
 */
export async function collectFindings(WF_DIR: string = DEFAULT_ROOT): Promise<Finding[]> {
  const findings: Finding[] = [];
  const summaries = await listWorkflows(WF_DIR);
  assertScanned(summaries.length, 'loadable workflows', WF_DIR);

  for (const s of summaries) {
    const wfId = (s as { id: string }).id;
    const res = await loadWorkflow(WF_DIR, wfId);
    if (!res.success) {
      findings.push({ check: 'workflow-load', site: wfId, detail: `workflow failed to load: ${String(res.error)}` });
      continue;
    }
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
    if (allRefs.length === 0) continue;
    const resolved = await resolveTechniques(allRefs, WF_DIR, wfId);
    for (const u of resolved.filter(r => r.type === 'not-found')) {
      findings.push({
        check: 'unresolved-technique-ref',
        site: `${wfId} :: ${u.ref}`,
        detail: `techniques[] reference '${u.ref}' does not resolve through the loader (declared in: ${(refSites.get(u.ref) ?? []).join(', ')})`,
      });
    }
  }
  return findings;
}

await runGuard('refs', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
  okMessage: 'every activity/workflow techniques[] reference resolves through the loader',
  remedy: 'fix or remove each unresolved reference',
});
