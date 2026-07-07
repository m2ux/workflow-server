import type { VariableDefinition } from '../schema/workflow.schema.js';

/**
 * Build the initial session variable bag from a workflow's variable
 * declarations (#166 B7). Every declaration carrying a `defaultValue` is
 * seeded — presence is what matters, so falsy defaults (`false`, `""`, `0`)
 * seed too. Declarations without a default stay absent from the bag, which
 * keeps `exists`/`notExists` gates on them meaningful.
 */
export function seedDefaults(variables: VariableDefinition[] | undefined): Record<string, unknown> {
  const bag: Record<string, unknown> = {};
  for (const v of variables ?? []) {
    if (v.defaultValue !== undefined) bag[v.name] = v.defaultValue;
  }
  return bag;
}

/**
 * JSON-model type of a runtime value, aligned with the variable `type` enum
 * (`string` | `number` | `boolean` | `array` | `object`). `null` and
 * `undefined` return 'null'/'undefined', which never match a declared type.
 */
export function jsonTypeOf(value: unknown): string {
  if (value === null) return 'null';
  if (Array.isArray(value)) return 'array';
  return typeof value;
}

/**
 * True for `{name}` template passthroughs authored as setVariable values —
 * the literal is a reference resolved agent-side, so its string type must
 * not be validated against the declared variable type.
 */
export function isTemplateReference(value: unknown): boolean {
  return typeof value === 'string' && /^\{[^{}]+\}$/.test(value);
}
