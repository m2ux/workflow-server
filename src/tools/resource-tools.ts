import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { listWorkflows, loadWorkflow } from '../loaders/workflow-loader.js';
import { listResources, readResourceRaw, listWorkflowsWithResources } from '../loaders/resource-loader.js';
import { listActivities, readActivity, readActivityIndex } from '../loaders/activity-loader.js';
import { listSkills, listUniversalSkills, listWorkflowSkills, readSkill, readSkillIndex } from '../loaders/skill-loader.js';
import { readRules } from '../loaders/rules-loader.js';
import { createSessionToken, decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';

function withAdvancedToken(
  result: { content: Array<{ type: 'text'; text: string }> },
  token: string,
  updates?: { act?: string },
) {
  return {
    ...result,
    _meta: { session_token: advanceToken(token, updates) },
  };
}

export function registerResourceTools(server: McpServer, config: ServerConfig): void {

  // ============== Activity Tools ==============

  server.tool(
    'get_activity',
    'Get a specific activity by ID for detailed flow guidance',
    { ...sessionTokenParam },
    withAuditLog('get_activity', async ({ session_token }) => {
      const { act } = decodeSessionToken(session_token);
      if (!act) throw new Error('No activity set in session token');
      const result = await readActivity(config.workflowDir, act);
      if (!result.success) throw result.error;
      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }] },
        session_token,
      );
    })
  );

  // ============== Session Tools ==============

  server.tool(
    'start_session',
    'Start a workflow session. Accepts a workflow ID (from list_workflows). Returns agent rules, workflow metadata, and an opaque session token for all subsequent tool calls.',
    {
      workflow_id: z.string().describe('Workflow ID to start a session for (e.g., "work-package")'),
    },
    withAuditLog('start_session', async ({ workflow_id }) => {
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const rulesResult = await readRules(config.workflowDir);
      if (!rulesResult.success) throw rulesResult.error;

      const workflow = wfResult.value;
      const initialActivity = (workflow as Record<string, unknown>)['initialActivity'] as string | undefined;
      const token = createSessionToken(workflow_id, workflow.version ?? '0.0.0', initialActivity ?? '');

      const response = {
        rules: rulesResult.value,
        workflow: {
          id: workflow.id,
          version: workflow.version,
          title: workflow.title,
          description: workflow.description,
        },
        session_token: token,
      };
      return { content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }] };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'get_skills',
    'Get the skill index - summary of all available skills with capabilities.',
    { ...sessionTokenParam },
    withAuditLog('get_skills', async ({ session_token }) => {
      const result = await readSkillIndex(config.workflowDir);
      if (!result.success) {
        const skills = await listSkills(config.workflowDir);
        return withAdvancedToken(
          { content: [{ type: 'text' as const, text: JSON.stringify(skills, null, 2) }] },
          session_token,
        );
      }
      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }] },
        session_token,
      );
    })
  );

  server.tool(
    'list_skills',
    'List all available skills - both universal and workflow-specific for the session workflow.',
    { ...sessionTokenParam },
    withAuditLog('list_skills', async ({ session_token }) => {
      const { wf } = decodeSessionToken(session_token);
      const workflowSkills = await listWorkflowSkills(config.workflowDir, wf);
      const universalSkills = await listUniversalSkills(config.workflowDir);
      const result = { universal: universalSkills, workflow: workflowSkills };
      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] },
        session_token,
      );
    })
  );

  server.tool(
    'get_skill',
    'Get a specific skill for tool orchestration guidance. Checks workflow-specific skills first, then universal.',
    {
      ...sessionTokenParam,
      skill_id: z.string().describe('Skill ID (e.g., workflow-execution, activity-resolution)'),
    },
    withAuditLog('get_skill', async ({ session_token, skill_id }) => {
      const { wf } = decodeSessionToken(session_token);
      const result = await readSkill(skill_id, config.workflowDir, wf);
      if (!result.success) throw result.error;
      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: JSON.stringify(result.value, null, 2) }] },
        session_token,
      );
    })
  );

  // ============== Resource Tools ==============

  server.tool(
    'list_workflow_resources',
    'List all resources available for the session workflow',
    { ...sessionTokenParam },
    withAuditLog('list_workflow_resources', async ({ session_token }) => {
      const { wf } = decodeSessionToken(session_token);
      const resources = await listResources(config.workflowDir, wf);
      const result = resources.map(r => ({
        index: r.index, name: r.name, title: r.title, format: r.format,
      }));
      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: JSON.stringify(result, null, 2) }] },
        session_token,
      );
    })
  );

  server.tool(
    'get_resource',
    'Get a specific resource by index from the session workflow',
    {
      ...sessionTokenParam,
      index: z.string().describe('Resource index (e.g., 0, 00, 01)'),
    },
    withAuditLog('get_resource', async ({ session_token, index }) => {
      const { wf } = decodeSessionToken(session_token);
      const result = await readResourceRaw(config.workflowDir, wf, index);
      if (!result.success) throw result.error;
      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: result.value.content }] },
        session_token,
      );
    })
  );

  // ============== Discovery Tool ==============

  server.tool(
    'discover_resources',
    'Discover all available resources: workflows, resources, skills',
    { ...sessionTokenParam },
    withAuditLog('discover_resources', async ({ session_token }) => {
      const workflows = await listWorkflows(config.workflowDir);
      const workflowsWithResources = await listWorkflowsWithResources(config.workflowDir);
      const universalSkills = await listUniversalSkills(config.workflowDir);

      const discovery: Record<string, unknown> = {
        bootstrap: {
          tool: 'list_workflows',
          description: 'List available workflows, then call start_session with the chosen workflow_id',
        },
        universal_skills: {
          items: universalSkills.map(s => s.id),
          tool: 'list_skills',
          description: 'Universal skills (apply to all workflows)',
        },
        workflows: workflows.map(w => ({
          id: w.id, title: w.title,
        })),
      };

      for (const workflowId of workflowsWithResources) {
        const resources = await listResources(config.workflowDir, workflowId);
        const workflowSkills = await listWorkflowSkills(config.workflowDir, workflowId);

        const workflowDiscovery: Record<string, unknown> = {
          resources: { count: resources.length },
        };
        if (workflowSkills.length > 0) {
          workflowDiscovery['skills'] = { items: workflowSkills.map(s => s.id) };
        }
        discovery[workflowId] = workflowDiscovery;
      }

      return withAdvancedToken(
        { content: [{ type: 'text' as const, text: JSON.stringify(discovery, null, 2) }] },
        session_token,
      );
    })
  );
}
