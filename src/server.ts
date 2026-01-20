import { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from './config.js';
import { registerWorkflowTools } from './tools/workflow-tools.js';
import { registerGuideResources } from './resources/guide-resources.js';
import { registerSkillResources } from './resources/skill-resources.js';
import { registerIntentResources } from './resources/intent-resources.js';
import { logInfo } from './logging.js';

export function createServer(config: ServerConfig): McpServer {
  const server = new McpServer({ name: config.serverName, version: config.serverVersion });
  logInfo('Creating workflow server', { name: config.serverName, version: config.serverVersion, workflowDir: config.workflowDir, guideDir: config.guideDir });
  registerWorkflowTools(server, config);
  registerGuideResources(server, config);
  registerSkillResources(server);
  registerIntentResources(server);
  logInfo('Server configured', { tools: ['list_workflows', 'get_workflow', 'validate_transition', 'get_phase', 'get_checkpoint', 'health_check'], resources: ['workflow://intents', 'workflow://skills', 'workflow://guides'] });
  return server;
}
