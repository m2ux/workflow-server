# Dispatch Child — Transient Parent Path — Comprehension Artifact

> **Last updated**: 2026-05-20
> **Work package**: `2026-05-20-fix-work-package-transition-folder-defect`
> **Coverage**: The transient-parent branch of `dispatch_child` (the defect site), its supporting session-store helpers, the documented contract it violates, and the existing test surface.
> **Related artifacts**: [hierarchical-dispatch.md](hierarchical-dispatch.md) (legacy `start_session` + `parent_session_token` design — predates `dispatch_child` and does not cover the embedded-state model).

## Scope note

This is a narrowly-scoped comprehension artifact for a defect-fix work package, per user direction: "this is a simple task, keep the activities simple". It covers only the code paths, helpers, and tests needed to understand the two defects already localised in the design-philosophy and assumptions log. It is **not** a broad architectural deep-dive of session management or the dispatch system.

## The Defect Site

The fix lives in a single branch inside `dispatch_child` at `src/tools/resource-tools.ts:283-308` — the `parentIsTransient` branch. Two defects in one branch:

1. **Slug not promoted.** The child workspace folder reuses the transient slug verbatim (`lookupTransientSlugByFolder(parentFolder) ?? '${workflowId}-${YYYY-MM-DD}'` — line 289-290). When the meta session was started without a user-supplied `planning_slug`, that slug is `transition-<uuid>`, and the workspace folder inherits that name.
2. **Inverted parent/child nesting.** The child is written at the *top level* of `session.json` with the parent meta snapshot stuffed into `parentSession` (line 298). The documented contract is the opposite: child embedded under `parent.triggeredWorkflows[N].state`, parent remains top level.

Tool description at `resource-tools.ts:261-264` explicitly documents this as a "special case", so the current behaviour is intentional code — but the user's framing of this as a defect makes the documented contract authoritative.

## Code Path

### Entry point

`server.registerTool('dispatch_child', …)` at `src/tools/resource-tools.ts:257-345`.

Top-level flow (line 271-279):

```
loadSessionForTool(workspaceDir, session_index) → loaded
parentFolder         = loaded.folderAbsPath
parentIsTransient    = isTransientFolder(parentFolder)
loadWorkflow(child_workflow_id) → child workflow version
```

Then two branches.

### Branch A — Transient parent (the defect site) — `:283-308`

```ts
if (parentIsTransient) {
  const parentSlug = lookupTransientSlugByFolder(parentFolder)
    ?? `${loaded.state.workflowId}-${new Date().toISOString().slice(0, 10)}`;
  const childFolder       = await ensurePlanningFolder(config.workspaceDir, parentSlug);
  const childSessionIndex = await computeSessionIndex(childFolder);
  const childInitial      = createInitialSessionFile({
    sessionIndex:     childSessionIndex,
    workflowId:       workflow_id,        // ← child workflow id
    workflowVersion:  effectiveWorkflowVersion,
    agentId:          agent_id,
    parentSession:    loaded.state,        // ← meta snapshot demoted here
  });
  await writeSessionFile(childFolder, childInitial);  // ← child written at TOP level
  await discardTransient(parentFolder);
  // returns child session_index + planning_slug
}
```

This shape on disk:

```
session.json (top)
├─ workflowId: "work-package"           ← child
├─ parentSession:
│  └─ workflowId: "meta"                ← parent demoted
└─ triggeredWorkflows: []                ← empty
```

The documented contract requires the inverse — meta at top, work-package under `triggeredWorkflows[0].state`. The folder name is also the wrong slug shape (transient or workflow-derived, not a dated work-package slug).

### Branch B — Persistent parent (correct, working) — `:310-343`

The contract-honouring branch. Lives on the same handler:

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

This is the shape the fix must produce *also* when the parent is transient.

## Key Helpers (Session Store)

All in `src/utils/session/store.ts`:

