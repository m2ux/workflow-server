import { describe, it, expect } from 'vitest';
import { resolve } from 'node:path';
import { readAllSchemas, listSchemaIds } from '../src/loaders/schema-loader.js';

const SCHEMAS_DIR = resolve(import.meta.dirname, '../schemas');
const IDS = ['workflow', 'activity', 'condition', 'technique', 'state'] as const;

describe('schema-loader', () => {
  it('names every schema it can load', () => {
    const ids = listSchemaIds();
    for (const id of IDS) expect(ids).toContain(id);
  });

  it('loads each named schema as a JSON Schema titled after its id', async () => {
    const result = await readAllSchemas(SCHEMAS_DIR);
    expect(result.success).toBe(true);
    if (!result.success) return;
    for (const id of IDS) {
      const schema = result.value[id] as Record<string, unknown> | undefined;
      expect(schema, `no schema loaded for '${id}'`).toBeDefined();
      expect(schema!['$schema'], id).toContain('json-schema.org');
      expect(schema!['title']).toBe(id);
    }
  });

  it('returns an error for a non-existent directory', async () => {
    const result = await readAllSchemas('/non/existent/path');
    expect(result.success).toBe(false);
    if (!result.success) expect(result.error.message).toContain('Failed to read schema');
  });
});
