/**
 * Marginal cost of each operation in the orchestrator's opening bundle, and of the worker's
 * per-dispatch baseline. Run from the server checkout root:
 *
 *   npx tsx .engineering/artifacts/planning/2026-09-21-roles-as-skills/measure-bundle.ts <corpus-root>
 *
 * The orchestrator total reproduces the `bundle_chars` the server logs on `get_workflow` for the
 * meta session, so a marginal figure below is a share of the same number the budget test measures.
 */
import { resolveTechniques, formatTechniqueBundle } from '../../../../src/loaders/technique-loader.js';
import {
  CORE_ORCHESTRATOR_TECHNIQUES,
  CORE_WORKER_TECHNIQUES,
  WORKER_CHECKPOINT_TECHNIQUES,
  ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
} from '../../../../src/loaders/core-ops.js';
import { stringifyForResponse } from '../../../../src/utils/serialization.js';

const dir = process.argv[2]!;

/** meta's own `techniques.workflow` list, from corpus/meta/workflow.yaml. */
const META_WORKFLOW_REFS = [
  'workflow-engine::start-session',
  'workflow-engine::handle-sub-workflow',
  'workflow-engine::dispatch-activity',
  'workflow-engine::resume-worker',
  'workflow-engine::continue-batch',
  'workflow-engine::workflow-orchestrator',
];

async function sizeOf(refs: string[]): Promise<number> {
  const resolved = await resolveTechniques(refs, dir, 'meta');
  return stringifyForResponse(formatTechniqueBundle(resolved)).length;
}

/** meta's `end-workflow` activity holds a checkpoint step, so the gate pair rides the bundle. */
const orchestratorRefs = Array.from(new Set([
  ...META_WORKFLOW_REFS,
  ...CORE_ORCHESTRATOR_TECHNIQUES,
  ...ORCHESTRATOR_CHECKPOINT_TECHNIQUES,
]));

const whole = await sizeOf(orchestratorRefs);
console.log(`orchestrator bundle ${whole} chars over ${orchestratorRefs.length} operations`);

for (const ref of orchestratorRefs) {
  const without = await sizeOf(orchestratorRefs.filter(r => r !== ref));
  console.log(`  ${String(whole - without).padStart(7)}  ${ref}`);
}

async function groupCost(label: string, member: (ref: string) => boolean): Promise<void> {
  const kept = orchestratorRefs.filter(r => !member(r));
  console.log(`${label}: ${whole - await sizeOf(kept)} chars over ${orchestratorRefs.length - kept.length} operations`);
}

await groupCost('harness-compat, whole group', r => r.startsWith('harness-compat::'));
await groupCost('harness-compat, hosts other than claude-code', r =>
  ['harness-compat::cursor', 'harness-compat::cline', 'harness-compat::generic'].includes(r));
await groupCost('conduct', r => r === 'agent-conduct' || r === 'orchestrator-conduct');
await groupCost('checkpoint pair', r => (ORCHESTRATOR_CHECKPOINT_TECHNIQUES as readonly string[]).includes(r));

const workerRefs = Array.from(new Set([
  ...CORE_WORKER_TECHNIQUES,
  ...WORKER_CHECKPOINT_TECHNIQUES,
  'variable-binding',
]));
console.log(`worker baseline ${await sizeOf(workerRefs)} chars over ${workerRefs.length} operations`);
console.log(`  without conduct ${await sizeOf(workerRefs.filter(r => r !== 'agent-conduct' && r !== 'worker-conduct'))} chars`);
