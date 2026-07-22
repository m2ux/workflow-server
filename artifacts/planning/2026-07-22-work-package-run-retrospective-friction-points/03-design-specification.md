# Design Specification — Work-Package Run Retrospective Friction Points (Review-Mode Pass)

**Workflow:** `work-package` v3.35.0 (primary) · `meta` / `ponytail` (coupled)
**Mode:** Update
**Date:** 2026-07-22
**Change categories:** Technique, Resource, Rule (per-step edits within existing activities — no activities added, removed, or reordered)
**Change request:** Address the still-open, workflow-server-owned friction points from [issue #271](https://github.com/m2ux/workflow-server/issues/271) — a retrospective on a **review-mode** run of `work-package` against midnight-node PR #1900 — grounded against the current committed tip rather than the issue text as frozen truth. Companion issue #270 owns the template/links/commit-ordering surface (items 12, 13, 17) and is excluded here. Issue #272's nine items (delivered on PR #273, this same planning folder) are baseline, not this scope.
**Baseline:** [01-structural-inventory.md](01-structural-inventory.md)

---

## Purpose

Seven change goals cover the eleven still-open, in-scope #271 findings (of 28 total, minus 3 owned by #270):

| Goal | Meaning | #271 items |
|------|---------|------------|
| Cross-workflow resource ids resolve at the call site | `ponytail::*` techniques dispatched from `work-package/lean-coding-audit` reference their own resources (`review-taxonomy`, `the-ladder`, `ponytail-marker-convention`) with the owning workflow's qualifier, not a bare id that only resolves inside `ponytail`'s own context. | 3 |
| Distrust-then-reconcile over blind bag trust | Before an orchestrator decision depends on a critical path/state variable, a stale or unmirrored `inspect_session` read-back is cross-checked against the worker's own `activity_complete` envelope and, when still uncertain, planning-folder evidence — mirrors the coping pattern #272's own retrospective already named, made explicit rather than incidental. | 7, 8, 9, 10, 11 |
| Review-mode-native close-out | `conduct-retrospective` and its `COMPLETE.md` coupling, plus the "update status once merged" step, have a path that doesn't assume the reviewed PR is this work package's to merge. | 15 |
| Review-mode outcome set | `verify-outcomes` evaluates a review-mode-appropriate outcome list instead of reporting create-path outcomes (ADR recorded, docs updated) as unmet gaps when their producing steps were correctly gated out. | 16 |
| Discovery favors the actionable target | A request naming a specific existing PR/implementation to review routes to `work-package` review mode rather than a dedicated review workflow, without a re-scan. | 19 |
| Checkpoint capability is verified, not asserted | A worker or orchestrator confirms `defaultOption` / `autoAdvanceMs` via the presentation layer before treating a checkpoint as auto-advanceable. | 25 |
| Commit-rule scoping is legible | The hook-level `commit-after-activity` duty and the ad-hoc `explicit-commit` rule cross-reference their scopes so they read as non-conflicting, not just as separately located. | 27 |

**Out of scope:**

- **Owned by #270** (excluded from this pass, tracked separately): items 12, 13, 17 — consolidated review template abandonment, dead template links, rating-cap self-refutation carve-in.
- **Already delivered** — confirmed live on current tip, no redraft:
  - Item 14 (validate demands local `cargo`) — `local-validation-permission` checkpoint + `run_local_validation` / `{mark_progress_na}` gate already give an externalized/N/A path (`work-package/activities/11-validate.yaml`); delivered as #272 A-3.
  - Item 21 (base-drift diff trap) — `review-baseline-state.md` / `review-scope.md` / `review-diff.md` already use three-dot diffs against `{base_branch}` with an explicit merge-base recompute-and-log guard when HEAD is a merge commit.
  - Item 26 (`foreground-always` vs background dispatch) — `harness-compat/cursor.md` already documents async dispatch + completion-notification wait as blocking-equivalent; delivered as #272 A-6.
- **Server/tool-layer, not workflow content** (flagged for a separate engineering ticket against `src/`, not this workflow-design pass): items 1 (`get_activity` payload cap), 2 (path-typo-compounded retry loop), 4 (`ToolSearch` bootstrap tax), 5 (`next_activity` missing `trace_token`), 6 (`next_activity` `usage` field rejected by `additionalProperties: false`).
- **Environment/harness context, not workflow-server-owned** (recorded per the #272 precedent classification; no workflow action): items 20 (inaccessible sibling submodule), 22 (GitNexus multi-repo disambiguation), 23 (WebFetch 404 on GitHub URLs), 24 (sandbox loop guardrail).
- **Recorded for completeness:** item 28 (operator error) — enabled by #270's dead-link condition; no separate action beyond #270.

**Also see:** [assumptions log](03-assumptions-log.md) (A-2, A-3, A-5 open → Gate 2; A-1, A-4, A-6, A-7, A-8 audit-validated) · [structural inventory](01-structural-inventory.md)

---

## Activity list

No activities added, removed, or reordered. Step/technique/resource edits inside existing activities (work-package + coupled meta).

| Activity / surface | Role in this change |
|--------------------|---------------------|
| WP `lean-coding-audit` (+ `ponytail::*` resource links) | Qualify `review-taxonomy` / `the-ladder` / `ponytail-marker-convention` as `ponytail/…` at every cross-workflow call site so `get_resource` resolves them from a `work-package` dispatch context (item 3). |
| WP `complete` (`conduct-retrospective::retrospective`) | Review-mode-native retrospective: decouple `## Workflow Retrospective` from requiring a pre-existing `COMPLETE.md`, and gate "Update Status" on this work package's own merge, not the reviewed third-party PR's (item 15). |
| meta `end-workflow` (`workflow-engine::verify-outcomes`) | Evaluate a review-mode-appropriate outcome list (via `target_workflow_outcomes` or a mode-aware derivation) instead of the unconditional create-path array (item 16). |
| meta `discover-session` (`workflow-engine::match-target-workflow`) | Disambiguate a review-of-existing-PR request toward `work-package` review mode over a dedicated review workflow absent an explicit ask for the latter (item 19). |
| meta `present-checkpoint-to-user` / `respond-checkpoint` | Add a verify-capability step before a worker or orchestrator asserts `defaultOption` / `autoAdvanceMs` (item 25). |
| meta `dispatch-activity` / `commit-and-persist` | Add a reconcile step: when `inspect_session` state disagrees with the worker's own `activity_complete` envelope, the envelope (and planning-folder evidence) governs, and the discrepancy is logged (items 7–11). |
| meta `version-control::TECHNIQUE.md` / `commit-and-persist.md` (documentation only) | One-line cross-reference so `commit-after-activity` (hook-level, mandatory) and `explicit-commit` (ad-hoc, opt-in) read as scoped, not contradictory (item 27). |

---

## Checkpoints

No checkpoints added or removed this pass. Item 25's fix is a verification step inside the existing `present-checkpoint-to-user` / `respond-checkpoint` call flow, not a new gate — see Activity list. All other in-scope items are technique/rule/resource edits with no checkpoint-surface impact.

---

## Artifacts

| Artifact / surface | Target shape |
|--------------------|--------------|
| Ponytail resource links (`review-taxonomy.md`, `the-ladder.md`, `ponytail-marker-convention.md`) | Referenced as `ponytail/review-taxonomy#tags` etc. at cross-workflow call sites (or a documented dispatch-time id-qualification rule in meta) — mirrors the pattern `ponytail/resources/README.md` already documents for its own callers. |
| `dispatch-activity` / `commit-and-persist` reconcile step | When a critical routing/state variable's `inspect_session` value disagrees with the worker's reported `variables_changed`, the envelope value governs; the discrepancy is logged rather than silently resolved either way. |
| `conduct-retrospective::retrospective` / `COMPLETE.md` | Review-mode retrospective path that writes its own minimal review-mode close-out section when `create-complete-doc` was gated out, and defers "Update Status" to this work package's own PR (if any), never the audited third-party PR. |
| `target_workflow_outcomes` / `verify-outcomes` | A review-mode outcome list (e.g., review posted, findings documented, worktree cleaned) that stands in for the create-path array (ADR recorded, docs updated) when `is_review_mode == true`. |
| Workflow catalog tags / `match-target-workflow` guidance | A disambiguating signal (tag or scoring note) so a request naming a specific PR/implementation to review favors `work-package` over tag-overlap-only candidates like `midnight-system-review`. |
| `present-checkpoint-to-user` / `respond-checkpoint` | Explicit verify-capability step reading the checkpoint definition's actual `defaultOption` / `autoAdvanceMs` before a resolution assumes either. |
| `commit-and-persist` / `version-control::TECHNIQUE.md` | One-line cross-reference: `commit-after-activity` governs the orchestrator's post-activity hook only; `explicit-commit` governs ad-hoc, outside-the-hook commits; neither overrides the other's scope. |

---

## Rules

| Rule / principle | Application |
|------------------|--------------|
| Distrust-then-reconcile over blind bag trust | Critical routing/path state read from `inspect_session` is cross-checked against the worker's own `activity_complete` envelope and, when still uncertain, planning-folder evidence, before an orchestrator decision depends on it. |
| Cross-workflow resource ids are qualified at the call site | A technique dispatched into a foreign workflow context references its own resources with the owning workflow's qualifier, not a bare id assumed local to the caller. |
| Outcome sets are mode-aware | A workflow whose activities branch on a mode variable (e.g., `is_review_mode`) declares or derives a per-mode outcome set, so `verify-outcomes` never reports a structurally-inapplicable outcome as an unmet gap. |
| Checkpoint capability is verified, not assumed | A worker or orchestrator confirms `defaultOption` / `autoAdvanceMs` via the presentation layer before treating a checkpoint as auto-advanceable. |
| Discovery scoring favors specific-request signals over broad tag overlap | `match-target-workflow` (or the catalog tags feeding it) resolves a request naming a specific existing PR/implementation toward the workflow that can act on it end-to-end, not the workflow with the closest tag match on a single word like "review". |

---

## Confirmation ask

Approving this specification means: proceed to pattern → impact → scope-and-draft to implement the seven in-scope #271 goals (eleven numbered findings) across `work-package` (`lean-coding-audit`, `complete`) and coupled `meta` (`end-workflow`, `discover-session`, `dispatch-activity` / `commit-and-persist`, `present-checkpoint-to-user` / `respond-checkpoint`, `version-control`) surfaces, settling open design judgements (bag-reconciliation mechanism, review-mode outcome-list contents, discovery-disambiguation approach) at Gate 2.
