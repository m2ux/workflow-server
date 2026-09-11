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
 * that each name a different type, starting value or value set are a contradiction and fail the
 * load; one that is silent about a starting value takes the value another site names.
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
import { type Workflow, branchKey, destinationTargets } from '../schema/workflow.schema.js';
import type { ActivityVariables, VariableDefinition } from '../schema/variable.schema.js';
import type { Condition } from '../schema/condition.schema.js';
import { composeActivityTechnique } from '../loaders/technique-loader.js';
import { indexCorpus, workflowSubdir } from '../loaders/corpus-index.js';
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
/**
 * What two declarations of one name disagree about, or null when they agree. Silence is no
 * opinion: a declaration that names no starting value, and one that names no value set, agrees
 * with whatever another declaration says about it. Two declarations that both name one and differ
 * are a contradiction.
 */
function disagreement(a: VariableDefinition, b: VariableDefinition): string | null {
  if (a.type !== b.type) return `declared '${a.type}' and '${b.type}'`;
  if (a.defaultValue !== undefined && b.defaultValue !== undefined) {
    const left = JSON.stringify(a.defaultValue);
    const right = JSON.stringify(b.defaultValue);
    if (left !== right) return `defaults ${left} and ${right}`;
  }
  if (a.values !== undefined && b.values !== undefined) {
    const left = JSON.stringify(a.values);
    const right = JSON.stringify(b.values);
    if (left !== right) return `value sets ${left} and ${right}`;
  }
  return null;
}

/**
 * The declaration the merge keeps: the one already seen, filled in from the newcomer wherever it
 * is silent. A starting value declared at one site is the session's starting value whichever site
 * declared it, so the order two declarations arrive in does not decide what a session seeds.
 */
