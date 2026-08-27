/**
 * Activity variable contracts (#493).
 *
 * An activity declares the session variables it reads and the variables it writes, under
 * `variables:` in its own file. Reads are names; writes are full declarations (type, description,
 * optional default), because a write is where the variable is owned. Direction is what a checker
 * can act on: a read with no writer, a write with no reader, and a read that no path reaches a
 * write for are each mechanical once the two lists exist.
 *
 * Including an activity in a workflow's graph contributes its write declarations to that
 * workflow's variable set — one flat namespace, so two activities naming one variable mean one
 * variable and a later activity reads what an earlier one produced. Two declarations of one name
 * that disagree on type or default are a contradiction and fail the load.
 *
 * This module holds three things the server and the guards share, so they cannot drift:
 *
 *   - `mergeActivityVariables` — the contribution rule and its contradiction check.
 *   - `deriveActivityContract` — what an activity ACTUALLY reads and writes, computed from its
 *     steps under the same name-match convention `binding-provenance` resolves a step's inputs
 *     with. The declared contract is checked against this, so a stale declaration is a finding
 *     rather than a silent lie.
 *   - `activityGraph` / `unreachableReads` — the graph walk the reachability check runs over.
 */
import { existsSync, readdirSync, readFileSync } from 'node:fs';
import { join } from 'node:path';
import type { Activity, Step, TechniqueBinding } from '../schema/activity.schema.js';
import { flattenActivitySteps, techniqueName } from '../schema/activity.schema.js';
import type { Workflow } from '../schema/workflow.schema.js';
import type { ActivityVariables, VariableDefinition } from '../schema/variable.schema.js';
import type { Condition } from '../schema/condition.schema.js';
import { composeActivityTechnique } from '../loaders/technique-loader.js';
import { parseDefinition } from './serialization.js';
import { IDENTIFIER_PATTERN, OPTIONAL_INPUT_RE } from './binding-provenance.js';
import { expressionPaths } from '../schema/when-expression.js';
import { logWarn } from '../logging.js';

/* --------------------------------- declarations --------------------------------- */

/** One name declared twice with disagreeing type or default. */
export interface VariableContradiction {
  name: string;
  detail: string;
}

/** A declaration and where it came from — a workflow file, or the activity that writes it. */
interface DeclarationSite {
  declaration: VariableDefinition;
  /** `workflow.yaml`, or the id of the declaring activity. */
  source: string;
}

const WORKFLOW_SOURCE = 'workflow.yaml';

/** Whether two declarations of one name agree on the facts that make them the same variable. */
function disagreement(a: VariableDefinition, b: VariableDefinition): string | null {
  if (a.type !== b.type) return `declared '${a.type}' and '${b.type}'`;
  const left = JSON.stringify(a.defaultValue ?? null);
  const right = JSON.stringify(b.defaultValue ?? null);
  if (left !== right) return `defaults ${left} and ${right}`;
  const leftValues = JSON.stringify(a.values ?? null);
  const rightValues = JSON.stringify(b.values ?? null);
  if (leftValues !== rightValues) return `value sets ${leftValues} and ${rightValues}`;
  return null;
}

/** What the merge needs of an activity: which one it is, and what it declares. */
export interface VariableContributor {
  id: string;
  variables?: ActivityVariables | undefined;
}

export interface MergedVariables {
  /** The workflow's variable set: what the file owns, plus what its activities contribute. */
  variables: VariableDefinition[];
  /** Name → the sources that declare it, in contribution order. */
  sources: Map<string, string[]>;
  contradictions: VariableContradiction[];
}

/**
 * The variable set a session runs with: the workflow file's own declarations plus every write
 * declaration the activities in its graph contribute. Declaration is contribution — there is no
 * separate registration step, and a name declared by two activities is one variable. A pair that
 * disagrees on type or default is returned as a contradiction for the caller to fail on.
 */
