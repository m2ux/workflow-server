import { z } from 'zod';
import type { McpServer } from '@modelcontextprotocol/sdk/server/mcp.js';
import { normalizeRepoPath, presentPathToAgent, type ServerConfig } from '../config.js';
import { withAuditLog, logInfo } from '../logging.js';

import { loadWorkflow, loadWorkflowWithDiagnostics, getActivity } from '../loaders/workflow-loader.js';
import { readResourceStructured } from '../loaders/resource-loader.js';
import { composeActivityTechnique, projectTechnique } from '../loaders/technique-loader.js';
import {
  sessionIndexParam,
  agentIdParam,
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
  buildSessionScope,
  resolveSessionRoot,
  listSessionSearchRoots,
} from '../utils/session/index.js';
import {
  createInitialSessionFile,
  bindSessionRepo,
  safeValidateSessionFile,
  parentChainDepth,
  PARENT_CHAIN_DEPTH_WARN_THRESHOLD,
  type SessionFile,
} from '../schema/session.schema.js';
import { techniqueName, flattenActivitySteps, type Step } from '../schema/activity.schema.js';
import { buildProducerIndex, provenanceContextFor, decorateTechniqueProvenance } from '../utils/binding-provenance.js';
import { seedDefaults } from '../utils/variable-seed.js';
import { buildValidation, validateWorkflowVersion } from '../utils/validation.js';
import { stringifyForResponse } from '../utils/serialization.js';
import { contentHash, deliveredHash, dedupTechniqueBlocks, deliveryScope, recordDeliveries, unchangedMarker } from '../utils/delivery.js';
import { hasDispatch, recordDispatch } from '../utils/dispatch.js';
import { extractMarkdownSection, parseResourceRef } from '../utils/resource-ref.js';
import { appendStepStartedIfAbsent } from '../utils/step-events.js';
import { createTraceEvent } from '../trace.js';
import { randomUUID } from 'node:crypto';
import { basename, isAbsolute, resolve } from 'node:path';

