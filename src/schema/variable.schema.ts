import { z } from 'zod';
import { enforcement } from './enforcement.js';
import { EXEMPT_DATA_IDS, QUALIFIED_DATA_ID_PATTERN } from './identifiers.js';

export const VariableNameSchema = z.union([
  z.string().regex(QUALIFIED_DATA_ID_PATTERN, 'a variable name is a qualified snake_case noun phrase (>=2 words, AP-60), e.g. `analysis_target`').describe('Qualified snake_case noun phrase of at least two words: a lowercase letter, then lowercase letters and digits, with each further word after a single underscore (`analysis_target`, never bare `target`).'),
  z.enum(EXEMPT_DATA_IDS).describe('Permitted single-word variable name.'),
]).describe('Snake_case noun phrase of at least two words, or a listed single-word exemption.');

export const VariableDefinitionSchema = z.object({
  name: VariableNameSchema,
  type: enforcement(z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Declared variable type. A value written to the session, through a checkpoint `setVariable` effect or a reported variable change, is checked against it; a mismatch is stored as written with a warning, and a `{name}` template value is exempt. Declarations of one name, in the workflow or its activities, that name different types fail the workflow load.'), { owner: 'Engine', strictness: 'enforced' }),
  description: z.string().optional().describe('Meaning and intended use of the variable.'),
  values: enforcement(z.array(z.string().describe('Allowed string value for the variable.')).min(1).optional().describe('Complete set of values the variable admits: nonempty, without repeats, and declared only on a `string` variable. A declared `defaultValue` must be one of them. A value written outside the set is stored as written with a warning, and a `{name}` template value is exempt. Declarations of one name that each name a value set, and name different ones, fail the workflow load.'), { owner: 'Engine', strictness: 'enforced' }),
  defaultValue: enforcement(z.unknown().optional().describe('Initial value, present from the start of every session and child session. Do not gate a defaulted variable with `exists` or `notExists`: the variable is always present, so the gate is constant, and `check:variable-model` rejects it. Declarations of one name that each name a starting value, and name different ones, fail the workflow load.'), { owner: 'Engine', strictness: 'enforced' }),
  required: enforcement(z.boolean().default(false).describe('Marks the variable as expected to be set; no check reads it.'), { owner: 'Agent', strictness: 'advisory' }),
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
}).describe('Variable declaration with type, allowed values, and an optional initial value.');
export type VariableDefinition = z.infer<typeof VariableDefinitionSchema>;

/** True when `value` is outside the variable's declared value set. A variable with no set admits any value. */
export function isOutsideValueSet(variable: Pick<VariableDefinition, 'values'>, value: unknown): boolean {
  return variable.values !== undefined && !variable.values.includes(value as string);
}

export const ActivityVariablesSchema = z.object({
  reads: enforcement(z.array(VariableNameSchema).optional().describe('Session variables this activity consults and does not produce: gate and routing conditions, loop collections, prose interpolations, and the bound techniques\' inputs it does not supply itself. A name written by an earlier step of the same activity is local and not declared here.'), { owner: 'Engine', strictness: 'advisory' }),
  writes: enforcement(z.array(VariableDefinitionSchema).optional().describe('Declarations for the session variables this activity writes: its bound techniques\' outputs (under their identifier or the step binding\'s remap target), its checkpoint `setVariable` effects, its `set` action targets, and the item variable each of its loops binds. Contributed to the variable set of every workflow whose graph includes the activity, `defaultValue` included.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Variables required from the workflow and variables produced by the activity. A workflow\'s variables form one flat namespace, so two activities naming one variable mean one variable. Declarations of one name that each name a different type, starting value or value set fail the load; one silent about a starting value takes the value another names.');
export type ActivityVariables = z.infer<typeof ActivityVariablesSchema>;
