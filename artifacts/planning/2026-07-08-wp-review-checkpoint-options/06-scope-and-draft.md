# Scope and Draft — work-package `review-findings` checkpoint fix

**Workflow:** work-package (update mode) · **Session:** J37EZY
**Worktree:** `/home/mike1/projects/work/workflows/2026-07-08-wp-strategic-review-checkpoint` (branch `workflow/wp-strategic-review-checkpoint`)
**Date:** 2026-07-08

---

## 1. Scope manifest (confirmed — 4 files, all modify, no create/remove)

| # | Path (relative to worktree root) | Action | Type | Change |
|---|----------------------------------|--------|------|--------|
| 1 | `work-package/activities/12-strategic-review.yaml` | modify | activity | `review-findings` checkpoint: add `condition`, `blocking: true`, remove `autoAdvanceMs`/`defaultOption`, edit message, add `selective-fixes` option, differentiate `defer-findings`. Version 2.6.0 → 2.7.0. |
| 2 | `work-package/techniques/strategic-findings-analysis.md` | modify | technique | Add `review_passed` boolean output + protocol step 4 + rule. Version 1.0.0 → 1.1.0. |
| 3 | `work-package/workflow.yaml` | modify | workflow | Declare `strategic_fixes_selective` + `strategic_findings_deferred` (boolean, default false). Version 3.18.0 → 3.19.0. |
| 4 | `work-package/activities/README.md` | modify | readme | Mermaid edge labels for the `review-findings` checkpoint. |

Drafting order followed: workflow.yaml → activity → technique → README.

## 2. Structural approach

- **Checkpoint gains a `condition`** (`strategic_findings_summary != ""`) so the finding-free case auto-dismisses via `respond_checkpoint condition_not_met` (no effect fires). Uses the schema's `simple` condition form — the same construct already used by gated steps in this activity.
- **`blocking: true`, `autoAdvanceMs`/`defaultOption` removed** — a real decision must not auto-accept; the trivial (finding-free) case is now handled structurally by the condition, not by a timer.
- **New option `selective-fixes`** sits between `fix-findings` and `defer-findings`; sets `needs_strategic_fixes` + `strategic_fixes_selective`. Routes to plan-prepare (fix path) via the default transition.
- **`defer-findings` differentiated** — now also sets `strategic_findings_deferred: true` (still sets `review_passed: true`, so routes to submit-for-review).
- **Technique emits `review_passed: true`** on the finding-free/minor path. This is the mechanism that makes the `condition_not_met` dismissal proceed to submit-for-review (transition 2 fires) rather than fall through to the plan-prepare re-loop.
- **Two new boolean variables declared** — mandatory: a `setVariable` to an undeclared variable is a hard-zero `check:variable-model` failure. Both default `false`, neither gated with exists/notExists.

## 3. Removals (all flagged in 05-impact-analysis §6 — no unflagged removals)

- `blocking: false` → `true` (behaviour change)
- `defaultOption: acceptable` (removed)
- `autoAdvanceMs: 30000` (removed)
- `. Auto-advancing in 30s.` message text (removed)
- `defer-findings` effect differentiated (option retained, effect extended)

`has_unflagged_removals = false`.

## 4. Schema validation (all pass)

- `validate-workflow-yaml.ts` against `work-package/`: **[PASS]** workflow.yaml (v3.19.0) + all 15 activities incl. `12-strategic-review.yaml`; techniques anchor check PASS. "All YAML files valid."
- `check:variable-model`: **OK** — defaults, gates, and setVariable effects coherent.
- `check:fragments`: **OK** — every ref resolves, no inline duplicates.

## 5. Final variable changes

| Variable | Change |
|----------|--------|
| `review_passed` | declaration unchanged; gains new producer (technique output) |
| `strategic_fixes_selective` | NEW declaration (boolean, default false) |
| `strategic_findings_deferred` | NEW declaration (boolean, default false) |
