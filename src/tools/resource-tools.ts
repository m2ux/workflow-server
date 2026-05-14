import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { readSkillRaw, resolveOperations, formatOperationsBundle } from '../loaders/skill-loader.js';
import { encodeToon } from '../utils/toon.js';
import { sessionIndexParam, assertNoActiveCheckpoint } from '../utils/session.js';
import {
  loadSessionForTool,
  advanceSession,
  saveSessionForTool,
  sessionView,
  describeSessionStoreError,
} from '../utils/session-resolver.js';
import {
  SessionStoreError,
  ensurePlanningFolder,
  sessionFileExists,
  writeSessionFile,
  verifySeal,
} from '../utils/session-store.js';
import { computeSessionIndex } from '../utils/session-index.js';
import { createInitialSessionFile, safeValidateSessionFile, type SessionFile } from '../schema/session.schema.js';
import { buildValidation, validateWorkflowVersion } from '../utils/validation.js';
import { createTraceEvent } from '../trace.js';
import { randomUUID } from 'node:crypto';

/**
 * Parse a resource reference that may include a workflow prefix.
 * Format: "workflow/index" for cross-workflow, or bare "index" for local.
 * Examples: "meta/01" → { workflowId: "meta", index: "01" }
 *           "01"      → { workflowId: undefined, index: "01" }
 */
function parseResourceRef(ref: string): { workflowId: string | undefined; index: string } {
  const slashIdx = ref.indexOf('/');
  if (slashIdx > 0) {
    return { workflowId: ref.substring(0, slashIdx), index: ref.substring(slashIdx + 1) };
  }
  return { workflowId: undefined, index: ref };
}

/**
 * Wrap a tool handler so any thrown `SessionStoreError` is re-thrown with a
 * user-facing message. Mirrors the helper in `workflow-tools.ts`.
 */
function withSessionStoreErrors<T extends Record<string, unknown>, R>(
  handler: (args: T) => Promise<R>,
): (args: T) => Promise<R> {
  return async (args: T) => {
    try {
      return await handler(args);
    } catch (err) {
      if (err instanceof SessionStoreError) {
        throw new Error(describeSessionStoreError(err));
      }
      throw err;
    }
  };
}