| Helper | Purpose | Line |
|---|---|---|
| `isTransientFolder(folder)` | Returns true if `folder` lives under the `os.tmpdir() / workflow-server-transient-<uuid>/` prefix. | 798 |
| `lookupTransientSlugByFolder(folder)` | Reverse-lookup the slug a transient folder was registered under; returns `undefined` if none. | 790 |
| `lookupTransientBySlug(slug)` | Forward lookup, returns folder or `undefined`. | 785 |
| `createTransientFolder()` | Mkdir under `os.tmpdir()/workflow-server-transient-<uuid>/`. | 772 |
| `registerTransient(idx, folder, slug?)` | Adds to the two in-memory maps (`transientFolderByIndex`, `transientFolderBySlug`). | 779 |
| `discardTransient(folder)` | Removes registry entries and `rm -rf` the folder. Best-effort. No-op if not transient. | 807 |
| `ensurePlanningFolder(workspace, slug)` | `mkdir -p <workspace>/.engineering/artifacts/planning/<slug>` mode 0700. Validates slug shape. Idempotent. | 727 |
| `findPlanningFolderBySlug(workspace, slug)` | Walks the planning root looking for a folder named `slug` that contains a `session.json`. Returns undefined if no match, throws COLLISION on multiple. | 676 |
| `writeSessionFile(folder, state)` | Canonicalise → seal → atomic-write `session.json` + `.session-token`. | 308 |

The fs `rename` primitive is bound to a small adapter (`fsAdapter.rename`, line 23) that tests can substitute — useful for the EXDEV fallback path, not load-bearing for the fix itself.

**There is no existing helper that renames a planning folder.** A folder promotion (rename transient → workspace, or rename transient-slug → dated-slug) is currently done by *creating* a new folder via `ensurePlanningFolder` and discarding the old one (the existing transient-parent branch does this). No "rename in place" path exists today.

### Session schema relevant fields

In `src/schema/session.schema.ts`:

- `SessionFile.triggeredWorkflows: EmbeddedSessionRef[]` (line 120, 146) — array of child entries; `state` field of each is a full embedded `SessionFile` (via `z.lazy`).
- `SessionFile.parentSession?: SessionFile` (line 147, 156) — recursive upward link, optional.
- `createInitialSessionFile({ sessionIndex, workflowId, workflowVersion, agentId, parentSession? })` (line 219-249) — minimal valid fresh file. Sets `parentSession` only if supplied. Initialises `triggeredWorkflows: []`.
- `EmbeddedSessionRefSchema` (line 163-175) — shape: `{ workflowId, sessionIndex, triggeredAt, triggeredFrom: { activityId, stepIndex? }, status, completedAt?, returnedContext?, state? }`. The fix must construct one of these for the meta→work-package case.

### Resolver helpers (`src/utils/session/resolver.ts`)

- `loadSessionForTool(workspace, idx)` → `{ state, folderAbsPath, bytes, jsonPath, topState }`. For a transient session, `folderAbsPath` is the `/tmp` folder and `jsonPath` is `[]`.
- `advanceSession(state, mutate?)` — bumps seq/ts, deep-clones, runs mutator.
- `saveSessionForTool(loaded, newState)` — writes `newState` back, slotting it into `loaded.topState` at `loaded.jsonPath` if non-empty.
- `replacePath(root, jsonPath, newSubState)` — pure, used by `saveSessionForTool`.
- `navigatePath(root, jsonPath)` — pure, used by `loadSessionForTool`.

These already support every operation the fix needs; the fix is purely about rearranging the call sequence in branch A.

## Documented Contract (What the Fix Targets)

`workflows/meta/skills/00-workflow-engine.toon` line 174-185, operation `handle-sub-workflow`:

```
handle-sub-workflow:
  description: "Dispatch a child workflow under the current session as its parent."
  inputs[2]:
    - parent_session_index: "The current session's session_index — passed to the server
        so it can append the child under the parent's triggeredWorkflows[] with the
        child's SessionFile embedded inline"
    - workflow_id: "Child workflow ID"
  output[1]:
    - child_session_index: "The 6-character base32 session_index of the newly created
        child session"
  procedure[1]:
    - "Call dispatch_child({ session_index: <parent_session_index>, workflow_id: <child
        workflow id>, agent_id: 'workflow-orchestrator' }); capture child_session_index
        from the response. The child SessionFile is embedded under
        parent.triggeredWorkflows[N].state in the top-level session.json — no
        separate child folder."
```

