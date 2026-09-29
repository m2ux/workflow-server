import { describe, it, expect } from 'vitest';
import { readFileSync, readdirSync } from 'node:fs';
import { join, resolve } from 'node:path';

const SCHEMAS_DIR = resolve(import.meta.dirname, '../schemas');

/**
 * Guardrail for the generated JSON Schema files (issue #166 B5).
 *
 * zod-to-json-schema with `$refStrategy: 'none'` cannot represent recursive schemas: each cycle
 * (the and/or/not condition combinators, the loop-kind step's nested steps[], the session file's
 * embedded launched-workflow state) silently degrades to the empty schema `{}` — accept-anything —
 * so authoring-time validation passes garbage that Zod then rejects at load. These tests fail if a
 * regeneration reintroduces an empty-schema recursion point.
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

/** Visit schema positions, excluding instance data such as defaults and examples. */
function findUndescribedSchemas(node: unknown, path: string, out: string[]): void {
  if (node === null || typeof node !== 'object' || Array.isArray(node)) return;
  const schema = node as Record<string, unknown>;
  if (typeof schema['$ref'] !== 'string'
    && (typeof schema['description'] !== 'string' || !schema['description'].trim())) {
    out.push(path);
  }
  for (const key of ['properties', 'patternProperties', 'definitions', '$defs']) {
    const children = schema[key];
    if (children && typeof children === 'object' && !Array.isArray(children)) {
      for (const [name, child] of Object.entries(children)) {
        findUndescribedSchemas(child, `${path}.${key}.${name}`, out);
      }
    }
  }
  for (const key of ['items', 'additionalProperties', 'not', 'if', 'then', 'else']) {
    findUndescribedSchemas(schema[key], `${path}.${key}`, out);
  }
  for (const key of ['anyOf', 'oneOf', 'allOf', 'prefixItems', 'items']) {
    const children = schema[key];
    if (Array.isArray(children)) {
      children.forEach((child, i) => findUndescribedSchemas(child, `${path}.${key}[${i}]`, out));
    }
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

  it.each(schemaFiles)('%s describes every schema item or references a described definition', (file) => {
    const schema: unknown = JSON.parse(readFileSync(join(SCHEMAS_DIR, file), 'utf-8'));
    const missing: string[] = [];
    findUndescribedSchemas(schema, '$', missing);
    expect(missing, `schema items without descriptions in ${file}`).toEqual([]);
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

  /** Every `$ref` target in a schema, wherever it sits. */
  function refTargets(node: unknown, out: string[] = []): string[] {
    if (Array.isArray(node)) { node.forEach((n) => refTargets(n, out)); return out; }
    if (node === null || typeof node !== 'object') return out;
    for (const [key, value] of Object.entries(node)) {
      if (key === '$ref' && typeof value === 'string') out.push(value);
      else refTargets(value, out);
    }
    return out;
  }

  const read = (name: string) => JSON.parse(readFileSync(join(SCHEMAS_DIR, `${name}.schema.json`), 'utf-8'));

  it.each([
    ['activity', ['activity', 'whenExpression', 'condition', 'techniqueReference']],
    ['routine', ['routine', 'whenExpression', 'condition', 'techniqueReference']],
    ['workflow', ['workflow', 'techniqueReference']],
  ])('%s leads its definitions with its own and then the shared grammars', (name, keys) => {
    expect(Object.keys(read(name).definitions)).toEqual(keys);
  });

  it.each(['activity', 'routine'])('%s gates and technique references reference the shared definitions', (name) => {
    const schema = read(name);
    const conditions = schema.definitions.condition.anyOf as Array<{ properties: Record<string, { $ref?: string; items?: { $ref?: string } }> }>;
    const byType = (t: string) => conditions.find(v => (v.properties['type'] as { const?: string }).const === t)!;
    expect(byType('and').properties['conditions']!.items!.$ref).toBe('#/definitions/condition');
    expect(byType('not').properties['condition']!.$ref).toBe('#/definitions/condition');
    // A condition field shared by every step kind is referenced at its first site; that site, and so
    // every chain through it, ends at the condition definition rather than at another field's value.
    const resolve = (ref: string): unknown => ref.slice(2).split('/').reduce<unknown>((n, k) => (n as Record<string, unknown>)[k], schema);
    const ownPath = `#/definitions/${name}/`;
    for (const ref of refTargets(schema).filter((r) => r.startsWith(ownPath) && /condition$/.test(r))) {
      expect((resolve(ref) as { $ref?: string }).$ref, ref).toBe('#/definitions/condition');
    }
    // Each step kind's entry gate, and a technique step's reference, reach the shared definitions.
    const kinds = schema.definitions[name].properties.steps.items.anyOf as Array<{ properties: Record<string, { $ref?: string; anyOf?: Array<{ $ref?: string }> }> }>;
    for (const kind of kinds) {
      const when = kind.properties['when']!.$ref!;
      expect(when.startsWith(ownPath) ? (resolve(when) as { $ref?: string }).$ref : when).toBe('#/definitions/whenExpression');
    }
    expect(kinds[0]!.properties['technique']!.anyOf![0]!.$ref).toBe('#/definitions/techniqueReference');
    for (const kind of kinds) {
      for (const field of ['continueWhile', 'breakCondition'] as const) {
        const ref = kind.properties[field]?.$ref;
        if (ref !== undefined) expect(ref, field).toBe('#/definitions/condition');
      }
    }
  });

  it('an activity exit gate and the activity technique list reference the shared definitions directly', () => {
    const activity = read('activity').definitions.activity;
    expect(activity.properties.exits.items.properties.when.$ref).toBe('#/definitions/whenExpression');
    expect(activity.properties.techniques.items.$ref).toBe('#/definitions/techniqueReference');
  });
});
