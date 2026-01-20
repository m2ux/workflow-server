import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listIntents, readIntent, readIntentIndex } from '../loaders/intent-loader.js';
import { logInfo } from '../logging.js';

export function registerIntentResources(server: McpServer): void {
  // Static resource for intent index (primary entry point for agents)
  server.resource(
    'intents-index',
    'workflow://intents',
    { description: 'Get the intent index - the primary entry point for workflow execution' },
    async () => {
      logInfo('Resource accessed: workflow://intents');
      const result = await readIntentIndex();
      if (!result.success) {
        // Fall back to listing intents if index not found
        const intents = await listIntents();
        return { contents: [{ uri: 'workflow://intents', mimeType: 'application/json', text: JSON.stringify(intents, null, 2) }] };
      }
      return { contents: [{ uri: 'workflow://intents', mimeType: 'application/json', text: JSON.stringify(result.value, null, 2) }] };
    }
  );

  // Dynamic resource template for individual intents
  server.resource(
    'intent',
    new ResourceTemplate('workflow://intents/{id}', { list: undefined }),
    { description: 'Get a specific workflow intent' },
    async (uri, variables) => {
      const id = variables['id'] as string;
      if (!id) throw new Error('Invalid intent URI');
      logInfo('Resource accessed: intent', { id });
      const result = await readIntent(id);
      if (!result.success) throw result.error;
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(result.value, null, 2) }] };
    }
  );
}
