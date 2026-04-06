import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig, ResolvedServerConfig } from './config.js';
import { TraceStore } from './trace.js';
import { registerWorkflowTools } from './tools/workflow-tools.js';
import { registerResourceTools } from './tools/resource-tools.js';

import { registerSchemaResources } from './resources/schema-resources.js';
import { logInfo } from './logging.js';

export function createServer(config: ServerConfig): McpServer {
  const resolvedConfig: ResolvedServerConfig = {
    ...config,
    traceStore: config.traceStore ?? new TraceStore(),
    schemaPreamble: config.schemaPreamble ?? '',
  };

  const server = new McpServer(
    { name: resolvedConfig.serverName, version: resolvedConfig.serverVersion },
    { capabilities: { tools: {}, resources: {} } }
  );
  logInfo('Creating workflow server', { name: resolvedConfig.serverName, version: resolvedConfig.serverVersion, workflowDir: resolvedConfig.workflowDir });
  registerWorkflowTools(server, resolvedConfig);
  registerResourceTools(server, resolvedConfig);
  registerSchemaResources(server, resolvedConfig);
  logInfo('Server configured', { resources: ['workflow-server://schemas'] });
  return server;
}