The contract: child embedded under `parent.triggeredWorkflows[N].state`. No special case for transient parents is mentioned. The persistent-parent branch already implements this contract; the transient-parent branch must converge to the same shape, with the additional requirement that the planning folder be promoted to a dated work-package slug.

## On-Disk Evidence

The current planning folder demonstrates the defect:

`/home/mike1/projects/main/workflow-server/.engineering/artifacts/planning/2026-05-20-fix-work-package-transition-folder-defect/session.json`:

- Top-level `workflowId: "work-package"` (child).
- `parentSession.workflowId: "meta"` (parent demoted).
- The folder name `2026-05-20-fix-work-package-transition-folder-defect` looks correct here only because the user supplied an explicit `planning_slug` to `start_session`. When the slug is omitted, the slug remains `transition-<uuid>`.

## Test Surface

All in `tests/mcp-server.test.ts`:

| Test | Lines | Status under fix |
|---|---|---|
| `dispatch_child returns a distinct session_index than the parent` | 1541-1566 | Should still pass — does not assert on shape. |
| `meta sessions live in os.tmpdir() (not the workspace) and are discarded when a child captures them` | 1568-1613 | **Encodes the defect.** Asserts `childWorkspaceFolder` reuses meta's slug verbatim. Will need rewriting to assert the promoted-slug + nested-shape contract. |
| `three-level dispatch (A → B → C → D) records the full chain in D's session.json` | 1615-1661 | **Encodes the defect.** Asserts `topState.workflowId === 'work-package'` and `topState.parentSession?.workflowId === 'meta'` at lines 1654-1656. Will need flipping: top should be meta, child should be under `triggeredWorkflows[0].state`. C and D embedding under B's array is already correct. |
| `dispatch depth > 5 emits a soft warning in _meta.validation` | 1663-1684 | Skipped — TODO acknowledges the rework is pending for the embedded-state design. Unaffected. |
| `dispatch_child embeds the child SessionFile under parent.triggeredWorkflows[N].state and returns its session_index` | 1847-1887 | Persistent-parent path. Should be unaffected — already exercises the correct branch. Provides the assertion template for the fix's rewritten transient-parent tests. |
| `dispatch_child embeds the child inline under parent.triggeredWorkflows[N].state` | 1912-1959 | Same — persistent parent. Unaffected. |
| `mutations through a child session_index land in the embedded state (not in a separate file)` | 1961-1993 | Persistent parent. Unaffected. Useful as a template for verifying the post-fix transient case still mutates correctly. |

Two test categories will need updating: the meta-dispatch tests at lines 1568-1613 and 1615-1661 must invert their expectations to the contract shape. The persistent-parent tests are already correct and serve as the assertion template.

### Test conventions

- Tests use `client.callTool({ name, arguments })` against an in-process MCP client.
- Each test owns a unique slug; the workspaceDir is a shared per-suite tmp.
- On-disk verification uses `JSON.parse(readFileSync(join(workspaceDir, '.engineering/artifacts/planning', slug, 'session.json'), 'utf8'))`.
- No fixtures beyond the workflow definitions in `workflows/`.

## Edges & Caveats

1. **What if `planning_slug` was explicitly supplied to `start_session`?**
   `start_session` line 113: `const slug = planning_slug ?? \`transition-${randomUUID()}\``. When supplied, the slug is the user's choice (e.g., `2026-05-20-fix-work-package-transition-folder-defect`). For meta, that supplied slug is still registered in `transientFolderBySlug` (line 203), so `lookupTransientSlugByFolder` returns it. **The current branch already uses the user-supplied slug as the workspace folder name** — the problem is only that the slug is *transient-<uuid>* when the user supplies nothing. The fix needs to derive a slug only in the no-user-supplied case, or always derive a dated slug regardless.

2. **What if the meta session is already promoted (workspace folder, not transient)?**
   Cannot happen. `start_session` only mints a transient folder when `workflow_id === 'meta'` AND no existing workspace folder for the slug AND no existing transient (line 117-124). Once a workspace folder exists, `parentIsTransient` is false and branch B runs.

