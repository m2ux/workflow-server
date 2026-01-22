import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

// Loaders
import { listWorkflows } from '../loaders/workflow-loader.js';
import { listGuides, readGuideRaw, listWorkflowsWithGuides } from '../loaders/guide-loader.js';
import { listTemplates, readTemplate } from '../loaders/template-loader.js';
import { listIntents, readIntent, readIntentIndex } from '../loaders/intent-loader.js';
import { listSkills, readSkill } from '../loaders/skill-loader.js';

export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  
  // ============== Intent Tools ==============
  
  server.tool(
    'get_intents',
    'Get the intent index - the primary entry point for workflow execution. Returns quick_match patterns to identify user intent.',
    {},
    withAuditLog('get_intents', async () => {
      const result = await readIntentIndex();
      if (!result.success) {
        // Fall back to listing intents
        const intents = await listIntents();
        return { content: [{ type: 'text', text: JSON.stringify(intents, null, 2) }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    })
  );

  server.tool(
    'get_intent',
    'Get a specific intent by ID for detailed flow guidance',
    { intent_id: z.string().describe('Intent ID (e.g., start-workflow, resume-workflow)') },
    withAuditLog('get_intent', async ({ intent_id }) => {
      const result = await readIntent(intent_id);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'list_skills',
    'List all available workflow execution skills',
    {},
    withAuditLog('list_skills', async () => {
      const skills = await listSkills();
      return { content: [{ type: 'text', text: JSON.stringify(skills, null, 2) }] };
    })
  );

  server.tool(
    'get_skill',
    'Get a specific skill for tool orchestration guidance',
    { skill_id: z.string().describe('Skill ID (e.g., workflow-execution)') },
    withAuditLog('get_skill', async ({ skill_id }) => {
      const result = await readSkill(skill_id);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    })
  );

  // ============== Guide Tools ==============

  server.tool(
    'list_guides',
    'List all guides available for a workflow',
    { workflow_id: z.string().describe('Workflow ID (e.g., work-package)') },
    withAuditLog('list_guides', async ({ workflow_id }) => {
      const guides = await listGuides(config.workflowDir, workflow_id);
      const result = guides.map(g => ({
        index: g.index,
        name: g.name,
        title: g.title,
        format: g.format,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    })
  );

  server.tool(
    'get_guide',
    'Get a specific guide by index',
    { 
      workflow_id: z.string().describe('Workflow ID (e.g., work-package)'),
      index: z.string().describe('Guide index (e.g., 0, 00, 01)')
    },
    withAuditLog('get_guide', async ({ workflow_id, index }) => {
      const result = await readGuideRaw(config.workflowDir, workflow_id, index);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: result.value.content }] };
    })
  );

  // ============== Template Tools ==============

  server.tool(
    'list_templates',
    'List all templates available for a workflow',
    { workflow_id: z.string().describe('Workflow ID (e.g., work-package)') },
    withAuditLog('list_templates', async ({ workflow_id }) => {
      const templates = await listTemplates(config.workflowDir, workflow_id);
      const result = templates.map(t => ({
        index: t.index,
        name: t.name,
        title: t.title,
      }));
      return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
    })
  );

  server.tool(
    'get_template',
    'Get a specific template by index',
    { 
      workflow_id: z.string().describe('Workflow ID (e.g., work-package)'),
      index: z.string().describe('Template index (e.g., 01, 02)')
    },
    withAuditLog('get_template', async ({ workflow_id, index }) => {
      const result = await readTemplate(config.workflowDir, workflow_id, index);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: result.value }] };
    })
  );

  // ============== Discovery Tool ==============

  server.tool(
    'list_resources',
    'Discover all available resources: workflows, guides, templates, intents, skills',
    {},
    withAuditLog('list_resources', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      const workflowsWithGuides = await listWorkflowsWithGuides(config.workflowDir);
      
      const resources: Record<string, unknown> = {
        intents: {
          tool: 'get_intents',
          description: 'Intent index - primary entry point for workflow execution',
        },
        skills: {
          tool: 'list_skills',
          description: 'Available workflow execution skills',
        },
        workflows: workflows.map(w => ({
          id: w.id,
          title: w.title,
          tool: `get_workflow { workflow_id: "${w.id}" }`,
        })),
      };
      
      // Add workflow-specific resources
      for (const workflowId of workflowsWithGuides) {
        const guides = await listGuides(config.workflowDir, workflowId);
        const templates = await listTemplates(config.workflowDir, workflowId);
        
        resources[workflowId] = {
          guides: {
            count: guides.length,
            tool: `list_guides { workflow_id: "${workflowId}" }`,
          },
          templates: templates.length > 0 ? {
            count: templates.length,
            tool: `list_templates { workflow_id: "${workflowId}" }`,
          } : undefined,
        };
      }
      
      return { content: [{ type: 'text', text: JSON.stringify(resources, null, 2) }] };
    })
  );
}
