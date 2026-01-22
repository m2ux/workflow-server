import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from './config.js';
import { registerWorkflowTools } from './tools/workflow-tools.js';
import { registerResourceTools } from './tools/resource-tools.js';
import { logInfo } from './logging.js';

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer({ name: config.serverName, version: config.serverVersion });
  logInfo('Creating workflow server', { name: config.serverName, version: config.serverVersion, workflowDir: config.workflowDir });
  registerWorkflowTools(server, config);
  registerResourceTools(server, config);
  logInfo('Server configured', { 
    tools: [
      'list_workflows', 'get_workflow', 'validate_transition', 'get_phase', 'get_checkpoint', 'health_check',
      'fetch_resource', 'list_resources'
    ]
  });
  return server;
}
