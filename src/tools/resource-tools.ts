import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { resolveOperations, formatOperationsBundle, composeTechnique, projectTechniqueToToon } from '../loaders/technique-loader.js';
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
import { resolve } from 'node:path';
/**
 * Parse a resource reference that may include a workflow prefix.
 * Format: "workflow/id" for cross-workflow, or bare "id" for local.
 * Examples: "meta/bootstrap-protocol" → { workflowId: "meta", id: "bootstrap-protocol" }
 *           "review-mode"             → { workflowId: undefined, id: "review-mode" }
 */
function parseResourceRef(ref: string): { workflowId: string | undefined; id: string; section: string | undefined } {
  // Split off an optional `#section` anchor (e.g. "assumption-reconciliation#log-format").
  let section: string | undefined;
  let base = ref.trim();
  const hashIdx = base.indexOf('#');
  if (hashIdx >= 0) {
    section = base.substring(hashIdx + 1).trim() || undefined;
    base = base.substring(0, hashIdx);
  }
  // Tolerate a trailing `.md` (the projection emits bare ids, but a path-y form may arrive).
  base = base.replace(/\.md$/, '');
  const slashIdx = base.indexOf('/');
  if (slashIdx > 0) {
    return { workflowId: base.substring(0, slashIdx), id: base.substring(slashIdx + 1), section };
  }
  return { workflowId: undefined, id: base, section };
}

/**
 * Extract a single markdown section by its GitHub-style heading anchor: returns the heading line
 * and everything beneath it up to (not including) the next heading of the same or higher level.
 * Returns null when no heading matches the anchor.
 */
