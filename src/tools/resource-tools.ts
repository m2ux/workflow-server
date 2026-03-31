import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import type { StructuredResource } from '../loaders/resource-loader.js';
import { readSkill, listUniversalSkillIds, listWorkflowSkillIds } from '../loaders/skill-loader.js';
import { createSessionToken, decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation, validateWorkflowConsistency, validateWorkflowVersion, validateSkillAssociation } from '../utils/validation.js';
import { createTraceEvent } from '../trace.js';

/**
 * Parse a resource reference that may include a workflow prefix.
 * Format: "workflow/index" for cross-workflow, or bare "index" for local.
 * Examples: "meta/05" → { workflowId: "meta", index: "05" }
 *           "05"      → { workflowId: undefined, index: "05" }
 */
function parseResourceRef(ref: string): { workflowId: string | undefined; index: string } {
  const slashIdx = ref.indexOf('/');
  if (slashIdx > 0) {
    return { workflowId: ref.substring(0, slashIdx), index: ref.substring(slashIdx + 1) };
  }
  return { workflowId: undefined, index: ref };
}

async function loadSkillResources(workflowDir: string, workflowId: string, skillValue: unknown): Promise<StructuredResource[]> {
  if (typeof skillValue !== 'object' || skillValue === null) return [];
  const resources_field = (skillValue as Record<string, unknown>)['resources'];
  if (!Array.isArray(resources_field)) return [];
  const skillResources = resources_field.filter((v): v is string => typeof v === 'string');

  const resources: StructuredResource[] = [];
  for (const ref of skillResources) {
    const parsed = parseResourceRef(ref);
    const targetWorkflow = parsed.workflowId ?? workflowId;
    const result = await readResourceStructured(workflowDir, targetWorkflow, parsed.index);
    if (result.success) {
      resources.push({ ...result.value, index: ref });
    }
  }
  return resources;
}

/**
 * Strip the raw `resources` array from a skill value and attach resolved content.
 * Returns a new object with `_resources` containing the resolved content
 * and the original `resources` reference list removed.
 */
function bundleSkillWithResources(skillValue: unknown, resolvedResources: StructuredResource[]): unknown {
  if (typeof skillValue !== 'object' || skillValue === null) return skillValue;
  const { resources: _stripped, ...rest } = skillValue as Record<string, unknown>;
  if (resolvedResources.length > 0) {
    return { ...rest, _resources: resolvedResources };
  }
  return rest;
}

export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  // ============== Session Tools ==============

  server.tool(
    'start_session',
    'Start a workflow session. Accepts a workflow ID (from list_workflows). Returns workflow metadata and an opaque session token for all subsequent tool calls. Call get_skills after this to load behavioral protocols.',
    {
      workflow_id: z.string().describe('Workflow ID to start a session for (e.g., "work-package")'),
    },
    withAuditLog('start_session', async ({ workflow_id }) => {
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const workflow = wfResult.value;
      if (!workflow.version) {
        console.warn(`[start_session] Workflow '${workflow_id}' has no version defined; version drift detection will be unreliable.`);
      }
      const token = await createSessionToken(workflow_id, workflow.version ?? '0.0.0');

      if (config.traceStore) {
        const decoded = await decodeSessionToken(token);
        config.traceStore.initSession(decoded.sid);
        const event = createTraceEvent(
          decoded.sid, 'start_session', 0, 'ok',
          workflow_id, '', '',
        );
        config.traceStore.append(decoded.sid, event);
      }

      const response = {
        workflow: {
          id: workflow.id,
          version: workflow.version,
          title: workflow.title,
          description: workflow.description,
        },
        session_token: token,
      };
      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response) }],
        _meta: { session_token: token },
      };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'get_skills',
    'Get all skills with resources nested under each skill. Before any activity is entered (token.act empty), returns workflow-level skills. When an activity is entered and agent_id is provided: if the agent_id differs from the last known agent (token.aid), returns universal meta skills + activity skills (first call for a new agent); if the agent_id matches, returns activity skills only. Each skill\'s resolved resources appear in _resources; the raw reference list is stripped.',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      agent_id: z.string().optional().describe('Agent identifier. When provided, the server detects new agents and includes universal/meta skills on their first call. Omit for backward-compatible behavior.'),
    },
    withAuditLog('get_skills', async ({ session_token, workflow_id, agent_id }) => {
      const token = await decodeSessionToken(session_token);
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const workflow = wfResult.value;
      const activityId = token.act || null;
      let skillIds: string[];
      let scope: string;
      const isNewAgent = agent_id !== undefined && agent_id !== token.aid;

      if (!activityId) {
        const universalIds = await listUniversalSkillIds(config.workflowDir);
        const workflowSpecificIds = await listWorkflowSkillIds(config.workflowDir, workflow_id);
        const workflowDeclared = workflow.skills ?? [];
        const combined = new Set([...universalIds, ...workflowSpecificIds, ...workflowDeclared]);
        skillIds = [...combined];
        scope = 'workflow';
      } else if (isNewAgent) {
        const activity = getActivity(workflow, activityId);
        if (!activity) throw new Error(`Activity not found: ${activityId}`);
        const universalIds = await listUniversalSkillIds(config.workflowDir);
        const activitySkills = [activity.skills.primary, ...(activity.skills.supporting ?? [])];
        const combined = new Set([...universalIds, ...activitySkills]);
        skillIds = [...combined];
        scope = 'activity+meta';
      } else {
        const activity = getActivity(workflow, activityId);
        if (!activity) throw new Error(`Activity not found: ${activityId}`);
        skillIds = [activity.skills.primary, ...(activity.skills.supporting ?? [])];
        scope = 'activity';
      }

      const skills: Record<string, unknown> = {};
      const failedSkills: string[] = [];

      for (const sid of skillIds) {
        const result = await readSkill(sid, config.workflowDir, workflow_id);
        if (result.success) {
          const resources = await loadSkillResources(config.workflowDir, workflow_id, result.value);
          skills[sid] = bundleSkillWithResources(result.value, resources);
        } else {
          failedSkills.push(sid);
        }
      }

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, wfResult.value),
      );

      const responseBody: Record<string, unknown> = { activity_id: activityId, scope, skills };
      if (failedSkills.length > 0) responseBody['failed_skills'] = failedSkills;

      const tokenUpdates: { wf: string; aid?: string } = { wf: workflow_id };
      if (isNewAgent) tokenUpdates.aid = agent_id;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseBody) }],
        _meta: { session_token: await advanceToken(session_token, tokenUpdates), validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_skill',
    'Get a single skill with its referenced resources. Resources are nested under the skill as _resources (the raw resources reference list is stripped).',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      skill_id: z.string().describe('Skill ID (e.g., execute-activity, orchestrate-workflow)'),
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
        skill: bundleSkillWithResources(result.value, resources),
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response) }],
        _meta: { session_token: await advanceToken(session_token, { wf: workflow_id, skill: skill_id }), validation },
      };
    }, traceOpts)
  );

}
