# Design Philosophy — Fix Work Package Transition Folder Defect

**Created:** 2026-05-20
**Activity:** design-philosophy
**Status:** Complete

---

## Problem Statement

`start_session({ workflow_id: "meta" })` mints a transient `transition-<uuid>` planning folder slug. When a subsequent `dispatch_child({ workflow_id: "<client>" })` is called to launch the actual work package, two contract violations occur in the on-disk `session.json`:

1. **No folder promotion.** The transient `transition-<uuid>` slug is never renamed to a dated, descriptive slug derived from the client work-package (the expected form is `YYYY-MM-DD-<work-package-name>`). The transient slug persists for the lifetime of the work.
2. **Inverted parent/child nesting.** The child session is written at the top level of `session.json`, and the original meta session is demoted into a nested `parentSession` field underneath the child. This is the inverse of the documented `workflow-engine::handle-sub-workflow` contract, which requires the child to be embedded under `parent.triggeredWorkflows[N].state` while the meta parent remains the authoritative top-level record.

**Impact:** The planning directory accumulates `transition-<uuid>` folders with no human-readable hints; agents and humans cannot find in-flight work by reading directory names; tooling that walks `triggeredWorkflows[]` to find active children does not see them because they sit at the top level instead.

**Success criteria:**
- After `dispatch_child` completes, the planning folder is renamed to the dated client-workflow slug.
- After `dispatch_child` completes, `session.json` has the meta session at the top level with the client session embedded under `triggeredWorkflows[N].state`.
- Existing tests still pass; new tests cover both invariants.

**Constraints:**
- Fix lives in the standalone repo at `/home/mike1/projects/work/workflow-server/2026-05-20-fix-work-package-transition-folder-defect` on branch `fix/work-package-transition-folder-defect`.
- Planning artifacts live in the parent monorepo under `.engineering/artifacts/planning/2026-05-20-fix-work-package-transition-folder-defect/`.
- No modifications to workflow TOON content; this is a server-side state-management defect.

---

## Classification

| Field | Value |
|-------|-------|
| Problem type | **specific-cause-known** (defect-fix) |
| Complexity | **simple** |
| Path-gating complexity | simple |

**Rationale.** The defect is well-localised: the dispatch_child code path mishandles two specific concerns (folder rename, state nesting) with a documented contract to compare against (`workflow-engine::handle-sub-workflow`). There is no ambiguity in the desired behaviour, no design exploration required, and no cross-cutting refactor implied. The user has explicitly framed this as a simple task.

---

## Workflow Path

Selected option: **`skip-optional`** at the `workflow-path-selected` checkpoint.

| Variable | Value |
|----------|-------|
| `needs_elicitation` | false |
| `needs_research` | false |
| `skip_optional_activities` | true |
| `needs_comprehension` | true (mandatory) |

**Rationale.** Requirements are already clear from the defect description. No external research is needed — the contract is documented inside the codebase. Codebase comprehension remains mandatory to locate the dispatch_child code path and its tests before planning the fix.

Next activity will be **codebase-comprehension**, followed directly by **plan-prepare** (elicitation and research are skipped).

---

## Out of Scope

- Refactoring `start_session` semantics for non-meta workflows.
- Changing the `transition-<uuid>` minting strategy itself — only the promotion-to-dated-slug step.
- Schema changes to `session.json` beyond restoring the documented nesting shape.
