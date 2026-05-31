import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { readSkillRaw, resolveOperations, formatOperationsBundle } from '../loaders/skill-loader.js';
import { encodeToon } from '../utils/toon.js';
import {
  sessionIndexParam,
  assertNoActiveCheckpoint,
  loadSessionForTool,
  advanceSession,
  saveSessionForTool,
  sessionView,
  describeSessionStoreError,
  SessionStoreError,
  ensurePlanningFolder,
  ensureNestedPlanningFolder,
  findPlanningFolderBySlug,
  sessionFileExists,
  writeSessionFile,
  verifySeal,
  planningRoot,
  computeSessionIndex,
  migratePlanningFolder,
  MigrationError,
  describeMigrationError,
  createTransientFolder,
  registerTransient,
  lookupTransientBySlug,
  lookupTransientSlugByFolder,
  isTransientFolder,
  redirectTransientToWorkspace,
  computeEmbeddedSessionIndex,
} from '../utils/session/index.js';
import {
  createInitialSessionFile,
  safeValidateSessionFile,
  parentChainDepth,
  PARENT_CHAIN_DEPTH_WARN_THRESHOLD,
  type SessionFile,
} from '../schema/session.schema.js';
import { buildValidation, validateWorkflowVersion } from '../utils/validation.js';
import { createTraceEvent } from '../trace.js';
import { randomUUID } from 'node:crypto';
import { basename, isAbsolute, resolve } from 'node:path';
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
        'Start or resume the TOP-LEVEL workflow session. Identifies the planning folder via `planning_folder` — an absolute path whose basename is the slug (e.g., `/home/user/repo/.engineering/artifacts/planning/2026-05-28-my-slug` → slug `2026-05-28-my-slug`). Only the basename is consumed; the path part is a hint and is otherwise ignored, so a stale or off-workspace path passed by the agent is harmless. The server always resolves the slug against its own workspace planning root. ' +
        'Returns a 6-character base32 `session_index` for the root session, plus basic workflow metadata, plus the canonical server-side `planning_folder_path` (the absolute path of the folder under THIS server\'s workspace) — the agent can pick up the current location from this response without doing any path math. ' +
        'Behaviour: if a folder for that slug already exists under the server\'s workspace planning root with `session.json`, the server resumes it (workflow_id taken from state — caller cannot rebrand a live session). Otherwise the folder is created (for non-meta workflows) or a transient tmp folder is used (for meta-bootstrap), and a fresh session is written. When `planning_folder` is omitted entirely, a fresh meta-bootstrap session is created in `os.tmpdir()` and a synthetic UUID slug is registered so subsequent `dispatch_child` calls can promote it. ' +
        'The full resolved absolute path is persisted as `planningFolderPath` inside session.json; on resume, if the folder has been renamed or moved within the planning root, the recorded value is silently overwritten with its current location. ' +
        'Other tools identify the session by `session_index` (returned here) — they do not need the path, because session.json carries it. ' +
        'Child workflows are not created through start_session — call `dispatch_child({ session_index, workflow_id })` from inside the parent session to append a child under `triggeredWorkflows[]` (embedded inline; the whole work-package tree lives in the top-level session.json). ' +
        'If the resolved folder contains legacy `workflow-state.json` + `.session-token` artefacts, the server migrates them in place. ' +
        'The agent_id parameter is stored on `session.json#agentId`, distinguishing orchestrator from worker calls in the trace.',
      inputSchema: z
        .object({
          workflow_id: z.string().optional().describe('Optional. Target workflow ID for a fresh top-level session (e.g., "work-package"). Defaults to "meta". Ignored when the slug already resolves to an existing `session.json` (the workflow is taken from the resumed state).'),
          planning_folder: z.string().optional().describe('Optional. Absolute path whose basename is treated as the planning slug. The path part is informational — the slug is resolved against the SERVER\'s own workspace planning root, not the path you pass. Bare slugs and relative paths are rejected. When omitted, the server mints a transitional UUID slug and registers it for the meta bootstrap session.'),
          agent_id: z.string().default('orchestrator').describe('Sets the agentId field inside the session state. Distinguishes agents sharing a session in the trace. Defaults to "orchestrator" if omitted.'),
        })
        .strict(),
    },
    withAuditLog('start_session', async ({ workflow_id, planning_folder, agent_id }) => {
      const DEFAULT_WORKFLOW_ID = 'meta';

      // start_session is top-level only — it either opens an existing
      // workspace top-level folder (and resumes the session inside it) or
      // creates a fresh meta-bootstrap session under os.tmpdir() registered
      // to the slug. Child workflows are dispatched by calling dispatch_child
      // against the returned session_index.
      //
      // `planning_folder` is treated as a HINT supplied by the agent. The
      // server only consumes its basename as the slug; the rest of the path
      // is ignored. This means a stale or off-workspace path passed by the
      // agent is harmless — the server always resolves the slug against its
      // own workspace planning root, and the agent never has to reconcile
      // paths. The canonical server-side path is recorded into session.json
      // (and returned in the response), so the agent can pick up the
      // current location on resume without doing any path math.
      let planning_slug: string | undefined;
      if (planning_folder !== undefined) {
        if (!isAbsolute(planning_folder)) {
          throw new Error(
            `start_session: when supplied, planning_folder must be an absolute path, got '${planning_folder}'. ` +
            `Bare slugs and relative paths are rejected. Omit planning_folder entirely for the meta bootstrap (slug not yet known).`,
          );
        }
        planning_slug = basename(resolve(planning_folder));
      }

      const slugIsSynthetic = planning_slug === undefined;
      const slug = planning_slug ?? `transition-${randomUUID()}`;
      const effectiveWfId = workflow_id ?? DEFAULT_WORKFLOW_ID;
      const wouldBeTransient = effectiveWfId === DEFAULT_WORKFLOW_ID;

      // Folder resolution is slug-based regardless of whether planning_folder
      // was supplied or not — the path's basename is the only part we use.
      //   1. Existing folder under the workspace planning root → resume.
      //   2. No existing folder + meta workflow → transient tmp bootstrap.
      //   3. No existing folder + non-meta workflow → fresh workspace folder.
      let folder: string;
      let isTransientSession: boolean;
      const slugCandidate = await findPlanningFolderBySlug(config.workspaceDir, slug);
      isTransientSession = !slugCandidate && wouldBeTransient;
      if (slugCandidate) {
        folder = slugCandidate;
      } else if (isTransientSession) {
        const existing = lookupTransientBySlug(slug);
        folder = existing ?? await createTransientFolder();
      } else {
        folder = await ensurePlanningFolder(config.workspaceDir, slug);
      }

      // Detect-and-migrate legacy session-state in the folder before anything
      // else. Idempotent: short-circuits when `session.json` is already
      // present. On a successful migration the legacy `workflow-state.json`
      // is deleted and the new seal replaces the legacy `.session-token`.
      let migrationResult;
      try {
        migrationResult = await migratePlanningFolder(folder);
      } catch (err) {
        if (err instanceof MigrationError) {
          throw new Error(describeMigrationError(err));
        }
        throw err;
      }

      // The effective workflow_id resolves in this order:
      //   1. If session.json exists (either pre-existing or just migrated),
      //      the workflow_id stored in state wins (caller cannot rebrand a
      //      live session).
      //   2. Otherwise, fall back to the caller-supplied workflow_id, then
      //      to the default "meta".
      let effectiveWorkflowId = workflow_id ?? DEFAULT_WORKFLOW_ID;
      if (migrationResult.migrated && migrationResult.state) {
        effectiveWorkflowId = migrationResult.state.workflowId;
      } else if (await sessionFileExists(folder)) {
        try {
          const { state: rawState } = await verifySeal(folder);
          const peek = safeValidateSessionFile(rawState);
          if (peek.success) effectiveWorkflowId = peek.data.workflowId;
        } catch {
          // Best-effort peek; the canonical load + parse happens below.
        }
      }

      // Load the workflow to capture version (carried into session.json#workflowVersion).
      const wfPreLoad = await loadWorkflow(config.workflowDir, effectiveWorkflowId);
      const effectiveWorkflowVersion = wfPreLoad.success ? (wfPreLoad.value.version ?? '') : '';

      // session_index resolution differs by branch:
      //   - On RESUME, the stored sessionIndex in session.json wins.
      //   - On FRESH creation, derive the index from the new folder's
      //     realpath, persist it via createInitialSessionFile, and return.
      let sessionIndex: string;
      let state: SessionFile;
      // Canonical absolute path of the folder we resolved to — recorded in
      // session.json so the agent can read it back and the server can detect
      // drift on resume. Skipped for transient (tmp) sessions.
      const canonicalFolder = isTransientSession ? undefined : resolve(folder);
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
        sessionIndex = state.sessionIndex;
        // Silently re-stamp planningFolderPath if it is missing or stale (the
        // folder was moved/renamed within the planning root since the last
        // recorded value), and update agentId if it differs. One persist if
        // either changed.
        const pathDrift = canonicalFolder !== undefined && state.planningFolderPath !== canonicalFolder;
        const agentDrift = state.agentId !== agent_id;
        if (pathDrift || agentDrift) {
          state = {
            ...state,
            ...(agentDrift ? { agentId: agent_id } : {}),
            ...(pathDrift ? { planningFolderPath: canonicalFolder } : {}),
          };
          await writeSessionFile(folder, state);
        }
      } else {
        // Fresh top-level session — no parent. Children are dispatched via
        // dispatch_child after start_session returns the index.
        sessionIndex = await computeSessionIndex(folder);
        const newState = createInitialSessionFile({
          sessionIndex,
          workflowId: effectiveWorkflowId,
          workflowVersion: effectiveWorkflowVersion,
          agentId: agent_id,
          ...(canonicalFolder ? { planningFolderPath: canonicalFolder } : {}),
        });
        state = newState;
        await writeSessionFile(folder, state);

        // If this is a transient session, register so its session_index
        // resolves back to the os.tmpdir() folder. Done AFTER writeSessionFile
        // so the registry only points at fully-sealed folders. The slug is
        // registered only when the caller actually supplied one — synthetic
        // `transition-<uuid>` slugs are minted per-call from a fresh UUID, so
        // a slug-keyed entry for them would never be hit by a future lookup,
        // and leaving it out lets `lookupTransientSlugByFolder` return
        // undefined for the synthetic case (which dispatch_child relies on to
        // fall through to the dated workflow-id folder name).
        if (isTransientSession) {
          registerTransient(sessionIndex, folder, slugIsSynthetic ? undefined : slug);
        }
      }

      // Depth of the recursive parent chain rooted at the new/resumed
      // session. Past PARENT_CHAIN_DEPTH_WARN_THRESHOLD we surface a soft
      // validation warning and stamp the depth onto the trace event. There
      // is no hard ceiling — pathological depth is loud, not fatal.
      const depth = parentChainDepth(state);
      const depthWarning =
        depth > PARENT_CHAIN_DEPTH_WARN_THRESHOLD
          ? `Parent chain depth ${depth} exceeds soft threshold of ${PARENT_CHAIN_DEPTH_WARN_THRESHOLD}. Typical dispatch is 2-3 levels deep; verify the nested-workflow topology is intentional.`
          : null;

      if (config.traceStore) {
        config.traceStore.initSession(state.sessionIndex);
        const traceOpts: { psid?: string; pdepth?: number } = {};
        if (state.parentSession) traceOpts.psid = state.parentSession.sessionIndex;
        if (depth > 0) traceOpts.pdepth = depth;
        const event = createTraceEvent(
          state.sessionIndex, 'start_session', 0, 'ok',
          effectiveWorkflowId, state.currentActivity, agent_id,
          Object.keys(traceOpts).length > 0 ? traceOpts : undefined,
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
      if (state.planningFolderPath) response['planning_folder_path'] = state.planningFolderPath;
      if (migrationResult.migrated) {
        response['migrated'] = true;
      }

      return {
        content: [{ type: 'text' as const, text: JSON.stringify(response, null, 2) }],
        _meta: { session_index: sessionIndex, validation: buildValidation(depthWarning) },
      };
    })
  );

  server.registerTool(
    'dispatch_child',
    {
      description:
        'Dispatch a child workflow from the current session. Pass `session_index` of the parent (any depth) and `workflow_id` of the child workflow. ' +
        'The server appends a child entry under the parent\'s `triggeredWorkflows[]` with the child\'s full SessionFile embedded inline (the entire work-package tree lives in the top-level session.json). ' +
        'Returns the child\'s `session_index`, which the agent threads to subsequent authenticated tool calls operating on the child. ' +
        'Special case: when the parent is a transient orchestrator-bootstrap session (e.g. meta), the parent\'s state is promoted onto disk under a stable workspace planning folder before the child is embedded. The slug is taken from (in order): the optional `planning_slug` argument; the slug registered at start_session; a `YYYY-MM-DD-<workflow-id>` fallback. The parent\'s tmp folder is discarded post-promotion, but the parent\'s session_index is retained — the orchestrator can keep using its original index to authenticate subsequent calls (it resolves to the promoted folder for the lifetime of this server process). The on-disk shape matches the persistent-parent case — parent at the top of the file, child under `triggeredWorkflows[0].state`.',
      inputSchema: z.object({
        ...sessionIndexParam,
        workflow_id: z.string().describe('Workflow id for the child (e.g. "work-package"). Must resolve to a workflow definition in the workflows directory.'),
        agent_id: z.string().default('worker').describe('agent_id stored on the child SessionFile. Defaults to "worker".'),
        planning_slug: z.string().optional().describe('Optional. When the parent is a transient orchestrator-bootstrap session, the slug used for the promoted workspace folder. Takes precedence over any slug registered at start_session. Ignored when the parent is already persistent (the persistent parent owns the slug).'),
      }).strict(),
    },
    withAuditLog('dispatch_child', withSessionStoreErrors(async ({ session_index, workflow_id, agent_id, planning_slug }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const parentFolder = loaded.folderAbsPath;
      const parentIsTransient = isTransientFolder(parentFolder);

      // Resolve workflow version up-front (carried onto the child SessionFile).
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;
      const effectiveWorkflowVersion = wfResult.value.version ?? '';

      const triggeredAt = new Date().toISOString();

      if (parentIsTransient) {
        // Transient parent (meta-bootstrap) — promote the parent's state onto
        // disk under a stable workspace planning folder, then embed the child
        // under triggeredWorkflows[0].state exactly like the persistent-parent
        // branch below. The only differences from that branch are:
        //   - the workspace folder is materialised here (the parent never had
        //     one), and
        //   - the original tmp folder is discarded once the new file is durable
        //     (but the parent's session_index entry in transientFolderByIndex
        //     is repointed at the promoted folder so the caller's original
        //     index keeps resolving — without this, the orchestrator that
        //     called dispatch_child can no longer authenticate next_activity
        //     for subsequent meta activities).
        // The promoted slug is taken from (in order): the explicit
        // `planning_slug` argument (callers that derive a descriptive
        // initiative slug AFTER start_session pass it here); the slug the
        // caller supplied to start_session (looked up via the folder-keyed
        // registry); a `YYYY-MM-DD-<workflow_id>` fallback. start_session
        // does not register synthetic `transition-<uuid>` slugs in the
        // folder registry, so the fallback fires for the common case of
        // bootstrap-only meta sessions and produces a stable dated folder
        // name instead of leaking the transitional UUID into the workspace.
        const promotedSlug =
          planning_slug
          ?? lookupTransientSlugByFolder(parentFolder)
          ?? `${new Date().toISOString().slice(0, 10)}-${workflow_id}`;
        const promotedWorkspaceFolder = await ensurePlanningFolder(config.workspaceDir, promotedSlug);
        const childSessionIndex = await computeEmbeddedSessionIndex(
          promotedWorkspaceFolder,
          ['triggeredWorkflows', 0, 'state'],
        );
        const childInitial = createInitialSessionFile({
          sessionIndex: childSessionIndex,
          workflowId: workflow_id,
          workflowVersion: effectiveWorkflowVersion,
          agentId: agent_id,
        });
        const parentNext = advanceSession(loaded.state, (draft) => {
          draft.triggeredWorkflows.push({
            workflowId: workflow_id,
            sessionIndex: childSessionIndex,
            triggeredAt,
            triggeredFrom: { activityId: draft.currentActivity || '' },
            status: 'running',
            state: childInitial,
          });
          draft.history.push({
            timestamp: triggeredAt,
            type: 'workflow_triggered',
            activity: draft.currentActivity || undefined,
            data: { workflowId: workflow_id, sessionIndex: childSessionIndex },
          });
        });
        await writeSessionFile(promotedWorkspaceFolder, parentNext);
        // The promoted file is durable; redirect the caller's transient
        // index to it and remove the tmp folder.
        await redirectTransientToWorkspace(parentFolder, promotedWorkspaceFolder);
        return {
          content: [{ type: 'text' as const, text: JSON.stringify({ session_index: childSessionIndex, workflow: { id: wfResult.value.id, version: wfResult.value.version }, planning_slug: promotedSlug }, null, 2) }],
          _meta: { session_index: childSessionIndex, validation: buildValidation(null) },
        };
      }

      // Persistent parent — embed the child inline under
      // triggeredWorkflows[N].state. The child's sessionIndex is derived
      // from the top folder + jsonPath so it stays stable as long as the
      // array index doesn't shift (triggeredWorkflows is append-only).
      const newArrayIndex = loaded.state.triggeredWorkflows.length;
      const childJsonPath = [...loaded.jsonPath, 'triggeredWorkflows', newArrayIndex, 'state'];
      const childSessionIndex = await computeEmbeddedSessionIndex(parentFolder, childJsonPath);
      const childInitial = createInitialSessionFile({
        sessionIndex: childSessionIndex,
        workflowId: workflow_id,
        workflowVersion: effectiveWorkflowVersion,
        agentId: agent_id,
      });
      const parentNext = advanceSession(loaded.state, (draft) => {
        draft.triggeredWorkflows.push({
          workflowId: workflow_id,
          sessionIndex: childSessionIndex,
          triggeredAt,
          triggeredFrom: { activityId: draft.currentActivity || '' },
          status: 'running',
          state: childInitial,
        });
        draft.history.push({
          timestamp: triggeredAt,
          type: 'workflow_triggered',
          activity: draft.currentActivity || undefined,
          data: { workflowId: workflow_id, sessionIndex: childSessionIndex },
        });
      });
      await saveSessionForTool(loaded, parentNext);
      return {
        content: [{ type: 'text' as const, text: JSON.stringify({ session_index: childSessionIndex, workflow: { id: wfResult.value.id, version: wfResult.value.version } }, null, 2) }],
        _meta: { session_index: childSessionIndex, validation: buildValidation(null) },
      };
    }), traceOpts)
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
      await saveSessionForTool(loaded, next);

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
      await saveSessionForTool(loaded, next);

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
      await saveSessionForTool(loaded, next);

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
