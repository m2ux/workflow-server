# Session Trace

> Workflows corpus batch (PR #372) · workflow-authoring session `WEGGYY` · resolved at meta end-workflow · 2026-08-01

Cost: [09-token-usage.md](09-token-usage.md) — the run's sole cost home.

## Run shape

| Metric | Value |
|--------|------:|
| Activities entered | 7 (4 distinct + terminal; scope-and-draft ×2, validate-and-commit ×2) |
| Activity dispatches | 7 |
| Activities exited | 6 |
| Checkpoints reached / responded | 3 / 3 |
| History events | 233 |
| Technique bundled / fetched | 13 / 29 |
| Resource fetched | 21 |
| Usage ledger rows | 3 |
| `vw` clusters | none observed |
| Workflow status | completed (`__terminal__`) |

## Per-activity summary

| Activity | Dispatches | Tool events (usage rows) | Duration (min, ledger) | Wall-clock (min, enter→exit) | Errors | `vw` |
|----------|-----------:|-------------------------:|-----------------------:|-----------------------------:|--------|------|
| intake-and-context | 2 | 53 | 14.3 | 26.0 | 0 | — |
| scope-and-draft | 2 | 44 | 17.4 | 81.9 + 8.4 | 0 | — |
| quality-review | 1 | — | — | 16.3 | 0 | — |
| validate-and-commit | 2 | — | — | 34.9 + 0.6 | 0 | — |

Duration (ledger) sums `activity_usage` rows only. Wall-clock is an **unpriced duration note** from durable `activity_entered` → `activity_exited` when usage is missing — not a token figure.

## Checkpoints

| Checkpoint | Decision |
|------------|----------|
| intake-and-context / impact-approved | approve-removals |
| scope-and-draft / scope-confirmed#0 | confirmed |
| validate-and-commit / approve-to-commit#0 | approved |

## Mechanical notes

- Client terminal activity is `validate-and-commit` (completed in `completedActivities`; PR #372 opened on `workflow/358-338-corpus-batch`). Workflow completed at `__terminal__` 2026-08-01T09:04:54.038Z.
- Usage ledger covers intake-and-context (initial + post-checkpoint resume) and the first scope-and-draft dispatch only. Unaccounted fresh dispatches: scope-and-draft resume, quality-review, validate-and-commit (pre-checkpoint), validate-and-commit (post-checkpoint terminal) — 4 of 7.
- Successful terminal dispatch (`worker-validate-and-commit-1` resume after `approve-to-commit#0`) left no ledger row after exit; wall-clock only (~0.6 min enter→exit on the second pass).
- One `checkpoint_replayed` event is present in history; no `vw` clusters observed.
