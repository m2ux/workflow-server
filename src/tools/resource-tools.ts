import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { readSkill } from '../loaders/skill-loader.js';
import { createSessionToken, decodeSessionToken, advanceToken, sessionTokenParam } from '../utils/session.js';
import { buildValidation, validateWorkflowConsistency, validateWorkflowVersion } from '../utils/validation.js';
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

interface ResourceRef {
  index: string;
  id: string | undefined;
  version: string | undefined;
}

async function loadSkillResourceRefs(workflowDir: string, workflowId: string, skillValue: unknown): Promise<ResourceRef[]> {
  if (typeof skillValue !== 'object' || skillValue === null) return [];
  const resources_field = (skillValue as Record<string, unknown>)['resources'];
  if (!Array.isArray(resources_field)) return [];
  const skillResources = resources_field.filter((v): v is string => typeof v === 'string');

  const refs: ResourceRef[] = [];
  for (const ref of skillResources) {
    const parsed = parseResourceRef(ref);
    const targetWorkflow = parsed.workflowId ?? workflowId;
    const result = await readResourceStructured(workflowDir, targetWorkflow, parsed.index);
    if (result.success) {
      refs.push({ index: ref, id: result.value.id, version: result.value.version });
    }
  }
  return refs;
}

/**
 * Strip the raw `resources` array from a skill value and attach lightweight refs.
 * Returns a new object with `_resources` containing index/id/version refs
 * (no content — use get_resource to load individually).
 */
function bundleSkillWithResourceRefs(skillValue: unknown, refs: ResourceRef[]): unknown {
  if (typeof skillValue !== 'object' || skillValue === null) return skillValue;
  const { resources: _stripped, ...rest } = skillValue as Record<string, unknown>;
  if (refs.length > 0) {
    return { ...rest, _resources: refs };
  }
  return rest;
}

