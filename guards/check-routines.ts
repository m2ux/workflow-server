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
 * - `routine-operation-unbound` — an input declared `kind: technique` that no step of the body binds.
 *   It stands in a technique position rather than being read as a value, so an unread-input rule
 *   asking the derivation about it would report every one of them.
 * - `routine-reads-argument-output` — a signature carrying a value the bound operation produces. A
 *   run takes its argument's operation and not that operation's values, which differ by argument, so
 *   a declaration naming one holds at the site that supplied it and nowhere else.
 *
 * A routine whose body binds an operation by argument names a parameter where an operation reference
 * belongs, so it has no signature of its own and the signature rules run ONCE PER REFERENCE SITE,
 * against the operation that site supplies. A routine binding no operation by argument keeps the
 * once-per-routine path. A routine with an operation parameter and no reference site is reported as
 * unreferenced, whose remedy — refer to it or delete it — settles the contract question either way.
 *
 * - `routine-signature-unheld` — a routine that HAS reference sites and not one of them supplies an
 *   operation this can read. Every site is skipped, so nothing is derived and no signature rule can
 *   fire; saying so is what keeps a routine nothing checked from reading as a routine nothing found
 *   fault with.
 *
 * The placement rules, which are corpus-wide by construction:
 *
 * - `routine-unreferenced` — a routine nothing references anywhere in the corpus. Reported here and
 *   NOT a load failure: a load reaches one workflow while the resolution rule admits a
 *   cross-workflow reference, so a per-workflow load would fail while a reference site sits a
 *   directory away.
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
import { existsSync, readFileSync, readdirSync } from 'node:fs';
import { join } from 'node:path';
import { fileURLToPath, pathToFileURL } from 'node:url';
import { parseDefinition } from '../src/utils/serialization.js';
import type { Activity, Step } from '../src/schema/activity.schema.js';
import type { Routine } from '../src/schema/routine.schema.js';
import { isOperationInput, operationInputs, routineScope } from '../src/schema/routine.schema.js';
import { indexCorpus } from '../src/loaders/corpus-index.js';
import {
  META_WORKFLOW_ID, type OperationMap, bodyWithOperations, collectRoutineRefs, collectRoutineSteps, parseRoutineRef,
} from '../src/loaders/routine-resolver.js';
import { ROUTINES_DIR, buildRoutineLookup, readCorpusRoutines } from '../src/loaders/routine-loader.js';
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
  /** The arguments the site binds, which an operation parameter's contract is derived against. */
  args: Record<string, string | number | boolean> | undefined;
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
  /** The bodies to derive: one per reference site where the routine binds an operation by argument. */
  bodies: ReadonlyArray<{ operations: OperationMap; site: string }>,
): Promise<Finding[]> {
  const scope = routineScope(routine);
  const declared = new Set([...scope.inputs.keys(), ...scope.outputs.keys(), ...scope.internals.keys()]);
  const site = `${workflowId}/routines/${routine.id}.yaml`;
  const findings: Finding[] = [];

  // A routine's body is an activity's step list by construction, so the derivation reads it as one.
  // The namespace is the signature: a name outside it is exactly the undeclared read to report.
  //
  // `produces` and `mentions` are the un-narrowed sets — every name a step produces or consults,
  // whether or not a declaration mentions it. The narrowed `reads`/`writes` would answer the wrong
  // question here, having already been filtered to the namespace this check is testing.
  //
  // `mentions` less the literals, because a binding's unbraced value is a rename only where it names
  // something declared: `analysis_mode: thorough` mentions `thorough` and reads nothing, and
  // reporting it as an undeclared read would fire on nearly every real body.
  const written = new Set<string>();
  const consulted = new Set(bodyUses(routine));
  for (const body of bodies) {
    const derived = await deriveActivityContract({
      activity: {
        id: routine.id, version: routine.version, name: routine.name, required: true,
        steps: bodyWithOperations(routine.steps, body.operations),
      } as Activity,
      workflowDir: root,
      scopeWorkflowId: workflowId,
      namespace: declared,
      routines,
    });
    for (const name of derived.produces) written.add(name);
    for (const name of derived.mentions) if (!derived.literalValues.has(name)) consulted.add(name);

    // An undeclared read is something the body DOES, so it is reported where it happens. One site's
    // operation reading a name is a gap in the signature whether or not another site's operation
    // reads it.
    for (const name of derived.mentions) {
      if (declared.has(name) || derived.literalValues.has(name)) continue;
      findings.push({
        check: 'routine-undeclared-read', site: body.site,
        detail: `the body reads '${name}' and the signature declares it as neither an input, an output nor an internal — declare it as an input, and a reference site that binds nothing takes the host's value under that name`,
      });
    }

    // A value the ARGUMENT produces cannot be carried onward, because which values those are follows
    // from the argument. A name the body passes on has to be one the run owns at every site, and a
    // declaration naming one of the argument's outputs is a signature that holds only at this one.
    for (const name of await argumentProductions(root, workflowId, routine, body.operations, routines)) {
      if (!declared.has(name)) continue;
      findings.push({
        check: 'routine-reads-argument-output', site: body.site,
        detail: `'${name}' is an output of the operation this site binds and the signature declares it — a run takes its argument's operation and not that operation's values, which differ by argument, so nothing downstream of the run can be promised one`,
      });
    }
  }

  // A declaration rule asks whether the body ever honours what the signature promises, so it is
  // graded over every body and reported against the declaration. An input one site's operation
  // consults and another's does not is still an input the run consults.
  for (const [id] of scope.outputs) {
    if (written.has(id)) continue;
    findings.push({
      check: 'routine-output-unwritten', site,
      detail: `output '${id}' is declared and no step of the body writes it — a reference site binding it would take a value nothing produces`,
    });
  }
  for (const [id, input] of scope.inputs) {
    if (isOperationInput(input)) {
      if (consulted.has(id)) continue;
      findings.push({
        check: 'routine-operation-unbound', site,
        detail: `input '${id}' declares 'kind: technique' and no step of the body binds it — every reference site is asked for an operation the run never invokes`,
      });
      continue;
    }
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
  return findings;
}

/**
 * What the operation one site binds produces, derived from the parameterised steps alone and with
 * their actions dropped.
 *
 * Taking the whole body's productions would answer a different question, and so would keeping the
 * actions: a step's actions are the RUN's writes, authored beside the binding and the same whichever
 * operation the site supplies. Only what the operation itself declares varies by argument, and only
 * that is what a signature may not carry.
 */
async function argumentProductions(
  root: string,
  workflowId: string,
  routine: Routine,
  operations: OperationMap,
  routines: Awaited<ReturnType<typeof buildRoutineLookup>>,
): Promise<Set<string>> {
  if (operations.size === 0) return new Set();
  const parameterised: Step[] = [];
  const collect = (authored: readonly Step[], substituted: readonly Step[]): void => {
    authored.forEach((step, index) => {
      const mirror = substituted[index]!;
      if (step.kind === 'technique') {
        const reference = typeof step.technique === 'string' ? step.technique : step.technique.name;
        if (operations.has(reference)) parameterised.push({ ...mirror, actions: undefined } as Step);
      } else if (step.kind === 'loop') {
        collect(step.steps as Step[], (mirror as Step & { kind: 'loop' }).steps as Step[]);
      }
    });
  };
  collect(routine.steps, bodyWithOperations(routine.steps, operations));
  if (parameterised.length === 0) return new Set();

  const derived = await deriveActivityContract({
    activity: {
      id: routine.id, version: routine.version, name: routine.name, required: true, steps: parameterised,
    } as Activity,
    workflowDir: root,
    scopeWorkflowId: workflowId,
    namespace: new Set<string>(),
    routines,
  });
  return derived.produces;
}

/**
 * The names the routine as AUTHORED puts in positions the derivation cannot report.
 *
 * Two of them, and both are gone by the time a derived body is read. An operation parameter stands
 * in a technique position, which substitution has replaced with a concrete reference. And a
 * comparison's right-hand operand is a value by the dialect's grammar, so a parameter standing there
 * is never a bag read however plainly the body consults it.
 */
function bodyUses(routine: Routine): Set<string> {
  const used = new Set<string>();
  const operand = /(?:==|!=|>=|<=|>|<)\s*([A-Za-z_][A-Za-z0-9_]*)(?![A-Za-z0-9_.])/g;
  const visit = (steps: readonly Step[]): void => {
    for (const step of steps) {
      if (step.kind === 'technique') {
        used.add(typeof step.technique === 'string' ? step.technique : step.technique.name);
      }
      if (typeof step.when === 'string') {
        for (const match of step.when.matchAll(operand)) used.add(match[1]!);
      }
      if (step.kind === 'loop') visit(step.steps as Step[]);
    }
  };
  visit(routine.steps);
  return used;
}

/** One activity as authored: where it sits, and the steps a reference can be found among. */
interface AuthoredActivity {
  /** Path from the corpus root, so a finding names a file that exists on disk. */
  site: string;
  steps: Step[] | undefined;
}

/** Every `.yaml` under a directory, at any depth, in a stable order. */
function definitionsUnder(dir: string, prefix = ''): { rel: string; path: string }[] {
  return readdirSync(dir, { withFileTypes: true })
    .sort((a, b) => a.name.localeCompare(b.name))
    .flatMap((entry) => {
      const path = join(dir, entry.name);
      const rel = prefix ? `${prefix}/${entry.name}` : entry.name;
      if (entry.isDirectory()) return definitionsUnder(path, rel);
      return entry.name.endsWith('.yaml') ? [{ rel, path }] : [];
    });
}

/**
 * Every activity a workflow authors, read from its files.
 *
 * The directory is the one the manifest names and `activities` otherwise, matching the loader's
 * rule. A manifest may also carry an activity inline, which no file holds, so those are read from
 * the manifest itself. A file that does not parse contributes no reference and is not reported
 * here: an unreadable activity is a louder failure than this guard's subject, and the guards that
 * own it name it already.
 *
 * Definitions sit at any depth under that directory: `meta/activities/patterns/` holds a library of
 * activities another workflow borrows by path rather than ones meta's own graph reaches. A borrowed
 * activity carries its references wherever it runs, so a routine it names has a referrer and a home
 * to compute from — and a walk that stopped at the top level would report the routine as referred to
 * by nothing.
 */
function authoredActivities(workflowId: string, dir: string): AuthoredActivity[] {
  const out: AuthoredActivity[] = [];
  let manifest: Record<string, unknown> = {};
  try {
    manifest = (parseDefinition(readFileSync(join(dir, 'workflow.yaml'), 'utf-8')) ?? {}) as Record<string, unknown>;
  } catch { /* a manifest that does not parse is the load's finding, not this guard's */ }

  for (const entry of Array.isArray(manifest['activities']) ? manifest['activities'] : []) {
    // A string entry is a path to a file, read below from whichever workflow directory holds it.
    if (entry && typeof entry === 'object') {
      const inline = entry as { id?: unknown; steps?: unknown };
      const id = typeof inline.id === 'string' ? inline.id : 'inline';
      out.push({ site: `${workflowId}/workflow.yaml#${id}`, steps: inline.steps as Step[] | undefined });
    }
  }

  const activitiesDir = typeof manifest['activitiesDir'] === 'string' ? manifest['activitiesDir'] : 'activities';
  const dirPath = join(dir, activitiesDir);
  if (!existsSync(dirPath)) return out;
  for (const { rel, path } of definitionsUnder(dirPath)) {
    try {
      const doc = parseDefinition(readFileSync(path, 'utf-8')) as { steps?: Step[] } | null;
      out.push({ site: `${workflowId}/${activitiesDir}/${rel}`, steps: doc?.steps });
    } catch { continue; }
  }
  return out;
}

/**
 * The operations one reference site supplies, or undefined where it supplies something the load
 * refuses — a missing argument, or one carrying a token that has no value when definitions load.
 * Reporting those here would name the same defect the load already names, with less of the site.
 */
function siteOperations(
  routine: Routine,
  parameters: string[],
  args: Record<string, string | number | boolean> | undefined,
): Map<string, string> | undefined {
  const operations = new Map<string, string>();
  const declared = routineScope(routine).inputs;
  for (const id of parameters) {
    const argument = args?.[id] ?? declared.get(id)?.default;
    if (typeof argument !== 'string' || argument.includes('{')) return undefined;
    operations.set(id, argument);
  }
  return operations;
}

export async function collectRoutineFindings(root: string): Promise<Finding[]> {
  const index = indexCorpus(root);
  const corpus = corpusWorkflows(root, index);
  const workflows = corpus.map(({ id }) => id);
  assertScanned(workflows.length, 'workflows with a workflow.yaml', root);

  const { byWorkflow: declared, errors } = await readCorpusRoutines(root, index);

  const findings: Finding[] = errors.map(({ workflowId, error }) => ({
    check: 'routine-unreadable',
    site: `${workflowId}/${ROUTINES_DIR}/`,
    detail: error,
  }));
  // A corpus declaring no readable routine has nothing further to check. The unreadable ones are
  // already reported above, so this is not a silent pass over a sweep that measured nothing.
  if (declared.size === 0) return findings;

  // Every reference, from every activity file and every routine body, across every workflow. The
  // sweep is corpus-wide because the rules are: a reference site may sit a directory away.
  //
  // Read from disk rather than through the loader. A reference is a field an activity file carries,
  // so reading the file answers for it, and a workflow that fails to load is then a workflow whose
  // references are still counted — where a load-based sweep contributes none of them and a routine
  // only that workflow refers to presents as a routine nothing refers to. An activity's directory is
  // also the workflow it was authored in, which is the attribution a borrowed activity needs and
  // costs nothing to read.
  const references: Reference[] = [];
  for (const { id: workflowId, dir } of corpus) {
    for (const { site, steps } of authoredActivities(workflowId, dir)) {
      for (const step of collectRoutineSteps({ steps })) {
        references.push({ workflowId, site, ref: step.routine, args: step.with });
      }
    }
  }
  for (const [workflowId, routines] of declared) {
    for (const routine of routines.values()) {
      for (const step of collectRoutineSteps({ steps: routine.steps })) {
        references.push({
          workflowId, site: `${workflowId}/routines/${routine.id}.yaml`, ref: step.routine, args: step.with,
        });
      }
    }
  }
  for (const reference of references) {
    const resolved = resolveKey(reference.ref, reference.workflowId, declared);
    if (resolved) reference.resolved = resolved;
  }

  const sitesByRoutine = new Map<string, Reference[]>();
  for (const reference of references) {
    if (!reference.resolved) continue;
    const key = keyOf(reference.resolved.workflowId, reference.resolved.name);
    sitesByRoutine.set(key, [...(sitesByRoutine.get(key) ?? []), reference]);
  }

  // The signature check. Once per routine, and once per REFERENCE SITE for a routine whose body binds
  // an operation by argument: such a body names a parameter where an operation reference belongs, so
  // it has no signature of its own and there is nothing to derive until a site says which operation.
  // A routine no site refers to is reported as unreferenced below, which is the same remedy.
  for (const [workflowId, routines] of declared) {
    const lookup = await buildRoutineLookup(root, [workflowId], [...routines.values()].flatMap(
      (routine) => collectRoutineRefs({ steps: routine.steps })));
    for (const routine of routines.values()) {
      const parameters = operationInputs(routine);
      const declaration = `${workflowId}/routines/${routine.id}.yaml`;
      if (parameters.length === 0) {
        findings.push(...await checkSignature(root, workflowId, routine, lookup, [
          { operations: new Map(), site: declaration },
        ]));
        continue;
      }
      const sites = sitesByRoutine.get(keyOf(workflowId, routine.id)) ?? [];
      const bodies = [];
      for (const reference of sites) {
        const operations = siteOperations(routine, parameters, reference.args);
        if (operations === undefined) continue; // an argument the load refuses; the load names it
        bodies.push({ operations, site: `${declaration} at ${reference.site}` });
      }
      if (bodies.length > 0) {
        findings.push(...await checkSignature(root, workflowId, routine, lookup, bodies));
        continue;
      }
      // Sites exist and not one of them supplies an operation this can derive against, so the
      // signature went unheld. Saying so is the difference between a guard with no verdict and a
      // guard reporting that a routine is sound.
      if (sites.length > 0) {
        findings.push({
          check: 'routine-signature-unheld', site: declaration,
          detail: `no reference site supplies an operation argument this can read — ${sites.length} site(s) refer to '${routine.id}' and each binds `
            + `${parameters.map((id) => `'${id}'`).join(', ')} to something that resolves at run time or not at all, so the signature was not held against the body`,
        });
      }
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
