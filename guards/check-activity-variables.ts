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
 * Hard zero, no ledger: every finding named a definition defect and each was fixed in the corpus.
 *
 *   npx tsx guards/check-activity-variables.ts [--root <workflows-dir>] [--json]
 *   npx tsx guards/check-activity-variables.ts --emit-contracts   # derived contracts, as JSON
 */
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import { fanGroups, loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { AMBIENT_CONTEXT_IDS, IDENTIFIER_PATTERN } from '../src/utils/binding-provenance.js';
import {
  activityGraph,
  bagName,
  containerMember,
  readCarriesIndex,
  deriveActivityContract,
  orchestratorInputs,
  unreachableReads,
  type DerivedContract,
} from '../src/utils/activity-variables.js';
import { branchKey, instanceFans } from '../src/schema/workflow.schema.js';
import type { VariableDefinition } from '../src/schema/variable.schema.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { assertScanned, corpusWorkflows, requireWorkflowsRoot, workflowSubdir, defaultCorpusDest } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));
const DEFAULT_ROOT = defaultCorpusDest(join(DIR, '..'));

/**
 * Names that already differ between the branches of one fan, so an artifact filename keyed on one
 * is a filename per instance without also carrying the unit.
 *
 * A branch runs under an identity distinct from its siblings' — the delivery ledger and the batch
 * bound are keyed on it, so the engine cannot let two branches share one. A name interpolating it
 * is therefore already discriminated, and demanding the unit as well would demand a second
 * discriminator for a name that has one.
 */
const FAN_UNIT_IDENTITIES: ReadonlySet<string> = new Set(['agent_id']);

/** The declared contract of one activity, keyed for reporting. */
interface ActivityRecord {
  id: string;
  /** The workflow the activity file was authored in — differs when the graph includes it. */
  sourceWorkflowId: string;
  declaredReads: Set<string>;
  declaredWrites: Map<string, VariableDefinition>;
  /**
   * What the guard measures the productions against: the declared names for an activity no graph
   * fans, and the container plus one entry per member for one a graph does.
   */
  writeSet: Set<string>;
  /** The key its outputs land under, present only where the graph fans it. */
  branchKey?: string;
  /** The collection the graph reads to open its fan — a synthetic read attributed to this branch. */
  fanCollection?: string;
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
  const index = indexCorpus(root);
  // What the orchestrator consumes out of the same bag, whichever workflow is running.
  const engineInputs = await orchestratorInputs(root);
  const workflows = corpusWorkflows(root, index).map(({ id }) => id);
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
    const rawWorkflowYaml = readFileSync(workflowSubdir(index, workflowId, 'workflow.yaml')!, 'utf-8');
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

    // Declared anywhere in this workflow, on either side of any contract. `namespace` above is not
    // this set: it omits declared writes, deliberately, so an included activity's read is measured.
    const declaredAnywhere = new Set(namespace);
    for (const activity of workflow.activities ?? []) {
      for (const declaration of activity.variables?.writes ?? []) declaredAnywhere.add(declaration.name);
    }

    // What the graph fans, and what each fan supplies its branch. A fan's per-instance parameter is
    // ambient to the activity the fan runs and unwritten everywhere else, so a stray reader is
    // reported natively; declaring it on the workflow file would make it workflow-owned, which is
    // both skipped by the unwritten-read check and seeded into the availability lattice.
    const fans = fanGroups(workflow);
    const fannedActivityIds = new Set(fans.flatMap((fan) => fan.branches));
    const fanParameterOf = new Map<string, string>();
    /** Branch id → the head of the collection expression the GRAPH reads to open its fan. */
    const fanCollectionOf = new Map<string, string>();
    for (const fan of fans) {
      for (const member of instanceFans(fan.destination)) {
        fanParameterOf.set(member.activity, member.variable);
        fanCollectionOf.set(member.activity, member.over.split('.')[0]!);
      }
    }

    const records: ActivityRecord[] = [];
    for (const activity of workflow.activities ?? []) {
      const sourceWorkflowId = activitySourceWorkflow.get(activity.id) ?? workflowId;
      const key = fannedActivityIds.has(activity.id) ? branchKey(activity.id) : undefined;
      const derived = await deriveActivityContract({
        activity, workflowDir: root, scopeWorkflowId: sourceWorkflowId, namespace,
        ...(key !== undefined ? { branchKey: key } : {}),
      });
      const declaredReads = new Set(activity.variables?.reads ?? []);
      const declaredWrites = new Map((activity.variables?.writes ?? []).map((w) => [w.name, w]));
      // The fan's collection acquires a reader that is not an activity — the graph — so its head
      // enters both the declared-read and the derived-read sets of the BRANCH, never the source.
      // The lattice computes an activity's outgoing set as its incoming set plus its own writes and
      // the finding tests against the INCOMING set, so attributing it to a source that writes the
      // collection itself reports falsely on the flagship shape. Attributed to the branch, the
      // claim is the wanted one: the collection is available on entry to the branch.
      const collection = fanCollectionOf.get(activity.id);
      if (collection !== undefined) {
        declaredReads.add(collection);
        derived.reads.add(collection);
        derived.consumes.add(collection);
        // Deliberately NOT a path read. A fan consumes its collection whole, which is the access a
        // container exists for, so a destination whose `over` names an earlier fan's container is
        // legal and reports nothing — while an authored bare read of a container, which does reach
        // `pathReads` from its own step, is still reported. The exemption is keyed on this one read.
      }
      records.push({
        id: activity.id,
        sourceWorkflowId,
        declaredReads,
        declaredWrites,
        // The declared-write set the guard measures against: the container plus one entry per
        // member, index-free because the width is a run-time value a static check cannot enumerate.
        writeSet: key === undefined
          ? new Set(declaredWrites.keys())
          : new Set([key, ...[...declaredWrites.keys()].map((name) => `${key}.${name}`)]),
        ...(key !== undefined ? { branchKey: key } : {}),
        ...(collection !== undefined ? { fanCollection: collection } : {}),
        derived,
      });
    }

    /** Branch key → the activity it belongs to, for resolving a member read to its producer. */
    const branchKeyOwner = new Map<string, ActivityRecord>();
    for (const record of records) {
      if (record.branchKey !== undefined) branchKeyOwner.set(record.branchKey, record);
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
      // A fanned activity's productions land re-keyed, so they are measured at member grain: the
      // container itself is contributed by the graph and needs no declaration of its own.
      const produced = record.branchKey === undefined ? record.derived.writes : record.derived.memberWrites;
      for (const name of produced) {
        if (!record.writeSet.has(name)) {
          findings.push({
            check: 'undeclared-use', site: site(record),
            detail: `writes '${name}' without declaring it under variables.writes`,
          });
        }
      }
      // A value that crosses an activity boundary with no contract at either end. Every other
      // family here is measured against the declared namespace, and the namespace is assembled
      // from the declarations — so a name nobody declares is invisible on BOTH sides: the
      // production drops out of `writes` and the consultation drops out of `reads`, and the two
      // silences look exactly like a name that is simply not used. This reads the wider `produces`
      // and `mentions` to see them. A production nothing consults elsewhere is not reported: a
      // utility operation's confirmation value legitimately dies with its step.
      for (const name of record.derived.produces) {
        if (AMBIENT_CONTEXT_IDS.has(name)) continue;
        if (declaredAnywhere.has(name)) continue;
        if (record.derived.persistedProductions.has(name)) continue; // destination is a file
        const consumers = records
          .filter((other) => other.id !== record.id && other.derived.mentions.has(name))
          .map((other) => other.id);
        if (consumers.length === 0) continue;
        findings.push({
          check: 'undeclared-crossing', site: site(record),
          detail: `produces '${name}', which ${consumers.join(', ')} consults, and no contract in this workflow declares it — the value crosses an activity boundary with nothing accounting for it on either side`,
        });
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
        const landed = record.branchKey === undefined
          ? record.derived.writes.has(name)
          : record.derived.memberWrites.has(`${record.branchKey}.${name}`);
        if (!landed) {
          findings.push({
            check: 'unused-declaration', site: site(record),
            detail: `declares a write of '${name}' that no step produces`,
          });
        }
      }
    }

    const writersOf = new Map<string, string[]>();
    for (const record of records) {
      // Re-keyed for a fanned activity, so the bare member is written by nothing and any surviving
      // bare read of it is reported natively as an unwritten read.
      for (const name of record.writeSet) {
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

    // Member grain on the read side: which members of which container anything in this workflow
    // actually gathers, and which references address a member at all.
    const gatheredMembers = new Set<string>();
    /**
     * Containers something reads whole. A meeting point does not author indices — it hands the
     * container to the ordered gather with the fan's own collection as the expected ids — so a
     * whole-container read gathers every member the branch produces.
     */
    const gatheredWhole = new Set<string>();
    for (const record of records) {
      for (const name of [...record.declaredReads, ...record.derived.consumes]) {
        if (branchKeyOwner.has(name)) gatheredWhole.add(name);
      }
      for (const reference of record.derived.pathReads) {
        const key = bagName(reference);
        if (!branchKeyOwner.has(key)) continue;
        const member = containerMember(reference, key);
        if (member !== undefined && member !== '') gatheredMembers.add(`${key}.${bagName(member)}`);
      }
    }

    for (const record of records) {
      const ownParameter = fanParameterOf.get(record.id);
      for (const name of record.declaredReads) {
        // The parameter is ambient to the activity the fan runs and unwritten everywhere else.
        if (name === ownParameter) continue;
        if (owned.has(name) || writersOf.has(name) || AMBIENT_CONTEXT_IDS.has(name)) continue;
        const suppliedTo = [...fanParameterOf].find(([, parameter]) => parameter === name)?.[0];
        findings.push({
          check: 'unwritten-read', site: site(record),
          detail: suppliedTo !== undefined
            ? `reads '${name}', which the graph supplies only to '${suppliedTo}' as the fan's per-instance parameter — it is a read-only projection on that activity's own delivery, available nowhere else`
            : `reads '${name}', which no activity in this workflow writes and the workflow file does not own`,
        });
      }

      // A read into a branch container, at member grain. With a uniform index a container-and-member
      // read with no index addresses nothing and the flat walker would never find it, so it is
      // reported by the instance form it should have carried.
      for (const reference of record.derived.pathReads) {
        const key = bagName(reference);
        const owner = branchKeyOwner.get(key);
        if (owner === undefined || reference === key) continue;
        if (!readCarriesIndex(reference, key)) {
          findings.push({
            check: 'unwritten-read', site: site(record),
            detail: `reads '${reference}', which omits the slot index — a branch's outputs land at '${key}.<instance>.result.<member>', so a container-and-member read with no index addresses nothing`,
          });
          continue;
        }
        const member = containerMember(reference, key)!;
        if (member === '' || owner.declaredWrites.has(bagName(member))) continue;
        findings.push({
          check: 'unwritten-read', site: site(record),
          detail: `reads '${reference}', which '${owner.id}' does not produce; it lands ${[...owner.declaredWrites.keys()].sort().join(', ')}`,
        });
      }

      for (const name of record.declaredWrites.keys()) {
        if (record.branchKey !== undefined) {
          // A member is gathered somewhere, or written to a file, or consumed by this activity's
          // own later steps. Without the self-consumed exemption the family fires dozens of times
          // on one correct fan, most of a branch's declared writes being working values.
          const entry = `${record.branchKey}.${name}`;
          if (gatheredWhole.has(record.branchKey) || gatheredMembers.has(entry)) continue;
          if (record.derived.internalReads.has(name)) continue;
          if (record.derived.artifactWrites.has(entry)) continue;
          if (proseReads.has(name) || engineInputs.has(name)) continue;
          findings.push({
            check: 'unread-write', site: site(record),
            detail: `writes '${entry}', which nothing in this workflow gathers`,
          });
          continue;
        }
        if (readersOf.has(name) || proseReads.has(name) || record.derived.artifactWrites.has(name)) continue;
        if (engineInputs.has(name)) continue;
        findings.push({
          check: 'unread-write', site: site(record),
          detail: `writes '${name}', which nothing in this workflow reads`,
        });
      }
    }

    // The collision family: the one new check on the safety floor, and the one that guards against
    // data loss rather than definition hygiene. The artifact writer is keyed on a bare filename
    // with a find-or-update and a re-scan mint guard, so two concurrent writers both re-scan, both
    // create, and the run thereafter resolves the lowest-numbered instance for the rest of the
    // walk. Literal names only: a template fails closed on the distinct arm, and the instance arm
    // decides the template case rather than failing open on it.
    const byId = new Map(records.map((record) => [record.id, record]));
    const literalNames = (record: ActivityRecord | undefined): string[] =>
      [...(record?.derived.artifactNames ?? [])].filter((name) => !name.includes('{'));

    for (const fan of fans) {
      const at = `'${fan.source}.${fan.exit}'`;

      // Distinct arm: two members of one fan whose composed signatures resolve one filename. Two
      // activities running together resolve one filename to one file.
      const writersByName = new Map<string, string[]>();
      for (const branch of fan.branches) {
        for (const name of literalNames(byId.get(branch))) {
          const writers = writersByName.get(name) ?? [];
          writers.push(branch);
          writersByName.set(name, writers);
        }
      }
      for (const [name, writers] of writersByName) {
        if (writers.length < 2) continue;
        findings.push({
          check: 'fan-artifact-collision', site: `${workflowId} :: ${fan.source}.${fan.exit}`,
          detail: `The fan at ${at} has ${writers.map((w) => `'${w}'`).join(' and ')} both writing artifact '${name}'. Two activities running together resolve one filename to one file, so one branch's writes land in the other's document.`,
        });
      }

      // Instance arm: every artifact name on the fanned activity's composed signatures resolves to
      // a filename of its own for each instance, or every instance resolves one filename.
      //
      // Two tokens make it its own. The fan's parameter is the obvious one — the unit itself. The
      // branch's identity is the other: each branch runs under an identity distinct from its
      // siblings' (dispatch-fan::one-identity-per-branch), so a name keyed on it is already one per
      // instance, and requiring the unit as well would be requiring a second discriminator for a
      // name that has one.
      const perBranch = new Set([...FAN_UNIT_IDENTITIES]);
      for (const member of instanceFans(fan.destination)) {
        perBranch.add(member.variable);
        const record = byId.get(member.activity);
        for (const name of record?.derived.artifactNames ?? []) {
          const carriesUnit = [...name.matchAll(/\{([A-Za-z0-9_.]+)\}/g)]
            .some((match) => perBranch.has(bagName(match[1]!)));
          if (carriesUnit) continue;
          findings.push({
            check: 'fan-artifact-collision', site: site(record!),
            detail: `Activity '${member.activity}' is fanned by ${at} over '${member.over}' and writes artifact '${name}'. Every instance resolves that one filename to one file, so either the name carries the unit — '{${member.variable}}-${name}' — or the branch declares no artifact and the activity the fan converges on writes the document.`,
          });
        }
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
      // From the loader's single derivation, so the grouping keeps one home and the graph type
      // stays a flat reachability map.
      fans,
      // The parameter is available to the activity the fan runs and to no other, so it is seeded
      // per activity rather than into the global ambient set — a flat seed would satisfy a read of
      // it anywhere in the workflow.
      ambientPerActivity: fanParameterOf,
      initialActivity: workflow.initialActivity,
      availableAtEntry,
      reads: new Map(records.map((record) => [record.id, record.declaredReads])),
      // A routing read is only checked where the contract declares it too, so a stale declaration
      // cannot conjure a reachability finding out of nothing.
      routingReads: new Map(records.map((record) => [
        record.id,
        new Set([...record.derived.routingReads].filter((name) => record.declaredReads.has(name))),
      ])),
      // The re-keyed set, so a branch makes its CONTAINER available at the meeting point: keyed on
      // the bare members the container would be written by nothing and every meeting point's read
      // of it would be unreachable.
      writes: new Map(records.map((record) => [record.id, record.writeSet])),
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
  const index = indexCorpus(root);
  for (const { id: workflowId } of corpusWorkflows(root, index)) {
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
  if (process.argv.includes('--emit-contracts')) {
    await emitContracts(requireWorkflowsRoot(DEFAULT_ROOT));
  } else {
    await runGuard('activity-variables', () => requireWorkflowsRoot(DEFAULT_ROOT), collectFindings, {
      okMessage: 'every activity declares the variables it reads and writes, every write has a reader, and every read has a writer on every path',
      remedy: 'correct the activity\'s variables.reads / variables.writes, or the definition the contract describes',
    });
  }
}
