# Work Package Plan — Fix Work Package Transition Folder Defect

**Created:** 2026-05-20
**Activity:** plan-prepare
**Status:** Draft (pending approach-confirmed checkpoint)
**Scope:** Defect-fix, simple complexity. Per user direction: keep tasks tight and small.

---

## Goal

Make `dispatch_child`'s transient-parent branch (the `parentIsTransient` arm at `src/tools/resource-tools.ts:283-308`) honour the same on-disk shape as the persistent-parent branch:

- Meta parent at the top of `session.json`.
- Child embedded under `parent.triggeredWorkflows[N].state`.
- Planning folder named with a stable, dated slug — never `transition-<uuid>`.

The persistent-parent branch at `:310-343` is the reference implementation. The fix converges branch A onto branch B's shape, with one extra concern: folder promotion off the transient slug.

---

## Design Note — Slug Derivation

The transient slug needs to become a stable workspace slug. Three options were considered (see `01-assumptions-log.md` A5):

| Option | Behaviour | Trade-off |
|---|---|---|
| A. `YYYY-MM-DD-<child-workflow-id>` always | Server derives a dated slug from the child workflow id (e.g. `2026-05-20-work-package`). | Simple, deterministic. Two work-packages started on the same day would collide. |
| B. Pass through user-supplied slug; fall back to A | If `start_session({ planning_slug })` was called with an explicit slug (recorded in the transient registry), reuse it. Otherwise derive `YYYY-MM-DD-<child-workflow-id>`. | Matches today's behaviour for the common explicit-slug case; only the no-slug case needs a derived fallback. |
| C. Defer naming to the child workflow | Use the derived slug initially, let `start-work-package::compute-canonical-target-path` rename later. | Requires a new folder-rename helper in the session store; broadens scope. |

**Selected: Option B** — pass through user-supplied slug; fall back to `YYYY-MM-DD-<child-workflow-id>` when none. Reasons:

- This is what the current branch already does in the common case (the user-supplied slug today is preserved verbatim). The only new behaviour is the fallback shape.
- No new helper required — `ensurePlanningFolder` + `discardTransient` already handle "create new folder, drop old one".
- Collision risk on the derived path is bounded (same workflow id, same day, no user-supplied slug) and `ensurePlanningFolder` is idempotent; if a name collision were to occur in practice, that is a separate concern best surfaced through `findPlanningFolderBySlug`'s existing COLLISION error.
- Renaming under user-meaningful names is left to whichever workflow has that information later. No folder-rename helper is added in this work package.

Open caveat: existing buggy sessions already on disk are **not** migrated (A6). Forward behaviour only.

---

## Tasks

Total: **5 tasks**, all small. Estimates are agentic time + separate human review time.

### Task 1 — Rewrite the transient-parent branch of `dispatch_child`

**Effort:** 30-45m agentic, 10-15m review.

**Location:** `src/tools/resource-tools.ts:283-308`.

**Change:** Replace the branch body so it:

1. Computes the promoted slug per Option B above: `lookupTransientSlugByFolder(parentFolder) ?? \`${new Date().toISOString().slice(0, 10)}-${workflow_id}\``. Note the date-first format (`YYYY-MM-DD-<workflow-id>`), reversing today's `workflow-id-YYYY-MM-DD`.
2. Calls `ensurePlanningFolder(config.workspaceDir, promotedSlug)` to materialise the workspace folder for the meta session (not the child).
3. Constructs the parent's next state by snapshotting `loaded.state` (the meta state) and pushing a fresh `triggeredWorkflows[0]` entry with the child's `createInitialSessionFile({...})` embedded under `.state`. Mirror branch B's shape exactly — same fields on the embedded entry (`workflowId, sessionIndex, triggeredAt, triggeredFrom, status: 'running', state`) and the same `history.push({ type: 'workflow_triggered', ... })` event.
4. The child's `session_index` is derived via `computeEmbeddedSessionIndex(promotedWorkspaceFolder, ['triggeredWorkflows', 0, 'state'])` — the same primitive branch B uses.
5. Writes the new top-level file via `writeSessionFile(promotedWorkspaceFolder, parentNext)`. **Do NOT** populate `parentSession` on the child; it is omitted (matches branch B).
6. Calls `discardTransient(parentFolder)` last, after the new file is durable on disk.
7. Returns the response shape branch B uses — `{ session_index: childSessionIndex, workflow: { id, version } }` — but additionally includes `planning_slug: promotedSlug` since callers of the transient-parent path rely on it (the current branch returns it; preserve that for backward compatibility).

**Update the tool description** at `:261-264` to drop the "child becomes a new top-level workspace folder rather than nesting inside the parent" language; under the new behaviour, the transient case mirrors the persistent case structurally. The single remaining distinguishing trait is folder promotion (slug rename + meta workspace materialisation).

**Done when:** The transient and persistent branches produce structurally identical on-disk shapes (parent at top, child under `triggeredWorkflows[0].state`); the only difference is that the transient branch additionally promotes the folder and discards the tmp directory.

### Task 2 — Update `meta-sessions-tmpdir` test to assert the contract shape

**Effort:** 15-25m agentic, 5-10m review.

**Location:** `tests/mcp-server.test.ts:1568-1613` (`meta sessions live in os.tmpdir() ... and are discarded when a child captures them`).

**Change:** Keep the meta-folder-is-transient assertions intact. After the `dispatch_child` call, replace the existing assertions about the child workspace folder reusing the meta slug with:

