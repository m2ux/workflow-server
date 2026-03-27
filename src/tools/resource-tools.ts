import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import type { StructuredResource } from '../loaders/resource-loader.js';
import { readSkill } from '../loaders/skill-loader.js';
import { readRules } from '../loaders/rules-loader.js';
import { createSessionToken, decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation, validateWorkflowConsistency, validateWorkflowVersion, validateSkillAssociation } from '../utils/validation.js';
import { createTraceEvent } from '../trace.js';

async function loadSkillResources(workflowDir: string, workflowId: string, skillValue: unknown): Promise<StructuredResource[]> {
  if (typeof skillValue !== 'object' || skillValue === null) return [];
  const resources_field = (skillValue as Record<string, unknown>)['resources'];
  if (!Array.isArray(resources_field)) return [];
  const skillResources = resources_field.filter((v): v is string => typeof v === 'string');

  const resources: StructuredResource[] = [];
  for (const idx of skillResources) {
    const result = await readResourceStructured(workflowDir, workflowId, idx);
    if (result.success) resources.push(result.value);
  }
  return resources;
}

export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

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
      if (!workflow.version) {
        console.warn(`[start_session] Workflow '${workflow_id}' has no version defined; version drift detection will be unreliable.`);
      }
      const token = await createSessionToken(workflow_id, workflow.version ?? '0.0.0');

      if (config.traceStore) {
        const decoded = await decodeSessionToken(token);
        config.traceStore.initSession(decoded.sid);
        // Session initialization marker (duration 0) — the actual start_session
        // tool call duration is captured separately by withAuditLog.
        const event = createTraceEvent(
          decoded.sid, 'start_session', 0, 'ok',
          workflow_id, '', '',
        );
        config.traceStore.append(decoded.sid, event);
      }

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
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_token: token },
      };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'get_skills',
    'Get all skills and their associated resources for an activity in one call. Resources are returned as a structured array with index, id, version, and content fields.',
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
      const failedSkills: string[] = [];
      const allResources: StructuredResource[] = [];
      const seenIndices = new Set<string>();
      const duplicateIndices: string[] = [];

      for (const sid of skillIds) {
        const result = await readSkill(sid, config.workflowDir, workflow_id);
        if (result.success) {
          skills[sid] = result.value;
          const resources = await loadSkillResources(config.workflowDir, workflow_id, result.value);
          for (const r of resources) {
            if (!seenIndices.has(r.index)) {
              seenIndices.add(r.index);
              allResources.push(r);
            } else {
              duplicateIndices.push(r.index);
            }
          }
        } else {
          failedSkills.push(sid);
        }
      }

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, wfResult.value),
      );

      const responseBody: Record<string, unknown> = { activity_id, skills, resources: allResources };
      if (failedSkills.length > 0) responseBody['failed_skills'] = failedSkills;
      if (duplicateIndices.length > 0) responseBody['duplicate_resource_indices'] = duplicateIndices;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseBody, null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, act: activity_id }), validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_skill',
    'Get a single skill with its referenced resources. Resources are returned as a structured array with index, id, version, and content fields.',
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

      const resources = await loadSkillResources(config.workflowDir, workflow_id, result.value);

      const response = {
        skill: result.value,
        resources,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, skill: skill_id }), validation },
      };
    }, traceOpts)
  );

}
