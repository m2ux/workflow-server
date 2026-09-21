/**
 * check-operation-contract — an activity's variable contract against the operations bound to it.
 *
 * `check-activity-variables` measures a contract against the activity's own steps: every read has a
 * writer, every write has a reader, every name is declared. It never opens the technique file the
 * step binds, so two things an operation states about a value go unmeasured:
 *
 *   declared-type-mismatch    — the contract calls a value a scalar and the operation filling it
 *                               publishes a structure. Both descriptions are internally consistent
 *                               and they are about one value, so one of them is wrong. Only an
 *                               output DECLARING its members is measured: one declaring none states
 *                               nothing about its shape and contradicts no declaration.
 *   underived-operation-write — a bound operation lands a value this activity's ROUTING tests, and
 *                               the contract does not declare the write. A value that chooses an
 *                               exit outlives the activity that produced it, so a reader of the
 *                               contract cannot see what decided where the run went.
 *
 * Both families are invisible to the contract guard for the same reason, and it is worth naming
 * because it is not an oversight. That guard narrows every derived name to the workflow's declared
 * namespace, and the namespace is assembled out of the declarations — so an operation output no
 * contract mentions is absent from the derived set and the declared set at once, and the omission
 * reads exactly like an operation that lands nothing. Both families here are derived from the
 * technique file instead, which states its outputs whether or not any contract mentions them.
 *
 * ---
 *
 * NOT IN THE GUARD REGISTRY, and `tests/guard-registry.test.ts` records the reason.
 *
 * `check-activity-variables` is a hard-zero guard: every family it carries named a definition defect
 * and each was fixed. `declared-type-mismatch` holds at 12, so this one does not land on zero yet.
 *
 * A wider reading of the second family reported 117 further places, every one an operation output a
 * later step of the same activity consumed and nothing outside ever saw. That is what the
 * construct inventory now calls the technique layer's own wiring, and `check-binding-fidelity`
 * answers for it — so the crossing above is the whole subject, and the 117 are not findings this
 * program withholds but places it has no claim on.
 *
 * The 12 are defects, each a contract and an operation describing one value incompatibly. They are
 * a corpus fix rather than a question, and enrolling before they land would take a green hard-zero
 * sweep red and cost every other family its signal — the state `check-corpus-links` was held out of
 * the registry to avoid. Enrolling is the last step, in the commit that makes it pass.
 *
 * Run: npx tsx guards/check-operation-contract.ts [--root <workflows-dir>] [--json]
 */
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { loadWorkflowWithDiagnostics, type WorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { buildRoutineLookup } from '../src/loaders/routine-loader.js';
import { type RoutineLookup, collectRoutineRefs } from '../src/loaders/routine-resolver.js';
import { deriveActivityContract } from '../src/utils/activity-variables.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/**
 * Types that hold one value. A declaration naming one of these describes something with no members
 * to address, which is the claim an operation publishing members contradicts.
 */
const SCALAR_TYPES: ReadonlySet<string> = new Set(['string', 'number', 'boolean']);

export async function collectFindings(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  const index = indexCorpus(root);
  const workflows = corpusWorkflows(root, index).map(({ id }) => id);
  assertScanned(workflows.length, 'workflows with a workflow.yaml', root);

  for (const workflowId of workflows) {
    const loaded = await loadWorkflowWithDiagnostics(root, workflowId);
    if (!loaded.success) {
      // A workflow the loader refuses is ground this guard did not read. Skipping it quietly would
      // shrink the measurement and still report clean, which is the one answer a measurement must
      // never give.
      findings.push({
        check: 'workflow-load', site: `${workflowId}/workflow.yaml`,
        detail: loaded.error.message,
      });
      continue;
    }
    const { workflow, activitySourceWorkflow, authoredActivities } = loaded.value;

    // The namespace the contract guard derives against, rebuilt here so both programs narrow one
    // way: the workflow's variables, plus every name an activity declares a read of.
    const namespace = new Set((workflow.variables ?? []).map((declaration) => declaration.name));
    for (const activity of workflow.activities ?? []) {
      for (const name of activity.variables?.reads ?? []) namespace.add(name);
    }
    const routines = await routineLookupFor(root, loaded.value);

    for (const activity of workflow.activities ?? []) {
      const sourceWorkflowId = activitySourceWorkflow.get(activity.id) ?? workflowId;
      // The AUTHORED form, for the reason the contract guard takes it: a routine reference is a
      // boundary, and the materialised form would charge the activity the routine's internals.
      const authored = authoredActivities.get(activity.id) ?? activity;
      const derived = await deriveActivityContract({
        activity: authored, workflowDir: root, scopeWorkflowId: sourceWorkflowId, namespace, routines,
      });
      const site = sourceWorkflowId === workflowId
        ? `${workflowId} :: ${activity.id}`
        : `${workflowId} :: ${sourceWorkflowId}/${activity.id}`;

      const declaredWrites = new Map((activity.variables?.writes ?? []).map((w) => [w.name, w]));

      for (const [name, declaration] of declaredWrites) {
        if (declaration.type === undefined || !SCALAR_TYPES.has(declaration.type)) continue;
        if (!derived.structuredWrites.has(name)) continue;
        findings.push({
          check: 'declared-type-mismatch', site,
          detail: `declares '${name}' as '${declaration.type}', and the operation filling it publishes `
            + 'a value with named members — one value described two incompatible ways, so a reader of '
            + 'the contract and a reader of the operation learn different things about it',
        });
      }

      for (const name of derived.operationWrites) {
        if (declaredWrites.has(name)) continue;
        // A contract states what crosses the activity's boundary. An activity's routing is the
        // crossing this program can see from inside one: a transition or decision branch testing
        // the value chooses where the run goes next, so the value outlives the activity that
        // produced it and a reader of the contract cannot see what decided the exit.
        if (!derived.routingConsults.has(name)) continue;
        // The server consumes a persisted output when it synthesizes the artifact contract, so the
        // value reaches a reader whatever the contract says.
        if (derived.persistedProductions.has(name)) continue;
        findings.push({
          check: 'underived-operation-write', site,
          detail: `binds an operation landing '${name}', which this activity's routing tests, and `
            + 'declares no write of it — the value chooses an exit and nothing in the contract shows it',
        });
      }
    }
  }
  return findings;
}

/** The routine lookup a workflow's derivations resolve through, built once per workflow. */
async function routineLookupFor(root: string, loaded: WorkflowWithDiagnostics): Promise<RoutineLookup> {
  const refs = [...loaded.authoredActivities.values()].flatMap((activity) => collectRoutineRefs(activity));
  const scopes = [...loaded.activitySourceWorkflow.values()];
  return buildRoutineLookup(root, scopes, refs);
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  await runGuard('operation-contract', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
    okMessage: 'every contract agrees with the operations bound to it on what they publish and what they land',
    remedy: 'restate the variable as the shape the operation publishes, or declare the write the operation performs',
  });
}