export function mergeActivityVariables(
  own: VariableDefinition[] | undefined,
  activities: readonly VariableContributor[] | undefined,
): MergedVariables {
  const merged = new Map<string, DeclarationSite>();
  const sources = new Map<string, string[]>();
  const contradictions: VariableContradiction[] = [];

  const contribute = (declaration: VariableDefinition, source: string): void => {
    const seen = merged.get(declaration.name);
    if (!seen) {
      merged.set(declaration.name, { declaration, source });
      sources.set(declaration.name, [source]);
      return;
    }
    sources.get(declaration.name)!.push(source);
    const conflict = disagreement(seen.declaration, declaration);
    if (conflict) {
      contradictions.push({
        name: declaration.name,
        detail: `'${declaration.name}': ${seen.source} and ${source} ${conflict}`,
      });
    }
  };

  for (const declaration of own ?? []) contribute(declaration, WORKFLOW_SOURCE);
  for (const activity of activities ?? []) {
    for (const declaration of activity.variables?.writes ?? []) contribute(declaration, activity.id);
  }

  return {
    variables: [...merged.values()].map((entry) => entry.declaration),
    sources,
    contradictions,
  };
}

/* --------------------------------- derivation --------------------------------- */

/** What an activity reads from and writes to the session bag, computed from its steps. */
export interface DerivedContract {
  /** Names the activity consults that no earlier step of its own produces. */
  reads: Set<string>;
  /** Names the activity puts into the bag. */
  writes: Set<string>;
  /** Names it consults that its own earlier steps produce — read, but not from the contract. */
  internalReads: Set<string>;
  /**
   * Names it writes as a persisted artifact. The server reads them when it synthesizes the
   * activity's artifact contract, so the value reaches a consumer whatever else does.
   */
  artifactWrites: Set<string>;
  /**
   * Every name a step produces, whether or not any declaration mentions it: a bound operation's
   * declared output, a remap target, a checkpoint's setVariable key, a `set` action's target, a
   * loop's item variable. Most are local to the activity — an output a later step of the same
   * activity consumes and nothing else ever sees — so this is not a set of session writes. It is
   * wider than `writes` on purpose: `writes` is narrowed to the declared namespace, and the
   * namespace is assembled from the declarations, so a production no declaration mentions cannot
   * appear there at all.
   */
  produces: Set<string>;
  /**
   * Every name any step of the activity consults, before the namespace narrows it — the read-side
   * counterpart to `produces`, and wider than `reads` for the same reason. A name no declaration
   * mentions is absent from `reads` however plainly a technique's prose interpolates it.
   */
  mentions: Set<string>;
  /** Productions whose value is a file, not a bag entry: the technique declares an `#### artifact`. */
  persistedProductions: Set<string>;
  /**
   * Every name the activity consumes, whether or not the contract requires it: the reads above,
   * plus the inputs a bound operation takes when they are there and derives when they are not. An
   * optional input is not something the workflow must supply, so it is no read — but a value that
   * reaches one is consumed, which is a different question.
   */
  consumes: Set<string>;
  /**
   * Names its activity-level routing tests — the transition and decision-branch conditions that
   * choose where the run goes next. A stale value here costs an exit rather than a step.
   */
  routingReads: Set<string>;
}

/**
 * Metasyntactic tokens: notation for "some name" in prose, not a read of a bag value. Shared
 * spelling with the binding-fidelity guard's placeholder set.
 */
const PLACEHOLDER = new Set([
  'path', 'token', 'placeholder', 'field', 'key', 'value', 'var', 'x', 'n', 'i', 'templated',
  'output_id', 'declared_id', 'id', 'name', 'type', 'o', 'O',
]);

/**
 * Namespaces naming the environment rather than the bag: `gh.auth.status == 0` asks the GitHub
 * CLI. A probe head has no producer by construction.
 */
const ENV_PROBES = new Set(['gh', 'gpg', 'git', 'signing', 'workflows']);

const TOKEN_RE = new RegExp(`\\{(${IDENTIFIER_PATTERN}(?:\\.[a-zA-Z0-9_]+)*)\\}`, 'g');

/** The bag name a reference addresses: its head, since `current_unit.mode` reads `current_unit`. */
function bagName(reference: string): string {
  return reference.split('.')[0]!;
}

