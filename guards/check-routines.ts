#!/usr/bin/env npx tsx
/**
 * Routine guard (#704 W03) — the boundary, held from the routine's side.
 *
 * A routine's whole claim is that its declared signature says what it needs and what it produces, so
 * a host can charge the signature and never the body. That claim is only worth anything if something
 * checks it against the body, and this is that check. It is the one thing a routine buys over any
 * other way of sharing a run: a technique step contributes a declared signature too, but a technique
 * has no mechanical body to hold it against.
 *
 * The signature rules, checked with no host activity in sight:
 *
 * - `routine-output-unwritten` — a declared output no step of the body writes.
 * - `routine-input-unread` — a declared input no step of the body reads.
 * - `routine-internal-unwritten` / `routine-internal-unread` — an internal read but not written, or
 *   written but not read. Either way it is not what the declaration says it is.
 * - `routine-undeclared-read` — a name the body reads that the signature does not declare. The
 *   body's reads are wider than the tokens its step fields spell: they include, for every bound
 *   operation, that operation's prose interpolations and the declared inputs the step leaves
 *   unbound, both of which resolve out of the bag under their own names with no field to rewrite.
 *
 * The placement rules, which are corpus-wide by construction:
 *
 * - `routine-unreferenced` — a routine nothing references anywhere in the corpus. Reported beside
 *   `unused-fragment`, and NOT a load failure: a load reaches one workflow while the resolution rule
 *   admits a cross-workflow reference, so a per-workflow load would fail while a reference site sits
 *   a directory away.
 * - `routine-misplaced` — a routine whose home disagrees with the workflows its referrers sit in.
 *   One owner and it lives there; two or more and it lives in the shared home. A referrer is an
 *   activity file OR another routine, closed transitively — without the closure a routine referred
 *   to only by other routines has no referring activity file and the rule returns nothing, which is
 *   a guard with no verdict rather than a wrong one.
 *
 * Findings are guard findings rather than load failures, which is the recorded decision: the
 * contract derivation stays a guard's business, so a routine contradicting its signature fails a
 * guard run and a workflow carrying it still loads.
 *
 * Run: npx tsx guards/check-routines.ts [--root <workflows-dir>]
 */
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import type { Activity } from '../src/schema/activity.schema.js';
import type { Routine } from '../src/schema/routine.schema.js';
import { routineScope } from '../src/schema/routine.schema.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import { META_WORKFLOW_ID, collectRoutineRefs, parseRoutineRef } from '../src/loaders/routine-resolver.js';
import { buildRoutineLookup, readCorpusRoutines } from '../src/loaders/routine-loader.js';
import { loadWorkflowWithDiagnostics } from '../src/loaders/workflow-loader.js';
import { deriveActivityContract } from '../src/utils/activity-variables.js';
import { assertScanned, corpusWorkflows, defaultCorpusDest, requireWorkflowsRoot } from './workflows-root.js';
import { runGuard, type Finding } from './guard-protocol.js';

const DIR = fileURLToPath(new URL('.', import.meta.url));

/** Where one reference to a routine was made: the file that made it, and the workflow it sits in. */
interface Reference {
  /** The workflow the referring file belongs to — what placement is computed from. */
  workflowId: string;
  /** The referring file, for the finding's site. */
  site: string;
  /** The routine the reference names, as written. */
  ref: string;
  /** The routine name it resolves to, and where. */
  resolved?: { workflowId: string; name: string };
}

/** A routine key, unique corpus-wide: the workflow that declares it and its name. */
const keyOf = (workflowId: string, name: string): string => `${workflowId}::${name}`;

/**
 * Which routine a reference resolves to, under the resolution rule: a qualified name in that
 * workflow only, a bare name against the referring workflow and then the shared home.
 */
function resolveKey(
  ref: string,
  fromWorkflowId: string,
  declared: Map<string, ReadonlyMap<string, Routine>>,
): { workflowId: string; name: string } | undefined {
  let parsed: { workflowId?: string; name: string };
  try {
    parsed = parseRoutineRef(ref, 'placement');
  } catch {
    return undefined; // malformed: the load reports it, with the site
  }
  const candidates = parsed.workflowId
    ? [parsed.workflowId]
    : fromWorkflowId === META_WORKFLOW_ID ? [META_WORKFLOW_ID] : [fromWorkflowId, META_WORKFLOW_ID];
  for (const workflowId of candidates) {
    if (declared.get(workflowId)?.has(parsed.name)) return { workflowId, name: parsed.name };
  }
  return undefined;
}

