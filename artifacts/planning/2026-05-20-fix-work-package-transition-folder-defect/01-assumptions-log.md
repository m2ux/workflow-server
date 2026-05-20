# Assumptions Log — Fix Work Package Transition Folder Defect

**Created:** 2026-05-20
**Status:** Open — updated as activities progress

Convention:
- **Resolvable (code)** — answerable by reading the codebase; resolved here via targeted analysis.
- **Stakeholder-dependent** — requires user/maintainer input; left open for elicitation in later activities or surfaced as a question.

---

## Problem Interpretation

### A1 — Two distinct defects, one work package
**Assumption.** The defect description bundles two issues: (a) folder slug is not promoted from `transition-<uuid>` to a dated client-workflow slug; (b) the parent/child nesting in `session.json` is inverted relative to the `workflow-engine::handle-sub-workflow` contract. Both will be fixed in this work package.
**Resolvability.** Stakeholder-dependent — the user's framing defines scope.
**Status.** Open. Confirmed by the work-package framing in the worker prompt; will not be reopened unless the user reduces scope during plan-prepare.

### A2 — Current code intentionally writes child-at-top with `parentSession` for transient parents
**Assumption.** The current `dispatch_child` handler (in `src/tools/resource-tools.ts`) has a deliberate branch for transient parents that creates a new top-level workspace folder for the child, copies the parent's snapshot into the child's `parentSession`, and discards the transient parent folder. This is documented in the tool description as a "special case".
**Resolvability.** Resolved (code) — confirmed by reading `src/tools/resource-tools.ts:258-345`. Tool description at lines 261-264 explicitly states the special case.
**Status.** Resolved. The defect must therefore reconcile two interpretations: either (a) the documented contract in `workflow-engine::handle-sub-workflow` is authoritative and the special case is a bug, or (b) the special case is authoritative and the contract documentation is the bug. **User framing in the worker prompt makes (a) authoritative** — the work item is described as a defect, the documented contract is the target shape.

### A3 — On-disk evidence matches the defect description
**Assumption.** The current planning folder's `session.json` exhibits the described shape: `work-package` at top level, `meta` demoted into `parentSession`.
**Resolvability.** Resolved (code/data) — confirmed by reading the live `session.json` in this planning folder. `workflowId: "work-package"` at top, `parentSession.workflowId: "meta"`.
**Status.** Resolved. This is the reproduction case.

---

## Complexity Assessment

### A4 — Fix is localised to two files
**Assumption.** The fix lives primarily in `src/tools/resource-tools.ts` (the `dispatch_child` handler), with possible support changes in `src/utils/session/store.ts` (folder rename helpers exist already — see `fsAdapter.rename` in store.ts).
**Resolvability.** Resolved (code) — `grep` for `transition-`, `dispatch_child`, `triggeredWorkflows`, `parentSession` returns hits only in those two files plus their test files.
**Status.** Resolved. Supports the "simple" complexity classification.

### A5 — Slug derivation strategy for the promoted folder
**Assumption.** When promoting `transition-<uuid>` to a dated slug, the slug should be derived from the *child* workflow (e.g. `YYYY-MM-DD-<work-package-name>` or `YYYY-MM-DD-<workflow-id>`). The exact human-readable component is not yet determined and may need a small naming convention.
**Resolvability.** Stakeholder-dependent — the naming convention is a UX choice. Code can derive a slug from any input, but choosing *which* input requires direction. Note: the user supplied an explicit dated slug for this very session via `start_session({ planning_slug: ... })`, and that path works correctly. The transient-fallback path is what needs a convention.
**Status.** Open. Defer to plan-prepare; flag as a design question for the user.

### A6 — No schema migration is needed
**Assumption.** Existing `session.json` files written under the buggy shape do not need to be migrated; the fix changes forward behaviour only. Older planning folders remain readable.
**Resolvability.** Resolved (code) — `src/utils/session/migration.ts` exists and handles `schemaVersion`; the buggy shape is still `schemaVersion: 1`, so structurally valid for the existing loaders. Old folders are not currently broken by the fix because the load path tolerates a top-level non-meta workflow with `parentSession` populated.
**Status.** Resolved with a noted caveat. We will not attempt to retroactively re-nest pre-existing buggy sessions; we will document this in the plan.

---

## Workflow Path

### A7 — `skip-optional` is the correct path
**Assumption.** This defect has clear scope, a documented contract to compare against, and a known reproduction. Elicitation and research are not needed; codebase comprehension is sufficient.
**Resolvability.** Resolved (user-confirmed). The user explicitly directed "this is a simple task, keep the activities simple", and selected `skip-optional` at the workflow-path-selected checkpoint.
**Status.** Resolved.

### A8 — Codebase comprehension is still required
**Assumption.** Even on the skip-optional path, the worker must locate and read the dispatch_child handler, the transient-folder registry, and the relevant tests before authoring a plan.
**Resolvability.** Resolved (activity definition) — `needs_comprehension: true` is hard-coded in the `determine-path` step of design-philosophy. The orchestrator will dispatch codebase-comprehension next.
**Status.** Resolved.

---

## Outstanding Questions (for plan-prepare)

1. **Slug naming convention for promotion** (A5). Should the promoted slug be `YYYY-MM-DD-<workflow-id>` (e.g. `2026-05-20-work-package`)? Should it use an additional descriptor? This is a UX decision.
2. **Behaviour when no slug can be derived.** If neither a user-supplied slug nor a sensible workflow-derived slug is available, what is the fallback? (The current fallback exists; we just need to confirm it remains acceptable.)
3. **Backfill of existing buggy sessions** (A6). Confirm with user that no retroactive migration is wanted.

These do not block design-philosophy completion; they are raised here so plan-prepare picks them up.
