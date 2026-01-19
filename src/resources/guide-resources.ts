import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listGuides, readGuide } from '../loaders/guide-loader.js';
import { logInfo } from '../logging.js';

export function registerGuideResources(server: McpServer, config: ServerConfig): void {
  // Static resource for listing all guides
  server.resource(
    'guides-list',
    'workflow://guides',
    { description: 'List all available workflow guides' },
    async () => {
      logInfo('Resource accessed: workflow://guides');
      return { contents: [{ uri: 'workflow://guides', mimeType: 'application/json', text: JSON.stringify(await listGuides(config.guideDir), null, 2) }] };
    }
  );

  // Dynamic resource template for individual guides
  server.resource(
    'guide',
    new ResourceTemplate('workflow://guides/{name}', { list: undefined }),
    { description: 'Get content of a specific workflow guide' },
    async (uri, variables) => {
      const name = variables['name'] as string;
      if (!name) throw new Error('Invalid guide URI');
      logInfo('Resource accessed: guide', { name });
      const result = await readGuide(config.guideDir, name);
      if (!result.success) throw result.error;
      return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: result.value }] };
    }
  );
}
