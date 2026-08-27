import { z } from 'zod';
import { EXEMPT_DATA_IDS, QUALIFIED_DATA_ID_PATTERN } from './identifiers.js';

// A variable name is a qualified snake_case noun phrase (AP-60: >=2 words, e.g.
// `analysis_target`, never bare `target`), or one of the enumerated bare-word exemptions.
export const VariableNameSchema = z.union([
  z.string().regex(QUALIFIED_DATA_ID_PATTERN, 'a variable name is a qualified snake_case noun phrase (>=2 words, AP-60), e.g. `analysis_target`'),
  z.enum(EXEMPT_DATA_IDS),
]).describe('Qualified snake_case noun phrase (>=2 words, AP-60), or an enumerated bare-word exemption.');

export const VariableDefinitionSchema = z.object({
  name: VariableNameSchema,
  type: z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Declared type. The server validates checkpoint setVariable values against it, warn-only: a mismatch is stored as written and surfaced in _meta.validation and on the variable_set history event. Agents honor it for their own writes.'),
  description: z.string().optional(),
  values: z.array(z.string()).min(1).optional().describe('The complete set of values a string variable admits. The server validates writes against it warn-only, as it does the declared type.'),
  defaultValue: z.unknown().optional().describe('Initial value the server seeds into the session variable bag at session creation (start_session fresh sessions and dispatch_child children), recorded as one variables_seeded history event. Do not gate a defaulted variable with exists/notExists — seeding makes the gate constant (check:variable-model enforces this).'),
  required: z.boolean().default(false).describe('Authoring metadata; the server does not check that the variable is ever set.'),
}).superRefine((variable, ctx) => {
  if (variable.values === undefined) return;
  if (variable.type !== 'string') {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['values'],
      message: `variable '${variable.name}': a value set is declared on a string variable, not on ${variable.type}`,
    });
  }
  const duplicates = variable.values.filter((v, i) => variable.values!.indexOf(v) !== i);
  if (duplicates.length > 0) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['values'],
      message: `variable '${variable.name}': value set repeats [${[...new Set(duplicates)].join(', ')}]`,
    });
  }
  if (variable.defaultValue !== undefined && !variable.values.includes(variable.defaultValue as string)) {
    ctx.addIssue({
      code: z.ZodIssueCode.custom,
      path: ['defaultValue'],
      message: `variable '${variable.name}': default ${JSON.stringify(variable.defaultValue)} is outside its declared value set [${variable.values.join(', ')}]`,
    });
  }
});
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;

/** True when `value` is outside the variable's declared value set. A variable with no set admits any value. */
export function isOutsideValueSet(variable: Pick<VariableDefinition, 'values'>, value: unknown): boolean {
  return variable.values !== undefined && !variable.values.includes(value as string);
}

/**
 * An activity's variable contract (#493): the session variables it reads, and the variables it
 * writes. Direction is the part a checker acts on — a read with no writer, a write with no reader,
 * and a read no path reaches a write for are each mechanical once the two lists exist.
 *
 * A read is a name: the activity needs the value and does not own it. A write is a full
 * declaration, because the writing activity is where the variable is owned. Including the activity
 * in a workflow's graph contributes its writes to that workflow's variable set — one flat
 * namespace, so two activities naming one variable mean one variable. Two declarations of one name
 * that disagree on type or default fail the load.
 */
export const ActivityVariablesSchema = z.object({
  reads: z.array(VariableNameSchema).optional().describe('Session variables this activity consults: gate and routing conditions, loop collections, prose interpolations, and the bound operations\' own inputs it does not supply itself. A name written by an earlier step of the same activity is resolved internally and is not declared here.'),
  writes: z.array(VariableDefinitionSchema).optional().describe('Session variables this activity puts into the bag: its bound operations\' outputs (under their declared id or the step binding\'s remap target), its checkpoint setVariable effects and its `set` action targets. Contributed to the including workflow\'s variable set, defaultValue included — a loop variable is iteration state and is not declared here.'),
}).strict();
export type ActivityVariables = z.infer<typeof ActivityVariablesSchema>;
