/**
 * Activity variable-contract guard (#493).
 *
 * An activity declares the session variables it reads and the variables it writes. This guard
 * holds the corpus to those declarations, over each workflow's own activity graph — including the
 * activities a workflow includes from another workflow, which are checked in the scope they RUN
 * in rather than the scope they were authored in (#491 finding 1).
 *
 * Five finding families:
 *
 *   undeclared-use     — the activity reads or writes a name its contract omits. Derivation is
 *                        the same name-match convention `binding-provenance` resolves a step's
 *                        inputs with, so the contract is measured against what a run would do.
 *   unused-declaration — the contract declares a name the activity neither reads nor writes.
 *   unwritten-read     — a declared read no activity in the graph writes, and the workflow file
 *                        does not own. The value would have to be improvised at the step.
 *   unread-write       — a declared write nothing reads: neither another activity's contract nor
 *                        the workflow file's own prose.
 *   unreachable-read   — a read no path satisfies. `entry` means some path from the initial
 *                        activity arrives before any write; `re-entry` means the read sits on a
 *                        cycle no activity in the cycle writes, so a return visit reads the
 *                        previous pass's value and a route testing for the other value cannot be
 *                        taken.
 *
 * Hard-zero: every finding is a defect in the corpus, not in the guard.
 *
 *   npx tsx scripts/check-activity-variables.ts [--root <workflows-dir>] [--json]
 *   npx tsx scripts/check-activity-variables.ts --emit-contracts   # derived contracts, as JSON
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { AMBIENT_CONTEXT_IDS, IDENTIFIER_PATTERN } from '../src/utils/binding-provenance.js';
import {
  activityGraph,
  deriveActivityContract,
  orchestratorInputs,
  unreachableReads,
  type DerivedContract,
} from '../src/utils/activity-variables.js';
import type { VariableDefinition } from '../src/schema/variable.schema.js';
import { assertScanned, requireWorkflowsRoot } from './workflows-root.js';
import { findingKey, report, wantsJson, type Finding } from './guard-protocol.js';
import { applyTriage, loadTriageFile, triageStampNote, triageSummary } from './triage.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = join(DIR, '..', 'workflows');
/** The ledger of accepted findings, per finding, with a named rationale each. */
const TRIAGE = join(DIR, 'activity-variable-triage.json');
const TRIAGE_REL = 'scripts/activity-variable-triage.json';

/** The declared contract of one activity, keyed for reporting. */
interface ActivityRecord {
  id: string;
  /** The workflow the activity file was authored in — differs when the graph includes it. */
  sourceWorkflowId: string;
  declaredReads: Set<string>;
  declaredWrites: Map<string, VariableDefinition>;
  derived: DerivedContract;
}

/** Bag names a workflow file's own prose interpolates — its rules and descriptions read too. */
function workflowProseReads(workflowYaml: string): Set<string> {
  const token = new RegExp(`\\{(${IDENTIFIER_PATTERN})(?:\\.[a-zA-Z0-9_]+)*\\}`, 'g');
  const names = new Set<string>();
  for (const match of workflowYaml.matchAll(token)) names.add(match[1]!);
  return names;
}

/** Declarations the workflow FILE carries, read before the loader folds activity writes in. */
function ownDeclarations(workflowYaml: string): VariableDefinition[] {
  const parsed = parseDefinition(workflowYaml) as { variables?: VariableDefinition[] } | null;
  return Array.isArray(parsed?.variables) ? parsed.variables : [];
}