export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  // ============== Session Tools ==============

  server.registerTool(
    'start_session',
    {
      description:
        'Start a new workflow session or inherit an existing one. Returns a `session_index` (a 6-character RFC 4648 base32 string, required for all subsequent authenticated tool calls) and basic workflow metadata. ' +
        'In Phase 4 the input shape mirrors the legacy contract: provide `workflow_id` (defaults to "meta") and `agent_id`; pass `parent_session_index` for nested-workflow dispatch. The server creates a planning folder under `<workspace>/.engineering/artifacts/planning/`, writes `session.json` + `.session-token`, and returns the index that identifies the folder. ' +
        'The agent_id parameter is required and is stored on `session.json#agentId`, distinguishing orchestrator from worker calls in the trace.',
      inputSchema: z
        .object({
          workflow_id: z.string().optional().describe('Optional. Target workflow ID for a fresh session (e.g., "work-package"). Defaults to "meta".'),
          parent_session_index: z.string().regex(/^[A-Z2-7]{6}$/).optional().describe('Optional. When dispatching a child workflow, the parent\'s session_index. The parent\'s `session.json` is snapshot under the child\'s `parentSession` field for trace correlation and recursive parent traversal.'),
          planning_slug: z.string().optional().describe('Optional. Slug for the planning folder under `<workspace>/.engineering/artifacts/planning/<slug>/`. When omitted, the server creates a transitional slug derived from a fresh UUID. Phase 5 makes this the canonical input.'),
          agent_id: z.string().default('orchestrator').describe('Sets the agentId field inside the session state (e.g., "orchestrator", "worker-1"). Distinguishes agents sharing a session in the trace. Defaults to "orchestrator" if omitted.'),
        })
        .strict(),
    },
    withAuditLog('start_session', async ({ workflow_id, parent_session_index, planning_slug, agent_id }) => {
      const DEFAULT_WORKFLOW_ID = 'meta';
      const effectiveWorkflowId = workflow_id ?? DEFAULT_WORKFLOW_ID;

      // Load the workflow to capture version (carried into session.json#workflowVersion).
      const wfPreLoad = await loadWorkflow(config.workflowDir, effectiveWorkflowId);
      const effectiveWorkflowVersion = wfPreLoad.success ? (wfPreLoad.value.version ?? '') : '';

      // Resolve the planning folder.
      // - When `planning_slug` is provided, use it directly (Phase 5-compatible).
      // - Otherwise mint a transitional slug (`transition-<uuid>`); Phase 5 will
      //   make `planning_slug` required and remove this fallback.
      const slug = planning_slug ?? `transition-${randomUUID()}`;
      const folder = await ensurePlanningFolder(config.workspaceDir, slug);

      // Compute the canonical session_index for the folder.
      const sessionIndex = await computeSessionIndex(folder);

      // If session.json already exists, resume; otherwise create + seal.
      let state: SessionFile;
      if (await sessionFileExists(folder)) {
        const { state: rawState } = await verifySeal(folder);
        const parsed = safeValidateSessionFile(rawState);
        if (!parsed.success) {
          const issues = parsed.error.issues.map(i => `${i.path.join('.')}: ${i.message}`).join('; ');
          throw new Error(
            `start_session: existing session.json at ${folder} does not match the SessionFile schema (${issues}). ` +
            `Remove the folder or restore it from the most recent commit before retrying.`,
          );
        }
        state = parsed.data;
        // Update agent_id on resume (matches legacy aid-mismatch semantics).
        if (state.agentId !== agent_id) {
          state = { ...state, agentId: agent_id };
          await writeSessionFile(folder, state);
        }
      } else {
        // Capture parent snapshot if a parent_session_index was provided.
        let parentSession: SessionFile | undefined;
        if (parent_session_index) {
          try {
            const parentLoaded = await loadSessionForTool(config.workspaceDir, parent_session_index);
            parentSession = parentLoaded.state;

            if (config.traceStore) {
              const parentEvent = createTraceEvent(
                parentLoaded.state.sessionIndex, 'start_session', 0, 'ok',
                parentLoaded.state.workflowId, parentLoaded.state.currentActivity, parentLoaded.state.agentId,
                { vw: [effectiveWorkflowId] },
              );
              config.traceStore.append(parentLoaded.state.sessionIndex, parentEvent);
            }
          } catch (err) {
            // Parent index is invalid — proceed without parent context.
            console.warn(`[start_session] parent_session_index '${parent_session_index}' could not be resolved; creating session without parent snapshot. Error: ${err instanceof Error ? err.message : String(err)}`);
          }
        }

        const newState = createInitialSessionFile({
          sessionIndex,
          workflowId: effectiveWorkflowId,
          workflowVersion: effectiveWorkflowVersion,
          agentId: agent_id,
          ...(parentSession ? { parentSession } : {}),
        });
        state = newState;
        await writeSessionFile(folder, state);
      }

      if (config.traceStore) {
        config.traceStore.initSession(state.sessionIndex);
        const event = createTraceEvent(
          state.sessionIndex, 'start_session', 0, 'ok',
          effectiveWorkflowId, state.currentActivity, agent_id,
          state.parentSession ? { psid: state.parentSession.sessionIndex } : undefined,
        );
        config.traceStore.append(state.sessionIndex, event);
      }

      if (!wfPreLoad.success) throw wfPreLoad.error;
      const workflow = wfPreLoad.value;
      if (!workflow.version) {
        console.warn(`[start_session] Workflow '${effectiveWorkflowId}' has no version defined; version drift detection will be unreliable.`);
      }

      const response: Record<string, unknown> = {
        workflow: {
          id: workflow.id,
          version: workflow.version,
          title: workflow.title,
          description: workflow.description,
        },
        session_index: sessionIndex,
        planning_slug: slug,
      };

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_index: sessionIndex, validation: buildValidation() },
      };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'get_skills',
    'DEPRECATED: prefer get_workflow which now bundles the workflow-level operations (resolved from workflow.skill_operations + core orchestrator ops) directly in its response. Use resolve_operations for ad-hoc operation lookups. Retained for backwards compatibility with workflows still on the legacy primary-skill model. Loads the workflow-level primary skill as raw TOON.',
    {
      ...sessionIndexParam,
    },
    withAuditLog('get_skills', withSessionStoreErrors(async ({ session_index }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const workflow = wfResult.value;
      const skillIds: string[] = workflow.skills?.primary ? [workflow.skills.primary] : [];

      const rawBlocks: string[] = [];
      const failedSkills: string[] = [];

      for (const sid of skillIds) {
        const rawResult = await readSkillRaw(sid, config.workflowDir, workflow_id);
        if (rawResult.success) {
          rawBlocks.push(rawResult.value);
        } else {
          failedSkills.push(sid);
        }
      }

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wfResult.value),
      );

      const next = advanceSession(state);
      await saveSessionForTool(loaded.folderAbsPath, next);

      const header = [
        `scope: workflow`,
        `session_index: ${session_index}`,
        ...(failedSkills.length > 0 ? [`failed_skills: ${failedSkills.join(', ')}`] : []),
      ];

      return {
        content: [{ type: 'text' as const, text: header.join('\n') + '\n\n---\n\n' + rawBlocks.join('\n\n---\n\n') }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

  server.tool(
    'get_skill',
    'Load a skill within the current workflow or activity. If called before next_activity (no current activity in session), it loads the primary skill for the workflow. If called during an activity, it resolves the skill reference from the activity definition. If step_id is provided, it loads the skill explicitly assigned to that step. If step_id is omitted during an activity, it loads the primary skill for the entire activity. Returns the skill definition with resource references in _resources.',
    {
      ...sessionIndexParam,
      step_id: z.string().optional().describe('Optional. Step ID within the current activity (e.g., "define-problem"). If omitted, returns the primary skill for the activity, or the workflow primary skill if no activity is active.'),
    },
    withAuditLog('get_skill', withSessionStoreErrors(async ({ session_index, step_id }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      const workflow_id = state.workflowId;

      assertNoActiveCheckpoint(state);

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      let skillId: string | undefined;

      if (!state.currentActivity) {
        if (step_id) {
          throw new Error('Cannot provide step_id when no activity is active. Call next_activity first.');
        }
        skillId = wfResult.value.skills?.primary;
        if (!skillId) {
          throw new Error(`Workflow '${workflow_id}' does not define a primary skill.`);
        }
      } else {
        const activity = getActivity(wfResult.value, state.currentActivity);
        if (!activity) {
          throw new Error(`Activity '${state.currentActivity}' not found in workflow '${workflow_id}'.`);
        }

        if (!step_id) {
          skillId = activity.skills?.primary;
          if (!skillId) {
            throw new Error(`Activity '${state.currentActivity}' does not define a primary skill.`);
          }
        } else {
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
            throw new Error(`Step '${step_id}' not found in activity '${state.currentActivity}'. Available steps: [${allStepIds.join(', ')}]`);
          }

          if (!skillId) {
            throw new Error(`Step '${step_id}' in activity '${state.currentActivity}' has no associated skill.`);
          }
        }
      }

      const rawResult = await readSkillRaw(skillId, config.workflowDir, workflow_id);
      if (!rawResult.success) throw rawResult.error;

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wfResult.value),
      );

      const next = advanceSession(state, (draft) => {
        draft.currentSkill = skillId as string;
      });
      await saveSessionForTool(loaded.folderAbsPath, next);

      return {
        content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${rawResult.value}` }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

  server.tool(
    'get_resource',
    'Load a single resource\'s full content by its ID. Use this to fetch resources referenced in skill _resources arrays. The resource_id can be a bare index (e.g., "05") which resolves within the session\'s workflow, or a prefixed cross-workflow reference (e.g., "meta/01") which resolves from the named workflow. Returns the resource content, id, and version.',
    {
      ...sessionIndexParam,
      resource_id: z.string().describe('Resource ID — bare (e.g., "23") resolves within the session workflow, prefixed (e.g., "meta/01") resolves from the specified workflow'),
    },
    withAuditLog('get_resource', withSessionStoreErrors(async ({ session_index, resource_id }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;

      const parsed = parseResourceRef(resource_id);
      const targetWorkflow = parsed.workflowId ?? workflow_id;
      const result = await readResourceStructured(config.workflowDir, targetWorkflow, parsed.index);
      if (!result.success) throw result.error;

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      const view = sessionView(state);
      const validation = buildValidation(
        wfResult.success ? validateWorkflowVersion(view, wfResult.value) : null,
      );

      const next = advanceSession(state);
      await saveSessionForTool(loaded.folderAbsPath, next);

      const { content: resourceContent, ...meta } = result.value;
      const lines = [
        `resource_id: ${resource_id}`,
        ...(meta.id ? [`id: ${meta.id}`] : []),
        ...(meta.version ? [`version: ${meta.version}`] : []),
        `session_index: ${session_index}`,
        '',
        resourceContent,
      ];

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

  // ============== Operation Resolution ==============

  server.tool(
    'resolve_operations',
    'Resolve a flat list of skill::element references to their bodies. Each ref is in skill-id::element-name form (e.g., "agent-conduct::file-sensitivity", "workflow-orchestrator::evaluate-transition"). Optionally workflow-prefixed: "meta/agent-conduct::file-sensitivity". Returns a bundle grouped by kind: `operations` and `errors` are objects keyed by `<skill-id>::<name>` → body; `rules` is a flat array of [rule-name, rule-line] tuples (one tuple per line, with global rules from any touched skill auto-included); `unresolved` lists refs that did not resolve. Empty groups are omitted. No session_index required — this is a structural lookup.',
    {
      operations: z.array(z.string()).min(1).describe('List of skill::element references to resolve. Each entry is "skill-id::element-name" or "workflow/skill-id::element-name".'),
    },
    withAuditLog('resolve_operations', async ({ operations }) => {
      const resolved = await resolveOperations(operations, config.workflowDir);
      return {
        content: [{ type: 'text' as const, text: encodeToon(formatOperationsBundle(resolved)) }],
      };
    })
  );

}
