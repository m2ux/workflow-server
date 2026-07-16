import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import type { ServerConfig } from '../config.js';
import { withAuditLog } from '../logging.js';

import { loadWorkflow, loadWorkflowWithDiagnostics, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { composeActivityTechnique, projectTechnique } from '../loaders/technique-loader.js';
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
  findPlanningFolderBySlug,
  sessionFileExists,
  writeSessionFile,
  verifySeal,
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
import { techniqueName, flattenActivitySteps, type Step } from '../schema/activity.schema.js';
import { buildProvenanceContext, decorateTechniqueProvenance } from '../utils/binding-provenance.js';
import { seedDefaults } from '../utils/variable-seed.js';
import { buildValidation, validateWorkflowVersion } from '../utils/validation.js';
import { stringifyForResponse } from '../utils/serialization.js';
import { contentHash, deliveredHash, dedupTechniqueBlocks, recordDeliveries, unchangedMarker } from '../utils/delivery.js';
import { createTraceEvent } from '../trace.js';
import { randomUUID } from 'node:crypto';
import { basename, isAbsolute, resolve } from 'node:path';
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
export function extractMarkdownSection(content: string, anchor: string): string | null {
  const slugify = (heading: string): string =>
    heading.trim().toLowerCase().replace(/[^\w\s-]/g, '').replace(/\s+/g, '-');
  const lines = content.split(/\r?\n/);
  const isFence = (l: string): boolean => /^\s*(```|~~~)/.test(l);

  // Headings inside fenced code blocks (e.g. a ```markdown template skeleton) are content, not
  // section boundaries — track fence state so they neither match the anchor nor terminate the section.
  let startIdx = -1;
  let startLevel = 0;
  let inFence = false;
  for (let i = 0; i < lines.length; i++) {
    if (isFence(lines[i]!)) { inFence = !inFence; continue; }
    if (inFence) continue;
    const m = lines[i]!.match(/^(#{1,6})\s+(.+?)\s*$/);
    if (m && slugify(m[2]!) === anchor) {
      startIdx = i;
      startLevel = m[1]!.length;
      break;
    }
  }
  if (startIdx < 0) return null;
  let endIdx = lines.length;
  inFence = false;
  for (let i = startIdx + 1; i < lines.length; i++) {
    if (isFence(lines[i]!)) { inFence = !inFence; continue; }
    if (inFence) continue;
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
        'Start or resume the top-level workflow session. Returns `session_index`, workflow metadata, and canonical `planning_folder_path`. ' +
        'Pass `planning_folder` as an absolute path (basename = slug; resolved against the server planning root). Omit it for a transient meta bootstrap. ' +
        'Children use `dispatch_child`, not this tool. ' +
        '`context_mode: "persistent"` is ONLY for solo (same agent context; no worker spawn); omit/`"fresh"` for disposable workers.',
      inputSchema: z
        .object({
          workflow_id: z.string().optional().describe('Optional. Fresh-session workflow id (default "meta"). Ignored on resume.'),
          planning_folder: z.string().optional().describe('Optional. Absolute path; basename is the planning slug. Bare/relative paths rejected. Omit for transient meta bootstrap.'),
          agent_id: z.string().default('orchestrator').describe('Agent identity stored on the session (default "orchestrator"). Use one canonical id for solo persistent walks.'),
          context_mode: z.enum(['persistent', 'fresh']).optional().describe('Optional. "persistent" = reference delivery; ONLY for solo (same agent retains payloads). Omit/"fresh" for disposable workers. Resume overwrites recorded mode.'),
        })
        .strict(),
    },
    withAuditLog('start_session', async ({ workflow_id, planning_folder, agent_id, context_mode }) => {
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
        // recorded value), update agentId if it differs, and adopt a supplied
        // context_mode. One persist if any changed.
        const pathDrift = canonicalFolder !== undefined && state.planningFolderPath !== canonicalFolder;
        const agentDrift = state.agentId !== agent_id;
        const modeDrift = context_mode !== undefined && state.contextMode !== context_mode;
        if (pathDrift || agentDrift || modeDrift) {
          state = {
            ...state,
            ...(agentDrift ? { agentId: agent_id } : {}),
            ...(pathDrift ? { planningFolderPath: canonicalFolder } : {}),
            ...(modeDrift ? { contextMode: context_mode } : {}),
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
          ...(context_mode ? { contextMode: context_mode } : {}),
          // B7 (#166): seed declared defaults into the fresh bag. Conditional
          // on the pre-load succeeding — its failure is only surfaced further
          // down, and an unseeded bag is the correct shape for that path.
          ...(wfPreLoad.success ? { variables: seedDefaults(wfPreLoad.value.variables) } : {}),
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
      if (state.contextMode) response['context_mode'] = state.contextMode;
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
        'Dispatch a child workflow under the parent session. Returns the child `session_index` and canonical `planning_folder_path`. ' +
        'Transient meta parents are promoted to a workspace planning folder first (optional `planning_slug`). ' +
        'Never set `context_mode: "persistent"` on disposable-worker children — workers need fresh/full delivery.',
      inputSchema: z.object({
        ...sessionIndexParam,
        workflow_id: z.string().describe('Child workflow id (e.g. "work-package").'),
        agent_id: z.string().default('worker').describe('Child agent_id (default "worker").'),
        planning_slug: z.string().optional().describe('Optional. Promotion slug when the parent is a transient meta bootstrap. Ignored if the parent is already persistent.'),
        context_mode: z.enum(['persistent', 'fresh']).optional().describe('Optional. Child delivery mode. "persistent" ONLY for solo child walks; omit/"fresh" for disposable workers.'),
      }).strict(),
    },
    withAuditLog('dispatch_child', withSessionStoreErrors(async ({ session_index, workflow_id, agent_id, planning_slug, context_mode }) => {
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
          ...(context_mode ? { contextMode: context_mode } : {}),
          variables: seedDefaults(wfResult.value.variables),
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
          content: [{ type: 'text' as const, text: JSON.stringify({ session_index: childSessionIndex, workflow: { id: wfResult.value.id, version: wfResult.value.version }, planning_slug: promotedSlug, planning_folder_path: promotedWorkspaceFolder }, null, 2) }],
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
        ...(context_mode ? { contextMode: context_mode } : {}),
        variables: seedDefaults(wfResult.value.variables),
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
        content: [{ type: 'text' as const, text: JSON.stringify({ session_index: childSessionIndex, workflow: { id: wfResult.value.id, version: wfResult.value.version }, planning_folder_path: parentFolder }, null, 2) }],
        _meta: { session_index: childSessionIndex, validation: buildValidation(null) },
      };
    }), traceOpts)
  );

  // ============== Technique Tool ==============

  server.tool(
    'get_technique',
    'Load one fully composed technique (step-bound when `step_id` is set; otherwise the activity\'s or workflow\'s first). ' +
    'Under `context_mode: "persistent"`, a byte-identical refetch may return an unchanged-reference; pass `full: true` when earlier content was summarized away. ' +
    'Workers in fresh contexts must not rely on reference collapse — use full delivery.',
    {
      ...sessionIndexParam,
      step_id: z.string().optional().describe('Optional. Step id whose bound technique to load; omit for the activity/workflow first technique.'),
      full: z.boolean().optional().describe('Optional. Force full content when persistent mode would return an unchanged-reference (e.g. after summarization).'),
    },
    withAuditLog('get_technique', withSessionStoreErrors(async ({ session_index, step_id, full }) => {
      const loaded = await loadSessionForTool(config.workspaceDir, session_index);
      const { state } = loaded;
      const workflow_id = state.workflowId;

      assertNoActiveCheckpoint(state);

      const wfDiag = await loadWorkflowWithDiagnostics(config.workflowDir, workflow_id);
      if (!wfDiag.success) throw wfDiag.error;
      const wfResult = { success: true as const, value: wfDiag.value.workflow };
      // A borrowed activity's technique refs resolve against the workflow the activity file was
      // authored in (mirroring #166 B10 fragment scoping), not the borrowing session's workflow.
      const techniqueScopeWorkflowId = (state.currentActivity
        && wfDiag.value.activitySourceWorkflow.get(state.currentActivity)) || workflow_id;

      let techniqueId: string | undefined;
      let boundStep: Step | undefined;

      if (!state.currentActivity) {
        if (step_id) {
          throw new Error('Cannot provide step_id when no activity is active. Call next_activity first.');
        }
        techniqueId = (wfResult.value as { techniques?: { workflow?: string[] } }).techniques?.workflow?.[0];
        if (!techniqueId) {
          throw new Error(`Workflow '${workflow_id}' does not declare any workflow-level techniques.`);
        }
      } else {
        const activity = getActivity(wfResult.value, state.currentActivity);
        if (!activity) {
          throw new Error(`Activity '${state.currentActivity}' not found in workflow '${workflow_id}'.`);
        }

        if (!step_id) {
          techniqueId = activity.techniques?.[0];
          if (!techniqueId) {
            throw new Error(`Activity '${state.currentActivity}' does not declare any activity-level techniques.`);
          }
        } else {
          const allSteps = flattenActivitySteps(activity);
          const step = allSteps.find(s => s.id === step_id);
          if (step) {
            boundStep = step;
            techniqueId = step.kind === 'technique' ? techniqueName(step.technique) : undefined;
          }

          if (!step && !techniqueId) {
            const allStepIds = allSteps.map(s => s.id).filter((id): id is string => id !== undefined);
            throw new Error(`Step '${step_id}' not found in activity '${state.currentActivity}'. Available steps: [${allStepIds.join(', ')}]`);
          }

          if (!techniqueId) {
            throw new Error(`Step '${step_id}' in activity '${state.currentActivity}' has no associated technique.`);
          }
        }
      }

      // Activity-group convention (see composeActivityTechnique): a bare op id resolves first
      // against the group named after the current activity, falling back to as-authored — both
      // within the activity's source-workflow scope.
      const composed = await composeActivityTechnique(
        techniqueId, config.workflowDir, techniqueScopeWorkflowId, state.currentActivity || undefined,
      );
      if (!composed.success) throw composed.error;
      techniqueId = composed.value.techniqueId;

      // Binding-seam provenance (#166 B3): a step-bound fetch annotates its own inputs (and the
      // noteworthy inherited ones) with their resolution under the name-match convention, and
      // each remapped output with its landing name; UNRESOLVED own inputs surface as warn-only
      // validation entries. Classification is static — declarations and document order — so the
      // annotated payload is deterministic per (corpus, step) and byte-identical refetches keep
      // collapsing under reference delivery.
      let technique = composed.value.technique;
      const provenanceWarnings: string[] = [];
      if (boundStep?.id && state.currentActivity) {
        const ctx = await buildProvenanceContext({
          workflow: wfResult.value,
          workflowDir: config.workflowDir,
          currentActivityId: state.currentActivity,
          currentStepId: boundStep.id,
          activitySourceWorkflow: wfDiag.value.activitySourceWorkflow,
        });
        if (ctx) {
          const binding = boundStep.kind === 'technique' && typeof boundStep.technique === 'object'
            ? boundStep.technique
            : undefined;
          const decorated = decorateTechniqueProvenance(technique, ctx, binding, techniqueId as string, boundStep.id);
          technique = decorated.technique;
          provenanceWarnings.push(...decorated.warnings);
        }
      }
      // Hash the whole technique over the pre-marker projected text so the whole-marker
      // branch below still collapses an identical refetch; block dedup runs later.
      const ordered = projectTechnique(technique);
      const text = stringifyForResponse(ordered);

      const view = sessionView(state);
      const validation = buildValidation(
        validateWorkflowVersion(view, wfResult.value),
        ...provenanceWarnings,
      );

      // Fidelity observability (#166 B8): every technique fetch is recorded in
      // the session history, keyed by resolved technique id, bound step (when
      // step_id was supplied) and the session's agentId. next_activity's
      // manifest validation reads these events to warn (advisory) when a
      // manifested technique step had no fetch during the activity. Recorded
      // on both delivery paths — an unchanged-reference answer is still a
      // fetch.
      const recordFetch = (draft: SessionFile): void => {
        draft.history.push({
          timestamp: new Date().toISOString(),
          type: 'technique_fetched',
          ...(state.currentActivity ? { activity: state.currentActivity } : {}),
          data: {
            techniqueId: techniqueId as string,
            ...(boundStep?.id ? { stepId: boundStep.id } : {}),
            agentId: state.agentId,
          },
        });
      };

      // Delta delivery for persistent-context sessions: a refetch whose composed
      // content is byte-identical to what this session+agent already received
      // returns a short unchanged-reference instead of the full payload. The
      // ledger is keyed per agent and per technique id; `full: true` is the
      // escape for a context that no longer holds the earlier delivery.
      const ledgerKey = `technique:${techniqueId}`;
      const hash = contentHash(text);
      if (state.contextMode === 'persistent' && full !== true && deliveredHash(state, ledgerKey) === hash) {
        const next = advanceSession(state, (draft) => {
          draft.currentTechnique = techniqueId as string;
          recordFetch(draft);
        });
        await saveSessionForTool(loaded, next);

        // Canonical unchanged-marker: { delivery: 'unchanged', content_hash } —
        // the same shape the get_activity bundle path emits (delivery.ts#unchangedMarker).
        // The technique id and note ride alongside as sibling context.
        const stub = stringifyForResponse({
          id: techniqueId,
          ...unchangedMarker(hash),
          note: 'Byte-identical to the composed technique already delivered in this session — reuse it from your context. Pass full: true to re-fetch the full content.',
        });
        return {
          content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${stub}` }],
          _meta: { session_index, validation, delivery: 'unchanged' },
        };
      }

      // Full-delivery branch. Under reference delivery, collapse any shared contract/rules
      // block already delivered by a sibling technique to a marker while the core stays full;
      // block hashes are recorded alongside the whole-technique key.
      let body = text;
      const blockDeliveries: Record<string, string> = {};
      if (state.contextMode === 'persistent' && full !== true) {
        const deduped = dedupTechniqueBlocks(ordered, state, blockDeliveries);
        body = stringifyForResponse(deduped);
      }
      const next = advanceSession(state, (draft) => {
        draft.currentTechnique = techniqueId as string;
        recordDeliveries(draft, state.agentId, { [ledgerKey]: hash, ...blockDeliveries });
        recordFetch(draft);
      });
      await saveSessionForTool(loaded, next);

      return {
        content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${body}` }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

  server.tool(
    'get_resource',
    'Load a resource by id (optional `#section`). Bare slug = session workflow; `workflow/slug` = cross-workflow. ' +
    'Under `context_mode: "persistent"`, a byte-identical refetch may return an unchanged-reference; pass `full: true` when content was summarized away. ' +
    'Never use persistent/`bundle: "reference"` assumptions on disposable workers — they need fresh/full delivery.',
    {
      ...sessionIndexParam,
      resource_id: z.string().describe('Resource ref: bare slug, `workflow/slug`, optional `#section` anchor.'),
      full: z.boolean().optional().describe('Optional. Force full content when persistent mode would return an unchanged-reference (e.g. after summarization).'),
    },
    withAuditLog('get_resource', withSessionStoreErrors(async ({ session_index, resource_id, full }) => {
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

      // Fidelity observability (#166 B8): resource fetches are recorded in the
      // session history for observability only — the server cannot know which
      // resources an activity requires, so no validation reads these events.
      // Recorded on both delivery paths — an unchanged-reference answer is still a fetch.
      const recordFetch = (draft: SessionFile): void => {
        draft.history.push({
          timestamp: new Date().toISOString(),
          type: 'resource_fetched',
          ...(state.currentActivity ? { activity: state.currentActivity } : {}),
          data: { resourceId: resource_id, agentId: state.agentId },
        });
      };

      const { content: resourceContent, ...meta } = result.value;
      const fullLines = [
        `resource_id: ${resource_id}`,
        ...(meta.id ? [`id: ${meta.id}`] : []),
        ...(meta.version ? [`version: ${meta.version}`] : []),
        `session_index: ${session_index}`,
        '',
        resourceContent,
      ];
      const fullText = fullLines.join('\n');

      // Ledger key is the exact caller resource_id (including any #section) so
      // bare and sectioned fetches never share a slot.
      const ledgerKey = `resource:${resource_id}`;
      const hash = contentHash(fullText);
      if (state.contextMode === 'persistent' && full !== true && deliveredHash(state, ledgerKey) === hash) {
        const next = advanceSession(state, (draft) => {
          recordFetch(draft);
        });
        await saveSessionForTool(loaded, next);

        const stub = stringifyForResponse({
          resource_id,
          ...unchangedMarker(hash),
          note: 'Byte-identical to the resource already delivered in this session — reuse it from your context. Pass full: true to re-fetch the full content.',
        });
        return {
          content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${stub}` }],
          _meta: { session_index, validation, delivery: 'unchanged' },
        };
      }

      const next = advanceSession(state, (draft) => {
        recordDeliveries(draft, state.agentId, { [ledgerKey]: hash });
        recordFetch(draft);
      });
      await saveSessionForTool(loaded, next);

      return {
        content: [{ type: 'text' as const, text: fullText }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

}
