import { z } from 'zod';
import { StepSchema } from './activity.schema.js';
import { SemanticVersionSchema } from './common.js';
import { VariableNameSchema } from './variable.schema.js';

export const RoutineIdSchema = z.string().regex(
  /^[a-z][a-z0-9]*(-[a-z0-9]+)*$/,
  'a routine id is kebab-case (`assumption-interview`) and carries no `::` — a routine name has no group grammar',
).describe('Kebab-case routine identifier without `::`.');

export const RoutineInputSchema = z.object({
  id: VariableNameSchema.describe('Parameter name within the routine body.'),
  description: z.string().describe('What the parameter is for, in the routine\'s own vocabulary.'),
  kind: z.literal('technique').optional().describe('Marks a technique-reference parameter, requiring a literal technique reference at each use or a declared default.'),
  default: z.union([z.string().describe('Default text value or technique reference.'), z.number().describe('Default numeric value.'), z.boolean().describe('Default boolean value.')]).optional().describe('Value for an unbound argument; without a default, a value parameter uses the host variable of the same name.'),
}).strict().describe('Routine parameter with an optional technique-reference kind and default.');
export type RoutineInput = z.infer<typeof RoutineInputSchema>;

/** Whether a parameter's argument is a technique reference rather than a value. */
export function isOperationInput(input: RoutineInput): boolean {
  return input.kind === 'technique';
}

export const RoutineOutputSchema = z.object({
  id: VariableNameSchema.describe('Output name within the routine body, bound to a session variable at each use.'),
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Type of the output and its bound session variable.'),
  description: z.string().describe('What the value is.'),
  values: z.array(z.string().describe('Allowed string output value.')).min(1).optional().describe('Complete set of allowed values for a string output.'),
  optional: z.literal(true).optional().describe('Declare `true` to allow this output to remain unbound; omission requires an output binding.'),
}).strict().describe('Produced value with its type, allowed values, and binding requirement.');
export type RoutineOutput = z.infer<typeof RoutineOutputSchema>;

export const RoutineInternalSchema = z.object({
  id: VariableNameSchema.describe('Name local to the routine body at each use, outside the workflow variable set.'),
  description: z.string().describe('What the value is, and which steps pass it.'),
}).strict().describe('Named value shared by steps within one use of a routine.');
export type RoutineInternal = z.infer<typeof RoutineInternalSchema>;

export const RoutineSchema = z.object({
  id: RoutineIdSchema.describe('Unique kebab-case routine identifier, without `::`.'),
  version: SemanticVersionSchema.describe('Semantic version of the routine'),
  name: z.string().describe('Human-readable routine name'),
  description: z.string().optional().describe('What the run does, and when to refer to it'),

  inputs: z.array(RoutineInputSchema).optional().describe('Parameters for every value the body reads without producing itself.'),
  outputs: z.array(RoutineOutputSchema).optional().describe('Produced values with variable declarations and bindings to session variables, without `defaultValue`.'),
  internals: z.array(RoutineInternalSchema).optional().describe('Names for values shared between the routine\'s steps, local to each use.'),

  steps: z.array(StepSchema).min(1).describe('Nonempty ordered list of steps.'),
}).strict().describe('Reusable steps with declared inputs, outputs, and internals; activity fields such as exits, outcome, rules, triggers, and activity-wide techniques are absent.').superRefine((routine, ctx) => {
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
