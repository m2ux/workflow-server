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
 * Three guarantees hold for every routine EXCEPT one that binds a technique by argument — an input
 * declared `kind: technique`, whose value stands in a body step's technique position. Such a body
 * names a parameter where a technique reference belongs, so what it reads and what artifact it
 * declares depend on the argument, and until a site supplies one there is nothing to derive:
 *
 * - A contract derives in isolation. For a routine binding a technique by argument it derives once
 *   per reference site, against the technique that site supplies.
 * - A routine walks from its declared inputs. Such a routine is walked per reference site instead.
 * - The artifact check runs once per routine. For such a routine it runs once per reference site.
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
 *
 * `kind: technique` declares that the argument is a technique reference rather than a value. Such a
 * parameter stands in a body step's technique position and is substituted there before the contract
 * derivation runs, so every reference site yields a concrete technique and every signature resolves.
 * It is what lets one run carry several passes that differ in nothing but the technique they bind.
 */
export const RoutineInputSchema = z.object({
  id: VariableNameSchema.describe('The name this parameter carries inside the body, and the name an unbound site falls through to in the host\'s bag.'),
  description: z.string().describe('What the parameter is for, in the routine\'s own vocabulary.'),
  kind: z.literal('technique').optional().describe('Declared where the argument is a technique reference standing in a body step\'s technique position. A reference site binds it with a literal reference, and an unbound one with no default fails the load.'),
  default: z.union([z.string(), z.number(), z.boolean()]).optional().describe('The value the body takes where a reference site binds nothing. Without one, an unbound input reads the host\'s value under this id.'),
}).strict();
export type RoutineInput = z.infer<typeof RoutineInputSchema>;

/** Whether a parameter's argument is a technique reference rather than a value. */
export function isOperationInput(input: RoutineInput): boolean {
  return input.kind === 'technique';
}

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
}).strict().superRefine((routine, ctx) => {
  // A technique step may omit its id, in which case it is derived from the technique reference's
  // last segment. Where that reference is a parameter, the derived id would be the parameter's own
  // name — one identifier for every site, naming the placeholder rather than the technique.
  const parameters = new Set((routine.inputs ?? []).filter(isOperationInput).map((input) => input.id));
  if (parameters.size === 0) return;
  const visit = (steps: readonly z.infer<typeof StepSchema>[], path: (string | number)[]): void => {
    steps.forEach((step, index) => {
      if (step.kind === 'technique' && !step.id) {
        const reference = typeof step.technique === 'string' ? step.technique : step.technique.name;
        if (parameters.has(reference)) {
          ctx.addIssue({
            code: z.ZodIssueCode.custom,
            path: [...path, index, 'id'],
            message: `this step binds the technique parameter '${reference}', so it declares its own id — a derived one would be '${reference}' at every reference site, naming the parameter rather than the technique it stands for`,
          });
        }
      }
      if (step.kind === 'loop') visit(step.steps, [...path, index, 'steps']);
    });
  };
  visit(routine.steps, ['steps']);
});

export type Routine = z.infer<typeof RoutineSchema>;

/** The parameters a routine declares whose argument is a technique reference. */
export function operationInputs(routine: Routine): string[] {
  return (routine.inputs ?? []).filter(isOperationInput).map((input) => input.id);
}

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