/** Whether a name is a bag read at all, or notation / an environment probe. */
function isBagRead(name: string): boolean {
  return !PLACEHOLDER.has(name) && !ENV_PROBES.has(name);
}

/** Bag names interpolated by a `{token}` anywhere in a string. */
function tokenReads(text: string): string[] {
  const out: string[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    const name = bagName(match[1]!);
    if (isBagRead(name)) out.push(name);
  }
  return out;
}

/** Bag names a `when:` expression consults. */
function whenReads(expression: string): string[] {
  return expressionPaths(expression).map(bagName).filter(isBagRead);
}

/** Bag names a structured condition consults, at any nesting depth. */
function conditionReads(condition: Condition | undefined): string[] {
  if (!condition) return [];
  const out: string[] = [];
  const walk = (node: Condition): void => {
    if (node.type === 'simple') {
      if (node.variable) {
        const name = bagName(node.variable);
        if (isBagRead(name)) out.push(name);
      }
      return;
    }
    if (node.type === 'not') { if (node.condition) walk(node.condition as Condition); return; }
    for (const nested of node.conditions ?? []) walk(nested as Condition);
  };
  walk(condition);
  return out;
}

/** The step-binding object of a technique step, when it carries deviations. */
function bindingOf(step: Step): TechniqueBinding | undefined {
  if (step.kind !== 'technique') return undefined;
  return typeof step.technique === 'object' ? step.technique : undefined;
}

/** A bound operation's signature: what it consults, and what it lands in the bag. */
interface OpSignature {
  /** Input ids, with the two markings that let the executing agent supply the value itself. */
  inputs: Array<{ id: string; suppliable: boolean }>;
  outputs: string[];
  /**
   * Outputs the operation persists as an artifact. The server consumes these when it synthesizes
   * the activity's artifact contract, so a value with no other reader still has one.
   */
  artifactOutputs: string[];
  /** Names its delivered protocol and rules interpolate — read at the step, out of the bag. */
  proseReads: string[];
}

const EMPTY_SIGNATURE: OpSignature = { inputs: [], outputs: [], artifactOutputs: [], proseReads: [] };

/**
 * Read a bound operation's signature as the step receives it: composed with its container
 * contracts, through the same resolution `get_technique` and `get_activity` deliver with. Own and
 * inherited entries are taken together, since both resolve out of the same session bag at the
 * step — which of them is a session variable is settled by the workflow's declared namespace, not
 * by where the entry was declared.
 */
async function readSignature(
  ref: string,
  activityId: string,
  workflowDir: string,
  scopeWorkflowId: string,
): Promise<OpSignature> {
  try {
    const result = await composeActivityTechnique(ref, workflowDir, scopeWorkflowId, activityId);
    if (!result.success) return EMPTY_SIGNATURE;
    const technique = result.value.technique;
    const inputs = [...(technique.inputs ?? []), ...(technique.inherited_inputs?.items ?? [])];
    const outputs = [...(technique.outputs ?? []), ...(technique.inherited_outputs?.items ?? [])];
    const outputIds = new Set(outputs.map((output) => output.id));
    const prose: string[] = [];
    for (const block of technique.protocol ?? []) {
      if (block.title) prose.push(...tokenReads(block.title));
      for (const step of block.steps) prose.push(...tokenReads(step));
    }
    for (const rule of Object.values(technique.rules ?? {})) {
      for (const text of Array.isArray(rule) ? rule : [rule]) prose.push(...tokenReads(text));
    }
    // An artifact filename is a template the worker interpolates from the bag at write time.
    for (const output of outputs) {
      if (output.artifact?.name) prose.push(...tokenReads(output.artifact.name));
    }
    const declared = new Set([...outputIds, ...inputs.map((input) => input.id)]);
    return {
      inputs: inputs.map((input) => ({
        id: input.id,
        suppliable: input.default !== undefined || OPTIONAL_INPUT_RE.test(input.description?.trim() ?? ''),
      })),
      outputs: [...outputIds],
      artifactOutputs: outputs.filter((output) => output.artifact !== undefined).map((output) => output.id),
      // A token naming an entry of the operation's own signature is that entry — whether it is
      // read at all is settled by the signature, where a default or an "(optional)" marking says
      // the agent may supply it. What is left names the session directly.
      proseReads: prose.filter((name) => !declared.has(name)),
    };
  } catch (error) {
    logWarn('Activity contract derivation skipped an unreadable bound op', {
      ref, activityId, workflowId: scopeWorkflowId,
      error: error instanceof Error ? error.message : String(error),
    });
    return EMPTY_SIGNATURE;
  }
}

