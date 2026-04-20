import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { readSkillRaw } from '../loaders/skill-loader.js';
import { createSessionToken, decodeSessionToken, decodePayloadOnly, advanceToken, sessionTokenParam, assertCheckpointsResolved } from '../utils/session.js';
import { buildValidation, validateWorkflowVersion } from '../utils/validation.js';
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


export function registerResourceTools(server: McpServer, config: ServerConfig): void {
  const traceOpts = config.traceStore ? { traceStore: config.traceStore } : undefined;

  // ============== Session Tools ==============

  server.tool(
    'start_session',
    'Start a new workflow session or inherit an existing one. Returns a session token (required for all subsequent tool calls) and basic workflow metadata. ' +
    'For a fresh session, provide workflow_id and agent_id. For worker dispatch or resume, also provide session_token from the parent/previous session — the returned token inherits all state (current activity, pending checkpoints, session ID) with the provided agent_id stamped into the signed payload. ' +
    'The agent_id parameter is required and sets the aid field inside the HMAC-signed token, distinguishing orchestrator from worker calls in the trace.',
    {
      workflow_id: z.string().describe('Workflow ID to start a session for (e.g., "work-package")'),
      session_token: z.string().optional().describe('Optional. An existing session token to inherit. When provided, the returned token preserves sid, act, pcp, pcpt, cond, v, and all state from the parent token. Used for worker dispatch (pass the orchestrator token) or resume (pass a saved token).'),
      agent_id: z.string().describe('REQUIRED. Sets the aid field inside the HMAC-signed token (e.g., "orchestrator", "worker-1"). Distinguishes agents sharing a session in the trace.'),
    },
    withAuditLog('start_session', async ({ workflow_id, session_token, agent_id }) => {
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      const workflow = wfResult.value;
      if (!workflow.version) {
        console.warn(`[start_session] Workflow '${workflow_id}' has no version defined; version drift detection will be unreliable.`);
      }

      let token: string;
      let mismatchWarning: string | undefined;
      let tokenAdoptedWarning: string | undefined;
      let tokenRecoveryWarning: string | undefined;

      if (session_token) {
        try {
          const parentToken = await decodeSessionToken(session_token);
          if (parentToken.wf !== workflow_id) {
            throw new Error(
              `Workflow mismatch: session token is for '${parentToken.wf}' but '${workflow_id}' was requested. ` +
              `Use the same workflow_id as the parent session, or omit session_token to start a fresh session.`
            );
          }
          
          if (parentToken.aid && parentToken.aid !== agent_id) {
            mismatchWarning = `Warning: The provided agent_id '${agent_id}' does not match the inherited session token's agent_id '${parentToken.aid}'. The session has been transitioned to '${agent_id}'.`;
          }

          token = await advanceToken(session_token, { aid: agent_id }, parentToken);

          if (config.traceStore) {
            const event = createTraceEvent(
              parentToken.sid, 'start_session', 0, 'ok',
              workflow_id, parentToken.act, agent_id,
            );
            config.traceStore.append(parentToken.sid, event);
          }
        } catch (err: unknown) {
          const errMsg = err instanceof Error ? err.message : String(err);
          const isTokenError = errMsg.includes('HMAC signature verification failed') ||
            errMsg.includes('missing signature segment') ||
            errMsg.includes('failed to decode payload') ||
            errMsg.includes('payload is missing required fields');

          if (!isTokenError) {
            // Re-throw non-token errors (e.g., workflow mismatch)
            throw err;
          }

          // HMAC verification failed — the token may be stale (server restart)
          // or corrupted. Try to adopt the payload by re-signing it.
          const payload = await decodePayloadOnly(session_token);

          if (payload && payload.wf === workflow_id) {
            // Payload is structurally valid and matches the workflow.
            // Re-sign it with the current key and adopt the session.
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
                workflow_id, payload.act, agent_id,
                { err: 'adopted:re-signed_stale_token' },
              );
              config.traceStore.append(payload.sid, event);
            }
          } else {
            // Payload is also corrupted or workflow mismatch.
            // Fall back to a fresh session.
            console.warn(`[start_session] Provided session_token is invalid and payload is not recoverable. Creating a fresh session for workflow '${workflow_id}'.`);
            tokenRecoveryWarning =
              `The provided session_token could not be verified and the payload could not be recovered. ` +
              `A fresh session has been created instead. The previous session state (activity position, variables) was NOT inherited. ` +
              `You must reconstruct the session state from your saved workflow-state.json: ` +
              `call next_activity to transition to the currentActivity, and restore variables manually. ` +
              `Original error: ${errMsg}`;

            token = await createSessionToken(workflow_id, workflow.version ?? '0.0.0', agent_id);

            if (config.traceStore) {
              const decoded = await decodeSessionToken(token);
              config.traceStore.initSession(decoded.sid);
              const event = createTraceEvent(
                decoded.sid, 'start_session', 0, 'ok',
                workflow_id, '', agent_id,
                { err: 'recovered:invalid_session_token' },
              );
              config.traceStore.append(decoded.sid, event);
            }
          }
        }
      } else {
        token = await createSessionToken(workflow_id, workflow.version ?? '0.0.0', agent_id);

        if (config.traceStore) {
          const decoded = await decodeSessionToken(token);
          config.traceStore.initSession(decoded.sid);
          const event = createTraceEvent(
            decoded.sid, 'start_session', 0, 'ok',
            workflow_id, '', agent_id,
          );
          config.traceStore.append(decoded.sid, event);
        }
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

      // Return session_id so callers never need to decode the token.
      // Decode the fresh token (always valid since we just created/advanced it).
      const decodedToken = await decodeSessionToken(token);
      response['session_id'] = decodedToken.sid;

      if (session_token && !tokenRecoveryWarning) {
        response['inherited'] = true;
      }
      if (tokenAdoptedWarning) {
        response['adopted'] = true;
        response['warning'] = tokenAdoptedWarning;
      } else if (tokenRecoveryWarning) {
        response['recovered'] = true;
        response['warning'] = tokenRecoveryWarning;
      } else if (mismatchWarning) {
        response['warning'] = mismatchWarning;
      }
      
      const _meta: Record<string, unknown> = { session_token: token };
      const warnings: string[] = [];
      if (tokenAdoptedWarning) warnings.push(tokenAdoptedWarning);
      if (tokenRecoveryWarning) warnings.push(tokenRecoveryWarning);
      if (mismatchWarning) warnings.push(mismatchWarning);
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
    'Load all workflow-level skills (behavioral protocols like session-protocol, agent-conduct). Call this after start_session to load the skills that govern session behavior. Returns raw TOON skill definitions separated by --- fences. These are workflow-scope skills; activity-level step skills are loaded separately via get_skill.',
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
      const skillIds = workflow.skills ? [workflow.skills.primary] : [];

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
    'Load a single resource\'s full content by its index. Use this to fetch resources referenced in skill _resources arrays. The resource_index can be a bare index (e.g., "05") which resolves within the session\'s workflow, or a prefixed cross-workflow reference (e.g., "meta/04") which resolves from the named workflow. Returns the resource content, id, and version.',
    {
      ...sessionTokenParam,
      resource_index: z.string().describe('Resource index — bare (e.g., "23") resolves within the session workflow, prefixed (e.g., "meta/04") resolves from the specified workflow'),
    },
    withAuditLog('get_resource', async ({ session_token, resource_index }) => {
      const token = await decodeSessionToken(session_token);
      assertCheckpointsResolved(token);
      const workflow_id = token.wf;

      const parsed = parseResourceRef(resource_index);
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
        `resource_index: ${resource_index}`,
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

}
