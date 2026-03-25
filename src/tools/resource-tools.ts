import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceRaw } from '../loaders/resource-loader.js';
import { readSkill } from '../loaders/skill-loader.js';
import { readRules } from '../loaders/rules-loader.js';
import { createSessionToken, decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation, validateWorkflowConsistency, validateWorkflowVersion, validateSkillAssociation } from '../utils/validation.js';

export function registerResourceTools(server: McpServer, config: ServerConfig): void {

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
      const token = await createSessionToken(workflow_id, workflow.version ?? '0.0.0');

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
    'Get all skills and their associated resources for an activity in one call. Returns primary + supporting skills with full content, plus all resources referenced by those skills.',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      activity_id: z.string().describe('Activity ID to load skills for'),
    },
    withAuditLog('get_skills', async ({ session_token, workflow_id, activity_id }) => {
      const token = await decodeSessionToken(session_token);
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const activity = getActivity(wfResult.value, activity_id);
      if (!activity) throw new Error(`Activity not found: ${activity_id}`);

      const skillIds = [activity.skills.primary, ...(activity.skills.supporting ?? [])];
      const skills: Record<string, unknown> = {};
      const resourceIndices = new Set<string>();

      for (const sid of skillIds) {
        const result = await readSkill(sid, config.workflowDir, workflow_id);
        if (result.success) {
          skills[sid] = result.value;
          const skillResources = (result.value as Record<string, unknown>)['resources'] as string[] | undefined;
          if (skillResources) {
            for (const idx of skillResources) resourceIndices.add(idx);
          }
        }
      }

      const resources: Record<string, string> = {};
      for (const idx of resourceIndices) {
        const result = await readResourceRaw(config.workflowDir, workflow_id, idx);
        if (result.success) resources[idx] = result.value.content;
      }

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, wfResult.value),
      );

      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ activity_id, skills, resources }, null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, act: activity_id }), validation },
      };
    })
  );

  server.tool(
    'get_skill',
    'Get a single skill by ID. For loading all skills for an activity at once, use get_skills instead.',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      skill_id: z.string().describe('Skill ID (e.g., workflow-execution, activity-resolution)'),
    },
    withAuditLog('get_skill', async ({ session_token, workflow_id, skill_id }) => {
      const token = await decodeSessionToken(session_token);
      const result = await readSkill(skill_id, config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        wfResult.success ? validateWorkflowVersion(token, wfResult.value) : null,
        wfResult.success && token.act ? validateSkillAssociation(wfResult.value, token.act, skill_id) : null,
      );

      const skillResources = (result.value as Record<string, unknown>)['resources'] as string[] | undefined;
      const resources: Record<string, string> = {};
      if (skillResources) {
        for (const idx of skillResources) {
          const resResult = await readResourceRaw(config.workflowDir, workflow_id, idx);
          if (resResult.success) resources[idx] = resResult.value.content;
        }
      }

      const response = Object.keys(resources).length > 0
        ? { ...result.value as Record<string, unknown>, _resources: resources }
        : result.value;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, skill: skill_id }), validation },
      };
    })
  );

}
