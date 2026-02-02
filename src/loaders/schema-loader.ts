import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { Result, ok, err } from '../result.js';

/**
 * All TOON schema definitions keyed by schema ID.
 */
export interface AllSchemas {
  workflow: object;
  activity: object;
  condition: object;
  skill: object;
  state: object;
}

const SCHEMA_IDS = ['workflow', 'activity', 'condition', 'skill', 'state'] as const;

/**
 * Read all schema files from the schemas directory.
 * Returns a single object with all schemas keyed by their ID.
 */
export async function readAllSchemas(schemasDir: string): Promise<Result<AllSchemas>> {
  try {
    const schemas: Record<string, object> = {};
    
    for (const schemaId of SCHEMA_IDS) {
      const filename = `${schemaId}.schema.json`;
      const filepath = join(schemasDir, filename);
      
      try {
        const content = await readFile(filepath, 'utf-8');
        schemas[schemaId] = JSON.parse(content);
      } catch (error) {
        return err(new Error(`Failed to read schema '${schemaId}': ${error instanceof Error ? error.message : String(error)}`));
      }
    }
    
    return ok(schemas as unknown as AllSchemas);
  } catch (error) {
    return err(error instanceof Error ? error : new Error(String(error)));
  }
}

/**
 * List available schema IDs.
 */
export function listSchemaIds(): readonly string[] {
  return SCHEMA_IDS;
}
