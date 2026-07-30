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
 * Run: npx tsx scripts/check-checkpoint-entry.ts [--root <workflows-dir>] [--json]
 */
import { readFileSync, readdirSync, existsSync, statSync } from 'node:fs';
import { join, relative, resolve } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parse } from 'yaml';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = resolve(join(DIR, '..', 'workflows'));

interface StepDef { kind?: string; id?: string }
interface ActivityDef { id?: string; steps?: StepDef[] }

export function collectFindings(root: string = DEFAULT_ROOT): Finding[] {
  const findings: Finding[] = [];
  let scanned = 0;
  for (const workflow of readdirSync(root).sort()) {
    const activitiesDir = join(root, workflow, 'activities');
    if (!existsSync(activitiesDir) || !statSync(activitiesDir).isDirectory()) continue;
    for (const entry of readdirSync(activitiesDir).sort()) {
      if (!entry.endsWith('.yaml') && !entry.endsWith('.yml')) continue;
      const path = join(activitiesDir, entry);
      const def = parse(readFileSync(path, 'utf-8')) as ActivityDef | null;
      scanned++;
      const first = def?.steps?.[0];
      if (first?.kind !== 'checkpoint') continue;
      findings.push({
        check: 'checkpoint-at-entry',
        site: `${relative(root, path)}`,
        detail: `activity '${def?.id ?? entry}' opens with checkpoint '${first.id ?? '?'}' — the worker is `
          + 'dispatched, paid full delivery, and yields before doing any work, so the whole first '
          + "dispatch only asks a question. Move the decision to the preceding activity's tail or to "
          + "the orchestrator's dispatch precondition.",
      });
    }
  }
  assertScanned(scanned, 'activity files', root);
  return findings;
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('checkpoint-entry', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'no activity opens with a checkpoint',
    remedy: "relocate the decision to the preceding activity's tail or the orchestrator's dispatch precondition",
  });
}
