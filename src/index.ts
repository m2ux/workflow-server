import { loadConfig } from './config.js';
import { logInfo, logError } from './logging.js';
import { startStdioServer } from './transports/stdio.js';
import { startHttpServer } from './transports/http.js';

export * from './schema/workflow.schema.js';
export * from './schema/state.schema.js';
export * from './schema/condition.schema.js';
export * from './schema/activity.schema.js';
export { createServer } from './server.js';
export {
  loadConfig,
  WorkspaceConfigError,
  normalizeRepoPath,
  resolveRepoPaths,
  resolveInstallDir,
  defaultInstallDir,
  resolveEngineeringDir,
  REPO_PLANNING_RELATIVE_DIR,
} from './config.js';
export type { ServerConfig, ResolvedServerConfig, Transport, RepoPaths } from './config.js';
export { TraceStore, createTraceToken, decodeTraceToken, createTraceEvent } from './trace.js';
export type { TraceEvent, TraceTokenPayload } from './trace.js';

/**
 * CLI entry point: resolve config, then dispatch to the transport it selects.
 * Both transports build their `McpServer` from the same `createServer(config)`
 * — this router only decides which one connects it.
 */
async function main(): Promise<void> {
  try {
    const config = loadConfig(process.argv.slice(2));
    logInfo('Starting MCP Workflow Server', {
      workflowDir: config.workflowDir,
      workspaceDir: config.workspaceDir,
      engineeringDir: config.engineeringDir ?? config.workspaceDir,
      ...(config.repo !== undefined ? { repo: config.repo } : {}),
      transport: config.transport ?? 'stdio',
    });

    switch (config.transport ?? 'stdio') {
      case 'http':
        await startHttpServer(config);
        break;
      case 'stdio':
      default:
        await startStdioServer(config);
        break;
    }
  } catch (error) {
    logError('Failed to start server', error instanceof Error ? error : undefined);
    process.exit(1);
  }
}

main();
