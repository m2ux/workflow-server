import { parse, stringify } from 'yaml';

/**
 * Parse a YAML workflow/activity/technique definition into an untyped object.
 * Callers validate or narrow the result against a schema.
 */
export function parseDefinition(content: string): unknown {
  return parse(content);
}

/**
 * Serialize a value to YAML for inclusion in MCP tool responses
 * (workflow/activity bundles, manifests, checkpoints).
 * `lineWidth: 0` disables line folding so long strings stay on a single line.
 */
export function stringifyForResponse(value: Record<string, unknown> | unknown[] | unknown): string {
  return stringify(value, { lineWidth: 0 });
}
