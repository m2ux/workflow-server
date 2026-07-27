import type { VariableDefinition } from '../schema/workflow.schema.js';
import type { HistoryEntry } from './../schema/state.schema.js';

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

/**
 * The two engine-applied write paths into the session variable bag. Recorded
 * on each `variable_set` history event so the stream distinguishes a user
 * decision from a worker's domain output.
 */
export type VariableWriteSource = 'setVariable' | 'variables_changed';

/** The mutable slice of session state a variable write touches. */
interface VariableWriteTarget {
  variables: Record<string, unknown>;
  history: HistoryEntry[];
}

/**
 * Apply a map of variable assignments to the session bag, appending one
 * `variable_set` history event per name and returning warn-only messages for
 * declared-type mismatches. Values are stored as written either way; `{name}`
 * template passthroughs are exempt because they are resolved agent-side.
 *
 * Shared by both write paths so they stay honest with one another: checkpoint
 * `setVariable` effects (respond_checkpoint) and worker-reported
 * `variables_changed` results (next_activity).
 */
export function applyVariableWrites(
  draft: VariableWriteTarget,
  values: Record<string, unknown>,
  declaredTypes: Map<string, string>,
  ctx: { timestamp: string; activity?: string; source: VariableWriteSource },
): string[] {
  const warnings: string[] = [];
  for (const [name, value] of Object.entries(values)) {
    const declaredType = declaredTypes.get(name);
    const valueType = jsonTypeOf(value);
    const mismatch = declaredType !== undefined && !isTemplateReference(value) && valueType !== declaredType;
    if (mismatch) {
      warnings.push(
        `${ctx.source} '${name}': value is ${valueType} but the variable is declared ${declaredType}; stored as written.`,
      );
    }
    draft.variables[name] = value;
    draft.history.push({
      timestamp: ctx.timestamp,
      type: 'variable_set',
      ...(ctx.activity !== undefined ? { activity: ctx.activity } : {}),
      data: { name, value, source: ctx.source, ...(mismatch ? { declaredType, valueType, typeMismatch: true } : {}) },
    });
  }
  return warnings;
}
