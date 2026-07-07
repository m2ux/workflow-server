import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SCHEMAS_DIR = resolve(import.meta.dirname, '../schemas');

/**
 * Guardrail for the generated JSON Schema files (issue #166 B5).
 *
 * zod-to-json-schema with `$refStrategy: 'none'` cannot represent recursive schemas: each cycle
 * (the and/or/not condition combinators, the loop-kind step's nested steps[], the session file's
 * parentSession) silently degrades to the empty schema `{}` — accept-anything — so authoring-time
 * validation passes garbage that Zod then rejects at load. These tests fail if a regeneration
 * reintroduces an empty-schema recursion point.
 */

/** Collect JSON paths of every empty-object schema found at a recursion-prone keyword. */
function findEmptySubschemas(node: unknown, path: string, out: string[]): void {
  if (Array.isArray(node)) {
    node.forEach((item, i) => findEmptySubschemas(item, `${path}[${i}]`, out));
    return;
  }
  if (node === null || typeof node !== 'object') return;
  for (const [key, value] of Object.entries(node)) {
    const childPath = `${path}.${key}`;
    const isEmptyObject = typeof value === 'object' && value !== null && !Array.isArray(value) && Object.keys(value).length === 0;
    // `items` always holds a schema; a `condition` under `properties` is a schema position too.
    if (isEmptyObject && (key === 'items' || (key === 'condition' && path.endsWith('.properties')))) {
      out.push(childPath);
      continue;
    }
    findEmptySubschemas(value, childPath, out);
  }
}

describe('generated-schemas', () => {
  const schemaFiles = readdirSync(SCHEMAS_DIR).filter(f => f.endsWith('.schema.json'));

  it('should find the generated schema files', () => {
    expect(schemaFiles).toContain('condition.schema.json');
    expect(schemaFiles).toContain('workflow.schema.json');
  });

  it.each(schemaFiles)('%s has no empty-schema recursion points', (file) => {
    const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, file), 'utf-8'));
    const empties: string[] = [];
    findEmptySubschemas(schema, '$', empties);
    expect(empties, `empty subschemas (lost recursion) in ${file}`).toEqual([]);
  });

  it('condition combinators reference the condition definition', () => {
    const schema = JSON.parse(readFileSync(join(SCHEMAS_DIR, 'condition.schema.json'), 'utf-8'));
    const variants: Array<{ properties: Record<string, { $ref?: string; items?: { $ref?: string } }> }> =
      schema.definitions.condition.anyOf;
    const byType = (t: string) => variants.find(v => (v.properties['type'] as { const?: string }).const === t)!;
    expect(byType('and').properties['conditions']!.items!.$ref).toBe('#/definitions/condition');
    expect(byType('or').properties['conditions']!.items!.$ref).toBe('#/definitions/condition');
    expect(byType('not').properties['condition']!.$ref).toBe('#/definitions/condition');
  });
});
