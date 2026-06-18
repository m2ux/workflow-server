# Dispatch Child — Transient Parent Path — Comprehension Artifact

> **Last updated**: 2026-06-18
> **Work package**: `2026-05-20-fix-work-package-transition-folder-defect`
> **Coverage**: The transient-parent branch of `dispatch_child`, its supporting session-store helpers, the contract it honours, and the test surface.
> **Related artifacts**: [hierarchical-dispatch.md](hierarchical-dispatch.md) (`start_session` + `parent_session_token` design; does not cover the embedded-state model).

## Scope note

This is a narrowly-scoped comprehension artifact for a defect-fix work package, per user direction: "this is a simple task, keep the activities simple". It covers only the code paths, helpers, and tests needed to understand the two defects localised in the design-philosophy and assumptions log. It is **not** a broad architectural deep-dive of session management or the dispatch system.

## The Transient-Parent Branch

The relevant branch is the `parentIsTransient` branch inside `dispatch_child` at `src/tools/resource-tools.ts:389-450`. The two defects this work package targets are:

1. **Slug not promoted.** The child workspace folder reused the transient slug verbatim. When the meta session was started without a user-supplied slug, that slug was `transition-<uuid>`, and the workspace folder inherited that name.
2. **Inverted parent/child nesting.** The child was written at the *top level* of `session.json` with the parent meta snapshot stored in `parentSession`. The contract is the opposite: child embedded under `parent.triggeredWorkflows[N].state`, parent at top level.

The branch (line 411-445):

- Derives the promoted slug from `planning_slug` argument → registered slug → `YYYY-MM-DD-<workflow_id>` fallback (line 411-414). Synthetic `transition-<uuid>` slugs are **not** registered in the folder→slug map (see `start_session` line 306-307: `slugIsSynthetic ? undefined : slug`), so the fallback fires for bootstrap-only meta sessions and produces a stable dated folder name rather than the UUID.
- Embeds the child under `parent.triggeredWorkflows[0].state` via `advanceSession` + `writeSessionFile` (line 426-442), with the meta parent at the top of the file and `parentSession` absent. This matches the persistent-parent shape.

The tool description at `resource-tools.ts:369` documents this behaviour ("The on-disk shape matches the persistent-parent case — parent at the top of the file, child under `triggeredWorkflows[0].state`").

## Code Path

### Entry point

`server.registerTool('dispatch_child', …)` at `src/tools/resource-tools.ts:362-487`.

Top-level flow (line 377-387):

```
loadSessionForTool(workspaceDir, session_index) → loaded
parentFolder         = loaded.folderAbsPath
parentIsTransient    = isTransientFolder(parentFolder)
loadWorkflow(child_workflow_id) → effectiveWorkflowVersion
```

The handler accepts an optional `planning_slug` argument (line 374) used only on the transient branch. Then two branches.

### Branch A — Transient parent — `:389-450`

The branch promotes the transient parent and embeds the child under it — the same contract shape as branch B:

```ts
if (parentIsTransient) {
  const promotedSlug =
    planning_slug
    ?? lookupTransientSlugByFolder(parentFolder)
    ?? `${new Date().toISOString().slice(0, 10)}-${workflow_id}`;   // YYYY-MM-DD-<workflow_id>
  const promotedWorkspaceFolder = await ensurePlanningFolder(config.workspaceDir, promotedSlug);
  const childSessionIndex = await computeEmbeddedSessionIndex(
    promotedWorkspaceFolder,
    ['triggeredWorkflows', 0, 'state'],
  );
  const childInitial = createInitialSessionFile({
    sessionIndex:    childSessionIndex,
    workflowId:      workflow_id,
    workflowVersion: effectiveWorkflowVersion,
    agentId:         agent_id,
    // NOTE: no parentSession — the meta stays at the TOP of the file.
  });
  const parentNext = advanceSession(loaded.state, (draft) => {
    draft.triggeredWorkflows.push({
      workflowId:    workflow_id,
      sessionIndex:  childSessionIndex,
      triggeredAt,
      triggeredFrom: { activityId: draft.currentActivity || '' },
      status:        'running',
      state:         childInitial,            // ← child embedded here
    });
    draft.history.push({ type: 'workflow_triggered', … });
  });
  await writeSessionFile(promotedWorkspaceFolder, parentNext);
  await redirectTransientToWorkspace(parentFolder, promotedWorkspaceFolder);
  // returns child session_index + planning_slug + planning_folder_path
}
```