/**
 * What an activity reads from and writes to the session bag.
 *
 * The contract covers the workflow's DECLARED variables — the namespace activities carry values
 * between each other in. A step output nobody declares is the technique layer's own wiring, held
 * to its own contract by the binding-fidelity guard, and stays out of this one.
 *
 * Writes are the producer sites `binding-provenance` scans for: a bound op's outputs (under their
 * declared id, or the step binding's remap target), checkpoint `setVariable` keys, `set` action
 * targets and loop variables.
 *
 * Reads are the names the activity consults: a bound op's input under the name-match convention,
 * the `{token}`s of a step binding's values and of the activity's prose, and the variables its
 * gates, conditions, loops and routing test. A name an earlier step of the same activity produces
 * is read internally rather than from the contract — the same closest-producer-before-position
 * rule the provenance annotation applies.
 */
export async function deriveActivityContract(args: {
  activity: Activity;
  workflowDir: string;
  /** The workflow the activity file was authored in — the scope its bound ops resolve against. */
  scopeWorkflowId: string;
  /** The workflow's declared variable names: the namespace a contract entry can name. */
  namespace: ReadonlySet<string>;
}): Promise<DerivedContract> {
  const { activity, workflowDir, scopeWorkflowId, namespace } = args;
  const reads = new Set<string>();
  const writes = new Set<string>();
  const internalReads = new Set<string>();
  const artifactWrites = new Set<string>();
  const produces = new Set<string>();
  /** Every name any step consults, before the namespace narrows it — see `produces`. */
  const mentions = new Set<string>();
  /** Productions whose value is a file the technique declares an `#### artifact` for. */
  const persistedProductions = new Set<string>();
  /** Produced so far in document order — what resolves a later read inside this activity. */
  const producedSoFar = new Set<string>();

  const consumes = new Set<string>();
  const read = (name: string): void => {
    mentions.add(name);
    if (!namespace.has(name)) return;
    consumes.add(name);
    if (producedSoFar.has(name)) internalReads.add(name);
    else reads.add(name);
  };
  /** Consumed without being required: an optional or defaulted input the value reaches. */
  const consume = (name: string): void => {
    if (namespace.has(name)) consumes.add(name);
  };
  const write = (name: string): void => {
    if (namespace.has(name)) writes.add(name);
    produces.add(name);
    producedSoFar.add(name);
  };

  for (const step of flattenActivitySteps(activity)) {
    // Gates and conditions are read before the step's own work.
    if (step.when) whenReads(step.when).forEach(read);
    conditionReads(step.condition).forEach(read);

    if (step.kind === 'loop') {
      // `over` is a plain collection reference (`open_assumptions`, `implementation_plan.tasks`),
      // not a gate expression.
      if (step.over) { const name = bagName(step.over); if (isBagRead(name)) read(name); }
      conditionReads(step.breakCondition).forEach(read);
      // The loop binds its item variable each iteration: a write, whose readers are the body's
      // own steps.
      if (step.variable) write(step.variable);
    }

    if (step.kind === 'technique') {
      const binding = bindingOf(step);
      const ref = techniqueName(step.technique);
      if (ref) {
        const signature = await readSignature(ref, activity.id, workflowDir, scopeWorkflowId);
        for (const input of signature.inputs) {
          const bound = binding?.inputs?.[input.id];
          if (bound !== undefined) {
            if (typeof bound === 'string') {
              tokenReads(bound).forEach(read);
              // A bare value is a rename when it names a variable, and a literal otherwise — the
              // same reading `resolveInputSource` gives it. The namespace settles which it is.
              if (!bound.includes('{')) read(bound);
            }
            continue;
          }
          if (input.suppliable) consume(input.id);
          else read(input.id);
        }
        signature.proseReads.forEach(read);
        const remapped = new Set(Object.keys(binding?.outputs ?? {}));
        const persisted = new Set(signature.artifactOutputs);
        const landed = (outputId: string, bagName: string): void => {
          write(bagName);
          if (persisted.has(outputId)) {
            persistedProductions.add(bagName);
            if (namespace.has(bagName)) artifactWrites.add(bagName);
          }
        };
        for (const [outputId, target] of Object.entries(binding?.outputs ?? {})) landed(outputId, target);
        for (const output of signature.outputs) if (!remapped.has(output)) landed(output, output);
      }
    }

    if (step.kind === 'checkpoint') {
      // A checkpoint reached more than once carries its instance in its id — `scope-confirmed#{scope_round}`
      // — so the id is a read of whatever distinguishes this visit from the last.
      tokenReads(step.id).forEach(read);
      if (step.message) tokenReads(step.message).forEach(read);
      for (const option of step.options ?? []) {
        for (const [name, value] of Object.entries(option.effect?.setVariable ?? {})) {
          if (typeof value === 'string') tokenReads(value).forEach(read);
          write(name);
        }
      }
    }

    if (step.kind === 'technique' || step.kind === 'action') {
      for (const action of step.actions ?? []) {
        if (action.condition) conditionReads(action.condition).forEach(read);
        if (action.action === 'validate' && action.target) whenReads(action.target).forEach(read);
        if (action.message) tokenReads(action.message).forEach(read);
        if (typeof action.value === 'string') tokenReads(action.value).forEach(read);
        if (action.action === 'set' && action.target) write(action.target);
      }
    }
  }

  // Activity-level routing is read at the boundary, after every step has run.
  const routingReads = new Set<string>();
  const routingRead = (name: string): void => {
    if (!namespace.has(name)) return;
    routingReads.add(name);
    read(name);
  };
  for (const exit of activity.exits ?? []) {
    if (exit.when) whenReads(exit.when).forEach(routingRead);
  }
  for (const rule of activity.rules ?? []) tokenReads(rule).forEach(read);
  for (const outcome of activity.outcome ?? []) tokenReads(outcome).forEach(read);
  // A trigger's passContext names the values the dispatching agent relays into the child session.
  for (const trigger of activity.triggers ?? []) (trigger.passContext ?? []).forEach(read);

  return { reads, writes, internalReads, artifactWrites, produces, mentions, persistedProductions, routingReads, consumes };
}

