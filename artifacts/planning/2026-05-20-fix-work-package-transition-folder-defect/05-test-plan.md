# Test Plan — Fix Work Package Transition Folder Defect

**Created:** 2026-05-20
**Activity:** plan-prepare
**Status:** Complete — test source links finalised at completion time.
**Scope:** Defect-fix. Reuses the existing test surface — no new test files.

> **Source-file note (added at `complete`):** Line numbers in the test cases below correspond to the test file as authored at plan time. The defect-encoding tests grew during the rewrite (TC-1 added tmp-snapshot/discard assertions; TC-2 became the longer recursive walk), so the on-disk line numbers in [`tests/mcp-server.test.ts`](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts) at HEAD are:
>
> - TC-1 → [tests/mcp-server.test.ts#L1568-L1645](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1568-L1645) (`it('meta sessions live in os.tmpdir() …')`).
> - TC-2 → [tests/mcp-server.test.ts#L1647-L1730](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1647-L1730) (`it('three-level dispatch (A → B → C → D) …')`).
> - TC-3 → unchanged persistent-parent regression suite at [tests/mcp-server.test.ts#L1541-L1566](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1541-L1566), [#L1847-L1887](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1847-L1887), [#L1912-L1959](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1912-L1959), [#L1961-L1993](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1961-L1993).

---

## Strategy

The defect lives in one code branch and has two existing tests that encode the buggy behaviour. The test plan is correspondingly tight:

1. **Update the two defect-encoding tests** to assert the documented contract (covered as Tasks 2 and 3 in the work-package plan).
2. **Rely on the four already-correct persistent-parent tests** (`:1847-1993`) as untouched regression coverage for branch B.
3. **One manual reproduction check** to confirm the symptom is gone end-to-end with no user-supplied slug (the case that originally surfaced the bug).

No new automated tests are added. The transient-parent branch's new shape is identical to the persistent-parent branch's shape, which is already covered by the existing persistent-parent assertions; the two updated tests provide the transient-specific coverage (folder promotion + tmp discard).

---

## Test Cases

### TC-1 — Meta-to-child dispatch produces the contract shape (updated existing test)

**File:** `tests/mcp-server.test.ts`, `:1568-1613`.

**Purpose:** Lock the transient-parent branch to the documented `handle-sub-workflow` contract.

**Setup:** `start_session({ workflow_id: 'meta', planning_slug: 'meta-bootstrap' })` → transient meta in tmpdir. Then `dispatch_child({ workflow_id: 'work-package' })`.

**Assertions (post-fix):**

| # | Assertion | Why |
|---|---|---|
| 1 | The workspace folder `<workspaceDir>/.engineering/artifacts/planning/meta-bootstrap/` exists. | Promotion happened (slug pass-through). |
| 2 | `session.json` + `.session-token` exist in that folder. | Sealed file pair written. |
| 3 | `topState.workflowId === 'meta'`. | Parent stays at the top. |
| 4 | `topState.parentSession` is undefined. | Meta is the root; nothing above it. |
| 5 | `topState.triggeredWorkflows.length === 1`. | Child registered. |
| 6 | `topState.triggeredWorkflows[0].workflowId === 'work-package'`. | Correct child id at the ref. |
| 7 | `topState.triggeredWorkflows[0].state.workflowId === 'work-package'`. | Child SessionFile embedded. |
| 8 | `topState.triggeredWorkflows[0].sessionIndex` equals the response's `session_index`. | Index round-trips. |
| 9 | The original transient `/tmp` folder no longer exists. | `discardTransient` ran. |

**Pre-fix expected:** Assertions 3-9 fail; 1-2 pass.

### TC-2 — Three-level chain layout (updated existing test)

**File:** `tests/mcp-server.test.ts`, `:1615-1661`.

**Purpose:** Lock the recursive `triggeredWorkflows[N].state` embedding shape when the chain root is a transient meta.

**Setup:** Chain meta (transient, slugA = `chain-a`) → work-package → remediate-vuln → prism-update via successive `dispatch_child` calls.

**Assertions (post-fix):**

| # | Assertion | Why |
|---|---|---|
| 1 | The top-level `session.json` lives at `<workspaceDir>/.engineering/artifacts/planning/chain-a/`. | Slug pass-through (user supplied it). |
| 2 | `topState.workflowId === 'meta'`. | Meta is root. |
| 3 | `topState.parentSession` is undefined. | Meta has no parent. |
| 4 | `topState.triggeredWorkflows[0].state.workflowId === 'work-package'`. | B embedded under meta. |
| 5 | `topState.triggeredWorkflows[0].state.triggeredWorkflows[0].state.workflowId === 'remediate-vuln'`. | C embedded under B. |
| 6 | `topState.triggeredWorkflows[0].state.triggeredWorkflows[0].state.triggeredWorkflows[0].state.workflowId === 'prism-update'`. | D embedded under C. |

**Pre-fix expected:** Assertions 2, 3, 4 fail (the current shape has work-package at top with meta in parentSession). 5-6 may already pass since the persistent-parent embedding inside B was correct.

### TC-3 — Persistent-parent regression (unchanged existing tests)

**Files:** `tests/mcp-server.test.ts` at `:1541-1566`, `:1847-1887`, `:1912-1959`, `:1961-1993`.

**Purpose:** Ensure the persistent-parent branch is structurally unchanged — these tests should pass before and after the fix.

**Action:** No code changes. Run `npm test`; confirm green.

### TC-4 — Manual reproduction with no user-supplied slug

**Purpose:** Cover the derived-slug fallback path (the original symptom — `transition-<uuid>` left behind).

**Steps:**

1. From the workspace root, invoke `start_session({ workflow_id: 'meta', agent_id: 'orchestrator' })` with **no** `planning_slug`. Capture the returned `session_index`.
2. Invoke `dispatch_child({ session_index: <meta_idx>, workflow_id: 'work-package' })`.
3. Inspect:
   - `ls .engineering/artifacts/planning/` — there should be exactly one new folder, named `YYYY-MM-DD-work-package` (today's date).
   - No `transition-<uuid>` folder remains under the workspace planning root.
   - `cat .engineering/artifacts/planning/YYYY-MM-DD-work-package/session.json` shows `workflowId: "meta"` at top and `workflowId: "work-package"` under `triggeredWorkflows[0].state`.
   - No `workflow-server-transient-*` folder remains under `os.tmpdir()`.

**Pre-fix expected:** A `transition-<uuid>` folder is created and persists; its `session.json` has `workflowId: "work-package"` at top with `parentSession.workflowId: "meta"`.

---

## Coverage Summary

| Concern | Covered by |
|---|---|
| Promoted-slug folder name (user-supplied case) | TC-1 (slug = `meta-bootstrap`), TC-2 (slug = `chain-a`). |
| Promoted-slug folder name (derived fallback case) | TC-4 (manual). |
| Meta-at-top / child-under-triggeredWorkflows[0].state | TC-1, TC-2, TC-4. |
| Tmp folder discarded post-dispatch | TC-1, TC-4. |
| `parentSession` not populated on the child entry | TC-1 (`topState.parentSession` undefined; child sits under triggeredWorkflows, not parentSession). |
| Recursive embedding for chained dispatches | TC-2. |
| No regression on the persistent-parent branch | TC-3. |

---

## Out of scope

- Re-enabling the `dispatch depth > 5` soft-warn test (existing skip, pre-existing TODO).
- Migration tests for legacy buggy on-disk shapes (no migration is being implemented).
- Property-based or fuzz tests (overkill for a localised defect).
- New unit tests of `ensurePlanningFolder` / `discardTransient` / `lookupTransientSlugByFolder` — these helpers are already exercised transitively and were not changed.