- The promoted folder exists and contains a `session.json` + `.session-token`.
- The top-level `workflowId` in that `session.json` is `meta` (not `work-package`).
- The top-level `parentSession` field is absent (the meta is the root, nothing above it).
- `triggeredWorkflows.length === 1`; entry 0 has `workflowId: 'work-package'`, `sessionIndex` matching the response's `session_index`, `status: 'running'`, `state.workflowId === 'work-package'`.
- The original `/tmp` folder for the meta is gone (use `existsSync` on the transient path resolver — preserve the existing tmp-discard assertion if present, add it if not).

Use the persistent-parent embedding test at `:1847-1887` as the assertion template.

**Done when:** Test name still reads naturally; assertions encode the documented contract; test fails against the pre-fix code and passes against the post-fix code.

### Task 3 — Update the three-level dispatch chain test

**Effort:** 15-25m agentic, 5-10m review.

**Location:** `tests/mcp-server.test.ts:1615-1661` (`three-level dispatch (A → B → C → D) records the full chain in D's session.json`).

**Change:** The chain is meta (transient) → work-package (B) → remediate-vuln (C) → prism-update (D). With the fix:

- The top-level `session.json` at `slugA` is owned by the **meta** session, not B.
- `topState.workflowId === 'meta'` (was `'work-package'`).
- `topState.parentSession` is **undefined** (was `{ workflowId: 'meta' }`).
- B lives under `topState.triggeredWorkflows[0].state` — assert `topState.triggeredWorkflows[0].state.workflowId === 'work-package'`.
- C lives under `topState.triggeredWorkflows[0].state.triggeredWorkflows[0].state` — assert `workflowId === 'remediate-vuln'`.
- D lives one level deeper — assert `topState.triggeredWorkflows[0].state.triggeredWorkflows[0].state.triggeredWorkflows[0].state.workflowId === 'prism-update'`.

Update the comment block above the test (currently "Layout: ... B becomes the workspace root at slugA") to reflect that the meta now remains the workspace root.

**Done when:** The chain assertions walk `triggeredWorkflows[0].state` four deep from meta to prism-update; test fails against the pre-fix code and passes against the post-fix code.

### Task 4 — Sanity-check unaffected tests

**Effort:** 10m agentic. No code changes expected.

Run `npm test` after Tasks 1-3 land and confirm:

- Persistent-parent tests at `:1847-1993` continue to pass (they should — they exercise branch B, which is unchanged).
- The skipped `dispatch depth > 5` test at `:1663-1684` remains skipped (its rework is out of scope).
- The `dispatch_child returns a distinct session_index than the parent` test at `:1541-1566` passes (it does not assert on shape).

If any unaffected test fails, treat it as a regression in the fix and revisit Task 1.

**Done when:** Full `npm test` is green; no skips other than the pre-existing depth-test skip.

### Task 5 — Manual reproduction check

**Effort:** 10m manual.

Reproduce the original symptom by starting a meta session with no `planning_slug` and dispatching a child; verify on disk that:

- The workspace planning folder is named `YYYY-MM-DD-work-package` (today's date), not `transition-<uuid>`.
- The folder's `session.json` has meta at top and work-package embedded under `triggeredWorkflows[0].state`.
- The original `/tmp/workflow-server-transient-<uuid>/` folder is gone after dispatch.

**Done when:** Manual reproduction confirms the documented contract on a fresh run.

---

## Out of scope

- Schema changes to `session.json` (A6 — none required).
- Migrating pre-existing buggy folders on disk to the new shape (A6 — forward-behaviour fix only).
- Adding a folder-rename helper to the session store (Option C — not needed for this fix).
- Reworking the `dispatch depth > 5` soft-warn test (acknowledged TODO in that test; tracked separately).
- Touching the persistent-parent branch (`:310-343`) — that branch is correct.

---

## Dependencies

None. The fix touches one source file and two test cases; both already exist; no new helpers needed.

---

## Risks & Mitigations

| Risk | Likelihood | Mitigation |
|---|---|---|
| `computeEmbeddedSessionIndex` returns a different index than the current branch's `computeSessionIndex(childFolder)`, breaking external callers that cache the child index. | Low | The current returned index is the response payload's `session_index`; no external persistence of it predates the dispatch call. The new index derivation is the same as branch B already uses for persistent parents — consistent. |
| Slug collision on the derived `YYYY-MM-DD-<workflow-id>` fallback path. | Low | Only matters when no `planning_slug` was supplied; `findPlanningFolderBySlug`'s existing COLLISION error surfaces it. Not changed by this fix. |
| Tests inadvertently relied on the inverted shape in helper utilities. | Low | The comprehension artifact's test table (Q3) enumerates all tests that read `parentSession` or `triggeredWorkflows` — only the two flagged tests touch the relevant shape; the rest are template-aligned to branch B already. |

---

## References

- `01-design-philosophy.md` — problem framing, classification, workflow path.
- `01-assumptions-log.md` — A4 (localised to two files), A5 (slug naming — resolved here), A6 (no migration).
- `comprehension/dispatch-child-transient-parent.md` — defect site, helpers, contract, test surface.
- `src/tools/resource-tools.ts:283-308` — defect branch.
- `src/tools/resource-tools.ts:310-343` — reference branch (persistent parent).
- `workflows/meta/skills/00-workflow-engine.toon` lines 174-185 — the documented contract.
