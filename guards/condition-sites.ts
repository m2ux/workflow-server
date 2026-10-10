/**
 * Structured-condition sites, and what can be measured about one.
 *
 * A step states its gate twice over: inline as `when`, or structurally as a `condition` object.
 * Retiring the structured form starts from an enumeration nobody wrote by hand — the site list here
 * is read off the corpus the same way the loader reads it, so a site added after the survey shows up
 * as a site the survey never dispositioned rather than as a site nobody looked for.
 *
 * Three measurements ride with the enumeration, because a disposition that cannot be recomputed is
 * an assertion:
 *
 *   `conditionSites`    — every step carrying a structured `condition`, activities and routines
 *                         alike, loop bodies included. An action's own `condition` and a loop's
 *                         `continueWhile`/`breakCondition` are not step gates and stay out.
 *   `measureVacuity`    — whether the gate can be false at all, over the values its variables admit.
 *                         A gate no assignment falsifies decides nothing, and comes out rather than
 *                         converting.
 *   `dismissalReading`  — what a dismissal of a checkpoint site leaves behind for anything
 *                         downstream to read.
 *
 * The variable model is the one `check:variable-model` reads: a workflow's own declarations plus the
 * writes each activity in its graph contributes.
 */
import { existsSync, readFileSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { parse } from 'yaml';
import type { Condition, ComparisonOperator } from '../src/schema/condition.schema.js';
import { comparableNumber } from '../src/schema/common.js';
import { type CorpusIndex, indexCorpus } from '../src/loaders/corpus-index.js';
import { citePath, corpusNamespaces, definitionsUnder } from './workflows-root.js';
import { declaredVariables } from './workflow-declarations.js';

/** The directories a namespace keeps authored step lists in. A routine is spliced in at load, so it carries gates of its own. */
const STEP_HOMES = ['activities', 'routines'] as const;

/** One step carrying a structured `condition`. */
export interface ConditionSite {
  /** `<file>::<definition id>::<step path>` — stable across a file moving between grouping folders. */
  key: string;
  /** The namespace whose variable model the gate reads against. */
  namespace: string;
  /** The file, as a reference reaches it. */
  file: string;
  /** The activity or routine the step belongs to. */
  definition: string;
  /** The step, loop bodies joined with `/`. */
  step: string;
  /** `technique`, `action` or `checkpoint` — the three step kinds the schema lets carry one. */
  kind: string;
  condition: Condition;
  /** Every variable the condition tests, in first-seen order. */
  reads: string[];
}

interface StepNode {
  kind?: string;
  id?: string;
  condition?: Condition;
  steps?: StepNode[];
  options?: Array<{ id?: string; effect?: { setVariable?: Record<string, unknown>; recordReply?: string; exit?: string } }>;
}

interface DefinitionNode {
  id?: string;
  steps?: StepNode[];
  exits?: Array<{ id?: string; when?: string; isDefault?: boolean }>;
}

/** Every variable a condition tests, in first-seen order. A dotted target is kept whole: it addresses inside a value. */
export function conditionReads(condition: Condition, out: string[] = []): string[] {
  switch (condition.type) {
    case 'simple':
      if (!out.includes(condition.variable)) out.push(condition.variable);
      return out;
    case 'and':
    case 'or':
      for (const member of condition.conditions) conditionReads(member, out);
      return out;
    case 'not':
      return conditionReads(condition.condition, out);
  }
}

function readDefinition(path: string): DefinitionNode | null {
  try {
    const parsed = parse(readFileSync(path, 'utf-8')) as DefinitionNode | null;
    return parsed && typeof parsed === 'object' ? parsed : null;
  } catch {
    return null; // A file that does not parse is `validate-activities`' finding, not this one's.
  }
}

/** The sites in one authored step list, descending loop bodies. */
function sitesInSteps(
  steps: StepNode[] | undefined,
  prefix: string,
  emit: (step: StepNode, path: string) => void,
): void {
  (steps ?? []).forEach((step, index) => {
    const path = prefix ? `${prefix}/${step.id ?? index}` : `${step.id ?? index}`;
    if (step.condition !== undefined) emit(step, path);
    if (step.steps) sitesInSteps(step.steps, path, emit);
  });
}

/**
 * Every step in the corpus carrying a structured `condition`, ordered by key.
 *
 * The walk is the authored one: a routine is a file of steps a reference splices in, so a gate
 * written there is a gate an author wrote, and reading only materialised activities would count it
 * once per reference or not at all.
 */
export function conditionSites(root: string, index: CorpusIndex = indexCorpus(root)): ConditionSite[] {
  return scanConditionSites(root, index).sites;
}

/**
 * The same walk, reporting what it read as well as what it found.
 *
 * Zero sites is the END STATE of this work rather than a broken measurement, so a guard over it
 * cannot assert on the site count. `definitions` is the number it is entitled to assert on: a walk
 * that read no definition found nothing because it looked nowhere.
 */
export function scanConditionSites(root: string, index: CorpusIndex = indexCorpus(root)): { sites: ConditionSite[]; definitions: number } {
  const sites: ConditionSite[] = [];
  let definitions = 0;
  for (const { ref, dir } of corpusNamespaces(root, index)) {
    for (const home of STEP_HOMES) {
      const stepsDir = join(dir, home);
      if (!existsSync(stepsDir) || !statSync(stepsDir).isDirectory()) continue;
      for (const { path } of definitionsUnder(stepsDir)) {
        const definition = readDefinition(path);
        if (!definition?.id) continue;
        definitions++;
        const file = citePath(root, path, index);
        sitesInSteps(definition.steps, '', (step, stepPath) => {
          sites.push({
            key: `${file}::${definition.id}::${stepPath}`,
            namespace: ref,
            file,
            definition: definition.id!,
            step: stepPath,
            kind: step.kind ?? 'unknown',
            condition: step.condition!,
            reads: conditionReads(step.condition!),
          });
        });
      }
    }
  }
  return { sites: sites.sort((a, b) => a.key.localeCompare(b.key)), definitions };
}

/* -------------------------------------------------------------------------------------------- */
/* The value model a gate is measured against                                                      */
/* -------------------------------------------------------------------------------------------- */

/** What one variable admits, as the declarations state it. */
export interface Domain {
  /** A declared `defaultValue` is seeded at session creation, so the variable is never absent. */
  seeded: boolean;
  /** The closed set of values, or `null` where the declaration closes none. */
  values: ReadonlyArray<string | number | boolean | null> | null;
  /** The declared type, for the record. */
  type?: string | undefined;
}

/** One candidate state of one variable. `opaque` is a present value no declaration pins down. */
interface VariableState { present: boolean; value?: unknown; opaque?: boolean }

const OPEN_DOMAIN: Domain = { seeded: false, values: null };

/**
 * The domain of every variable a namespace declares.
 *
 * A dotted condition target addresses inside a value and matches no declaration name, so it resolves
 * to the open domain — which is the honest answer: nothing in the model bounds it.
 */
export function variableDomains(root: string, namespace: string, index: CorpusIndex = indexCorpus(root)): Map<string, Domain> {
  const domains = new Map<string, Domain>();
  for (const [name, declaration] of declaredVariables(root, namespace, index)) {
    const values = declaration.values
      ? [...declaration.values]
      : declaration.type === 'boolean' ? [true, false] : null;
    domains.set(name, { seeded: declaration.defaultValue !== undefined, values, type: declaration.type });
  }
  return domains;
}

/** The states one variable can be in, as its domain allows. */
function statesOf(domain: Domain): VariableState[] {
  const states: VariableState[] = [];
  if (!domain.seeded) states.push({ present: false });
  if (domain.values === null) states.push({ present: true, opaque: true });
  else for (const value of domain.values) states.push({ present: true, value });
  return states;
}

export type Truth = 'true' | 'false' | 'unknown';

function compare(operator: ComparisonOperator, left: unknown, right: unknown): boolean {
  switch (operator) {
    case '==': return left === right;
    case '!=': return left !== right;
    case '>': case '<': case '>=': case '<=': {
      const a = comparableNumber(left);
      const b = comparableNumber(right);
      if (a === undefined || b === undefined) return false;
      return operator === '>' ? a > b : operator === '<' ? a < b : operator === '>=' ? a >= b : a <= b;
    }
    case 'exists': return left !== undefined && left !== null;
    case 'notExists': return left === undefined || left === null;
  }
}

/**
 * Three-valued evaluation of a gate under one assignment.
 *
 * `unknown` is what an opaque value forces, and it never becomes `true`: a gate this says nothing
 * about is a gate the survey cannot call vacuous. Presence is decided even where the value is not,
 * because seeding is a fact about the declaration rather than about the run.
 */
export function evaluateUnderAssignment(condition: Condition, assignment: Map<string, VariableState>): Truth {
  switch (condition.type) {
    case 'simple': {
      const state = assignment.get(condition.variable) ?? { present: true, opaque: true };
      if (condition.operator === 'exists') return state.present ? 'true' : 'false';
      if (condition.operator === 'notExists') return state.present ? 'false' : 'true';
      if (!state.present) return compare(condition.operator, undefined, condition.value) ? 'true' : 'false';
      if (state.opaque) return 'unknown';
      return compare(condition.operator, state.value, condition.value) ? 'true' : 'false';
    }
    case 'and': {
      const members = condition.conditions.map((member) => evaluateUnderAssignment(member, assignment));
      if (members.includes('false')) return 'false';
      return members.includes('unknown') ? 'unknown' : 'true';
    }
    case 'or': {
      const members = condition.conditions.map((member) => evaluateUnderAssignment(member, assignment));
      if (members.includes('true')) return 'true';
      return members.includes('unknown') ? 'unknown' : 'false';
    }
    case 'not': {
      const inner = evaluateUnderAssignment(condition.condition, assignment);
      return inner === 'unknown' ? 'unknown' : inner === 'true' ? 'false' : 'true';
    }
  }
}

/** The ceiling on one site's product. Past it the sweep reports `undetermined` rather than running out of memory. */
export const ASSIGNMENT_CEILING = 20_000;

/** What a sweep of one gate's assignments found. */
export interface Vacuity {
  /**
   * `always-true` — no assignment falsifies it, so the gate tests nothing and the site comes out.
   * `falsifiable` — an assignment falsifies it, so the gate is a real test and converts to `when`.
   * `undetermined` — the model does not bound the sweep; the gate converts, because nothing proved
   *                  it could not be false.
   */
  verdict: 'always-true' | 'falsifiable' | 'undetermined';
  /** How many assignments were evaluated. */
  assignments: number;
  /** The domain each variable was swept over, for the record. */
  domains: Record<string, { seeded: boolean; values: ReadonlyArray<string | number | boolean | null> | null; type?: string | undefined }>;
  /** The variables whose declarations close no value set, sorted — what an `undetermined` verdict rests on. */
  open: string[];
  /** The first assignment that evaluated false, where one did. */
  witness?: Record<string, unknown>;
}

/** An absent variable, as a recorded witness spells it. */
export const ABSENT = '<absent>';
/** A present variable whose value no declaration pins down, as a recorded witness spells it. */
export const ANY_VALUE = '<any>';

function describeState(state: VariableState): unknown {
  if (!state.present) return ABSENT;
  return state.opaque ? ANY_VALUE : state.value;
}

function stateFromWitness(value: unknown): VariableState {
  if (value === ABSENT) return { present: false };
  if (value === ANY_VALUE) return { present: true, opaque: true };
  return { present: true, value };
}

/**
 * Re-evaluate a gate under a recorded witness.
 *
 * This is what makes a `falsifiable` measurement evidence rather than a claim: the guard reads the
 * assignment the record names and asks the gate again, instead of trusting that a sweep once found
 * it. A witness naming fewer variables than the gate reads leaves the rest opaque, which can only
 * ever weaken the answer to `unknown` — never strengthen it to `false`.
 */
export function evaluateWitness(condition: Condition, witness: Record<string, unknown>): Truth {
  const assignment = new Map<string, VariableState>();
  for (const [name, value] of Object.entries(witness)) assignment.set(name, stateFromWitness(value));
  return evaluateUnderAssignment(condition, assignment);
}

/**
 * Sweep a gate over every state its variables admit, and say whether any of them makes it false.
 *
 * `always-true` is only ever returned off a sweep that reached `true` on every assignment with no
 * `unknown` among them, so an open value never becomes evidence of vacuity. The sweep is what the
 * record cites, and `check:condition-survey` runs it again rather than reading the citation back.
 */
export function measureVacuity(condition: Condition, domains: Map<string, Domain>): Vacuity {
  const reads = conditionReads(condition);
  const perVariable = reads.map((name) => ({ name, states: statesOf(domains.get(name) ?? OPEN_DOMAIN) }));
  const total = perVariable.reduce((product, { states }) => product * states.length, 1);
  const recorded: Vacuity['domains'] = {};
  const open: string[] = [];
  for (const name of reads) {
    const domain = domains.get(name) ?? OPEN_DOMAIN;
    recorded[name] = { seeded: domain.seeded, values: domain.values, ...(domain.type === undefined ? {} : { type: domain.type }) };
    if (domain.values === null) open.push(name);
  }
  open.sort();
  if (total > ASSIGNMENT_CEILING) {
    return { verdict: 'undetermined', assignments: 0, domains: recorded, open };
  }

  let sawUnknown = false;
  for (let n = 0; n < total; n++) {
    const assignment = new Map<string, VariableState>();
    let rest = n;
    for (const { name, states } of perVariable) {
      assignment.set(name, states[rest % states.length]!);
      rest = Math.floor(rest / states.length);
    }
    const truth = evaluateUnderAssignment(condition, assignment);
    if (truth === 'false') {
      const witness: Record<string, unknown> = {};
      for (const [name, state] of assignment) witness[name] = describeState(state);
      return { verdict: 'falsifiable', assignments: n + 1, domains: recorded, open, witness };
    }
    if (truth === 'unknown') sawUnknown = true;
  }
  return {
    verdict: sawUnknown ? 'undetermined' : 'always-true',
    assignments: total,
    domains: recorded,
    open,
  };
}

/* -------------------------------------------------------------------------------------------- */
/* What a dismissal leaves behind                                                                  */
/* -------------------------------------------------------------------------------------------- */

/**
 * What a dismissal of one checkpoint site leaves for anything downstream.
 *
 * A dismissal selects no option, so it applies no `setVariable`, records no reply and names no exit.
 * No definition can address a response that names no option: a gate reads session variables, and an
 * exit reads the option a choice named. So the nearest a definition gets to reading a dismissal is reading one of
 * the variables the withheld choice would have written — `optionWrites` is that set, and
 * `observedWrites` is the part of it some other gate in the activity tests.
 *
 * An empty `observedWrites` is the strong reading: nothing in the activity can tell this dismissal
 * from any other path that left those variables unset. The reading names the variables rather than
 * the gates that test them, so it stays a fact about the checkpoint — a step renamed elsewhere in
 * the activity does not change what the dismissal withholds.
 */
export interface DismissalReading {
  /** Variables a dismissal writes. The dismissal path selects no option, so this is empty at every site. */
  dismissalWrites: string[];
  /** Variables an option of this checkpoint writes when one is chosen — what the dismissal withholds. */
  optionWrites: string[];
  /** The exit a dismissal falls to, shared with every unmatched predicate of the activity. */
  defaultExit: string | null;
  /** The withheld writes some other gate in the activity tests, sorted. */
  observedWrites: string[];
}

function definitionAt(root: string, site: ConditionSite, index: CorpusIndex): { node: DefinitionNode; path: string } | null {
  for (const { ref, dir } of corpusNamespaces(root, index)) {
    if (ref !== site.namespace) continue;
    for (const home of STEP_HOMES) {
      const stepsDir = join(dir, home);
      if (!existsSync(stepsDir) || !statSync(stepsDir).isDirectory()) continue;
      for (const { path } of definitionsUnder(stepsDir)) {
        if (citePath(root, path, index) !== site.file) continue;
        const node = readDefinition(path);
        if (node?.id === site.definition) return { node, path };
      }
    }
  }
  return null;
}

function stepAt(steps: StepNode[] | undefined, path: string[]): StepNode | null {
  const [head, ...rest] = path;
  const found = (steps ?? []).find((step, index) => (step.id ?? String(index)) === head);
  if (!found) return null;
  return rest.length === 0 ? found : stepAt(found.steps, rest);
}

/**
 * The dismissal reading for one checkpoint site, measured off the corpus.
 *
 * Call it only for a `checkpoint` site: no other step kind is dismissible, so no other kind has a
 * record to read.
 */
export function dismissalReading(root: string, site: ConditionSite, index: CorpusIndex = indexCorpus(root)): DismissalReading {
  const found = definitionAt(root, site, index);
  const step = found ? stepAt(found.node.steps, site.step.split('/')) : null;
  const optionWrites = new Set<string>();
  for (const option of step?.options ?? []) {
    for (const name of Object.keys(option.effect?.setVariable ?? {})) optionWrites.add(name);
    if (option.effect?.recordReply) optionWrites.add(option.effect.recordReply);
  }
  const defaultExit = (found?.node.exits ?? []).find((exit) => exit.isDefault)?.id ?? null;

  // Every gate in the activity other than this step's own, as text a variable name is searched in.
  const gates: string[] = [];
  if (found) {
    for (const exit of found.node.exits ?? []) if (exit.when) gates.push(exit.when);
    const walk = (steps: StepNode[] | undefined, prefix: string): void => {
      (steps ?? []).forEach((other, index) => {
        const path = prefix ? `${prefix}/${other.id ?? index}` : `${other.id ?? index}`;
        if (path !== site.step) {
          const when = (other as { when?: string }).when;
          if (when) gates.push(when);
          if (other.condition) gates.push(JSON.stringify(other.condition));
        }
        if (other.steps) walk(other.steps, path);
      });
    };
    walk(found.node.steps, '');
  }
  const observedWrites = [...optionWrites].filter((name) => {
    const tested = new RegExp(`\\b${name.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}\\b`);
    return gates.some((gate) => tested.test(gate));
  }).sort();

  return {
    dismissalWrites: [],
    optionWrites: [...optionWrites].sort(),
    defaultExit,
    observedWrites,
  };
}
