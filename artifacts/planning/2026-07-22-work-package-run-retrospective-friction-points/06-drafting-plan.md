# Drafting Plan — batch (update, 22 files)

**Mode:** update · **Worktree:** `/home/mike1/projects/work/workflows/2026-07-22-work-package-run-retrospective-friction-points/`
**Basis:** [06-scope-manifest.md](06-scope-manifest.md) · open A-1–A-2, A-4–A-5, A-9 at agent positions (A-3 corrected)

| # | File | Approach |
|---|------|----------|
| 1–3 | discover-session + worker prompt + agent-conduct | Keep bound `list-available-workflows`; make bound-step `list_workflows` permit unmistakable (A-1) |
| 4–8 | evaluate/finalize/dispatch + orchestrator prompt + dispatch-client-workflow | Worker folds `next_activity_id` + `evaluated_condition` into `activity_complete`; loop `set`s from `worker_result` (A-2) |
| 9 | resolve-target | Add `re-list` option (+ effects) so `submodule-selection` has ≥2 options (A-5) |
| 10–12 | harness-compat TECHNIQUE/spawn/continue | Soften absolute foreground ban → blocking-equivalent via async+notify (removals 1–3) |
| 13–15 | WP workflow.yaml + validate + submit | `run_local_validation` + `{mark_progress_na}`; drop externalized-validation / `validation_skipped_by_user`; build-artifact hand-off on submit before mark-ready (A-3 corrected, A-4) |
| 16–20 | strategic-review + write-artifact + pr-description + update-pr | Final PR refresh at strategic-review; write-time mint guard + assumptions-log on conflict; lifecycle tense (A-8, A-9) |
| 21–22 | ponytail review-over-engineering + taxonomy | Hard comment-proportionality trim (A-7) |

**Schema:** `validate-workflow-yaml` PASS for `work-package`, `meta`, `ponytail`.
