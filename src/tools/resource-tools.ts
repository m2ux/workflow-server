import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { readSkillRaw, resolveOperations, formatOperationsBundle } from '../loaders/skill-loader.js';
import { encodeToon } from '../utils/toon.js';
import { createSessionToken, decodeSessionToken, decodePayloadOnly, advanceToken, sessionTokenParam, assertCheckpointsResolved } from '../utils/session.js';
import type { ParentContext } from '../utils/session.js';
import { buildValidation, validateWorkflowVersion } from '../utils/validation.js';
import { createTraceEvent } from '../trace.js';

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


export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  // ============== Session Tools ==============

  server.registerTool(
    'start_session',
    {
      description:
        'Start a new workflow session or inherit an existing one. Returns a session token (required for all subsequent tool calls) and basic workflow metadata. ' +
        'For a fresh session, provide agent_id only (defaults to "meta" workflow) or specify workflow_id for a different workflow. ' +
        'For nested workflow dispatch, provide workflow_id and parent_session_token — this creates a new child session with parent context fields (pwf, pact, pv, psid) embedded for trace correlation and resume routing. ' +
        'For worker dispatch or resume, provide session_token and agent_id — the returned token inherits all state (current activity, pending checkpoints, session ID) from the token, and the workflow is derived from the token\'s embedded workflow ID. ' +
        'The agent_id parameter is required and sets the aid field inside the HMAC-signed token, distinguishing orchestrator from worker calls in the trace. ' +
        'STRICT PARAMETERS: this tool rejects unknown keys (e.g., do NOT pass "saved_session_token" — pass the saved token under the "session_token" parameter). ' +
        'STALENESS RECOVERY POLICY: HMAC staleness recovery (re-signing a saved token after a server restart) is performed ONLY by start_session. Other workflow tools (next_activity, get_workflow, etc.) verify HMAC strictly with no recovery. To recover a stale saved token, call start_session with session_token set to the saved value; the auto-adopt path re-signs the payload in place and preserves sid, act, and variables.',
      inputSchema: z
        .object({
          workflow_id: z.string().optional().describe('Optional. Target workflow ID for a fresh session (e.g., "work-package"). When omitted and no session_token is provided, defaults to "meta". When session_token is provided, the workflow is derived from the token and this parameter is used only as a fallback for fresh-session recovery.'),
          parent_session_token: z.string().optional().describe('Optional. When creating a fresh session with workflow_id, provide the parent session token to establish a parent-child relationship. The parent\'s workflow ID, current activity, version, and session ID are embedded in the new token for trace correlation and resume routing. Ignored when session_token is provided.'),
          session_token: z.string().optional().describe('Optional. An existing session token to inherit. When provided, the returned token preserves sid, act, bcp, cond, v, and all state from the parent token. The workflow is derived from the token\'s embedded workflow ID. Used for worker dispatch (pass the orchestrator token) or resume (pass a saved token). NOTE: this is the parameter to use for resume from a saved workflow-state.json — do not invent a "saved_session_token" parameter; the schema is strict and unknown keys are rejected.'),
          agent_id: z.string().default('orchestrator').describe('Sets the aid field inside the HMAC-signed token (e.g., "orchestrator", "worker-1"). Distinguishes agents sharing a session in the trace. Defaults to "orchestrator" if omitted.'),
        })
        .strict(),
    },
    withAuditLog('start_session', async ({ workflow_id, parent_session_token, session_token, agent_id }) => {
      const DEFAULT_WORKFLOW_ID = 'meta';
      let effectiveWorkflowId: string;
      let effectiveWorkflowVersion: string;
      let token: string;
      let aidMismatchWarning: string | undefined;
      let tokenAdoptedWarning: string | undefined;
      let tokenRecoveryWarning: string | undefined;

      if (session_token) {
        // Decode the token FIRST to determine the authoritative workflow ID.
        try {
          const parentToken = await decodeSessionToken(session_token);

          // Auto-detect staleness: if the server started after the token was created,
          // the HMAC key has changed. Skip verification and go directly to re-signing.
          const serverUptimeSeconds = Math.floor(process.uptime());
          const tokenAgeSeconds = Math.floor(Date.now() / 1000) - parentToken.ts;
          if (tokenAgeSeconds > serverUptimeSeconds + 5) { // 5s grace period
            // Token predates server startup — it WILL fail HMAC verification.
            // Throw to trigger the re-signing path below.
            throw new Error('Invalid session token: HMAC signature verification failed. Auto-detected stale token (server restarted since token was created).');
          }

          effectiveWorkflowId = parentToken.wf;
          effectiveWorkflowVersion = parentToken.v;

          if (parentToken.aid && parentToken.aid !== agent_id) {
            aidMismatchWarning = `Warning: The provided agent_id '${agent_id}' does not match the inherited session token's agent_id '${parentToken.aid}'. The session has been transitioned to '${agent_id}'.`;
          }

          token = await advanceToken(session_token, { aid: agent_id }, parentToken);

          if (config.traceStore) {
            const event = createTraceEvent(
              parentToken.sid, 'start_session', 0, 'ok',
              effectiveWorkflowId, parentToken.act, agent_id,
            );
            config.traceStore.append(parentToken.sid, event);
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const isTokenError = errMsg.includes('HMAC signature verification failed') ||
            errMsg.includes('missing signature segment') ||
            errMsg.includes('failed to decode payload') ||
            errMsg.includes('payload is missing required fields') ||
            errMsg.includes('Auto-detected stale token');

          if (!isTokenError) {
            // Re-throw non-token errors
            throw err;
          }

          // HMAC verification failed — the token may be stale (server restart)
          // or corrupted. Try to adopt the payload by re-signing it.
          const payload = await decodePayloadOnly(session_token);

          if (payload) {
            // Payload is structurally valid. Use its wf as the workflow ID.
            effectiveWorkflowId = payload.wf;
            effectiveWorkflowVersion = payload.v;

            console.warn(`[start_session] Re-signing stale token for session '${payload.sid}' (HMAC key changed).`);
            tokenAdoptedWarning =
              `The provided session_token had an invalid signature (the server was likely restarted). ` +
              `The session state has been adopted and re-signed — session ID, activity position, and variables are preserved. ` +
              `Original error: ${errMsg}`;

            token = await advanceToken(session_token, { aid: agent_id }, payload);

            if (config.traceStore) {
              config.traceStore.initSession(payload.sid);
              const event = createTraceEvent(
                payload.sid, 'start_session', 0, 'ok',
                effectiveWorkflowId, payload.act, agent_id,
                { err: 'adopted:re-signed_stale_token' },
              );
              config.traceStore.append(payload.sid, event);
            }
          } else {
            // Payload is also corrupted. Fall back to a fresh session.
            // Use workflow_id if provided, otherwise default to meta.
            effectiveWorkflowId = workflow_id ?? DEFAULT_WORKFLOW_ID;
            // Load the workflow so the fresh token carries v (the workflow
            // version). Without this, the token's v stays empty and saved
            // state files end up duplicating workflowVersion at the envelope
            // level just to recover it.
            const wfPreLoad = await loadWorkflow(config.workflowDir, effectiveWorkflowId);
            effectiveWorkflowVersion = wfPreLoad.success ? (wfPreLoad.value.version ?? '') : '';
            console.warn(`[start_session] Provided session_token is invalid and payload is not recoverable. Creating a fresh session for workflow '${effectiveWorkflowId}'.`);
            tokenRecoveryWarning =
              `The provided session_token could not be verified and the payload could not be recovered. ` +
              `A fresh session has been created instead (workflow: '${effectiveWorkflowId}'). The previous session state (activity position, variables) was NOT inherited. ` +
              `You must reconstruct the session state from your saved workflow-state.json: ` +
              `call next_activity to transition to the currentActivity, and restore variables manually. ` +
              `Original error: ${errMsg}`;

            token = await createSessionToken(effectiveWorkflowId, effectiveWorkflowVersion, agent_id);

            if (config.traceStore) {
              const decoded = await decodeSessionToken(token);
              config.traceStore.initSession(decoded.sid);
              const event = createTraceEvent(
                decoded.sid, 'start_session', 0, 'ok',
                effectiveWorkflowId, '', agent_id,
                { err: 'recovered:invalid_session_token' },
              );
              config.traceStore.append(decoded.sid, event);
            }
          }
        }
      } else {
        // Fresh session — use workflow_id if provided, otherwise default to meta.
        effectiveWorkflowId = workflow_id ?? DEFAULT_WORKFLOW_ID;
        // Load the workflow so the fresh token carries v (the workflow version).
        // Without this, the token's v stays empty and saved state files end up
        // duplicating workflowVersion at the envelope level just to recover it.
        const wfPreLoad = await loadWorkflow(config.workflowDir, effectiveWorkflowId);
        effectiveWorkflowVersion = wfPreLoad.success ? (wfPreLoad.value.version ?? '') : '';

        // If parent_session_token is provided, extract parent context for trace correlation.
        let parentContext: ParentContext | undefined;
        if (parent_session_token) {
          try {
            const parentToken = await decodeSessionToken(parent_session_token);
            parentContext = {
              psid: parentToken.sid,
              pwf: parentToken.wf,
              pact: parentToken.act,
              pv: parentToken.v,
            };

            if (config.traceStore) {
              const parentEvent = createTraceEvent(
                parentToken.sid, 'start_session', 0, 'ok',
                parentToken.wf, parentToken.act, parentToken.aid,
                { vw: [effectiveWorkflowId] },
              );
              config.traceStore.append(parentToken.sid, parentEvent);
            }
          } catch {
            // Parent token is invalid — proceed without parent context.
            // The child session is still valid, just unlinked.
            console.warn(`[start_session] parent_session_token is invalid; creating child session without parent context.`);
          }
        }

        token = await createSessionToken(effectiveWorkflowId, effectiveWorkflowVersion, agent_id, parentContext);

        if (config.traceStore) {
          const decoded = await decodeSessionToken(token);
          config.traceStore.initSession(decoded.sid);
          const event = createTraceEvent(
            decoded.sid, 'start_session', 0, 'ok',
            effectiveWorkflowId, '', agent_id,
            parentContext ? { psid: parentContext.psid } : undefined,
          );
          config.traceStore.append(decoded.sid, event);
        }
      }

      // Load the workflow using the effective workflow ID.
      const wfResult = await loadWorkflow(config.workflowDir, effectiveWorkflowId);
      if (!wfResult.success) throw wfResult.error;

      const workflow = wfResult.value;
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
        session_token: token,
      };

      if (session_token && !tokenRecoveryWarning) {
        response['inherited'] = true;
      }
      if (tokenAdoptedWarning) {
        response['adopted'] = true;
        response['warning'] = tokenAdoptedWarning;
      } else if (tokenRecoveryWarning) {
        response['recovered'] = true;
        response['warning'] = tokenRecoveryWarning;
      } else if (aidMismatchWarning) {
        response['warning'] = aidMismatchWarning;
      }
      
      const _meta: Record<string, unknown> = { session_token: token };
      const warnings: string[] = [];
      if (tokenAdoptedWarning) warnings.push(tokenAdoptedWarning);
      if (tokenRecoveryWarning) warnings.push(tokenRecoveryWarning);
      if (aidMismatchWarning) warnings.push(aidMismatchWarning);
      if (warnings.length > 0) {
        _meta['validation'] = { status: 'warning', warnings };
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta,
      };
    })
  );

  // ============== Skill Tools ==============

  server.tool(
    'get_skills',
    'DEPRECATED: prefer get_workflow which now bundles the workflow-level operations (resolved from workflow.skill_operations + core orchestrator ops) directly in its response. Use resolve_operations for ad-hoc operation lookups. Retained for backwards compatibility with workflows still on the legacy primary-skill model. Loads the workflow-level primary skill as raw TOON.',
    {
      ...sessionTokenParam,
    },
    withAuditLog('get_skills', async ({ session_token }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);
      const workflow_id = token.wf;
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

      const validation = buildValidation(
        validateWorkflowVersion(token, wfResult.value),
      );

      const advancedToken = await advanceToken(session_token);
      const header = [
        `scope: workflow`,
        `session_token: ${advancedToken}`,
        ...(failedSkills.length > 0 ? [`failed_skills: ${failedSkills.join(', ')}`] : []),
      ];

      return {
        content: [{ type: 'text' as const, text: header.join('\n') + '\n\n---\n\n' + rawBlocks.join('\n\n---\n\n') }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_skill',
    'Load a skill within the current workflow or activity. If called before next_activity (no current activity in session), it loads the primary skill for the workflow. If called during an activity, it resolves the skill reference from the activity definition. If step_id is provided, it loads the skill explicitly assigned to that step. If step_id is omitted during an activity, it loads the primary skill for the entire activity. Returns the skill definition with resource references in _resources.',
    {
      ...sessionTokenParam,
      step_id: z.string().optional().describe('Optional. Step ID within the current activity (e.g., "define-problem"). If omitted, returns the primary skill for the activity, or the workflow primary skill if no activity is active.'),
    },
    withAuditLog('get_skill', async ({ session_token, step_id }) => {
      const token = await decodeSessionToken(session_token);
      const workflow_id = token.wf;

      assertCheckpointsResolved(token);

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      let skillId: string | undefined;

      if (!token.act) {
        if (step_id) {
          throw new Error('Cannot provide step_id when no activity is active. Call next_activity first.');
        }
        skillId = wfResult.value.skills?.primary;
        if (!skillId) {
          throw new Error(`Workflow '${workflow_id}' does not define a primary skill.`);
        }
      } else {
        const activity = getActivity(wfResult.value, token.act);
        if (!activity) {
          throw new Error(`Activity '${token.act}' not found in workflow '${workflow_id}'.`);
        }

        if (!step_id) {
          skillId = activity.skills?.primary;
          if (!skillId) {
            throw new Error(`Activity '${token.act}' does not define a primary skill.`);
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
          throw new Error(`Step '${step_id}' not found in activity '${token.act}'. Available steps: [${allStepIds.join(', ')}]`);
        }

        if (!skillId) {
          throw new Error(`Step '${step_id}' in activity '${token.act}' has no associated skill.`);
        }
      }
      }

      const rawResult = await readSkillRaw(skillId, config.workflowDir, workflow_id);
      if (!rawResult.success) throw rawResult.error;

      const validation = buildValidation(
        validateWorkflowVersion(token, wfResult.value),
      );

      const advancedToken = await advanceToken(session_token, { skill: skillId });

      return {
        content: [{ type: 'text' as const, text: `session_token: ${advancedToken}\n\n${rawResult.value}` }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

  server.tool(
    'get_resource',
    'Load a single resource\'s full content by its ID. Use this to fetch resources referenced in skill _resources arrays. The resource_id can be a bare index (e.g., "05") which resolves within the session\'s workflow, or a prefixed cross-workflow reference (e.g., "meta/01") which resolves from the named workflow. Returns the resource content, id, and version.',
    {
      ...sessionTokenParam,
      resource_id: z.string().describe('Resource ID — bare (e.g., "23") resolves within the session workflow, prefixed (e.g., "meta/01") resolves from the specified workflow'),
    },
    withAuditLog('get_resource', async ({ session_token, resource_id }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);
      const workflow_id = token.wf;

      const parsed = parseResourceRef(resource_id);
      const targetWorkflow = parsed.workflowId ?? workflow_id;
      const result = await readResourceStructured(config.workflowDir, targetWorkflow, parsed.index);
      if (!result.success) throw result.error;

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      const validation = buildValidation(
        wfResult.success ? validateWorkflowVersion(token, wfResult.value) : null,
      );

      const advancedToken = await advanceToken(session_token);

      const { content: resourceContent, ...meta } = result.value;
      const lines = [
        `resource_id: ${resource_id}`,
        ...(meta.id ? [`id: ${meta.id}`] : []),
        ...(meta.version ? [`version: ${meta.version}`] : []),
        `session_token: ${advancedToken}`,
        '',
        resourceContent,
      ];

      return {
        content: [{ type: 'text' as const, text: lines.join('\n') }],
        _meta: { session_token: advancedToken, validation },
      };
    }, traceOpts)
  );

  // ============== Operation Resolution ==============

  server.tool(
    'resolve_operations',
    'Resolve a flat list of skill::element references to their bodies. Each ref is in skill-id::element-name form (e.g., "agent-conduct::file-sensitivity", "workflow-orchestrator::evaluate-transition"). Optionally workflow-prefixed: "meta/agent-conduct::file-sensitivity". Returns a bundle grouped by kind: `operations` and `errors` are objects keyed by `<skill-id>::<name>` → body; `rules` is a flat array of [rule-name, rule-line] tuples (one tuple per line, with global rules from any touched skill auto-included); `unresolved` lists refs that did not resolve. Empty groups are omitted. No session token required — this is a structural lookup.',
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
