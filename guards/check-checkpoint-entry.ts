/**
 * check-checkpoint-entry — a checkpoint may not be an activity's first step (#353 §1.4).
 *
 * An activity's first step runs in a freshly dispatched worker. A checkpoint there costs a whole
 * dispatch for nothing: the worker is spawned, pays full delivery of the activity bundle, yields for
 * the answer before executing anything, and has to be resumed to do the work. A dispatch that only
 * asks a question is the most expensive way to ask one — on the walk this guard was written from,
 * re-dispatch was ~31% of a 4.1M-token run.
 *
 * It is an ownership error as much as a cost one. A question with no work in front of it is not
 * worker work: it belongs to the preceding activity's tail, where the yield lands on an activity
 * boundary and the resumed worker has nothing left to do, or to the orchestrator as a precondition
 * on dispatching at all. An environment-capability question — can this machine run the suite? — is
 * decided before you dispatch, not by the thing you dispatched.
 *
 * A `when`/`condition` gate does not exempt a first-step checkpoint. A gate that is usually true is
 * the same wasted dispatch, and the remedy is the same relocation either way, so the check is
 * mechanical: `steps[0].kind == "checkpoint"`.
 *
 * It reads the MATERIALISED activities rather than the files as written (#704). The rule is about
 * the step a dispatched worker meets first, and a `kind: routine` reference in first position
 * expands to whatever the routine opens with — so against unexpanded text a reference to a routine
 * whose first step is a checkpoint evades the rule entirely, while costing exactly the dispatch the
 * rule exists to prevent.
 *
 * Run: npx tsx guards/check-checkpoint-entry.ts [--root <workflows-dir>] [--json]
 */
import { join, relative } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

export async function collectFindings(root: string = DEFAULT_ROOT): Promise<Finding[]> {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const { id, dir } of corpusWorkflows(root)) {
    const loaded = await loadWorkflowWithDiagnostics(root, id);
    if (!loaded.success) continue;
    for (const activity of loaded.value.workflow.activities ?? []) {
      scanned++;
      const first = activity.steps?.[0];
      if (first?.kind !== 'checkpoint') continue;
      const file = join(relative(root, dir), 'activities', `${activity.artifactPrefix ?? ''}${activity.artifactPrefix ? '-' : ''}${activity.id}.yaml`);
      findings.push({
        check: 'checkpoint-at-entry',
        site: file,
        detail: `activity '${activity.id}' opens with checkpoint '${first.id}' — the worker is `
          + 'dispatched, paid full delivery, and yields before doing any work, so the whole first '
          + "dispatch only asks a question. Move the decision to the preceding activity's tail or to "
          + "the orchestrator's dispatch precondition.",
      });
    }
  }
  assertScanned(scanned, 'activities', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('checkpoint-entry', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no activity opens with a checkpoint',
    remedy: "relocate the decision to the preceding activity's tail or the orchestrator's dispatch precondition",
  });
}
