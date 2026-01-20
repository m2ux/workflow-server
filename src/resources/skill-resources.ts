import { ResourceTemplate } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { listSkills, readSkill } from '../loaders/skill-loader.js';
import { logInfo } from '../logging.js';

export function registerSkillResources(server: McpServer): void {
  // Static resource for listing all skills
  server.resource(
    'skills-list',
    'workflow://skills',
    { description: 'List all available workflow execution skills' },
    async () => {
      logInfo('Resource accessed: workflow://skills');
      return { contents: [{ uri: 'workflow://skills', mimeType: 'application/json', text: JSON.stringify(await listSkills(), null, 2) }] };
    }
  );

  // Dynamic resource template for individual skills
  server.resource(
    'skill',
    new ResourceTemplate('workflow://skills/{id}', { list: undefined }),
    { description: 'Get a specific workflow execution skill' },
    async (uri, variables) => {
      const id = variables['id'] as string;
      if (!id) throw new Error('Invalid skill URI');
      logInfo('Resource accessed: skill', { id });
      const result = await readSkill(id);
      if (!result.success) throw result.error;
      return { contents: [{ uri: uri.href, mimeType: 'application/json', text: JSON.stringify(result.value, null, 2) }] };
    }
  );
}