export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  // ============== Session Tools ==============

  server.tool(
    'start_session',
    'Start a new workflow session for the given workflow_id. Returns a session token (required for all subsequent tool calls) and basic workflow metadata (id, version, title, description). The session token is opaque and cryptographically signed — pass it to every subsequent call and use the updated token from each response\'s _meta.session_token. After starting a session, call get_skills to load behavioral protocols, then call get_workflow (summary=true) to see the activity list and initialActivity field which tells you which activity to load first with next_activity. Does not return the activity list or initialActivity — use get_workflow for that.',
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
    'Load all workflow-level skills (behavioral protocols like session-protocol, agent-conduct). Call this after start_session to load the skills that govern session behavior. Returns a map of skill objects keyed by skill ID, each including its protocol phases, rules, and tool guidance. Resource references appear as lightweight entries in _resources (index, id, version only — use get_resource to load full content). These are workflow-scope skills; activity-level step skills are loaded separately via get_step_skill.',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
    },
    withAuditLog('get_skills', async ({ session_token, workflow_id }) => {
      const token = await decodeSessionToken(session_token);
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const workflow = wfResult.value;
      const skillIds = workflow.skills ?? [];

      const skills: Record<string, unknown> = {};
      const failedSkills: string[] = [];

      for (const sid of skillIds) {
        const result = await readSkill(sid, config.workflowDir, workflow_id);
        if (result.success) {
          const refs = await loadSkillResourceRefs(config.workflowDir, workflow_id, result.value);
          skills[sid] = bundleSkillWithResourceRefs(result.value, refs);
        } else {
          failedSkills.push(sid);
        }
      }

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, wfResult.value),
      );

      const advancedToken = await advanceToken(session_token, { wf: workflow_id });
      const responseBody: Record<string, unknown> = { scope: 'workflow', skills, session_token: advancedToken };
      if (failedSkills.length > 0) responseBody['failed_skills'] = failedSkills;

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(responseBody) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_skill',
    'Load a single skill by its ID. Use this when you need to reload or reference a specific skill during execution. Returns the skill definition with protocol phases, rules, and tool guidance. Resource references appear as lightweight entries in _resources (index, id, version only — use get_resource to load full content). For loading the skill assigned to a specific step within the current activity, use get_step_skill instead.',
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
      );

      const refs = await loadSkillResourceRefs(config.workflowDir, workflow_id, result.value);
      const advancedToken = await advanceToken(session_token, { wf: workflow_id, skill: skill_id });

      const response = {
        skill: bundleSkillWithResourceRefs(result.value, refs),
        session_token: advancedToken,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_step_skill',
    'Load the skill assigned to a specific step within the current activity. Resolves the skill reference from the activity definition using the step_id and the current activity tracked in the session token. Requires next_activity to have been called first — the session token must have a current activity set. Returns the skill definition with resource references in _resources (index, id, version only — use get_resource for full content). If the step_id is not found, the error lists all available step IDs in the current activity.',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID'),
      step_id: z.string().describe('Step ID within the current activity (e.g., "define-problem", "create-plan")'),
    },
    withAuditLog('get_step_skill', async ({ session_token, workflow_id, step_id }) => {
      const token = await decodeSessionToken(session_token);

      if (!token.act) {
        throw new Error('No current activity in session. Call next_activity before get_step_skill.');
      }

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const activity = getActivity(wfResult.value, token.act);
      if (!activity) {
        throw new Error(`Activity '${token.act}' not found in workflow '${workflow_id}'.`);
      }

      let skillId: string | undefined;
      const step = activity.steps?.find(s => s.id === step_id);
      if (step) {
        skillId = step.skill;
      } else if (activity.loops) {
        for (const loop of activity.loops) {
          const loopStep = loop.steps?.find(s => s.id === step_id);
          if (loopStep) {
            skillId = loopStep.skill;
            break;
          }
        }
      }

      if (!step && !skillId) {
        const allStepIds = [
          ...(activity.steps?.map(s => s.id) ?? []),
          ...(activity.loops?.flatMap(l => l.steps?.map(s => s.id) ?? []) ?? []),
        ];
        throw new Error(`Step '${step_id}' not found in activity '${token.act}'. Available steps: [${allStepIds.join(', ')}]`);
      }

      if (!skillId) {
        throw new Error(`Step '${step_id}' in activity '${token.act}' has no associated skill.`);
      }

      const result = await readSkill(skillId, config.workflowDir, workflow_id);
      if (!result.success) throw result.error;

      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        validateWorkflowVersion(token, wfResult.value),
      );

      const refs = await loadSkillResourceRefs(config.workflowDir, workflow_id, result.value);
      const advancedToken = await advanceToken(session_token, { wf: workflow_id, skill: skillId });

      const response = {
        skill: bundleSkillWithResourceRefs(result.value, refs),
        session_token: advancedToken,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_resource',
    'Load a single resource\'s full content by its index. Use this to fetch resources referenced in skill _resources arrays. The resource_index can be a bare index (e.g., "05") which resolves within the specified workflow_id, or a prefixed cross-workflow reference (e.g., "meta/04") which resolves from the named workflow. Returns the resource content, id, and version.',
    {
      ...sessionTokenParam,
      workflow_id: z.string().describe('Workflow ID (used as default when resource_index has no prefix)'),
      resource_index: z.string().describe('Resource index — bare (e.g., "23") resolves within workflow_id, prefixed (e.g., "meta/04") resolves from the specified workflow'),
    },
    withAuditLog('get_resource', async ({ session_token, workflow_id, resource_index }) => {
      const token = await decodeSessionToken(session_token);

      const parsed = parseResourceRef(resource_index);
      const targetWorkflow = parsed.workflowId ?? workflow_id;
      const result = await readResourceStructured(config.workflowDir, targetWorkflow, parsed.index);
      if (!result.success) throw result.error;

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      const validation = buildValidation(
        validateWorkflowConsistency(token, workflow_id),
        wfResult.success ? validateWorkflowVersion(token, wfResult.value) : null,
      );

      const advancedToken = await advanceToken(session_token, { wf: workflow_id });

      const response = {
        resource: { ...result.value, index: resource_index },
        session_token: advancedToken,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response) }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

}