This shape on disk (the contract shape):

```
session.json (top)  ← promoted to <workspace>/.engineering/artifacts/planning/<promotedSlug>/
├─ workflowId: "meta"                    ← parent at top
├─ parentSession: (absent)
└─ triggeredWorkflows:
   └─ [0].state:
      └─ workflowId: "work-package"      ← child embedded
```

Two structural differences from branch B: (a) the workspace folder is materialised here (the transient parent has no folder of its own), and (b) the tmp folder is reaped via `redirectTransientToWorkspace` so the caller's original `session_index` keeps resolving — see the helper table below.

### Branch B — Persistent parent — `:452-486`

The persistent-parent branch. Lives on the same handler:

```ts
const newArrayIndex     = loaded.state.triggeredWorkflows.length;
const childJsonPath     = [...loaded.jsonPath, 'triggeredWorkflows', newArrayIndex, 'state'];
const childSessionIndex = await computeEmbeddedSessionIndex(parentFolder, childJsonPath);
const childInitial      = createInitialSessionFile({ ... });   // no parentSession
const parentNext        = advanceSession(loaded.state, (draft) => {
  draft.triggeredWorkflows.push({
    workflowId:      workflow_id,
    sessionIndex:    childSessionIndex,
    triggeredAt,
    triggeredFrom:   { activityId: draft.currentActivity || '' },
    status:          'running',
    state:           childInitial,           // ← child embedded here
  });
  draft.history.push({ type: 'workflow_triggered', … });
});
await saveSessionForTool(loaded, parentNext);
```

Branch A produces this same embedded shape; the only structural difference is the index path (`triggeredWorkflows[0].state` for the freshly-promoted top file vs. `loaded.jsonPath + triggeredWorkflows[N].state` for a persistent parent at any depth).

## Key Helpers (Session Store)

All in `src/utils/session/store.ts`:

