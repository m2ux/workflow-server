import { describe, it, expect } from 'vitest';
import { join } from 'node:path';
import { readAllSchemas, listSchemaIds } from '../src/loaders/schema-loader.js';

const SCHEMAS_DIR = join(process.cwd(), 'schemas');

describe('schema-loader', () => {
  describe('listSchemaIds', () => {
    it('should return all schema IDs', () => {
      const ids = listSchemaIds();
      expect(ids).toContain('workflow');
      expect(ids).toContain('activity');
      expect(ids).toContain('condition');
      expect(ids).toContain('skill');
      expect(ids).toContain('state');
      expect(ids.length).toBe(5);
    });
  });

  describe('readAllSchemas', () => {
    it('should load all schemas successfully', async () => {
      const result = await readAllSchemas(SCHEMAS_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        expect(result.value.workflow).toBeDefined();
        expect(result.value.activity).toBeDefined();
        expect(result.value.condition).toBeDefined();
        expect(result.value.skill).toBeDefined();
        expect(result.value.state).toBeDefined();
      }
    });

    it('should return valid JSON Schema for workflow', async () => {
      const result = await readAllSchemas(SCHEMAS_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const schema = result.value.workflow as Record<string, unknown>;
        expect(schema['$schema']).toContain('json-schema.org');
        expect(schema['title']).toBe('workflow');
      }
    });

    it('should return valid JSON Schema for activity', async () => {
      const result = await readAllSchemas(SCHEMAS_DIR);
      expect(result.success).toBe(true);
      if (result.success) {
        const schema = result.value.activity as Record<string, unknown>;
        expect(schema['$schema']).toContain('json-schema.org');
        expect(schema['title']).toBe('activity');
      }
    });

    it('should return error for non-existent directory', async () => {
      const result = await readAllSchemas('/non/existent/path');
      expect(result.success).toBe(false);
      if (!result.success) {
        expect(result.error.message).toContain('Failed to read schema');
      }
    });
  });
});
