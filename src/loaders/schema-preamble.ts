import { readFile } from 'node:fs/promises';
import { join } from 'node:path';
import { readAllSchemas } from './schema-loader.js';
import { logInfo, logWarn } from '../logging.js';

/**
 * Build a schema preamble string: header + all JSON Schemas (workflow, activity, skill, condition, state).
 * Called once at startup and cached on ServerConfig.
 * Returns empty string if all sources are missing (graceful fallback).
 */
export async function buildSchemaPreamble(schemasDir: string): Promise<string> {
  // Load header (graceful fallback to empty)
  let header = '';
  try {
    header = await readFile(join(schemasDir, 'schema-header.md'), 'utf-8');
  } catch {
    logWarn('Schema header not found', { path: join(schemasDir, 'schema-header.md') });
  }

  // Load schemas (reuses existing loader)
  const result = await readAllSchemas(schemasDir);
  if (!result.success) {
    logWarn('Failed to load schemas for preamble', { error: result.error.message });
    return header;
  }

  const schemas = result.value;
  const sections = [
    header,
    '## workflow.schema.json\n```json\n' + JSON.stringify(schemas.workflow, null, 2) + '\n```',
    '## activity.schema.json\n```json\n' + JSON.stringify(schemas.activity, null, 2) + '\n```',
    '## skill.schema.json\n```json\n' + JSON.stringify(schemas.skill, null, 2) + '\n```',
    '## condition.schema.json\n```json\n' + JSON.stringify(schemas.condition, null, 2) + '\n```',
    '## state.schema.json\n```json\n' + JSON.stringify(schemas.state, null, 2) + '\n```',
  ].filter(Boolean);

  const preamble = sections.join('\n\n');
  logInfo('Schema preamble built', { headerLength: header.length, preambleLength: preamble.length });
  return preamble;
}
