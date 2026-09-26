import { z } from 'zod';

export const ComparisonOperatorSchema = z.enum([
  '==', '!=', '>', '<', '>=', '<=', 'exists', 'notExists',
]).describe('Comparison or presence test applied to a variable.');

export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;

export type Condition =
  | { type: 'simple'; variable: string; operator: ComparisonOperator; value?: string | number | boolean | null | undefined; }
  | { type: 'and'; conditions: Condition[]; }
  | { type: 'or'; conditions: Condition[]; }
  | { type: 'not'; condition: Condition; };

export const SimpleConditionSchema = z.object({
  type: z.literal('simple').describe('Identifies a variable comparison or presence test.'),
  variable: z.string().describe('Variable name or dot-separated path to the value to test.'),
  operator: ComparisonOperatorSchema,
  value: z.union([
    z.string().describe('Text value to compare.'),
    z.number().describe('Numeric value to compare.'),
    z.boolean().describe('Boolean value to compare.'),
    z.null().describe('Null value to compare.'),
  ]).optional().describe('Comparison value; unnecessary for `exists` and `notExists` tests.'),
}).describe('Comparison of a variable with a value, or a test of its presence.');

export type SimpleCondition = z.infer<typeof SimpleConditionSchema>;

export const ConditionSchema: z.ZodType<Condition> = z.union([
  SimpleConditionSchema,
  z.object({
    type: z.literal('and').describe('Identifies an all-members condition.'),
    conditions: z.lazy(() => z.array(ConditionSchema).min(2)).describe('At least two conditions that must all be true.'),
  }).describe('Condition requiring every member to be true.'),
  z.object({
    type: z.literal('or').describe('Identifies an any-member condition.'),
    conditions: z.lazy(() => z.array(ConditionSchema).min(2)).describe('At least two conditions, one or more of which must be true.'),
  }).describe('Condition requiring at least one member to be true.'),
  z.object({
    type: z.literal('not').describe('Identifies a negated condition.'),
    condition: z.lazy(() => ConditionSchema).describe('Condition that must be false.'),
  }).describe('Condition requiring its member to be false.'),
]).describe('Variable test or combination of conditions using `and`, `or`, or `not`.');

export function evaluateCondition(condition: Condition, variables: Record<string, unknown>): boolean {
  switch (condition.type) {
    case 'simple': return evaluateSimpleCondition(condition, variables);
    case 'and': return condition.conditions.every(c => evaluateCondition(c, variables));
    case 'or': return condition.conditions.some(c => evaluateCondition(c, variables));
    case 'not': return !evaluateCondition(condition.condition, variables);
  }
}

/** Resolves a dot-delimited path against the variables object. Returns undefined for missing segments — callers handle this via exists/notExists operators. */
function getVariableValue(path: string, variables: Record<string, unknown>): unknown {
  const parts = path.split('.');
  let current: unknown = variables;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function toNumber(v: unknown): number | undefined {
  if (typeof v === 'number') return v;
  if (typeof v === 'string') { const n = Number(v); return Number.isFinite(n) ? n : undefined; }
  return undefined;
}

function evaluateSimpleCondition(condition: SimpleCondition, variables: Record<string, unknown>): boolean {
  const value = getVariableValue(condition.variable, variables);
  switch (condition.operator) {
    case 'exists': return value !== undefined && value !== null;
    case 'notExists': return value === undefined || value === null;
    case '==': return value === condition.value;
    case '!=': return value !== condition.value;
    case '>': { const a = toNumber(value), b = toNumber(condition.value); return a !== undefined && b !== undefined && a > b; }
    case '<': { const a = toNumber(value), b = toNumber(condition.value); return a !== undefined && b !== undefined && a < b; }
    case '>=': { const a = toNumber(value), b = toNumber(condition.value); return a !== undefined && b !== undefined && a >= b; }
    case '<=': { const a = toNumber(value), b = toNumber(condition.value); return a !== undefined && b !== undefined && a <= b; }
  }
}

export function validateCondition(data: unknown): Condition { return ConditionSchema.parse(data); }
export function safeValidateCondition(data: unknown) { return ConditionSchema.safeParse(data); }