function fillSilences(seen: VariableDefinition, next: VariableDefinition): VariableDefinition {
  if (seen.defaultValue !== undefined && seen.values !== undefined) return seen;
  const filled = { ...seen };
  if (filled.defaultValue === undefined && next.defaultValue !== undefined) {
    filled.defaultValue = next.defaultValue;
  }
  if (filled.values === undefined && next.values !== undefined) filled.values = next.values;
  return filled;
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
  /**
   * The activities this workflow's graph fans. Each contributes its branch container BESIDE its own
   * write declarations, never in place of them: substituting would drop the members' declared types
   * and value sets — the only check on the one agent-supplied record the server does not type, for
   * precisely the activities a fan runs — and their starting values with them.
   */
  fannedActivityIds: ReadonlySet<string> = new Set(),
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
      return;
    }
    seen.declaration = fillSilences(seen.declaration, declaration);
  };

  for (const declaration of own ?? []) contribute(declaration, WORKFLOW_SOURCE);
  for (const activity of activities ?? []) {
    for (const declaration of activity.variables?.writes ?? []) contribute(declaration, activity.id);
    if (!fannedActivityIds.has(activity.id)) continue;
    // An array in both fan forms — the shape is a dense array either way, one slot per branch in
    // collection order, and the uniform index keeps a read form independent of the fan's shape. No
    // starting value: seeding one would make every existence gate on the container constant.
    contribute({
      name: branchKey(activity.id),
      type: 'array',
      description: `Each branch of the fan that runs '${activity.id}' lands its whole reported map in a slot of its own, in collection order — one slot per branch, each carrying its unit's id and that branch's values. A slot no branch filled carries no result. Read it whole and hand it to a gather; a bare member addresses nothing.`,
      required: false,
    }, `graph fan over ${activity.id}`);
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
  /**
   * Every read as the step spells it, dotted tail included — `research_outputs.0.result.findings`
   * beside the `research_outputs` its head contributes to `reads`. This is what makes a read into a
   * branch container checkable at member grain; the head alone discards the member.
   */
  pathReads: Set<string>;
  /**
   * What a branch's productions land as when the graph fans this activity: the container plus one
   * entry per member, index-free because the width is a run-time value. Empty for every activity no
   * graph fans, so the bare write set is what a sequential workflow is measured against.
   */
  memberWrites: Set<string>;
  /**
   * The filename every artifact its steps declare, template included — the string the writer
   * resolves at write time. Two contexts resolving one literal filename resolve one file, which is
   * data loss rather than hygiene, so this is what the collision family is decided from.
   */
  artifactNames: Set<string>;
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
export function bagName(reference: string): string {
  return reference.split('.')[0]!;
}

/** Whether a name is a bag read at all, or notation / an environment probe. */
function isBagRead(name: string): boolean {
  return !PLACEHOLDER.has(name) && !ENV_PROBES.has(name);
}

/**
 * The collectors return the WHOLE dotted reference and the read function splits it: the head serves
 * the namespace test, and the full reference is what makes member grain visible at all. Pre-split
 * here, the tail is discarded before any check runs.
 */
function tokenReads(text: string): string[] {
  const out: string[] = [];
  for (const match of text.matchAll(TOKEN_RE)) {
    if (isBagRead(bagName(match[1]!))) out.push(match[1]!);
  }
  return out;
}

/** References a `when:` expression consults. */
function whenReads(expression: string): string[] {
  return expressionPaths(expression).filter((path) => isBagRead(bagName(path)));
}

/** References a structured condition consults, at any nesting depth. */
function conditionReads(condition: Condition | undefined): string[] {
  if (!condition) return [];
  const out: string[] = [];
  const walk = (node: Condition): void => {
    if (node.type === 'simple') {
      if (node.variable && isBagRead(bagName(node.variable))) out.push(node.variable);
      return;
    }
    if (node.type === 'not') { if (node.condition) walk(node.condition as Condition); return; }
    for (const nested of node.conditions ?? []) walk(nested as Condition);
  };
  walk(condition);
  return out;
}

/**
 * The member a dotted read into a branch container addresses, or undefined where the reference is
 * not one. A slot carries its unit's id beside the result, so a member read drops a leading
 * all-digits segment and then the literal `result` segment: `research_outputs.0.result.findings`
 * addresses `findings`. A reference that omits the index addresses nothing — with a uniform index
 * the flat walker would never find it — and comes back as the empty string, which is reported.
 */
export function containerMember(reference: string, key: string): string | undefined {
  const segments = reference.split('.');
  if (segments[0] !== key) return undefined;
  const rest = segments.slice(1);
  if (rest.length === 0) return '';
  if (!/^\d+$/.test(rest[0]!)) return rest.join('.');
  const afterIndex = rest.slice(1);
  return afterIndex[0] === 'result' ? afterIndex.slice(1).join('.') : afterIndex.join('.');
}

/** Whether a member read carries the index the container's uniform shape requires. */
export function readCarriesIndex(reference: string, key: string): boolean {
  const segments = reference.split('.');
  return segments[0] === key && /^\d+$/.test(segments[1] ?? '');
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
  /** The filename each artifact output declares, template included. */
  artifactNames: string[];
  /** Names its delivered protocol and rules interpolate — read at the step, out of the bag. */
  proseReads: string[];
}

const EMPTY_SIGNATURE: OpSignature = { inputs: [], outputs: [], artifactOutputs: [], artifactNames: [], proseReads: [] };

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
      artifactNames: outputs
        .map((output) => output.artifact?.name)
        .filter((name): name is string => typeof name === 'string'),
      // A token naming an entry of the operation's own signature is that entry — whether it is
      // read at all is settled by the signature, where a default or an "(optional)" marking says
      // the agent may supply it. What is left names the session directly. Prose is a technique's
      // own surface rather than a step's binding, so it contributes the head: member grain is a
      // property of what a STEP spells, which is where a gather names a container's member.
      proseReads: prose.map(bagName).filter((name) => !declared.has(name)),
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
  /**
   * The key this activity's outputs land under when the graph fans it. Present only for a fanned
   * activity, so the same file contributes its writes flat in a workflow whose graph does not fan
   * it — an activity is borrowable into a fanning graph and a non-fanning one without carrying
   * either shape in its own file.
   */
  branchKey?: string | undefined;
}): Promise<DerivedContract> {
  const { activity, workflowDir, scopeWorkflowId, namespace, branchKey: key } = args;
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
  const pathReads = new Set<string>();
  const memberWrites = new Set<string>();
  const artifactNames = new Set<string>();

  const consumes = new Set<string>();
  const read = (reference: string): void => {
    const name = bagName(reference);
    mentions.add(name);
    if (!namespace.has(name)) return;
    pathReads.add(reference);
    consumes.add(name);
    if (producedSoFar.has(name)) internalReads.add(name);
    else reads.add(name);
  };
  /** Consumed without being required: an optional or defaulted input the value reaches. */
  const consume = (name: string): void => {
    if (namespace.has(name)) consumes.add(name);
  };
  /**
   * An unbraced input value: a rename when the WHOLE string names a variable, a literal otherwise
   * — the same reading `resolveInputSource` gives it. The namespace settles which it is, so the
   * match is on the whole string and not on a head, or every literal carrying a dot would read.
   */
  const readWholeName = (value: string): void => {
    if (namespace.has(value)) read(value);
    else mentions.add(value);
  };
  // A branch's productions land whole under its own key, so the write side re-keys to the
  // container plus one entry per member. Inside the branch names stay bare: a later step reads an
  // earlier output as an internal read, never through the key.
  const write = (name: string): void => {
    if (namespace.has(name)) {
      if (key === undefined) writes.add(name);
      else { writes.add(key); memberWrites.add(`${key}.${name}`); }
    }
    produces.add(name);
    producedSoFar.add(name);
  };

  for (const step of flattenActivitySteps(activity)) {
    // Gates and conditions are read before the step's own work.
    if (step.when) whenReads(step.when).forEach(read);

    if (step.kind === 'loop') {
      // A loop's predicates are its continuation test and its item-iteration early exit; its entry
      // gate is `when` alone.
      conditionReads(step.continueWhile).forEach(read);
      conditionReads(step.breakCondition).forEach(read);
      // `over` is a plain collection reference (`open_assumptions`, `implementation_plan.tasks`),
      // not a gate expression.
      if (step.over) { const name = bagName(step.over); if (isBagRead(name)) read(name); }
      // The loop binds its item variable each iteration: a write, whose readers are the body's
      // own steps.
      if (step.variable) write(step.variable);
    } else {
      conditionReads(step.condition).forEach(read);
    }

    if (step.kind === 'technique') {
      const binding = bindingOf(step);
      const ref = techniqueName(step.technique);
      if (ref) {
        const signature = await readSignature(ref, activity.id, workflowDir, scopeWorkflowId);
        for (const name of signature.artifactNames) artifactNames.add(name);
        for (const input of signature.inputs) {
          const bound = binding?.inputs?.[input.id];
          if (bound !== undefined) {
            if (typeof bound === 'string') {
              tokenReads(bound).forEach(read);
              if (!bound.includes('{')) readWholeName(bound);
            }
            continue;
          }
          if (input.suppliable) consume(input.id);
          else read(input.id);
        }
        signature.proseReads.forEach(read);
        const remapped = new Set(Object.keys(binding?.outputs ?? {}));
        const persisted = new Set(signature.artifactOutputs);
        // The artifact write and the persisted production take the branch key too, or the
        // artifact-write exemption stops applying and every artifact-valued branch output becomes
        // an unread write.
        const landed = (outputId: string, target: string): void => {
          write(target);
          if (persisted.has(outputId)) {
            const landing = key === undefined ? target : `${key}.${target}`;
            persistedProductions.add(landing);
            if (namespace.has(target)) artifactWrites.add(landing);
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

  return {
    reads, writes, internalReads, artifactWrites, produces, mentions, persistedProductions,
    routingReads, consumes, pathReads, memberWrites, artifactNames,
  };
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
  const index = indexCorpus(workflowDir);
  const techniques = workflowSubdir(index, ORCHESTRATOR_WORKFLOW, 'techniques');
  const dir = techniques ? join(techniques, ORCHESTRATOR_GROUP) : null;
  if (!dir || !existsSync(dir)) return names;
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
  const metaActivities = workflowSubdir(index, ORCHESTRATOR_WORKFLOW, 'activities');
  if (metaActivities && existsSync(metaActivities)) {
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
 *
 * A destination the graph fans contributes every branch it opens, and the de-duplication happens
 * AFTER the flatten: an instance fan's target list is one activity, so de-duplicating first is what
 * keeps the forward search, the predecessor index and the cycle pass seeing the graph one visit
 * would produce.
 */
export function activityGraph(workflow: Workflow): ActivityGraph {
  const graph: ActivityGraph = new Map();
  for (const activity of workflow.activities ?? []) {
    const bound = Object.values(workflow.graph?.[activity.id] ?? {});
    graph.set(activity.id, [...new Set(bound.flatMap(destinationTargets))]);
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
 * when every ARRIVAL makes it available, starting from what the session holds before the first
 * activity runs — the seeded and session-supplied names. A read of a name absent from that set is
 * reached, on at least one path, before anything writes it.
 *
 * An arrival is one way control can reach a node. An ordinary predecessor is its own arrival, and
 * a completed fan is one arrival contributing the union of its live branches' outgoing sets —
 * every branch ran, so the meeting point's entry state is what they collectively leave. Arrivals
 * intersect, because control still comes by exactly one of them. Two fans converging on one node
 * are two arrivals, so such a node may declare only the reads both unions satisfy.
 *
 * Termination is unaffected: the analysis descends from the universe to a fixed point over the
 * powerset lattice ordered by superset, each outgoing set is non-increasing across iterations, and
 * both a union and an intersection of non-increasing sets are non-increasing. The meet changes,
 * the lattice does not — and it need not, because a branch's writes are namespaced, so a branch
 * contributes exactly one flat name whatever object landed under it.
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
  initialActivity: string;
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
  /**
   * The fans the graph declares, from the loader's single derivation, so the grouping keeps one
   * home and the graph type stays a flat reachability map. A completed fan is ONE arrival at its
   * meeting point, contributing the union of its live branches' outgoing sets.
   */
  fans?: ReadonlyArray<{ branches: readonly string[]; join: string | undefined }>;
  /**
   * Activity id → a name ambient to that activity alone: a fan's per-instance parameter, which the
   * graph supplies on the branch's own delivery. Per activity rather than in the global ambient
   * set, because a flat seed would satisfy a read of the parameter anywhere in the workflow.
   */
  ambientPerActivity?: ReadonlyMap<string, string>;
}): UnreachableRead[] {
  const { graph, initialActivity, availableAtEntry, reads, routingReads, writes, policy } = args;
  const fans = args.fans ?? [];
  const ambientPerActivity = args.ambientPerActivity ?? new Map<string, string>();
  const nodes = [...graph.keys()];
  // A root outside the graph leaves the walk nothing to report against: the workflow names an
  // activity it does not include, which is a defect of its own.
  if (!graph.has(initialActivity)) return [];

  const predecessors = new Map<string, string[]>(nodes.map((id) => [id, []]));
  for (const [from, targets] of graph) {
    for (const to of targets) predecessors.get(to)?.push(from);
  }

  /**
   * The fans that converge on each meeting point, and the branches to remove from that meeting
   * point's plain predecessors. A branch appears either as a contributor to its fan's one union
   * arrival or as an ordinary intersecting predecessor, never both: left in both, the intersection
   * wipes the union straight back out and the change does nothing.
   */
  const arrivingFans = new Map<string, string[][]>();
  for (const fan of fans) {
    if (fan.join === undefined || !graph.has(fan.join)) continue;
    const live = fan.branches.filter((branch) => graph.has(branch));
    if (live.length === 0) continue;
    const converging = arrivingFans.get(fan.join) ?? [];
    converging.push([...live]);
    arrivingFans.set(fan.join, converging);
    const branchSet = new Set(live);
    predecessors.set(fan.join, (predecessors.get(fan.join) ?? []).filter((from) => !branchSet.has(from)));
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

  /**
   * The ways control can reach a node, each as the set of names it makes available. An ordinary
   * predecessor is its own arrival. A completed fan is ONE arrival contributing the UNION of its
   * live branches' outgoing sets, because every branch ran — an intersection there drops a name
   * only one branch writes and turns a correct declared read at the meeting point into a finding.
   * Arrivals then intersect, because control still comes by exactly one of them.
   */
  const arrivals = (id: string): Set<string>[] => {
    const out = (predecessors.get(id) ?? [])
      .filter((from) => reachable.has(from))
      .map((from) => outgoing(from));
    for (const branches of arrivingFans.get(id) ?? []) {
      // Built over distinct branch ids: the union is idempotent over an instance fan's siblings,
      // so N instances of one activity contribute one arrival carrying that activity's set once.
      const live = [...new Set(branches)].filter((branch) => reachable.has(branch));
      if (live.length === 0) continue;
      const union = new Set<string>();
      for (const branch of live) for (const name of outgoing(branch)) union.add(name);
      out.push(union);
    }
    return out;
  };

  let changed = true;
  while (changed) {
    changed = false;
    for (const id of reachable) {
      if (id === initialActivity) continue;
      const sources = arrivals(id);
      if (sources.length === 0) continue;
      // The candidate seed is the FIRST ARRIVAL's set, not the first predecessor's: seeded from a
      // predecessor, a union arrival's extra names are never candidates and the union does nothing.
      const next = new Set<string>();
      for (const name of sources[0]!) {
        if (sources.every((from) => from.has(name))) next.add(name);
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
    const ambient = ambientPerActivity.get(id);
    for (const name of reads.get(id) ?? []) {
      if (name === ambient) continue;
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
