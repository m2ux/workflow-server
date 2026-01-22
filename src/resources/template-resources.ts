import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listTemplates, readTemplate, getTemplateEntry } from '../loaders/template-loader.js';
import { logInfo } from '../logging.js';

export function registerTemplateResources(server: McpServer, config: ServerConfig): void {
  // Dynamic resource for listing templates in a specific workflow
  server.resource(
    'workflow-templates-list',
    new ResourceTemplate('workflow://{workflowId}/templates', { list: undefined }),
    { description: 'List all templates for a specific workflow' },
    async (uri, variables) => {
      const workflowId = variables['workflowId'] as string;
      if (!workflowId) throw new Error('Invalid workflow URI');
      
      logInfo('Resource accessed: workflow templates list', { workflowId });
      const templates = await listTemplates(config.workflowDir, workflowId);
      
      const result = templates.map(t => ({
        index: t.index,
        name: t.name,
        title: t.title,
        uri: `workflow://${workflowId}/templates/${t.index}`,
      }));
      
      return { 
        contents: [{ 
          uri: uri.href, 
          mimeType: 'application/json', 
          text: JSON.stringify(result, null, 2) 
        }] 
      };
    }
  );

  // Dynamic resource template for individual templates by index
  server.resource(
    'template',
    new ResourceTemplate('workflow://{workflowId}/templates/{index}', { list: undefined }),
    { description: 'Get content of a specific workflow template by index' },
    async (uri, variables) => {
      const workflowId = variables['workflowId'] as string;
      const index = variables['index'] as string;
      
      if (!workflowId || !index) throw new Error('Invalid template URI');
      
      logInfo('Resource accessed: template', { workflowId, index });
      
      const result = await readTemplate(config.workflowDir, workflowId, index);
      if (!result.success) throw result.error;
      
      // Get template entry for metadata
      const entry = await getTemplateEntry(config.workflowDir, workflowId, index);
      
      return { 
        contents: [{ 
          uri: uri.href, 
          mimeType: 'text/markdown',
          text: result.value,
        }] 
      };
    }
  );
}