/** Re-export for callers/tests that imported section extraction from this module. */
export { extractMarkdownSection } from '../utils/resource-ref.js';

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
  // Process-level engineering root (may be install multi-root). Per-session
  // owner/repo is resolved at start_session via the `repo` hint.
  const sessionScope = buildSessionScope(config);
  const planningRootDir = sessionScope.engineeringDir;
  /** Agent-facing path: rewrite container paths via host mount map when set. */
  const presentPlanningPath = (serverPath: string | undefined): string | undefined =>
    presentPathToAgent(serverPath, config.pathPresentation);

  async function sessionLoadOpts() {
    const searchRoots = await listSessionSearchRoots(sessionScope);
    return {
      planningRelativeDir: sessionScope.planningRelativeDir,
      searchRoots,
    };
  }

  // ============== Session Tools ==============

  server.registerTool(
    'start_session',
    {
      description:
        'Start or resume the top-level workflow session. Returns `session_index`, workflow metadata, and canonical `planning_folder_path`. ' +
        'Pass `planning_folder` as an absolute path (basename = slug). ' +
        'Always pass `repo` as owner/repo, derived from git via `version-control::resolve-host-repo` (origin remote of the outermost claiming superproject); the user or workspace AGENTS.md is a fallback only when the workspace is not a git repo or has no origin remote. Stored on session.json#repo. ' +
        'Omit planning_folder for a transient meta bootstrap. Children use `dispatch_child`, not this tool. ' +
        '`context_mode: "persistent"` is ONLY for solo (same agent context; no worker spawn); omit/`"fresh"` for worker-dispatched walks.',
      inputSchema: z
        .object({
          workflow_id: z.string().optional().describe('Optional. Fresh-session workflow id (default "meta"). Ignored on resume.'),
          planning_folder: z.string().optional().describe('Optional. Absolute path; basename is the planning slug. Bare/relative paths rejected. Omit for transient meta bootstrap.'),
          repo: z.string().optional().describe('Target owner/repo (or github URL). Always pass when known; written to session.json#repo. Also accepted from planning_folder under …/<owner>/<repo>/….'),
          user_request: z.string().optional().describe('The user\'s free-form request that opened this session. Seeded into the variable bag as `user_request`, so techniques that match or classify the request read it as state instead of needing it inlined into a spawn prompt. Children inherit it via dispatch_child.'),
          agent_id: z.string().default('orchestrator').describe('Agent identity stored on the session (default "orchestrator"). Use one canonical id for solo persistent walks.'),
          context_mode: z.enum(['persistent', 'fresh']).optional().describe('Optional. "persistent" = reference delivery; ONLY for solo (same agent retains payloads). Omit/"fresh" for disposable workers. Resume overwrites recorded mode.'),
        })
        .strict(),
    },
    withAuditLog('start_session', async ({ workflow_id, planning_folder, repo, agent_id, context_mode, user_request }) => {
      const DEFAULT_WORKFLOW_ID = 'meta';

      // start_session is top-level only — it either opens an existing
      // workspace top-level folder (and resumes the session inside it) or
      // creates a fresh meta-bootstrap session under os.tmpdir() registered
      // to the slug. Child workflows are dispatched by calling dispatch_child
      // against the returned session_index.
      //
      // `planning_folder` is treated as a HINT supplied by the agent. The
      // server consumes its basename as the slug. When the path sits under the
      // projects multi-root as …/<repo>/.engineering/… (canonical basename) or
      // legacy …/<owner>/<repo>/.engineering/…, that identity is also taken as
      // a repo hint (unless `repo` is passed explicitly). Off-workspace paths
      // still work as slug-only hints.
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

      // Search all known repo checkouts (multi-root) or the single eng root.
      const searchRoots = await listSessionSearchRoots(sessionScope);
      const slugCandidate = await findPlanningFolderBySlug(planningRootDir, slug, {
        planningRelativeDir: sessionScope.planningRelativeDir,
        searchRoots,
      });

      let folder: string;
      let isTransientSession: boolean;
      let sessionRoot: { engineeringDir: string; planningRelativeDir: string; repo?: string };

      isTransientSession = !slugCandidate && wouldBeTransient;
      if (slugCandidate) {
        folder = slugCandidate;
        // Resume: derive engineering dir from the found folder when multi-root.
        if (sessionScope.mode === 'multi' && sessionScope.engineeringMultiRoot) {
          sessionRoot = resolveSessionRoot(sessionScope, {
            repo,
            planningFolder: slugCandidate,
          });
        } else {
          sessionRoot = resolveSessionRoot(sessionScope, {
            repo,
            planningFolder: planning_folder,
          });
        }
      } else if (isTransientSession) {
        // Transient meta bootstrap needs no durable repo root.
        try {
          sessionRoot = resolveSessionRoot(sessionScope, {
            repo,
            planningFolder: planning_folder,
          });
        } catch {
          // Multi-root without repo: still allow pure meta bootstrap in tmp.
          sessionRoot = {
            engineeringDir: planningRootDir,
            planningRelativeDir: sessionScope.planningRelativeDir,
          };
        }
        const existing = lookupTransientBySlug(slug);
        folder = existing ?? await createTransientFolder();
      } else {
        // Fresh durable session — require a resolved engineering checkout.
        sessionRoot = resolveSessionRoot(sessionScope, {
          repo,
          planningFolder: planning_folder,
        });
        folder = await ensurePlanningFolder(sessionRoot.engineeringDir, slug, {
          planningRelativeDir: sessionRoot.planningRelativeDir,
        });
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
        // recorded value), update agentId if it differs, adopt a supplied
        // context_mode, and bind repo onto session.json when provided.
        // One persist if any changed. Repo is the durable multi-root binding
        // (not a process-local stash).
        const pathDrift = canonicalFolder !== undefined && state.planningFolderPath !== canonicalFolder;
        const agentDrift = state.agentId !== agent_id;
        const modeDrift = context_mode !== undefined && state.contextMode !== context_mode;
        // A resume carries a fresh request from the user — rebind it so the bag
        // describes why the session is running now, not why it opened.
        const requestDrift = user_request !== undefined && state.variables?.['user_request'] !== user_request;
        let nextState = state;
        if (pathDrift || agentDrift || modeDrift || requestDrift) {
          nextState = {
            ...nextState,
            ...(agentDrift ? { agentId: agent_id } : {}),
            ...(pathDrift ? { planningFolderPath: canonicalFolder } : {}),
            ...(modeDrift ? { contextMode: context_mode } : {}),
            ...(requestDrift ? { variables: { ...nextState.variables, user_request } } : {}),
          };
        }
        const repoBindRaw = repo?.trim() || sessionRoot.repo;
        if (repoBindRaw) {
          try {
            nextState = bindSessionRepo(nextState, repoBindRaw, normalizeRepoPath);
          } catch (err) {
            throw new Error(
              `start_session: ${err instanceof Error ? err.message : String(err)}`,
            );
          }
        }
        if (nextState !== state) {
          state = nextState;
          await writeSessionFile(folder, state);
        }
      } else {
        // Fresh top-level session — no parent. Children are dispatched via
        // dispatch_child after start_session returns the index.
        sessionIndex = await computeSessionIndex(folder);
        const boundRepo = (() => {
          const raw = repo?.trim() || sessionRoot.repo;
          if (!raw) return undefined;
          return normalizeRepoPath(raw);
        })();
        const newState = createInitialSessionFile({
          sessionIndex,
          workflowId: effectiveWorkflowId,
          workflowVersion: effectiveWorkflowVersion,
          agentId: agent_id,
          ...(canonicalFolder ? { planningFolderPath: canonicalFolder } : {}),
          ...(boundRepo ? { repo: boundRepo } : {}),
          ...(context_mode ? { contextMode: context_mode } : {}),
          // B7 (#166): seed declared defaults into the fresh bag. Conditional
          // on the pre-load succeeding — its failure is only surfaced further
          // down, and an unseeded bag is the correct shape for that path.
          // #324 A1: the caller's request seeds alongside them, so techniques
          // that match or classify it bind a variable rather than relying on
          // the orchestrator to inline it into a spawn prompt.
          ...(wfPreLoad.success || user_request !== undefined
            ? {
              variables: {
                ...(wfPreLoad.success ? seedDefaults(wfPreLoad.value.variables) : {}),
                ...(user_request !== undefined ? { user_request } : {}),
              },
            }
            : {}),
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
        // fall through to the dated workflow-id folder name). Repo lives on
        // session.json, not the process-local registry.
        if (isTransientSession) {
          registerTransient(
            sessionIndex,
            folder,
            slugIsSynthetic ? undefined : slug,
          );
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
      {
        const presented = presentPlanningPath(state.planningFolderPath);
        if (presented) response['planning_folder_path'] = presented;
      }
      // Echo the durable session binding (session.json#repo), not a path-only hint.
      if (state.repo) response['repo'] = state.repo;
      // Fail-soft: transient without session.repo still boots; bind via start_session
      // or dispatch_child before promote / durable path resolution needs it.
      if (isTransientSession && !state.repo) {
        response['repo_unbound'] = true;
      }
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
        'Dispatch a child workflow under the parent session. Returns the child `session_index`, canonical `planning_folder_path`, and `workflow.initialActivity` when the child workflow declares one — the activity its first `next_activity` should name, which the parent otherwise has no way to know. `get_workflow` remains where a session reads its OWN workflow metadata; this reports the CHILD\'s, so a parent need not load a workflow bundle it will not execute. Naming an activity the workflow does not declare fails that call; naming a declared one out of order is recorded with a warning, so the id is worth getting right here rather than relying on the transition check. '
        + 'From a TRANSIENT parent (the bootstrap case), re-dispatching into a planning folder that already holds a child of this workflow REPLACES it rather than continuing it, and returns the same `session_index` with an empty session behind it (#429). A persistent parent appends a second child instead. ' +
        'Transient meta parents are promoted to a workspace planning folder first (optional `planning_slug`). ' +
'Ensure `session.repo` is bound (pass `repo` here if start_session did not); path resolution reads only session.json. ' +
        'Never set `context_mode: "persistent"` on worker-dispatched children — a worker takes full delivery on the first activity of its run and collapses against its own ledger thereafter.',
      inputSchema: z.object({
        ...sessionIndexParam,
        workflow_id: z.string().describe('Child workflow id (e.g. "work-package").'),
        agent_id: z.string().default('worker').describe('Child agent_id (default "worker").'),
        planning_slug: z.string().optional().describe('Optional. Promotion slug when the parent is a transient meta bootstrap. Ignored if the parent is already persistent.'),
        repo: z.string().optional().describe('Bind owner/repo onto the parent session when missing (must match if already set). session.json#repo is the source of truth.'),
        context_mode: z.enum(['persistent', 'fresh']).optional().describe('Optional. Child delivery mode. "persistent" ONLY for solo child walks; omit/"fresh" for worker-dispatched walks.'),
      }).strict(),
    },
    withAuditLog('dispatch_child', withSessionStoreErrors(async ({ session_index, workflow_id, agent_id, planning_slug, repo, context_mode }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const parentFolder = loaded.folderAbsPath;
      const parentIsTransient = isTransientFolder(parentFolder);

      // Resolve workflow version up-front (carried onto the child SessionFile).
      const wfResult = await loadWorkflow(config.workflowDir, workflow_id);
      if (!wfResult.success) throw wfResult.error;
      const effectiveWorkflowVersion = wfResult.value.version ?? '';

      const triggeredAt = new Date().toISOString();

      // #324 A1: the request that opened the parent is the same request the
      // child workflow serves, so it travels into the child bag as state. A
      // child that declares `user_request` resolves it; one that does not is
      // unaffected.
      const inheritedRequest = loaded.state.variables?.['user_request'];
      const childVariables = (wf: typeof wfResult.value): Record<string, unknown> => ({
        ...seedDefaults(wf.variables),
        ...(inheritedRequest !== undefined ? { user_request: inheritedRequest } : {}),
      });

      // Bind-if-missing on the parent session. session.json#repo is the single
      // source of truth for path resolution / promotion; dispatch_child.repo
      // never overrides a prior bind.
      let parentState = loaded.state;
      if (repo?.trim()) {
        try {
          parentState = bindSessionRepo(parentState, repo, normalizeRepoPath);
        } catch (err) {
          throw new Error(
            `dispatch_child: ${err instanceof Error ? err.message : String(err)}`,
          );
        }
        if (parentState !== loaded.state && !parentIsTransient) {
          // Durable parent: persist bind before embedding the child.
          await writeSessionFile(parentFolder, parentState);
        }
      }

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
        // Promote using session.json#repo only (bound above if dispatch passed repo).
        const promoteRoot = (() => {
          try {
            return resolveSessionRoot(sessionScope, { repo: parentState.repo });
          } catch (err) {
            throw new Error(
              `dispatch_child: cannot promote transient session without session.repo. ` +
                `Bind repo on start_session or pass repo on dispatch_child. ` +
                `(${err instanceof Error ? err.message : String(err)})`,
            );
          }
        })();
        const promotedWorkspaceFolder = await ensurePlanningFolder(
          promoteRoot.engineeringDir,
          promotedSlug,
          { planningRelativeDir: promoteRoot.planningRelativeDir },
        );
        const childSessionIndex = await computeEmbeddedSessionIndex(
          promotedWorkspaceFolder,
          ['triggeredWorkflows', 0, 'state'],
        );
        const childInitial = createInitialSessionFile({
          sessionIndex: childSessionIndex,
          workflowId: workflow_id,
          workflowVersion: effectiveWorkflowVersion,
          agentId: agent_id,
          ...(parentState.repo ? { repo: parentState.repo } : {}),
          ...(context_mode ? { contextMode: context_mode } : {}),
          variables: childVariables(wfResult.value),
        });
        const parentNext = advanceSession(parentState, (draft) => {
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
          content: [{ type: 'text' as const, text: JSON.stringify({ session_index: childSessionIndex, workflow: { id: wfResult.value.id, version: wfResult.value.version, initialActivity: wfResult.value.initialActivity }, planning_slug: promotedSlug, planning_folder_path: presentPlanningPath(promotedWorkspaceFolder) ?? promotedWorkspaceFolder }, null, 2) }],
          _meta: { session_index: childSessionIndex, validation: buildValidation(null) },
        };
      }

      // Persistent parent — embed the child inline under
      // triggeredWorkflows[N].state. The child's sessionIndex is derived
      // from the top folder + jsonPath so it stays stable as long as the
      // array index doesn't shift (triggeredWorkflows is append-only).
      // Use parentState (may include a just-bound repo) rather than the
      // pre-bind loaded.state snapshot.
      const newArrayIndex = parentState.triggeredWorkflows.length;
      const childJsonPath = [...loaded.jsonPath, 'triggeredWorkflows', newArrayIndex, 'state'];
      const childSessionIndex = await computeEmbeddedSessionIndex(parentFolder, childJsonPath);
      const childInitial = createInitialSessionFile({
        sessionIndex: childSessionIndex,
        workflowId: workflow_id,
        workflowVersion: effectiveWorkflowVersion,
        agentId: agent_id,
        ...(parentState.repo ? { repo: parentState.repo } : {}),
        ...(context_mode ? { contextMode: context_mode } : {}),
        variables: childVariables(wfResult.value),
      });
      const parentNext = advanceSession(parentState, (draft) => {
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
        content: [{ type: 'text' as const, text: JSON.stringify({ session_index: childSessionIndex, workflow: { id: wfResult.value.id, version: wfResult.value.version, initialActivity: wfResult.value.initialActivity }, planning_folder_path: presentPlanningPath(parentFolder) ?? parentFolder }, null, 2) }],
        _meta: { session_index: childSessionIndex, validation: buildValidation(null) },
      };
    }), traceOpts)
  );

  // ============== Technique Tool ==============

  server.tool(
    'get_technique',
    'Load one fully composed technique (step-bound when `step_id` is set; otherwise the activity\'s or workflow\'s first). ' +
    'Under `context_mode: "persistent"` or `bundle: "reference"`, a byte-identical refetch to the SAME `agent_id` scope may return an unchanged-reference; pass `full: true` when earlier content was summarized away. ' +
    'A fresh worker context must not ask for reference delivery — it holds no prior delivery to reference.',
    {
      ...sessionIndexParam,
      ...agentIdParam,
      step_id: z.string().optional().describe('Optional. Step id whose bound technique to load; omit for the activity/workflow first technique.'),
      bundle: z.enum(['reference', 'full']).optional().describe('Optional. "reference" collapses a refetch already delivered to THIS agent_id scope. "full" forces full delivery. Defaults from context_mode.'),
      full: z.boolean().optional().describe('Optional. Force full content when reference delivery would return an unchanged-reference (e.g. after summarization). Overrides bundle.'),
    },
    withAuditLog('get_technique', withSessionStoreErrors(async ({ session_index, agent_id, step_id, bundle, full }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      const workflow_id = state.workflowId;
      const scope = deliveryScope(state, agent_id);

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
      let resolvedTechniques = 0;
      if (boundStep?.id && state.currentActivity) {
        const producerIndex = await buildProducerIndex({
          workflow: wfResult.value,
          workflowDir: config.workflowDir,
          activitySourceWorkflow: wfDiag.value.activitySourceWorkflow,
        });
        resolvedTechniques = producerIndex.resolvedTechniques;
        const ctx = provenanceContextFor(producerIndex, state.currentActivity, boundStep.id);
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
      // `chars` (the full composed size, on both delivery paths) and `delivery` make the payload
      // cost of a fetch summable from the ledger (#353 §1.3).
      const recordFetch = (draft: SessionFile, delivery: 'full' | 'unchanged'): void => {
        const ts = new Date().toISOString();
        draft.history.push({
          timestamp: ts,
          type: 'technique_fetched',
          ...(state.currentActivity ? { activity: state.currentActivity } : {}),
          data: {
            techniqueId: techniqueId as string,
            ...(boundStep?.id ? { stepId: boundStep.id } : {}),
            agentId: scope,
            chars: text.length,
            delivery,
          },
        });
        if (boundStep?.id && state.currentActivity) {
          appendStepStartedIfAbsent(draft, {
            activity: state.currentActivity, stepId: boundStep.id, agentId: scope, timestamp: ts,
          });
        }
      };

      // An out-of-band dispatch may never call get_activity, so its dispatch would otherwise go
      // unrecorded. It does mint its own `agent_id`, so the first server call bearing an unseen
      // scope records the dispatch (#353 §1.3).
      const recordFirstArrival = (draft: SessionFile): void => {
        if (hasDispatch(state, scope)) return;
        recordDispatch(draft, { scope, kind: 'fresh', activityId: state.currentActivity || undefined });
      };

      // Reference-not-repeat delivery: a refetch whose composed content is byte-identical to what
      // this AGENT CONTEXT already received returns a short unchanged-reference instead of the full
      // payload. Active via the per-call `bundle` opt-in (which a resumed worker uses — #353 §1.2)
      // or the session's declared context mode; `full: true` overrides both, for a context that no
      // longer holds the earlier delivery.
      const referenceMode = full !== true
        && (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';
      const ledgerKey = `technique:${techniqueId}`;
      const hash = contentHash(text);
      if (referenceMode && deliveredHash(state, ledgerKey, scope) === hash) {
        const next = advanceSession(state, (draft) => {
          draft.currentTechnique = techniqueId as string;
          recordFirstArrival(draft);
          recordFetch(draft, 'unchanged');
        });
        await saveSessionForTool(loaded, next);

        logInfo('Technique delivery cost', {
          session_index, technique: techniqueId, agentId: scope, delivery: 'unchanged',
          resolved_techniques: resolvedTechniques, composed_chars: text.length, response_chars: 0,
        });

        // Canonical unchanged-marker: { delivery: 'unchanged', content_hash } —
        // the same shape the get_activity bundle path emits (delivery.ts#unchangedMarker).
        // The technique id and note ride alongside as sibling context.
        const stub = stringifyForResponse({
          id: techniqueId,
          ...unchangedMarker(hash),
          note: 'Byte-identical to the composed technique already delivered to this agent context — reuse it from your context. Pass full: true to re-fetch the full content.',
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
      if (referenceMode) {
        const deduped = dedupTechniqueBlocks(ordered, state, blockDeliveries, scope);
        body = stringifyForResponse(deduped);
      }
      const next = advanceSession(state, (draft) => {
        draft.currentTechnique = techniqueId as string;
        recordDeliveries(draft, scope, { [ledgerKey]: hash, ...blockDeliveries });
        recordFirstArrival(draft);
        recordFetch(draft, 'full');
      });
      await saveSessionForTool(loaded, next);

      // What this fetch cost to build and to send. `resolved_techniques` is the distinct bound ops the
      // producer scan read to decorate one step, which is the resolve work a lazy fetch pays; the two
      // character figures are the composed technique and what the response carried after any shared
      // block collapsed.
      logInfo('Technique delivery cost', {
        session_index, technique: techniqueId, agentId: scope, delivery: 'full',
        resolved_techniques: resolvedTechniques, composed_chars: text.length, response_chars: body.length,
      });

      return {
        content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${body}` }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

  server.tool(
    'get_resource',
    'Load a resource by id (optional `#section`). Bare slug = session workflow; `workflow/slug` = cross-workflow. ' +
    'Under `context_mode: "persistent"` or `bundle: "reference"`, a byte-identical refetch to the SAME `agent_id` scope may return an unchanged-reference; pass `full: true` when content was summarized away. ' +
    'A freshly spawned worker must not ask for reference delivery — it holds no prior delivery to reference.',
    {
      ...sessionIndexParam,
      ...agentIdParam,
      resource_id: z.string().describe('Resource ref: bare slug, `workflow/slug`, optional `#section` anchor.'),
      bundle: z.enum(['reference', 'full']).optional().describe('Optional. "reference" collapses a refetch already delivered to THIS agent_id scope. "full" forces full delivery. Defaults from context_mode.'),
      full: z.boolean().optional().describe('Optional. Force full content when reference delivery would return an unchanged-reference (e.g. after summarization). Overrides bundle.'),
    },
    withAuditLog('get_resource', withSessionStoreErrors(async ({ session_index, agent_id, resource_id, bundle, full }) => {
      const loadOpts = await sessionLoadOpts();
      const loaded = await loadSessionForTool(planningRootDir, session_index, loadOpts);
      const { state } = loaded;
      assertNoActiveCheckpoint(state);
      const workflow_id = state.workflowId;
      const scope = deliveryScope(state, agent_id);

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
      const recordFetch = (draft: SessionFile, delivery: 'full' | 'unchanged', chars: number): void => {
        draft.history.push({
          timestamp: new Date().toISOString(),
          type: 'resource_fetched',
          ...(state.currentActivity ? { activity: state.currentActivity } : {}),
          data: { resourceId: resource_id, agentId: scope, chars, delivery },
        });
      };

      // As in get_technique: an out-of-band dispatch that never calls get_activity still announces
      // itself on the first server call bearing its own, unseen scope (#353 §1.3).
      const recordFirstArrival = (draft: SessionFile): void => {
        if (hasDispatch(state, scope)) return;
        recordDispatch(draft, { scope, kind: 'fresh', activityId: state.currentActivity || undefined });
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
      const referenceMode = full !== true
        && (bundle ?? (state.contextMode === 'persistent' ? 'reference' : 'full')) === 'reference';
      if (referenceMode && deliveredHash(state, ledgerKey, scope) === hash) {
        const next = advanceSession(state, (draft) => {
          recordFirstArrival(draft);
          recordFetch(draft, 'unchanged', fullText.length);
        });
        await saveSessionForTool(loaded, next);

        logInfo('Resource delivery cost', {
          session_index, resource: resource_id, agentId: scope, delivery: 'unchanged',
          resource_chars: fullText.length, response_chars: 0,
        });

        const stub = stringifyForResponse({
          resource_id,
          ...unchangedMarker(hash),
          note: 'Byte-identical to the resource already delivered to this agent context — reuse it from your context. Pass full: true to re-fetch the full content.',
        });
        return {
          content: [{ type: 'text' as const, text: `session_index: ${session_index}\n\n${stub}` }],
          _meta: { session_index, validation, delivery: 'unchanged' },
        };
      }

      const next = advanceSession(state, (draft) => {
        recordDeliveries(draft, scope, { [ledgerKey]: hash });
        recordFirstArrival(draft);
        recordFetch(draft, 'full', fullText.length);
      });
      await saveSessionForTool(loaded, next);

      logInfo('Resource delivery cost', {
        session_index, resource: resource_id, agentId: scope, delivery: 'full',
        resource_chars: fullText.length, response_chars: fullText.length,
      });

      return {
        content: [{ type: 'text' as const, text: fullText }],
        _meta: { session_index, validation },
      };
    }), traceOpts)
  );

}