function extractMarkdownSection(content: string, anchor: string): string | null {
  const slugify = (heading: string): string =>
    heading.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const lines = content.split(/\r?\n/);
  let startIdx = -1;
  let startLevel = 0;
  for (let i = 0; i < lines.length; i++) {
    const m = lines[i]!.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && slugify(m[2]!) === anchor) {
      startIdx = i;
      startLevel = m[1]!.length;
      break;
    }
  }
  if (startIdx < 0) return null;
  let endIdx = lines.length;
  for (let i = startIdx + 1; i < lines.length; i++) {
    const m = lines[i]!.match(/^(#{1,6})\s+/);
    if (m && m[1]!.length <= startLevel) {
      endIdx = i;
      break;
    }
  }
  return lines.slice(startIdx, endIdx).join('\n').trim();
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
        'Start or resume the TOP-LEVEL workflow session for a `planning_slug` (a single-segment slug for the canonical planning folder under `<workspace>/.engineering/artifacts/planning/<slug>/`). Returns a 6-character base32 `session_index` for the root session, plus basic workflow metadata. ' +
        'Behaviour: if a workspace folder with `session.json` already exists for the slug, the server resumes it (workflow_id taken from state — caller cannot rebrand a live session). Otherwise a fresh meta-bootstrap session is created in `os.tmpdir()` and the slug is registered so subsequent dispatch_child calls can promote it to a workspace folder. ' +
        'Child workflows are not created through start_session — call `dispatch_child({ session_index, workflow_id })` from inside the parent session to append a child under `triggeredWorkflows[]` (embedded inline; the whole work-package tree lives in the top-level session.json). ' +
        'If the resolved folder contains legacy `workflow-state.json` + `.session-token` artefacts, the server migrates them in place. ' +
        'The agent_id parameter is stored on `session.json#agentId`, distinguishing orchestrator from worker calls in the trace.',
      inputSchema: z
        .object({
          workflow_id: z.string().optional().describe('Optional. Target workflow ID for a fresh top-level session (e.g., "work-package"). Defaults to "meta". Ignored when the slug already resolves to an existing `session.json` (the workflow is taken from the resumed state).'),
          planning_slug: z.string().optional().describe('Optional. Single-segment slug for the top-level planning folder. When omitted the server mints a transitional slug derived from a fresh UUID and registers it for the meta bootstrap session.'),
          agent_id: z.string().default('orchestrator').describe('Sets the agentId field inside the session state. Distinguishes agents sharing a session in the trace. Defaults to "orchestrator" if omitted.'),
        })
        .strict(),
    },
    withAuditLog('start_session', async ({ workflow_id, planning_slug, agent_id }) => {
      const DEFAULT_WORKFLOW_ID = 'meta';

      // start_session is top-level only — it either opens an existing
      // workspace top-level folder for `planning_slug` (and resumes the
      // session inside it) or creates a fresh meta-bootstrap session under
      // os.tmpdir() registered to the slug. Child workflows are dispatched
      // by calling dispatch_child against the returned session_index.
      const slugIsSynthetic = planning_slug === undefined;
      const slug = planning_slug ?? `transition-${randomUUID()}`;
      // If a workspace folder already exists for the slug, resume the
      // top-level session there — the workflow_id stored in state wins.
      const workspaceCandidate = await findPlanningFolderBySlug(config.workspaceDir, slug);
      const isTransientSession = !workspaceCandidate && (workflow_id ?? DEFAULT_WORKFLOW_ID) === DEFAULT_WORKFLOW_ID;

      let folder: string;
      if (workspaceCandidate) {
        folder = workspaceCandidate;
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
        // Fresh top-level session — no parent. Children are dispatched via
        // dispatch_child after start_session returns the index.
        const newState = createInitialSessionFile({
          sessionIndex,
          workflowId: effectiveWorkflowId,
          workflowVersion: effectiveWorkflowVersion,
          agentId: agent_id,
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

  // ============== Technique Tool ==============

  server.tool(
    'get_technique',
    'Load a single composed technique within the current workflow or activity. If called before next_activity (no current activity), it loads the workflow primary technique. During an activity, it resolves the technique reference from the activity definition; with step_id, it loads the technique assigned to that step; without step_id, the activity primary technique. The returned technique is fully COMPOSED: it inherits its workflow-root `techniques/TECHNIQUE.md` base contract recursively (inputs/outputs/rules/errors merged, root protocol prepended) — never the meta root for a non-meta workflow. Techniques are loaded one at a time.',
    {
      ...sessionIndexParam,
      step_id: z.string().optional().describe('Optional. Step ID within the current activity (e.g., "define-problem"). If omitted, returns the primary technique for the activity, or the workflow primary technique if no activity is active.'),
    },
    withAuditLog('get_technique', withSessionStoreErrors(async ({ session_index, step_id }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      const workflow_id = state.workflowId;

      assertNoActiveCheckpoint(state);

      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;

      let techniqueId: string | undefined;

      if (!state.currentActivity) {
        if (step_id) {
          throw new Error('Cannot provide step_id when no activity is active. Call next_activity first.');
        }
        techniqueId = wfResult.value.techniques?.primary;
        if (!techniqueId) {
          throw new Error(`Workflow '${workflow_id}' does not define a primary technique.`);
        }
      } else {
        const activity = getActivity(wfResult.value, state.currentActivity);
        if (!activity) {
          throw new Error(`Activity '${state.currentActivity}' not found in workflow '${workflow_id}'.`);
        }

        if (!step_id) {
          techniqueId = activity.techniques?.primary;
          if (!techniqueId) {
            throw new Error(`Activity '${state.currentActivity}' does not define a primary technique.`);
          }
        } else {
          const step = activity.steps?.find(s => s.id === step_id);
          if (step) {
            techniqueId = step.technique;
          } else if (activity.loops) {
            for (const loop of activity.loops) {
              const loopStep = loop.steps?.find(s => s.id === step_id);
              if (loopStep) {
                techniqueId = loopStep.technique;
                break;
              }
            }
          }

          if (!step && !techniqueId) {
            const allStepIds = [
              ...(activity.steps?.map(s => s.id) ?? []),
              ...(activity.loops?.flatMap(l => l.steps?.map(s => s.id) ?? []) ?? []),
            ];
            throw new Error(`Step '${step_id}' not found in activity '${state.currentActivity}'. Available steps: [${allStepIds.join(', ')}]`);
          }

          if (!techniqueId) {
            throw new Error(`Step '${step_id}' in activity '${state.currentActivity}' has no associated technique.`);
          }
        }
      }

      const composed = await composeTechnique(techniqueId, config.workflowDir, workflow_id);
      if (!composed.success) throw composed.error;
      const text = projectTechniqueToToon(composed.value);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wfResult.value),
      );

      const next = advanceSession(state, (draft) => {
        draft.currentTechnique = techniqueId as string;
      });
      await saveSessionForTool(loaded, next);

      return {
        content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${text}` }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

  server.tool(
    'get_resource',
    'Load a resource by its id, optionally narrowed to a single section. Use this to fetch resources referenced in technique content (e.g. a template hyperlinked from an Input/Output). The resource_id is a text-only slug — bare (e.g., "review-mode") resolves within the session\'s workflow, or prefixed cross-workflow (e.g., "meta/bootstrap-protocol") resolves from the named workflow. Append a `#section` anchor (GitHub-style heading slug, e.g. "assumption-reconciliation#integration-with-assumptions-log") to return only that section and its body — used to fetch just the template a technique references without the whole file. Returns the resource content, id, and version.',
    {
      ...sessionIndexParam,
      resource_id: z.string().describe('Resource ref — bare slug ("review-mode"), cross-workflow prefixed ("meta/bootstrap-protocol"), each optionally suffixed with a "#section" heading anchor to return only that section (e.g. "assumption-reconciliation#integration-with-assumptions-log")'),
    },
    withAuditLog('get_resource', withSessionStoreErrors(async ({ session_index, resource_id }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;

      const parsed = parseResourceRef(resource_id);
      const targetWorkflow = parsed.workflowId ?? workflow_id;
      const result = await readResourceStructured(config.workflowDir, targetWorkflow, parsed.id);
      if (!result.success) throw result.error;

      // When a `#section` anchor is supplied, return only that section to minimise context.
      if (parsed.section) {
        const sectionText = extractMarkdownSection(result.value.content, parsed.section);
        if (sectionText === null) {
          throw new Error(`Section '#${parsed.section}' not found in resource '${parsed.id}'.`);
        }
        result.value.content = sectionText;
      }

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
    'Resolve a flat list of technique::element references to their bodies. Each ref is in technique-id::element-name form (e.g., "agent-conduct::file-sensitivity", "workflow-orchestrator::evaluate-transition"). Optionally workflow-prefixed: "meta/agent-conduct::file-sensitivity". Returns a bundle grouped by kind: `operations` and `errors` are objects keyed by `<technique-id>::<name>` → body; `rules` is a flat array of [rule-name, rule-line] tuples (one tuple per line, with global rules from any touched technique auto-included); `unresolved` lists refs that did not resolve. Empty groups are omitted. No session_index required — this is a structural lookup.',
    {
      operations: z.array(z.string()).min(1).describe('List of technique::element references to resolve. Each entry is "technique-id::element-name" or "workflow/technique-id::element-name".'),
    },
    withAuditLog('resolve_operations', async ({ operations }) => {
      const resolved = await resolveOperations(operations, config.workflowDir);
      return {
        content: [{ type: 'text' as const, text: encodeToon(formatOperationsBundle(resolved)) }],
      };
    })
  );

}
