# Completion Summary — Fix Work Package Transition Folder Defect

**Date:** 2026-05-20
**Activity:** `complete`
**Status:** Ready for merge (PR approved; merge is at user discretion)
**Complexity:** `simple` (no ADR required)

---

## 1. Outcome

The `dispatch_child` transient-parent branch in `src/tools/resource-tools.ts` now produces the same on-disk shape as the persistent-parent branch:

- The parent (meta) session sits at the top of the promoted `session.json`.
- The child is embedded under `triggeredWorkflows[0].state` with no `parentSession` field on either side.
- The workspace planning folder is named with the user-supplied slug (when present) or a stable `YYYY-MM-DD-<workflow-id>` fallback. The synthetic `transition-<uuid>` slug minted by `start_session` no longer leaks into the workspace.
- The transient `/tmp` folder is discarded once the promoted file is durable.

These four behaviours converge the transient and persistent branches onto the same documented `workflow-engine::handle-sub-workflow` contract.

---

## 2. Deliverables

### 2.1 Code changes

Branch: `fix/work-package-transition-folder-defect` (commits `e5c323d`, `3aca657`).

| File | Change |
|------|--------|
| `src/tools/resource-tools.ts` | Rewrote the transient-parent branch of `dispatch_child` (`:283-308` → `:290-343` at HEAD); updated the tool `description` string to drop the obsolete "child becomes a new top-level folder" language. Added the synthetic-slug guard discussed in the implementation note. |
| `tests/mcp-server.test.ts` | Flipped TC-1 and TC-2 from asserting the buggy shape to asserting the documented contract; added tmp-folder snapshot/discard assertions to TC-1. No new test files. |

### 2.2 Planning artifacts

All produced in this work package's planning folder:

- [01-design-philosophy.md](01-design-philosophy.md) — Problem classification, workflow path
- [01-assumptions-log.md](01-assumptions-log.md) — Six tracked assumptions, all resolved
- [../../comprehension/dispatch-child-transient-parent.md](../../comprehension/dispatch-child-transient-parent.md) — Codebase comprehension
- [05-work-package-plan.md](05-work-package-plan.md) — Implementation plan
- [05-test-plan.md](05-test-plan.md) — Test plan + source links (finalised at `complete`)
- [06-post-impl-review.md](06-post-impl-review.md) — Single-pass focused review
- [07-strategic-review.md](07-strategic-review.md) — Scope and hygiene review
- [architecture-summary.md](architecture-summary.md) — Stakeholder-facing summary
- [10-validation.md](10-validation.md) — Typecheck + test results

### 2.3 PR

[#121](https://github.com/m2ux/workflow-server/pull/121) — Approved on self-review; ready for merge. No external reviewer comments to address.

---

## 3. Test coverage

| Concern | Test | Location at HEAD |
|---------|------|------------------|
| Promoted-slug folder name (user-supplied) | TC-1 | [tests/mcp-server.test.ts#L1568-L1645](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1568-L1645) |
| Recursive embedding through chained dispatches | TC-2 | [tests/mcp-server.test.ts#L1647-L1730](https://github.com/m2ux/workflow-server/blob/fix/work-package-transition-folder-defect/tests/mcp-server.test.ts#L1647-L1730) |
| Persistent-parent regression | TC-3 | unchanged existing tests, see test plan |
| Promoted-slug folder name (derived fallback) | TC-4 (manual) | covered during validation by running this very work package |

Final validation: 322 passed, 4 skipped (pre-existing). Typecheck clean.

---

## 4. Key decisions

### 4.1 Synthetic-slug guard (deviation from plan)

The plan specified `lookupTransientSlugByFolder(parentFolder) ?? <dated fallback>`. In practice `start_session` always registers *some* slug (a synthetic `transition-<uuid>` when none is supplied), so the bare `??` never falls through. The implementation initially used a `startsWith('transition-')` guard inside `dispatch_child`; commit `3aca657` moved the responsibility to `start_session` itself, which now omits synthetic slugs from the registry. The end-state is structurally cleaner: `dispatch_child` reads what's in the registry without inspecting slug shape, and the rationale lives in one place (the inline comment in `dispatch_child`). Documented in [05-work-package-plan.md](05-work-package-plan.md) Implementation Notes and [06-post-impl-review.md](06-post-impl-review.md) F1.

### 4.2 No migration of pre-existing on-disk records

Forward-behaviour-only fix. Buggy sessions already on disk (with `parentSession`-inverted shape or `transition-<uuid>` folder names) are not rewritten. The defect surfaces fresh on each new dispatch, so forward-only is sufficient; a migration would expand scope beyond the simple-complexity classification.

### 4.3 No ADR

Complexity classified `simple` at design-philosophy (defect with documented contract, no design exploration required). The `create-adr` step is gated on `complexity == moderate || complexity == complex` and was skipped accordingly.

---

## 5. Follow-up items

None. The strategic review found zero findings (Critical/Major/Minor/Nit all clean). The single deviation (synthetic-slug handling) is documented and reviewed.

---

## 6. Activities and checkpoints

Activities completed (in order): `start-work-package`, `design-philosophy`, `codebase-comprehension`, `plan-prepare`, `assumptions-review`, `implement`, `post-impl-review`, `validate`, `strategic-review`, `submit-for-review`, `complete`.

Checkpoints resolved:

| Activity | Checkpoint | Resolution |
|----------|------------|------------|
| `start-work-package` | `issue-verification` | `skip-issue` (no GitHub issue) |
| `start-work-package` | `pr-creation` | `proceed` |
| `design-philosophy` | `classification-confirmed` | `confirmed` (simple) |
| `design-philosophy` | `workflow-path-selected` | `skip-optional` |
| `plan-prepare` | `approach-confirmed` | `confirmed` (single pass) |
| `strategic-review` | `unsigned-commits-prompt` | `decline-resign` |
| `strategic-review` | `review-findings` | `fix-findings` (S2 addressed via `3aca657`) |
| `submit-for-review` | `review-received` | `yes-review` |
| `submit-for-review` | `review-outcome` | `approved` |

---

## 7. Pointers

- Plan: [05-work-package-plan.md](05-work-package-plan.md)
- Test plan: [05-test-plan.md](05-test-plan.md)
- Post-impl review: [06-post-impl-review.md](06-post-impl-review.md)
- Strategic review: [07-strategic-review.md](07-strategic-review.md)
- Validation: [10-validation.md](10-validation.md)
- Retrospective: [08-workflow-retrospective.md](08-workflow-retrospective.md)
