import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { readAllSchemas } from '../loaders/schema-loader.js';

/**
 * Register MCP resources for TOON schema access.
 * Exposes all schemas via a single resource at workflow-server://schemas.
 */
export function registerSchemaResources(server: McpServer, config: ServerConfig): void {
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
