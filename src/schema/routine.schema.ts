/**
 * Routine definitions (#704 W02) — a named run of steps.
 *
 * A routine lives in a `routines/` directory beside `activities/`, one file per routine, with no
 * position number because it holds no place in an order. It declares what it takes (`inputs`), what
 * it produces (`outputs`) and what its own steps pass between themselves (`internals`); its `steps`
 * are the ordinary step list, so a routine may contain technique, action, checkpoint, loop and
 * routine steps.
 *
 * Its input, output and internal ids are the names in scope inside its body. A routine has no
 * UNDECLARED free variables: every name its body reads or writes is one of the three, which is what
 * makes the signature a contract and the body checkable with no host activity. A reference site that
 * leaves a declared input unbound takes the host's value under the same spelling.
 *
 * The routine is erased at load: `materializeActivityRoutines` copies its steps into the referring
 * activity, so everything downstream sees ordinary steps.
 */
import { z } from 'zod';
import { StepSchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';
import { VariableNameSchema } from './variable.schema.js';

/** A routine id: kebab-case, and carrying no `::`, which is the resolution separator. */
export const RoutineIdSchema = z.string().regex(
  /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
  'a routine id is kebab-case (`assumption-interview`) and carries no `::` — a routine name has no group grammar',
);

/**
 * A declared parameter. A reference site binds it under `with`; a site that leaves it unbound takes
 * the host's value under the same spelling, unless the declaration carries a default.
 */
export const RoutineInputSchema = z.object({
  id: VariableNameSchema.describe('The name this parameter carries inside the body, and the name an unbound site falls through to in the host\'s bag.'),
  description: z.string().describe('What the parameter is for, in the routine\'s own vocabulary.'),
  default: z.union([z.string(), z.number(), z.boolean()]).optional().describe('The value the body takes where a reference site binds nothing. Without one, an unbound input reads the host\'s value under this id.'),
}).strict();
export type RoutineInput = z.infer<typeof RoutineInputSchema>;

/**
 * A produced value, carrying a full variable declaration: the routine is where the value is owned,
 * so the declaration travels with it into the host's contribution to the workflow variable set.
 * A routine output declares no `defaultValue` — a default is a seed applied at session creation, a
 * property of the variable rather than of a run that writes it mid-flight.
 */
export const RoutineOutputSchema = z.object({
  id: VariableNameSchema.describe('The name this value carries inside the body. A reference site binds it to the session variable its value lands under.'),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Declared type, carried onto the session variable the reference site binds this output to.'),
  description: z.string().describe('What the value is.'),
  values: z.array(z.string()).min(1).optional().describe('The complete set of values a string output admits, carried onto the bound session variable.'),
  optional: z.literal(true).optional().describe('Declared only when a reference site may leave this output unbound, which drops the bindings that write it. Leaving an unmarked output unbound fails the load.'),
}).strict();
export type RoutineOutput = z.infer<typeof RoutineOutputSchema>;

/**
 * A name the body's steps pass between themselves and that never leaves. It declares an id and a
 * description and nothing else — no type, no default, no value set — because it never enters the
 * workflow's variable set and so nothing merges, seeds or type-checks it. That is the standing the
 * variable schema already gives a name written by an earlier step of the same activity; an internal
 * is that, scoped to a run rather than an activity. It may be a loop's item variable and it may hold
 * a collection.
 */
export const RoutineInternalSchema = z.object({
  id: VariableNameSchema.describe('The name this value carries inside the body. Materialised per host activity and per reference site, and never a workflow variable.'),
  description: z.string().describe('What the value is, and which steps pass it.'),
}).strict();
export type RoutineInternal = z.infer<typeof RoutineInternalSchema>;

/**
 * A routine definition. Closed object: a field outside the declared set is a schema error. A routine
 * declares no `exits`, no `outcome`, no `rules`, no `triggers` and no activity-wide `techniques` —
 * it takes no place in the graph, and it has no delivery of its own for prose to be delivered at.
 */
export const RoutineSchema = z.object({
  id: RoutineIdSchema.describe('Unique identifier for the routine, and the name a reference resolves.'),
  version: SemanticVersionSchema.describe('Semantic version of the routine'),
  name: z.string().describe('Human-readable routine name'),
  description: z.string().optional().describe('What the run does, and when to refer to it'),

  inputs: z.array(RoutineInputSchema).optional().describe('Declared parameters. Every name the body reads that it does not write is one of these.'),
  outputs: z.array(RoutineOutputSchema).optional().describe('Declared produced values, each a full variable declaration bound to a session variable at the point of use.'),
  internals: z.array(RoutineInternalSchema).optional().describe('Names the body\'s steps pass between themselves, which never enter the workflow variable set.'),

  steps: z.array(StepSchema).min(1).describe('The run, an ordered list of kind-tagged steps. A routine with no steps is a signature with nothing behind it.'),
}).strict();

export type Routine = z.infer<typeof RoutineSchema>;

export function validateRoutine(data: unknown): Routine { return RoutineSchema.parse(data); }
export function safeValidateRoutine(data: unknown) { return RoutineSchema.safeParse(data); }

/** Every name in scope inside a routine's body: its inputs, its outputs and its internals. */
export function routineScope(routine: Routine): {
  inputs: Map<string, RoutineInput>;
  outputs: Map<string, RoutineOutput>;
  internals: Map<string, RoutineInternal>;
} {
  return {
    inputs: new Map((routine.inputs ?? []).map((i) => [i.id, i])),
    outputs: new Map((routine.outputs ?? []).map((o) => [o.id, o])),
    internals: new Map((routine.internals ?? []).map((n) => [n.id, n])),
  };
}