3. **Existing buggy sessions on disk.**
   A6 in the assumptions log: forward-behaviour fix only, no migration. Existing top-level `workflow-package`-at-top files remain readable because `parentSession` is a valid optional field per the schema. The fix changes future writes, not past ones.

4. **The `parentSession` field doesn't go away entirely.**
   It remains valid for the legacy `start_session(parent_session_token=…)` flow (see [hierarchical-dispatch.md](hierarchical-dispatch.md)) and for the parent-chain-depth defence. The fix removes its use **on the transient-parent branch of `dispatch_child` only**.

5. **Slug derivation is a UX choice the user must confirm.**
   Per A5 in the assumptions log: the dated-slug shape (e.g., `YYYY-MM-DD-<workflow-id>` vs. `YYYY-MM-DD-<workflow-id>-<short-uuid>` vs. user-supplied descriptor) is open. The current `\`${workflowId}-${YYYY-MM-DD}\`` fallback at line 290 (no slash, no day prefix) shows what the code can already build, but the actual chosen shape is a plan-prepare decision.

6. **`discardTransient` ordering.**
   Currently called *after* the child file is written (line 303). The fix must preserve that ordering: the meta snapshot must be captured into the top file before the transient folder is reaped.

## Domain Concept Mapping

| Term | Technical construct |
|---|---|
| Transient parent | A `meta` session bootstrapped via `start_session` without a workspace folder; lives at `os.tmpdir()/workflow-server-transient-<uuid>/`. |
| Promotion | The act of renaming/migrating a planning folder from a transient or transient-named slug to a stable dated workspace slug. *No existing helper performs this in a single step.* |
| Embedded child | A `SessionFile` stored inline under `parent.triggeredWorkflows[N].state` rather than in its own folder. The current model since the dispatch_child redesign. |
| Special case (transient) | The branch at `resource-tools.ts:283-308` that diverges from the embedded-child contract specifically when the parent is transient. The defect site. |
| Contract violation | The child-at-top, parent-as-`parentSession` shape that the transient-parent branch produces. |

## Open Questions

All questions raised during this comprehension were resolved by reading the code and the contract. Outstanding *design* questions (slug naming convention, retroactive migration) are tracked in `01-assumptions-log.md` for plan-prepare; they are not codebase comprehension gaps.

| # | Question | Status | Resolution |
|---|---|---|---|
| Q1 | Does a "rename folder in place" helper exist in the session store? | Resolved | No. The store has `mkdir`/`rm` primitives and `ensurePlanningFolder`; folder transitions are achieved by create-new + discard-old. The fix can follow that idiom (create dated workspace folder, write meta + embedded child, discard transient) or introduce a rename helper — a plan-prepare decision. |
| Q2 | Does the fix require schema changes? | Resolved | No (A6 in assumptions log). `triggeredWorkflows[N].state` and `parentSession?` are both already valid schema constructs; the fix only changes which one is populated in the transient-parent branch. |
| Q3 | Are there other callers/branches relying on the current child-at-top + parentSession shape? | Resolved | Only the two tests at lines 1568-1661 of `mcp-server.test.ts` (already enumerated above). No production code reads `topState.parentSession` to identify the dispatching meta — `parentSession` is only used by `parentChainDepth` (a structural metric) and `start_session` trace correlation (line 220). The fix's new shape preserves both signals via `triggeredWorkflows[0].state.parentSession` (or by omitting parentSession entirely if depth tracking moves to triggeredWorkflows nesting per the TODO at line 1676-1683). |
| Q4 | Does any other code path call `lookupTransientSlugByFolder`? | Resolved | Single caller: the defect branch itself (`resource-tools.ts:289`). The fix can rework or remove the call freely. |
| Q5 | Is `discardTransient` called from anywhere else? | Resolved | Single caller: the defect branch (`resource-tools.ts:303`). Same freedom. |

---
*This artifact is scoped to the defect-fix work package; it is not intended to be a comprehensive comprehension of the dispatch subsystem.*