| Helper | Purpose | Line |
|---|---|---|
| `isTransientFolder(folder)` | Returns true if `folder` lives under the `os.tmpdir() / workflow-server-transient-<uuid>/` prefix. | 811 |
| `lookupTransientSlugByFolder(folder)` | Reverse-lookup the slug a transient folder was registered under; returns `undefined` if none. | 803 |
| `lookupTransientBySlug(slug)` | Forward lookup, returns folder or `undefined`. | 798 |
| `createTransientFolder()` | Mkdir under `os.tmpdir()/workflow-server-transient-<uuid>/`. | 785 |
| `registerTransient(idx, folder, slug?)` | Adds to the two in-memory maps (`transientFolderByIndex`, `transientFolderBySlug`). | 792 |
| `discardTransient(folder)` | Removes registry entries and `rm -rf` the folder. Best-effort. No-op if not transient. | 820 |
| `redirectTransientToWorkspace(oldFolder, newFolder)` | **Used by the transient-parent branch.** Repoints any `transientFolderByIndex` entry pointing at `oldFolder` to `newFolder` (so the caller's original `session_index` keeps resolving to the promoted workspace folder), drops the slug-keyed entry, then `rm -rf` the old tmp folder. Best-effort; no-op if `oldFolder` is not transient. | 847 |
| `ensurePlanningFolder(workspace, slug)` | `mkdir -p <workspace>/.engineering/artifacts/planning/<slug>` mode 0700. Validates slug shape. Idempotent. | 740 |
| `findPlanningFolderBySlug(workspace, slug)` | Walks the planning root looking for a folder named `slug` that contains a `session.json`. Returns undefined if no match, throws COLLISION on multiple. | 689 |
| `writeSessionFile(folder, state)` | Canonicalise → seal → atomic-write `session.json` + `.session-token`. | 309 |

The fs `rename` primitive is bound to a small adapter (`fsAdapter.rename`, line 23) that tests can substitute — useful for the EXDEV fallback path, not load-bearing for this branch.

Folder promotion (transient → workspace) is done by *creating* a new workspace folder via `ensurePlanningFolder`, writing the promoted top file into it, and reaping the old tmp folder via `redirectTransientToWorkspace` (which preserves the caller's `session_index`). The transient-parent branch follows exactly this idiom. The session store exposes `mkdir`/`rm` primitives and `ensurePlanningFolder`; folder transitions are create-new + reap-old.

### Session schema relevant fields

In `src/schema/session.schema.ts`:

- `SessionFile.triggeredWorkflows: EmbeddedSessionRef[]` (schema line 120, interface line 160) — array of child entries; `state` field of each is a full embedded `SessionFile` (via `z.lazy`).
- `SessionFile.parentSession?: SessionFile` (schema line 171, interface line 161) — recursive upward link, optional.
- `SessionFile.planningFolderPath?: string` (schema line 134, interface line 162) — absolute path of the owning planning folder; recorded for diagnostics, optional. Stamped on `start_session` and re-stamped silently on resume if the folder moved.
- `createInitialSessionFile({ sessionIndex, workflowId, workflowVersion, agentId, parentSession?, planningFolderPath? })` (line 234-265) — minimal valid fresh file. Sets `parentSession` / `planningFolderPath` only if supplied. Initialises `triggeredWorkflows: []`. The transient-parent branch calls this **without** `parentSession`, so the embedded child carries no upward link (the parent is its enclosing top file).
- `EmbeddedSessionRefSchema` (line 178-190) — shape: `{ workflowId, sessionIndex, triggeredAt, triggeredFrom: { activityId, stepIndex? }, status, completedAt?, returnedContext?, state? }`. `status` is `'running' | 'completed' | 'aborted' | 'error'`; `sessionIndex` is validated `/^[A-Z2-7]{6}$/`. The transient-parent branch constructs one of these for the meta→work-package case.

### Resolver helpers (`src/utils/session/resolver.ts`)

- `loadSessionForTool(workspace, idx)` → `{ state, folderAbsPath, bytes, jsonPath, topState }` (line 138-155). For a transient session, `folderAbsPath` is the `/tmp` folder and `jsonPath` is `[]`.
- `advanceSession(state, mutate?)` — bumps seq/ts, deep-clones, runs mutator (line 163).
- `saveSessionForTool(loaded, newState)` — writes `newState` back, slotting it into `loaded.topState` at `loaded.jsonPath` if non-empty (line 192). Branch B uses this; the transient branch calls `writeSessionFile` directly on the freshly-promoted folder, because the promoted file IS the new top (empty jsonPath) and `loaded.topState` points at the tmp state.
- `replacePath(root, jsonPath, newSubState)` — pure, used by `saveSessionForTool` (line 63).
- `navigatePath(root, jsonPath)` — pure, used by `loadSessionForTool` (line 20).

These resolver helpers support every operation in branch A: the branch arranges the call sequence and includes the `redirectTransientToWorkspace` step.

## Documented Contract

The contract lives in the meta workflow's `workflow-engine` technique, `handle-sub-workflow` capability — `workflows/meta/techniques/workflow-engine/handle-sub-workflow.md`. Content (markdown):

```
## Capability
Dispatch a child workflow under the current session as its parent.

## Inputs
### parent_session_index
The current session's session_index — passed to the server so it can append the child
under the parent's triggeredWorkflows[] with the child's SessionFile embedded inline.
### workflow_id
Child workflow ID.

## Outputs
### child_session_index
The 6-character base32 session_index of the newly created child session.

## Protocol
1. Call dispatch_child { session_index: {parent_session_index}, workflow_id: {workflow_id},
   agent_id: 'workflow-orchestrator' }; capture {child_session_index} from the response.
   The child SessionFile is embedded under parent.triggeredWorkflows[N].state in the
   top-level session.json — no separate child folder.
```

The contract: child embedded under `parent.triggeredWorkflows[N].state`. No special case for transient parents is mentioned. Both the persistent-parent branch and the transient-parent branch implement this shape; the transient branch additionally promotes the planning folder to a dated (or explicit) work-package slug.

## On-Disk Evidence

This work package's own planning folder holds a session file in the child-at-top shape — it was written before the slug-promotion and embedding behaviour was in place, and persists because session writes are forward-only (no migration; `start_session` does not rebrand a live session). It does not reflect the behaviour of the current transient branch.

`/home/mike1/projects/main/workflow-server/.engineering/artifacts/planning/2026-05-20-fix-work-package-transition-folder-defect/session.json` carries this shape:

- Top-level `workflowId: "work-package"` (child) — line 4.
- `triggeredWorkflows: []` (empty) — line 440.
- `parentSession.workflowId: "meta"` (parent in `parentSession`) — lines 441, 480.

A session.json produced by the current code on a transient meta parent has `workflowId: "meta"` at the top, `parentSession` absent, and the child under `triggeredWorkflows[0].state`. The folder name `2026-05-20-fix-work-package-transition-folder-defect` was an explicit user-supplied slug; an omitted slug yields a `YYYY-MM-DD-<workflow_id>` folder rather than a `transition-<uuid>` folder.

## Test Surface

All in `tests/mcp-server.test.ts`. The meta-dispatch tests assert the contract shape, and transient-promotion regression tests cover the promotion path:

| Test | Lines | Status |
|---|---|---|
| `dispatch_child returns a distinct session_index than the parent` | 1572-1597 | Passes — does not assert on shape. |
| `meta sessions live in os.tmpdir() (not the workspace) and are discarded when a child captures them` | 1599-1676 | Asserts the contract. Confirms `topState.workflowId === 'meta'`, `topState.parentSession` absent, child under `triggeredWorkflows[0].state`, the promoted folder exists under the bound slug, and the tmp folder is reaped (lines 1655-1675). |
| `dispatch_child accepts planning_slug to control the promoted workspace folder` | 1678-1713 | Starts a meta with no slug, passes `planning_slug` to `dispatch_child`, asserts the promoted folder uses the explicit slug and the `YYYY-MM-DD-<workflow_id>` fallback folder is absent. |
| `the parent session_index keeps resolving after dispatch_child promotes a transient meta` | 1715-1746 | Regression test for `redirectTransientToWorkspace`. Asserts the orchestrator's original meta index still authenticates `get_workflow` after promotion. |
| `three-level dispatch (A → B → C → D) records the full chain in D's session.json` | 1748-1799 | Asserts the contract. A (meta) promoted to top, B under `triggeredWorkflows[0].state`, C and D nested recursively; `topState.parentSession` absent (lines 1790-1798). |
| `dispatch depth > 5 emits a soft warning in _meta.validation` | 1801-1822 | Skipped — TODO acknowledges the depth-warning surface needs rework for the embedded-state model (depth lives in `triggeredWorkflows` nesting, not `parentSession`). |
| `dispatch_child embeds the child SessionFile under parent.triggeredWorkflows[N].state and returns its session_index` | 1985-2048 | Persistent-parent path. Exercises the contract branch; serves as the assertion template the transient tests follow. |
| `dispatch_child embeds the child inline under parent.triggeredWorkflows[N].state` | 2050-2097 | Same — persistent parent. |
| `mutations through a child session_index land in the embedded state (not in a separate file)` | 2099-2128 | Persistent parent. Verifies a mutation via the child index lands in `triggeredWorkflows[0].state`. |

Two `it.skip` tests at lines 1886-1940 and 1942-1983 cover the `parent_planning_slug` separate-folder layout; they are skipped and tagged as such.

### Test conventions

- Tests use `client.callTool({ name, arguments })` against an in-process MCP client.
- Each test owns a unique slug; the workspaceDir is a shared per-suite tmp.
- On-disk verification uses `JSON.parse(readFileSync(join(workspaceDir, '.engineering/artifacts/planning', slug, 'session.json'), 'utf8'))`.
- No fixtures beyond the workflow definitions in `workflows/`.

## Edges & Caveats

1. **How is the slug supplied / derived?**
   `start_session` takes an optional absolute `planning_folder` path and derives the slug from its `basename` (line 176-184). When omitted, `slugIsSynthetic` is true and `start_session` mints `transition-${randomUUID()}` (line 187-188) but **does not register** that synthetic slug in `transientFolderBySlug` (line 306-307: `slugIsSynthetic ? undefined : slug`). So `lookupTransientSlugByFolder` returns `undefined` for the common bootstrap case, and `dispatch_child` falls through to its `YYYY-MM-DD-<workflow_id>` fallback. The promoted slug resolution order in `dispatch_child` is: explicit `planning_slug` argument → registered slug → dated fallback (resource-tools.ts:411-414).

2. **What if the meta session is already promoted (workspace folder, not transient)?**
   This does not arise for a still-transient parent. `start_session` mints a transient folder only when the effective workflow is the default (`meta`) AND no existing workspace folder for the slug (line 199-205: `isTransientSession = !slugCandidate && wouldBeTransient`). Once a workspace folder exists, `parentIsTransient` is false and branch B runs.

3. **Existing sessions on disk in the child-at-top shape.**
   A6 in the assumptions log: forward-behaviour fix only, no migration. Existing top-level `work-package`-at-top files remain readable because `parentSession` is a valid optional field per the schema. The fix governs future writes — see the On-Disk Evidence section, where this work package's own folder carries the child-at-top shape.

4. **The `parentSession` field.**
   It is valid for the `start_session(parent_session_token=…)` flow (see [hierarchical-dispatch.md](hierarchical-dispatch.md)) and for the parent-chain-depth defence (`parentChainDepth`, session.schema.ts:215). The transient-parent branch of `dispatch_child` calls `createInitialSessionFile` without `parentSession`.

5. **Slug derivation.**
   The fallback shape is `YYYY-MM-DD-<workflow_id>` (resource-tools.ts:414 — day-prefixed, hyphen-joined), with an explicit `planning_slug` argument taking precedence. The plan-prepare options noted in A5 (short-uuid suffix, etc.) are tracked there as alternatives; the code uses the plain dated form.

6. **Tmp-folder reaping ordering.**
   The transient branch writes the promoted top file (`writeSessionFile`, line 442) *before* reaping the tmp folder. Reaping is done by `redirectTransientToWorkspace` (line 445), which repoints the caller's `session_index` at the promoted folder before `rm -rf`-ing the tmp dir — preserving authentication for subsequent meta activities.

## Domain Concept Mapping

| Term | Technical construct |
|---|---|
| Transient parent | A `meta` session bootstrapped via `start_session` without a workspace folder; lives at `os.tmpdir()/workflow-server-transient-<uuid>/`. |
| Promotion | Materialising a transient parent's state onto disk under a stable dated/explicit workspace slug, then reaping the tmp folder. Done in the transient branch via `ensurePlanningFolder` + `writeSessionFile` + `redirectTransientToWorkspace`. |
| Index redirect | Repointing the caller's original `session_index` from the discarded tmp folder to the promoted workspace folder so it keeps resolving (`redirectTransientToWorkspace`, store.ts:847). |
| Embedded child | A `SessionFile` stored inline under `parent.triggeredWorkflows[N].state` rather than in its own folder. |
| Transient branch | The branch at `resource-tools.ts:389-450`. Honours the embedded-child contract, promoting the parent and embedding the child under `triggeredWorkflows[0].state`. |

## Open Questions

The comprehension questions are answered by reading the code and the contract. The table below records each answer against the current code. Design questions (slug naming, retroactive migration) are tracked in `01-assumptions-log.md` as plan-prepare decisions, not comprehension gaps.

| # | Question | Status | Resolution |
|---|---|---|---|
| Q1 | Does a "rename folder in place" helper exist in the session store? | Answered | No. The store has `mkdir`/`rm` primitives and `ensurePlanningFolder`; folder transitions are create-new + reap-old. The transient branch creates the dated workspace folder, writes meta + embedded child, then calls `redirectTransientToWorkspace` (which repoints the caller's index and removes the tmp dir). |
| Q2 | Does the embedding require schema changes? | Answered | No (A6). `triggeredWorkflows[N].state` and `parentSession?` are both valid schema constructs; the transient branch populates `triggeredWorkflows[0].state` and leaves `parentSession` unset. Confirmed against the schema. |
| Q3 | Are there other callers/branches relying on a child-at-top + parentSession shape? | Answered | No production code reads `topState.parentSession` to identify the dispatching meta — `parentSession` is used by `parentChainDepth` (session.schema.ts:215, a structural metric) and `start_session` trace correlation (resource-tools.ts:324). The meta-dispatch tests assert the contract shape (see Test Surface). |
| Q4 | Does any other code path call `lookupTransientSlugByFolder`? | Answered | Single production caller: the transient branch (`resource-tools.ts:413`), as the second-precedence slug source behind the explicit `planning_slug` argument. Verified 2026-06-18. |
| Q5 | Is `discardTransient` called from anywhere on the dispatch path? | Answered | No. The transient branch calls `redirectTransientToWorkspace` (resource-tools.ts:445). `discardTransient` (store.ts:820) has no production caller; it appears only in test comments. |
| Q6 | Does the promoted-meta's `session_index` survive promotion, and how? | Answered | Yes — `redirectTransientToWorkspace` (store.ts:847) repoints the existing `transientFolderByIndex` entry from the tmp folder to the promoted workspace folder, so the orchestrator's original index keeps authenticating for the lifetime of the process. Covered by the regression test at mcp-server.test.ts:1715-1746. The in-memory redirect is process-lifetime only — a server restart loses it; the promoted folder is then re-resolved by slug via `start_session`. Not yet exercised by a test. |

---
*This artifact is scoped to the defect-fix work package; it is not intended to be a comprehensive comprehension of the dispatch subsystem.*