export async function collectFindings(root: string): Promise<Finding[]> {
  const findings: Finding[] = [];
  // What the orchestrator consumes out of the same bag, whichever workflow is running.
  const engineInputs = await orchestratorInputs(root);
  const workflows = readdirSync(root)
    .filter((entry) => statSync(join(root, entry)).isDirectory() && existsSync(join(root, entry, 'workflow.yaml')))
    .sort();
  assertScanned(workflows.length, 'workflows with a workflow.yaml', root);

  for (const workflowId of workflows) {
    const loaded = await loadWorkflowWithDiagnostics(root, workflowId);
    if (!loaded.success) {
      findings.push({
        check: 'workflow-load', site: `${workflowId}/workflow.yaml`,
        detail: loaded.error.message,
      });
      continue;
    }
    const { workflow, activitySourceWorkflow } = loaded.value;
    const rawWorkflowYaml = readFileSync(join(root, workflowId, 'workflow.yaml'), 'utf-8');
    const owned = new Set(ownDeclarations(rawWorkflowYaml).map((declaration) => declaration.name));
    const proseReads = workflowProseReads(rawWorkflowYaml);

    // The namespace a contract entry can name: the workflow's variable set (the file's own
    // declarations plus what its activities contribute) together with every name an activity
    // declares a read of. An included activity naming a read the including workflow supplies
    // nowhere is the seam this guard exists to report — so the name has to be IN the namespace,
    // or the read would go unmeasured and read as an idle declaration.
    const namespace = new Set((workflow.variables ?? []).map((declaration) => declaration.name));
    for (const activity of workflow.activities ?? []) {
      for (const name of activity.variables?.reads ?? []) namespace.add(name);
    }

    const records: ActivityRecord[] = [];
    for (const activity of workflow.activities ?? []) {
      const sourceWorkflowId = activitySourceWorkflow.get(activity.id) ?? workflowId;
      records.push({
        id: activity.id,
        sourceWorkflowId,
        declaredReads: new Set(activity.variables?.reads ?? []),
        declaredWrites: new Map((activity.variables?.writes ?? []).map((w) => [w.name, w])),
        derived: await deriveActivityContract({ activity, workflowDir: root, scopeWorkflowId: sourceWorkflowId, namespace }),
      });
    }

    // A borrowed activity's file lives in the workflow that authored it; naming that file in the
    // site is what tells a reader where to fix it, and the workflow prefix says where it failed.
    const site = (record: ActivityRecord): string =>
      record.sourceWorkflowId === workflowId
        ? `${workflowId} :: ${record.id}`
        : `${workflowId} :: ${record.sourceWorkflowId}/${record.id}`;

    for (const record of records) {
      for (const name of record.derived.reads) {
        if (!record.declaredReads.has(name)) {
          findings.push({
            check: 'undeclared-use', site: site(record),
            detail: `reads '${name}' without declaring it under variables.reads`,
          });
        }
      }
      for (const name of record.derived.writes) {
        if (!record.declaredWrites.has(name)) {
          findings.push({
            check: 'undeclared-use', site: site(record),
            detail: `writes '${name}' without declaring it under variables.writes`,
          });
        }
      }
      for (const name of record.declaredReads) {
        if (!record.derived.reads.has(name)) {
          findings.push({
            check: 'unused-declaration', site: site(record),
            detail: `declares a read of '${name}' that no step, gate, loop or transition consults`,
          });
        }
      }
      for (const name of record.declaredWrites.keys()) {
        if (!record.derived.writes.has(name)) {
          findings.push({
            check: 'unused-declaration', site: site(record),
            detail: `declares a write of '${name}' that no step produces`,
          });
        }
      }
    }

    const writersOf = new Map<string, string[]>();
    for (const record of records) {
      for (const name of record.declaredWrites.keys()) {
        const writers = writersOf.get(name) ?? [];
        writers.push(record.id);
        writersOf.set(name, writers);
      }
    }
    // Who reads a name: any activity declaring a read of it, the activity that writes it and then
    // reads it back within its own steps, and any activity a bound operation consumes it in
    // without requiring it. "Nothing reads it" has to mean nothing.
    const readersOf = new Map<string, string[]>();
    for (const record of records) {
      for (const name of [...record.declaredReads, ...record.derived.consumes]) {
        const readers = readersOf.get(name) ?? [];
        readers.push(record.id);
        readersOf.set(name, readers);
      }
    }

    for (const record of records) {
      for (const name of record.declaredReads) {
        if (owned.has(name) || writersOf.has(name) || AMBIENT_CONTEXT_IDS.has(name)) continue;
        findings.push({
          check: 'unwritten-read', site: site(record),
          detail: `reads '${name}', which no activity in this workflow writes and the workflow file does not own`,
        });
      }
      for (const name of record.declaredWrites.keys()) {
        if (readersOf.has(name) || proseReads.has(name) || record.derived.artifactWrites.has(name)) continue;
        if (engineInputs.has(name)) continue;
        findings.push({
          check: 'unread-write', site: site(record),
          detail: `writes '${name}', which nothing in this workflow reads`,
        });
      }
    }

    // Reachability. Seeded and workflow-owned names are present before the first activity runs;
    // an activity-declared default seeds the same way, so it counts as available at entry too.
    const availableAtEntry = new Set<string>([...owned, ...AMBIENT_CONTEXT_IDS]);
    for (const declaration of workflow.variables ?? []) {
      if (declaration.defaultValue !== undefined) availableAtEntry.add(declaration.name);
    }
    const unreachable = unreachableReads({
      graph: activityGraph(workflow),
      initialActivity: workflow.initialActivity,
      availableAtEntry,
      reads: new Map(records.map((record) => [record.id, record.declaredReads])),
      // A routing read is only checked where the contract declares it too, so a stale declaration
      // cannot conjure a reachability finding out of nothing.
      routingReads: new Map(records.map((record) => [
        record.id,
        new Set([...record.derived.routingReads].filter((name) => record.declaredReads.has(name))),
      ])),
      writes: new Map(records.map((record) => [record.id, new Set(record.declaredWrites.keys())])),
      policy: owned,
    });
    for (const found of unreachable) {
      const record = records.find((candidate) => candidate.id === found.activityId)!;
      findings.push({
        check: 'unreachable-read', site: site(record),
        detail: found.kind === 'entry'
          ? `reads '${found.name}' on a path that reaches it before anything writes it`
          : `reads '${found.name}' on a cycle no activity in the cycle writes, so a return visit reads the previous pass's value`,
      });
    }
  }
  return findings;
}

