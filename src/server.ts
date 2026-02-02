import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from './config.js';
import { registerWorkflowTools } from './tools/workflow-tools.js';
import { registerResourceTools } from './tools/resource-tools.js';
import { registerSchemaResources } from './resources/schema-resources.js';
import { logInfo } from './logging.js';

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer(
    { name: config.serverName, version: config.serverVersion },
    { capabilities: { tools: {}, resources: {} } }
  );
  logInfo('Creating workflow server', { name: config.serverName, version: config.serverVersion, workflowDir: config.workflowDir });
  registerWorkflowTools(server, config);
  registerResourceTools(server, config);
  registerSchemaResources(server, config);
  logInfo('Server configured', { 
    tools: [
      'list_workflows', 'get_workflow', 'validate_transition', 'get_workflow_activity', 'get_checkpoint', 'health_check',
      'get_activities', 'get_activity', 'get_rules', 'get_skills', 'list_skills', 'get_skill',
      'list_workflow_resources', 'get_resource', 'discover_resources'
    ],
    resources: ['workflow-server://schemas']
  });
  return server;
}
