import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listGuides, readGuide } from '../loaders/guide-loader.js';
import { logInfo } from '../logging.js';

export function registerGuideResources(server: McpServer, config: ServerConfig): void {
  server.resource('workflow://guides', 'List all available workflow guides', async () => {
    logInfo('Resource accessed: workflow://guides');
    return { contents: [{ uri: 'workflow://guides', mimeType: 'application/json', text: JSON.stringify(await listGuides(config.guideDir), null, 2) }] };
  });

  server.resource('workflow://guides/{name}', 'Get content of a specific workflow guide', async (uri) => {
    const name = uri.href.match(/workflow:\/\/guides\/(.+)$/)?.[1];
    if (!name) throw new Error('Invalid guide URI');
    logInfo('Resource accessed: guide', { name });
    const result = await readGuide(config.guideDir, name);
    if (!result.success) throw result.error;
    return { contents: [{ uri: uri.href, mimeType: 'text/markdown', text: result.value }] };
  });
}
