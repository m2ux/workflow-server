import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

// Loaders
import { listWorkflows } from '../loaders/workflow-loader.js';
import { listGuides, readGuideRaw, listWorkflowsWithGuides } from '../loaders/guide-loader.js';
import { listTemplates, readTemplate } from '../loaders/template-loader.js';
import { listActivities, readActivity, readActivityIndex } from '../loaders/activity-loader.js';
import { listSkills, listUniversalSkills, listWorkflowSkills, readSkill, readSkillIndex } from '../loaders/skill-loader.js';

export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  
  // ============== Activity Tools ==============
  
  server.tool(
    'get_activities',
    'Get the activity index - the primary entry point for workflow execution. Returns quick_match patterns to identify user activity.',
    {},
    withAuditLog('get_activities', async () => {
      const result = await readActivityIndex(config.workflowDir);
      if (!result.success) {
        // Fall back to listing activities
        const activities = await listActivities(config.workflowDir);
        return { content: [{ type: 'text', text: JSON.stringify(activities, null, 2) }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    })
  );

  server.tool(
    'get_activity',
    'Get a specific activity by ID for detailed flow guidance',
    { activity_id: z.string().describe('Activity ID (e.g., start-workflow, resume-workflow)') },
    withAuditLog('get_activity', async ({ activity_id }) => {
      const result = await readActivity(config.workflowDir, activity_id);
      if (!result.success) throw result.error;
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'get_skills',
    'Get the skill index - summary of all available skills with capabilities. Returns universal skills and workflow-specific skills grouped by workflow.',
    {},
    withAuditLog('get_skills', async () => {
      const result = await readSkillIndex(config.workflowDir);
      if (!result.success) {
        // Fall back to listing skills
        const skills = await listSkills(config.workflowDir);
        return { content: [{ type: 'text', text: JSON.stringify(skills, null, 2) }] };
      }
      return { content: [{ type: 'text', text: JSON.stringify(result.value, null, 2) }] };
    })
  );

  server.tool(
    'list_skills',
    'List all available skills - both universal (from meta workflow) and workflow-specific. Optionally filter by workflow.',
    { 
      workflow_id: z.string().optional().describe('Optional workflow ID to filter workflow-specific skills')
    },
    withAuditLog('list_skills', async ({ workflow_id }) => {
      if (workflow_id) {
        // List skills for a specific workflow + universal skills
        const workflowSkills = await listWorkflowSkills(config.workflowDir, workflow_id);
        const universalSkills = await listUniversalSkills(config.workflowDir);
        const result = {
          universal: universalSkills,
          workflow: workflowSkills,
        };
        return { content: [{ type: 'text', text: JSON.stringify(result, null, 2) }] };
      }
      // List all skills
      const skills = await listSkills(config.workflowDir);
      return { content: [{ type: 'text', text: JSON.stringify(skills, null, 2) }] };
    })
  );

  server.tool(
    'get_skill',
    'Get a specific skill for tool orchestration guidance. Workflow-specific skills are checked first, then universal.',
    { 
      skill_id: z.string().describe('Skill ID (e.g., workflow-execution, activity-resolution)'),
      workflow_id: z.string().optional().describe('Optional workflow ID to look for workflow-specific skill first')
    },
    withAuditLog('get_skill', async ({ skill_id, workflow_id }) => {
      const result = await readSkill(skill_id, config.workflowDir, workflow_id);
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
    'Discover all available resources: workflows, guides, templates, activities, skills',
    {},
    withAuditLog('list_resources', async () => {
      const workflows = await listWorkflows(config.workflowDir);
      const workflowsWithGuides = await listWorkflowsWithGuides(config.workflowDir);
      const universalSkills = await listUniversalSkills(config.workflowDir);
      
      const resources: Record<string, unknown> = {
        activities: {
          tool: 'get_activities',
          description: 'Activity index - primary entry point for workflow execution',
        },
        universal_skills: {
          items: universalSkills.map(s => s.id),
          tool: 'list_skills',
          description: 'Universal skills (apply to all workflows)',
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
        const workflowSkills = await listWorkflowSkills(config.workflowDir, workflowId);
        
        const workflowResources: Record<string, unknown> = {
          guides: {
            count: guides.length,
            tool: `list_guides { workflow_id: "${workflowId}" }`,
          },
        };
        
        if (templates.length > 0) {
          workflowResources['templates'] = {
            count: templates.length,
            tool: `list_templates { workflow_id: "${workflowId}" }`,
          };
        }
        
        if (workflowSkills.length > 0) {
          workflowResources['skills'] = {
            items: workflowSkills.map(s => s.id),
            tool: `list_skills { workflow_id: "${workflowId}" }`,
            get: `get_skill { skill_id: "...", workflow_id: "${workflowId}" }`,
          };
        }
        
        resources[workflowId] = workflowResources;
      }
      
      return { content: [{ type: 'text', text: JSON.stringify(resources, null, 2) }] };
    })
  );
}