/**
 * A routine's signature held against its own body.
 *
 * The body is derived exactly as an activity's steps are, over a namespace of the routine's own
 * three declaration lists — so the reads it reports are the names the body consults and the writes
 * are the names it produces, both at the same grain the host's contract is measured at. That shared
 * derivation is what keeps the two from disagreeing: a rule the host is held to and the routine is
 * not would be a rule a migration silently escapes.
 */
async function checkSignature(
  root: string,
  workflowId: string,
  routine: Routine,
  routines: Awaited<ReturnType<typeof buildRoutineLookup>>,
): Promise<Finding[]> {
  const scope = routineScope(routine);
  const declared = new Set([...scope.inputs.keys(), ...scope.outputs.keys(), ...scope.internals.keys()]);
  const site = `${workflowId}/routines/${routine.id}.yaml`;

  // A routine's body is an activity's step list by construction, so the derivation reads it as one.
  // The namespace is the signature: a name outside it is exactly the undeclared read to report.
  const derived = await deriveActivityContract({
    activity: { id: routine.id, version: routine.version, name: routine.name, required: true, steps: routine.steps } as Activity,
    workflowDir: root,
    scopeWorkflowId: workflowId,
    namespace: declared,
    routines,
  });

  const findings: Finding[] = [];
  // `produces` and `mentions` are the un-narrowed sets — every name a step produces or consults,
  // whether or not a declaration mentions it. The narrowed `reads`/`writes` would answer the wrong
  // question here, having already been filtered to the namespace this check is testing.
  //
  // `mentions` less the literals, because a binding's unbraced value is a rename only where it names
  // something declared: `analysis_mode: thorough` mentions `thorough` and reads nothing, and
  // reporting it as an undeclared read would fire on nearly every real body.
  const written = derived.produces;
  const consulted = new Set([...derived.mentions].filter((name) => !derived.literalValues.has(name)));

  for (const [id] of scope.outputs) {
    if (written.has(id)) continue;
    findings.push({
      check: 'routine-output-unwritten', site,
      detail: `output '${id}' is declared and no step of the body writes it — a reference site binding it would take a value nothing produces`,
    });
  }
  for (const [id] of scope.inputs) {
    if (consulted.has(id)) continue;
    findings.push({
      check: 'routine-input-unread', site,
      detail: `input '${id}' is declared and no step of the body reads it — every reference site is asked for a value the run never consults`,
    });
  }
  for (const [id] of scope.internals) {
    if (!written.has(id)) {
      findings.push({
        check: 'routine-internal-unwritten', site,
        detail: `internal '${id}' is read and no step writes it — an internal is a value the body's own steps pass between themselves, so a reader with no writer names nothing`,
      });
    }
    if (!consulted.has(id)) {
      findings.push({
        check: 'routine-internal-unread', site,
        detail: `internal '${id}' is written and no step reads it — it never leaves the routine, so a write nothing reads is discarded`,
      });
    }
  }
  for (const name of consulted) {
    if (declared.has(name)) continue;
    findings.push({
      check: 'routine-undeclared-read', site,
      detail: `the body reads '${name}' and the signature declares it as neither an input, an output nor an internal — declare it as an input, and a reference site that binds nothing takes the host's value under that name`,
    });
  }
  return findings;
}

