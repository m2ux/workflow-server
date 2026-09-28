import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { readAllSchemas, readSchema, listSchemaIds } from '../loaders/schema-loader.js';

const SCHEMA_DESCRIPTIONS: Record<string, string> = {
  workflow: 'Workflow definition schema — rules, variables and techniques, and the graph binding each activity exit to a destination',
  activity: 'Activity definition schema — an ordered list of kind-tagged steps (technique | action | checkpoint | loop | routine), the variables it reads and writes, and its named exits',
  condition: 'Condition schema — structured variable tests and their and/or/not combinations, gating steps, actions and loops',
  technique: 'Technique definition schema — reusable capabilities with inputs, protocol, rules, and outputs',
  'session-file': 'Session-file schema — the on-disk session.json record the server seals and loads by session_index',
};

/**
 * Register MCP resources for workflow-definition schema access.
 * Exposes each schema individually at workflow-server://schemas/{id}
 * and all schemas combined at workflow-server://schemas.
 */
export function registerSchemaResources(server: McpServer, config: ServerConfig): void {
  // Register individual schema resources
  for (const id of listSchemaIds()) {
    server.registerResource(
      `schema-${id}`,
      `workflow-server://schemas/${id}`,
      {
        description: SCHEMA_DESCRIPTIONS[id] ?? `${id} schema definition`,
        mimeType: 'application/json',
      },
      async (uri) => {
        const result = await readSchema(config.schemasDir, id);
        if (!result.success) {
          throw result.error;
        }
        return {
          contents: [{
            uri: uri.toString(),
            mimeType: 'application/json',
            text: JSON.stringify(result.value, null, 2),
          }],
        };
      }
    );
  }

  // Register combined resource for all schemas
  server.registerResource(
    'schemas',
    'workflow-server://schemas',
    {
      description: 'All schema definitions for workflow interpretation (workflow, activity, condition, technique, session-file)',
      mimeType: 'application/json',
    },
    async (uri) => {
      const result = await readAllSchemas(config.schemasDir);
      if (!result.success) {
        throw result.error;
      }
      return {
        contents: [{
          uri: uri.toString(),
          mimeType: 'application/json',
          text: JSON.stringify(result.value, null, 2),
        }],
      };
    }
  );
}