/**
 * The orchestrator's side of the session bag: every input the operations of meta's
 * `workflow-engine` group declare.
 *
 * A worker writes some values for the orchestrator rather than for a later activity — a Progress
 * row marked cancelled where a validation suite could not run, the outcomes a finished run
 * reports. The orchestrator's operations are the consumer, and they sit outside the workflow's own
 * graph by construction, since every workflow is driven by the same engine. Without this, a value
 * written for the engine reads as a value nothing consumes.
 */
export async function orchestratorInputs(workflowDir: string): Promise<Set<string>> {
  const cached = orchestratorInputsCache.get(workflowDir);
  if (cached) return cached;
  const names = new Set<string>();
  const dir = join(workflowDir, ORCHESTRATOR_WORKFLOW, 'techniques', ORCHESTRATOR_GROUP);
  if (!existsSync(dir)) return names;
  for (const entry of readdirSync(dir)) {
    if (!entry.endsWith('.md')) continue;
    const op = entry === 'TECHNIQUE.md' ? ORCHESTRATOR_GROUP : `${ORCHESTRATOR_GROUP}::${entry.slice(0, -3)}`;
    const composed = await composeActivityTechnique(op, workflowDir, ORCHESTRATOR_WORKFLOW);
    if (!composed.success) continue;
    for (const input of composed.value.technique.inputs ?? []) names.add(input.id);
    for (const input of composed.value.technique.inherited_inputs?.items ?? []) names.add(input.id);
  }
  // The orchestrator is also an ordinary reader through its own activities: meta drives every
  // session, so a name its graph reads is consumed whichever workflow writes it.
  const metaActivities = join(workflowDir, ORCHESTRATOR_WORKFLOW, 'activities');
  if (existsSync(metaActivities)) {
    for (const entry of readdirSync(metaActivities)) {
      if (!entry.endsWith('.yaml')) continue;
      const parsed = parseDefinition(readFileSync(join(metaActivities, entry), 'utf-8')) as
        { variables?: { reads?: string[] } } | null;
      for (const name of parsed?.variables?.reads ?? []) names.add(name);
    }
  }
  orchestratorInputsCache.set(workflowDir, names);
  return names;
}

