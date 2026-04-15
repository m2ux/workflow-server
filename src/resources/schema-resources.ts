import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { readAllSchemas, readSchema, listSchemaIds } from '../loaders/schema-loader.js';

const SCHEMA_DESCRIPTIONS: Record<string, string> = {
  workflow: 'Workflow definition schema — orchestrates activities with rules, variables, and modes',
  activity: 'Activity definition schema — stages with steps, transitions, checkpoints, and decisions',
  condition: 'Condition schema — conditional expressions for transitions, decisions, and loops',
  skill: 'Skill definition schema — reusable capabilities with protocol, tools, inputs/outputs, and rules',
  state: 'State schema — runtime execution progress tracking',
};

/**
 * Register MCP resources for TOON schema access.
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
        description: SCHEMA_DESCRIPTIONS[id] ?? `TOON ${id} schema definition`,
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
      description: 'All TOON schema definitions for workflow interpretation (workflow, activity, condition, skill, state)',
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
