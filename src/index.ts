import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import { createServer } from './server.js';
import { loadConfig } from './config.js';
import { logInfo, logError } from './logging.js';

export * from './schema/workflow.schema.js';
export * from './schema/state.schema.js';
export * from './schema/condition.schema.js';
export * from './types/workflow.js';
export * from './types/state.js';
export { createServer } from './server.js';
export { loadConfig } from './config.js';
export type { ServerConfig } from './config.js';

async function main(): Promise<void> {
  try {
    const config = loadConfig();
    logInfo('Starting MCP Workflow Server', { workflowDir: config.workflowDir });
    const server = createServer(config);
    await server.connect(new StdioServerTransport());
    logInfo('Server connected and ready');
  } catch (error) {
    logError('Failed to start server', error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

main().catch((error) => { logError('Unhandled error', error instanceof Error ? error : undefined); process.exit(1); });