const ORCHESTRATOR_WORKFLOW = 'meta';
const ORCHESTRATOR_GROUP = 'workflow-engine';
const orchestratorInputsCache = new Map<string, Set<string>>();

/* --------------------------------- graph --------------------------------- */

/** Activity id → the activities it can transition to. */
export type ActivityGraph = Map<string, string[]>;

/**
 * The workflow's activity graph as the reachability walk needs it: the destinations bound to each
 * activity's exits, keyed by the activity they leave. One source — the workflow's own `graph` — so
 * the walk sees the whole shape without assembling it from the activities. Destinations that are
 * not activities (the terminal sentinel) are kept: the walk needs to know a path leaves.
 */
export function activityGraph(workflow: Workflow): ActivityGraph {
  const graph: ActivityGraph = new Map();
  for (const activity of workflow.activities ?? []) {
    graph.set(activity.id, [...new Set(Object.values(workflow.graph?.[activity.id] ?? {}))]);
  }
  return graph;
}

/** A read the graph cannot satisfy on every path that reaches it. */
export interface UnreachableRead {
  activityId: string;
  name: string;
  /** `entry` — some path from the initial activity reaches the read with no write before it.
   *  `re-entry` — an exit the activity chooses by reading a variable no activity on its cycle
   *  writes, so a return visit routes on the previous pass's value. */
  kind: 'entry' | 're-entry';
}

/**
 * Reads no path can satisfy.
 *
 * The entry case is a definite-assignment walk: a variable is available on entry to an activity
 * when every predecessor path makes it available, starting from what the session holds before the
 * first activity runs — the seeded and session-supplied names. A read of a name absent from that
 * set is reached, on at least one path, before anything writes it.
 *
 * The re-entry case is the same question asked about a return visit, and only of the reads that
 * choose an exit. An activity the graph can come back to picks its onward transition again; where
 * no activity on the cycle writes the variable that choice tests, the second pass routes on what
 * the first pass left, and the branch that would take the other route cannot be reached. A step
 * re-reading an earlier stage's value is ordinary; an exit doing it is a defect. Two kinds of
 * variable are loop-invariant by design and exempt: one no activity writes at all, and one the
 * workflow file declares as policy for the run.
 */
