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

---

## Planning Phase (added during plan-prepare)

### A9 — Slug derivation strategy: user-supplied pass-through with dated derived fallback (resolves A5, Q1, Q2)
**Assumption.** When promoting the transient folder, use the slug the meta session was registered under if one is in the transient registry (the common case — `start_session({ planning_slug })` was called explicitly). Otherwise derive `YYYY-MM-DD-<child-workflow-id>` (note: date-first, not the current `workflow-id-YYYY-MM-DD`).
**Resolvability.** Stakeholder-dependent design decision; resolved here without re-asking the user because (a) the user directed "keep activities simple" and this is the smallest viable convention, (b) the pass-through case is what the current code already does, so behaviour for explicitly-named sessions is unchanged, and (c) the fallback only fires when no slug was supplied — exactly the case that produces the buggy `transition-<uuid>` today.
**Status.** Resolved. Documented in `05-work-package-plan.md` as Option B with rationale. The user reviews this at the approach-confirmed checkpoint and can request a different convention.

### A10 — No folder-rename helper added to the session store
**Assumption.** The fix does not introduce a `renamePlanningFolder` helper. Folder promotion is achieved by the existing idiom: `ensurePlanningFolder(workspace, promotedSlug)` to materialise the new folder, write the (new top-level) session file there via `writeSessionFile`, then `discardTransient(parentFolder)` to clean up the tmp dir.
**Resolvability.** Resolved (code) — the existing transient-parent branch already follows exactly this idiom. Reusing it keeps the fix surface area small and avoids broadening scope to a session-store API change.
**Status.** Resolved. Out-of-scope item recorded in `05-work-package-plan.md`.

### A11 — No new automated tests — update the two existing defect-encoding tests in place
**Assumption.** The two existing tests at `tests/mcp-server.test.ts:1568-1613` and `:1615-1661` are rewritten to assert the contract shape; the four persistent-parent tests at `:1847-1993` are left untouched and serve as branch-B regression coverage. A single manual reproduction check covers the derived-fallback slug path. No new test files or `describe` blocks are added.
**Resolvability.** Resolved (code review of the test surface — comprehension artifact Test Surface table). The two defect-encoding tests already set up the precise scenarios needed for post-fix assertions; the persistent-parent tests already pin the target shape; no coverage gap remains.
**Status.** Resolved. Test cases enumerated in `05-test-plan.md`.

### A12 — Caveat: derived-slug collision risk is bounded and acceptable
**Assumption.** Two work-packages started on the same day, both via meta with no explicit `planning_slug`, both of the same child workflow id, would derive the same `YYYY-MM-DD-<workflow-id>` slug. We accept this risk because (a) `ensurePlanningFolder` is idempotent, so the second dispatch would not crash on the directory itself but would surface a COLLISION via `findPlanningFolderBySlug` if the folder is already in use by a different session, (b) the no-explicit-slug case is the bootstrap-fallback path, not the recommended entry point, and (c) users wanting deterministic slugs supply `planning_slug` explicitly.
**Resolvability.** Resolved (code) — collision detection is the existing responsibility of `findPlanningFolderBySlug`, unchanged by this fix.
**Status.** Resolved. Caveat recorded in `05-work-package-plan.md` Design Note.

### A13 — Migration: no retroactive change to legacy on-disk shapes (re-confirms A6, resolves Q3)
**Assumption.** Existing planning folders under the legacy (buggy) shape — child workflow at top, `parentSession` containing meta — are left as-is. The schema accepts both shapes; the loaders tolerate both; no migration step runs on startup or on dispatch.
**Resolvability.** Resolved (code) — `parentSession?` is a valid optional field on `SessionFile`; the load path uses `loadSessionForTool` which handles either shape; no migration code exists today and none is being added.
**Status.** Resolved. The plan flags this explicitly so a reviewer can confirm during the approach-confirmed checkpoint.

---

## Convergence

All assumptions raised during design-philosophy and plan-prepare are now resolved by either (a) reading the code, (b) reading the documented contract, or (c) the user's explicit "keep activities simple" framing. No code-resolvable assumptions remain. The slug-derivation choice (A9) is the only design decision a reviewer might wish to revisit; it surfaces at the approach-confirmed checkpoint.