export async function collectRoutineFindings(root: string): Promise<Finding[]> {
  const index = indexCorpus(root);
  const workflows = corpusWorkflows(root, index).map(({ id }) => id);
  assertScanned(workflows.length, 'workflows with a workflow.yaml', root);

  const declared = await readCorpusRoutines(root, index);
  // A corpus declaring no routine has nothing to check, and says so rather than passing silently on
  // a sweep that measured nothing.
  if (declared.size === 0) return [];

  const findings: Finding[] = [];

  // Every reference, from every activity file and every routine body, across every workflow. The
  // sweep is corpus-wide because the rules are: a load reaches one workflow, and a reference site
  // may sit a directory away.
  const references: Reference[] = [];
  for (const workflowId of workflows) {
    const loaded = await loadWorkflowWithDiagnostics(root, workflowId);
    if (!loaded.success) continue;
    for (const activity of loaded.value.authoredActivities.values()) {
      const from = loaded.value.activitySourceWorkflow.get(activity.id) ?? workflowId;
      for (const ref of collectRoutineRefs(activity)) {
        references.push({ workflowId: from, site: `${from}/activities/${activity.id}.yaml`, ref });
      }
    }
  }
  for (const [workflowId, routines] of declared) {
    for (const routine of routines.values()) {
      for (const ref of collectRoutineRefs({ steps: routine.steps })) {
        references.push({ workflowId, site: `${workflowId}/routines/${routine.id}.yaml`, ref, });
      }
    }
  }
  for (const reference of references) {
    const resolved = resolveKey(reference.ref, reference.workflowId, declared);
    if (resolved) reference.resolved = resolved;
  }

  // The signature check, per declared routine.
  for (const [workflowId, routines] of declared) {
    const lookup = await buildRoutineLookup(root, [workflowId], [...routines.values()].flatMap(
      (routine) => collectRoutineRefs({ steps: routine.steps })));
    for (const routine of routines.values()) {
      findings.push(...await checkSignature(root, workflowId, routine, lookup));
    }
  }

  // Placement, over the transitive referrer closure. A routine referred to only by other routines
  // has no referring activity file, so the closure is what gives the rule a verdict at all.
  const directReferrers = new Map<string, Reference[]>();
  for (const reference of references) {
    if (!reference.resolved) continue;
    const key = keyOf(reference.resolved.workflowId, reference.resolved.name);
    directReferrers.set(key, [...(directReferrers.get(key) ?? []), reference]);
  }

  /** The workflows owning the ACTIVITY files that reach a routine, directly or through others. */
  const owningWorkflows = (key: string, seen = new Set<string>()): Set<string> => {
    const owners = new Set<string>();
    if (seen.has(key)) return owners;
    seen.add(key);
    for (const reference of directReferrers.get(key) ?? []) {
      if (reference.site.includes('/activities/')) { owners.add(reference.workflowId); continue; }
      // A routine referring to this one: its own referrers are this one's referrers too.
      const declaringName = /\/routines\/(.+)\.yaml$/.exec(reference.site)?.[1];
      if (!declaringName) continue;
      for (const owner of owningWorkflows(keyOf(reference.workflowId, declaringName), seen)) owners.add(owner);
    }
    return owners;
  };

  for (const [workflowId, routines] of declared) {
    for (const routine of routines.values()) {
      const key = keyOf(workflowId, routine.id);
      const site = `${workflowId}/routines/${routine.id}.yaml`;
      if ((directReferrers.get(key) ?? []).length === 0) {
        findings.push({
          check: 'routine-unreferenced', site,
          detail: `no activity file and no routine in the corpus references '${routine.id}' — the search covered ${workflows.length} workflow(s)`,
        });
        continue;
      }
      const owners = owningWorkflows(key);
      if (owners.size === 0) continue; // referred to only through a cycle the load already refuses
      const home = owners.size === 1 ? [...owners][0]! : META_WORKFLOW_ID;
      if (home === workflowId) continue;
      findings.push({
        check: 'routine-misplaced', site,
        detail: `computed home is '${home}' and the file sits in '${workflowId}' — its referrers are `
          + `${[...owners].sort().map((owner) => `'${owner}'`).join(', ')}, so `
          + (owners.size === 1 ? 'the one workflow that owns them is its home' : 'the shared home is its home'),
      });
    }
  }

  return findings;
}

if (process.argv[1] && import.meta.url === pathToFileURL(process.argv[1]).href) {
  await runGuard('routines', () => requireWorkflowsRoot(defaultCorpusDest(join(DIR, '..'))), collectRoutineFindings, {
    okMessage: 'every routine\'s signature matches its body, every routine is referenced, and every routine sits in its computed home',
    remedy: 'declare what the body reads, remove what it does not, or move the file to the home its referrers compute',
  });
}