/** The derived contracts, as JSON: `<workflow>::<activity>` → reads, writes, iteration variables. */
async function emitContracts(root: string): Promise<void> {
  const out: Record<string, { reads: string[]; writes: string[]; internalReads: string[]; sourceWorkflowId: string }> = {};
  for (const workflowId of readdirSync(root).filter((e) => existsSync(join(root, e, 'workflow.yaml'))).sort()) {
    const loaded = await loadWorkflowWithDiagnostics(root, workflowId);
    if (!loaded.success) continue;
    const namespace = new Set((loaded.value.workflow.variables ?? []).map((declaration) => declaration.name));
    for (const activity of loaded.value.workflow.activities ?? []) {
      const sourceWorkflowId = loaded.value.activitySourceWorkflow.get(activity.id) ?? workflowId;
      const derived = await deriveActivityContract({ activity, workflowDir: root, scopeWorkflowId: sourceWorkflowId, namespace });
      out[`${workflowId}::${activity.id}`] = {
        sourceWorkflowId,
        reads: [...derived.reads].sort(),
        writes: [...derived.writes].sort(),
        internalReads: [...derived.internalReads].sort(),
      };
    }
  }
  process.stdout.write(JSON.stringify(out, null, 2) + '\n');
}

const isMain = !!process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href;
if (isMain) {
  const root = requireWorkflowsRoot(DEFAULT_ROOT);
  if (process.argv.includes('--emit-contracts')) {
    await emitContracts(root);
  } else if (process.argv.includes('--emit-untriaged') || process.argv.includes('--emit-all')) {
    // Both only read: the first feeds a triage pass, the second prunes entries whose finding is
    // gone. Classification stays a human act.
    const all = await collectFindings(root);
    const known = new Set(loadTriageFile(TRIAGE).entries.map(findingKey));
    const emit = process.argv.includes('--emit-all') ? all : all.filter((f) => !known.has(findingKey(f)));
    process.stdout.write(JSON.stringify(emit, null, 2) + '\n');
  } else {
    const triage = loadTriageFile(TRIAGE);
    const result = applyTriage(await collectFindings(root), triage, { file: TRIAGE_REL });
    if (!wantsJson()) {
      process.stdout.write(triageSummary('activity-variables', result));
      const stamp = triageStampNote(triage.corpusSha, root);
      if (stamp) process.stdout.write(`activity-variables: ${stamp}\n`);
    }
    report('activity-variables', result.findings, {
      okMessage: 'every activity declares the variables it reads and writes, and every read has a writer on every path'
        + ` (${result.counts.harmless + result.counts['fix-later']} triaged as accepted debt)`,
      root,
      remedy: `correct the activity's variables.reads / variables.writes or the definition it describes, and classify each untriaged finding in ${TRIAGE_REL}`,
    });
  }
}
