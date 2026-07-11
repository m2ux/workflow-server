# Assumptions Log

> Review-Mode Diff-Scope Fix · #203 · updated 2026-07-09

## Log

One row per assumption, updated in place. IDs: two-letter phase prefix + sequence (RR-1 …).

| ID | Phase/Task | Category | Risk | Assumption — rationale | Resolution | Outcome |
|----|------------|----------|------|------------------------|------------|---------|
| RR-1 | Requirements Refinement | Checkpoint Necessity | L | The merge-in guard is a logging/structural guard (protocol step + technique rule), NOT a user checkpoint — because it has one correct resolution (recompute three-dot set and log the merge-in), and review mode is headless-after-activation per the WP review-mode-optimisation direction. | User interview | Confirmed |
| RR-2 | Requirements Refinement | Schema Construct Choice / Variable State | L | No new `workflow.yaml` `variables[]` entry is needed; the authoritative authored-file set flows through the bag as a canonical technique output, consistent with the existing diff variables (`changed_files`, `base_pr_diff`, `base_branch`) which are also undeclared. | Audit: `audit-conformance` — grep of `work-package/workflow.yaml` + activities: no diff variable is declared in `variables[]`; all flow via same-name bag binding. No `condition`/`transition` reads the authored set, so no cross-activity gating requires a declared variable. | Validated |
| RR-3 | Requirements Refinement | Variable State | L | The canonical authored-surface name reuses the existing `changed_files` bag name rather than introducing `authored_files`/`pr_changed_files` — maximising implicit same-name binding across the three consumers. | Audit: `audit-conformance` — `changed_files` is already the declared consumer input on `review-code.md` and (as the orphan-scan input) `strategic-review/review-scope.md`; canonical-rename-over-args favours one canonical name over per-call renames. | Validated |
| RR-4 | Requirements Refinement | Activity Boundaries / Technique Selection | L | No new activity or technique file; the fix is protocol + rule edits to five existing files (`review-baseline-state`, `strategic-review/review-scope`, `review-code`, `review-diff`, `review-summary`) + `resources/review-mode.md`. | Audit: `audit-consistency` — all five techniques + the resource exist in the corpus; intake update-mode-guide classified the change as *modify technique(s) + resource*; no phase is missing. | Validated |
| RR-5 | Requirements Refinement | Technique Selection / Rule Scope | M | The findings-constraint is enforced at the consolidation point (`review-summary`) plus a shared `## Rules` entry on the finding producers — NOT via a new dedicated finding-filter technique. | User interview | Confirmed |
| RR-6 | Requirements Refinement | Rule Scope | L | `review-diff.md` (already three-dot) needs only to source `{$base_branch}` from the authoritative PR base and add the merge-in guard — not a diff-form change. | Audit: `audit-consistency` — `review-diff.md` Protocol steps 2/4 already use `git diff {$base_branch}...HEAD` (three-dot); the only defect is `{$base_branch}` derived by local heuristic ("typically main/master") rather than the authoritative PR base. | Validated |

Resolution: `Audit:` with the audit pass + evidence, `User interview`, or `—` while open. Outcome: Validated / Invalidated / Partially Validated (audit-resolved) · Confirmed / Corrected: <change> / Deferred (user-resolved) · Open (<reason>).

## Wrap-Up

6 assumptions — all validated or confirmed. 4 validated by audit (RR-2, RR-3, RR-4, RR-6); 2 confirmed by user interview (RR-1 merge-in guard is structural not a checkpoint; RR-5 findings-constraint is a shared rule + consolidation enforcement, no new technique). No corrections, invalidations, or deferrals. Takeaway: the fix stays minimal — no new activity, checkpoint, workflow variable, or technique file; every design judgement resolved to the over-engineering-avoiding structural option consistent with issue #203.