export function unreachableReads(args: {
  graph: ActivityGraph;
  initialActivity: string | undefined;
  /** Names available before the first activity runs: seeded defaults and session-supplied facts. */
  availableAtEntry: ReadonlySet<string>;
  /** Activity id → the names it reads. */
  reads: ReadonlyMap<string, ReadonlySet<string>>;
  /** Activity id → the names its routing conditions test. */
  routingReads: ReadonlyMap<string, ReadonlySet<string>>;
  /** Activity id → the names it writes. */
  writes: ReadonlyMap<string, ReadonlySet<string>>;
  /**
   * Names the workflow file itself declares — policy for the whole run. Policy holds on a return
   * visit by definition, so an exit reading it is deciding on a current value, not a stale one.
   */
  policy: ReadonlySet<string>;
}): UnreachableRead[] {
  const { graph, initialActivity, availableAtEntry, reads, routingReads, writes, policy } = args;
  const nodes = [...graph.keys()];
  if (!initialActivity || !graph.has(initialActivity)) return [];

  const predecessors = new Map<string, string[]>(nodes.map((id) => [id, []]));
  for (const [from, targets] of graph) {
    for (const to of targets) predecessors.get(to)?.push(from);
  }

  // Only activities the initial activity can reach are walked: an unreachable activity is a graph
  // defect of its own, and its reads have no path to report against.
  const reachable = new Set<string>();
  const queue = [initialActivity];
  while (queue.length) {
    const id = queue.shift()!;
    if (reachable.has(id)) continue;
    reachable.add(id);
    for (const next of graph.get(id) ?? []) if (graph.has(next)) queue.push(next);
  }

  // Definite assignment: IN is the intersection over predecessors of their OUT, so a name is
  // available only where every path supplies it. Non-entry nodes start at the universe (every
  // declared name) and shrink to a fixed point, which is what makes a cycle's first pass honest.
  const universe = new Set<string>(availableAtEntry);
  for (const names of writes.values()) for (const name of names) universe.add(name);

  const incoming = new Map<string, Set<string>>();
  for (const id of reachable) {
    incoming.set(id, id === initialActivity ? new Set(availableAtEntry) : new Set(universe));
  }
  const outgoing = (id: string): Set<string> => {
    const out = new Set(incoming.get(id));
    for (const name of writes.get(id) ?? []) out.add(name);
    return out;
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (const id of reachable) {
      if (id === initialActivity) continue;
      const sources = (predecessors.get(id) ?? []).filter((from) => reachable.has(from));
      if (sources.length === 0) continue;
      const next = new Set<string>();
      for (const name of outgoing(sources[0]!)) {
        if (sources.every((from) => outgoing(from).has(name))) next.add(name);
      }
      const current = incoming.get(id)!;
      if (next.size !== current.size || [...next].some((name) => !current.has(name))) {
        incoming.set(id, next);
        changed = true;
      }
    }
  }

  const findings: UnreachableRead[] = [];
  for (const id of reachable) {
    const available = incoming.get(id)!;
    for (const name of reads.get(id) ?? []) {
      if (!available.has(name)) findings.push({ activityId: id, name, kind: 'entry' });
    }
  }

  // Re-entry: the strongly connected component an activity sits in is the set of activities a
  // return visit can pass through. An exit chosen by reading a written variable that no member
  // writes is decided on the previous pass's value.
  const written = new Set<string>();
  for (const names of writes.values()) for (const name of names) written.add(name);
  for (const component of stronglyConnected(graph, reachable)) {
    const writtenInComponent = new Set<string>();
    for (const id of component) for (const name of writes.get(id) ?? []) writtenInComponent.add(name);
    for (const id of component) {
      for (const name of routingReads.get(id) ?? []) {
        if (!written.has(name) || writtenInComponent.has(name) || policy.has(name)) continue;
        if (findings.some((f) => f.activityId === id && f.name === name)) continue;
        findings.push({ activityId: id, name, kind: 're-entry' });
      }
    }
  }
  return findings;
}

/**
 * The graph's strongly connected components of more than one node, plus self-looping nodes —
 * every set of activities a run can return to.
 */
function stronglyConnected(graph: ActivityGraph, within: ReadonlySet<string>): string[][] {
  const index = new Map<string, number>();
  const low = new Map<string, number>();
  const onStack = new Set<string>();
  const stack: string[] = [];
  const components: string[][] = [];
  let counter = 0;

  const strongConnect = (id: string): void => {
    index.set(id, counter);
    low.set(id, counter);
    counter += 1;
    stack.push(id);
    onStack.add(id);
    for (const next of graph.get(id) ?? []) {
      if (!within.has(next)) continue;
      if (!index.has(next)) {
        strongConnect(next);
        low.set(id, Math.min(low.get(id)!, low.get(next)!));
      } else if (onStack.has(next)) {
        low.set(id, Math.min(low.get(id)!, index.get(next)!));
      }
    }
    if (low.get(id) !== index.get(id)) return;
    const component: string[] = [];
    for (;;) {
      const member = stack.pop()!;
      onStack.delete(member);
      component.push(member);
      if (member === id) break;
    }
    const selfLoop = component.length === 1 && (graph.get(id) ?? []).includes(id);
    if (component.length > 1 || selfLoop) components.push(component);
  };

  for (const id of within) if (!index.has(id)) strongConnect(id);
  return components;
}
