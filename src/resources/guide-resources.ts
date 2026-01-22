import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { listGuides, readGuideRaw, listWorkflowsWithGuides } from '../loaders/guide-loader.js';
import { logInfo } from '../logging.js';

export function registerGuideResources(server: McpServer, config: ServerConfig): void {
  // Static resource for listing all workflows with guides
  server.resource(
    'guides-workflows',
    'workflow://guides',
    { description: 'List all workflows that contain guides' },
    async () => {
      logInfo('Resource accessed: workflow://guides');
      const workflows = await listWorkflowsWithGuides(config.workflowDir);
      const result = workflows.map(id => ({
        workflowId: id,
        guidesUri: `workflow://${id}/guides`,
      }));
      return { 
        contents: [{ 
          uri: 'workflow://guides', 
          mimeType: 'application/json', 
          text: JSON.stringify(result, null, 2) 
        }] 
      };
    }
  );

  // Dynamic resource for listing guides in a specific workflow
  server.resource(
    'workflow-guides-list',
    new ResourceTemplate('workflow://{workflowId}/guides', { list: undefined }),
    { description: 'List all guides for a specific workflow' },
    async (uri, variables) => {
      const workflowId = variables['workflowId'] as string;
      if (!workflowId) throw new Error('Invalid workflow URI');
      
      logInfo('Resource accessed: workflow guides list', { workflowId });
      const guides = await listGuides(config.workflowDir, workflowId);
      
      const result = guides.map(g => ({
        index: g.index,
        name: g.name,
        title: g.title,
        format: g.format,
        uri: `workflow://${workflowId}/guides/${g.index}`,
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

  // Dynamic resource template for individual guides by index
  server.resource(
    'guide',
    new ResourceTemplate('workflow://{workflowId}/guides/{guideIndex}', { list: undefined }),
    { description: 'Get content of a specific workflow guide by index' },
    async (uri, variables) => {
      const workflowId = variables['workflowId'] as string;
      const guideIndex = variables['guideIndex'] as string;
      
      if (!workflowId || !guideIndex) throw new Error('Invalid guide URI');
      
      logInfo('Resource accessed: guide', { workflowId, guideIndex });
      
      const result = await readGuideRaw(config.workflowDir, workflowId, guideIndex);
      if (!result.success) throw result.error;
      
      const mimeType = result.value.format === 'toon' ? 'text/plain' : 'text/markdown';
      
      return { 
        contents: [{ 
          uri: uri.href, 
          mimeType, 
          text: result.value.content 
        }] 
      };
    }
  );
}
