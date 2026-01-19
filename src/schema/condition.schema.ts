import { z } from 'zod';

export const ComparisonOperatorSchema = z.enum([
  '==', '!=', '>', '<', '>=', '<=', 'exists', 'notExists',
]);

export type ComparisonOperator = z.infer<typeof ComparisonOperatorSchema>;

export type Condition =
  | { type: 'simple'; variable: string; operator: ComparisonOperator; value?: string | number | boolean | null | undefined; }
  | { type: 'and'; conditions: Condition[]; }
  | { type: 'or'; conditions: Condition[]; }
  | { type: 'not'; condition: Condition; };

export const SimpleConditionSchema = z.object({
  type: z.literal('simple'),
  variable: z.string(),
  operator: ComparisonOperatorSchema,
  value: z.union([z.string(), z.number(), z.boolean(), z.null()]).optional(),
});

export type SimpleCondition = z.infer<typeof SimpleConditionSchema>;

export const ConditionSchema: z.ZodType<Condition> = z.union([
  SimpleConditionSchema,
  z.object({ type: z.literal('and'), conditions: z.lazy(() => z.array(ConditionSchema).min(2)) }),
  z.object({ type: z.literal('or'), conditions: z.lazy(() => z.array(ConditionSchema).min(2)) }),
  z.object({ type: z.literal('not'), condition: z.lazy(() => ConditionSchema) }),
]);

export const AndConditionSchema = z.object({ type: z.literal('and'), conditions: z.array(ConditionSchema).min(2) });
export const OrConditionSchema = z.object({ type: z.literal('or'), conditions: z.array(ConditionSchema).min(2) });
export const NotConditionSchema = z.object({ type: z.literal('not'), condition: ConditionSchema });

export type AndCondition = z.infer<typeof AndConditionSchema>;
export type OrCondition = z.infer<typeof OrConditionSchema>;
export type NotCondition = z.infer<typeof NotConditionSchema>;

export function evaluateCondition(condition: Condition, variables: Record<string, unknown>): boolean {
  switch (condition.type) {
    case 'simple': return evaluateSimpleCondition(condition, variables);
    case 'and': return condition.conditions.every(c => evaluateCondition(c, variables));
    case 'or': return condition.conditions.some(c => evaluateCondition(c, variables));
    case 'not': return !evaluateCondition(condition.condition, variables);
  }
}

function getVariableValue(path: string, variables: Record<string, unknown>): unknown {
  const parts = path.split('.');
  let current: unknown = variables;
  for (const part of parts) {
    if (current === null || current === undefined || typeof current !== 'object') return undefined;
    current = (current as Record<string, unknown>)[part];
  }
  return current;
}

function evaluateSimpleCondition(condition: SimpleCondition, variables: Record<string, unknown>): boolean {
  const value = getVariableValue(condition.variable, variables);
  switch (condition.operator) {
    case 'exists': return value !== undefined && value !== null;
    case 'notExists': return value === undefined || value === null;
    case '==': return value === condition.value;
    case '!=': return value !== condition.value;
    case '>': return typeof value === 'number' && typeof condition.value === 'number' && value > condition.value;
    case '<': return typeof value === 'number' && typeof condition.value === 'number' && value < condition.value;
    case '>=': return typeof value === 'number' && typeof condition.value === 'number' && value >= condition.value;
    case '<=': return typeof value === 'number' && typeof condition.value === 'number' && value <= condition.value;
  }
}

export function validateCondition(data: unknown): Condition { return ConditionSchema.parse(data); }
export function safeValidateCondition(data: unknown) { return ConditionSchema.safeParse(data); }
