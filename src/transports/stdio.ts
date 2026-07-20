import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from '../server.js';
import type { ServerConfig } from '../config.js';
import { logInfo } from '../logging.js';

/**
 * Start the server over stdio — the original (and still default) transport.
 * Body moved verbatim out of `main()` so the CLI router in `index.ts` can pick
 * between this and `startHttpServer` without duplicating startup logic.
 */
export async function startStdioServer(config: ServerConfig): Promise<void> {
  const server = createServer(config);
  await server.connect(new StdioServerTransport());
  logInfo('Server connected and ready', { transport: 'stdio' });
}
