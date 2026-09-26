import { z } from 'zod';
import { enforcement } from './enforcement.js';
import { EXEMPT_DATA_IDS, QUALIFIED_DATA_ID_PATTERN } from './identifiers.js';

export const VariableNameSchema = z.union([
  z.string().regex(QUALIFIED_DATA_ID_PATTERN, 'a variable name is a qualified snake_case noun phrase (>=2 words, AP-60), e.g. `analysis_target`').describe('Snake_case noun phrase containing at least two words.'),
  z.enum(EXEMPT_DATA_IDS).describe('Permitted single-word variable name.'),
]).describe('Snake_case noun phrase of at least two words, or a listed single-word exemption.');

export const VariableDefinitionSchema = z.object({
  name: VariableNameSchema,
  type: enforcement(z.enum(['string', 'number', 'boolean', 'array', 'object']).describe('Declared variable type.'), { owner: 'Engine', strictness: 'advisory' }),
  description: z.string().optional().describe('Meaning and intended use of the variable.'),
  values: enforcement(z.array(z.string().describe('Allowed string value for the variable.')).min(1).optional().describe('Nonempty set of distinct allowed string values, including the default when one is declared.'), { owner: 'Engine', strictness: 'advisory' }),
  defaultValue: enforcement(z.unknown().optional().describe('Initial variable value; a defaulted variable is already present at the start of a session.'), { owner: 'Engine', strictness: 'enforced' }),
  required: enforcement(z.boolean().default(false).describe('Whether the workflow requires a value for this variable.'), { owner: 'Agent', strictness: 'advisory' }),
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
  reads: enforcement(z.array(VariableNameSchema).optional().describe('Session variable names required from outside this activity; values produced by its earlier steps are local.'), { owner: 'Engine', strictness: 'advisory' }),
  writes: enforcement(z.array(VariableDefinitionSchema).optional().describe('Declarations for session variables written by this activity.'), { owner: 'Engine', strictness: 'enforced' }),
}).strict().describe('Variables required from the workflow and variables produced by the activity.');
export type ActivityVariables = z.infer<typeof ActivityVariablesSchema>;
