# Session Trace

> Corpus condition-to-when migration · workflow-authoring session `ZR4PDX` · resolved at meta end-workflow · 2026-08-01

Cost: [09-token-usage.md](09-token-usage.md) — the run's sole cost home.

## Run shape

| Metric | Value |
|--------|------:|
| Activities entered | 6 (4 distinct; quality-review ×2, validate-and-commit re-enter after exit) |
| Activity dispatches | 6 |
| Activities exited | 5 |
| Checkpoints reached / responded | 2 / 2 |
| History events | 221 |
| Technique bundled / fetched | 16 / 21 |
| Resource fetched | 24 |
| Usage ledger rows | 3 |
| `vw` clusters | none observed |
| In-memory `get_trace` events at close-out | 0 (trace empty; session history is the mechanical witness) |

## Per-activity summary

| Activity | Dispatches | Tool events (usage rows) | Duration (min, ledger) | Wall-clock (min, enter→exit) | Errors | `vw` |
|----------|-----------:|-------------------------:|-----------------------:|-----------------------------:|--------|------|
| intake-and-context | 1 | 48 | 13.5 | 17.5 | 0 | — |
| scope-and-draft | 1 (+ resume usage row) | 80 | 23.1 | 28.6 | 0 | — |
| quality-review | 3 | — | — | 61.9 + 7.0 | 0 | — |
| validate-and-commit | 1 | — | — | 10.5 | 0 | — |

Duration (ledger) sums `activity_usage` rows only. Wall-clock is an **unpriced duration note** from durable `activity_entered` → `activity_exited` when usage is missing — not a token figure.

## Checkpoints

| Checkpoint | Decision |
|------------|----------|
| scope-and-draft / scope-confirmed#0 | confirmed |
| validate-and-commit / approve-to-commit#0 | approved |

## Mechanical notes

- Client terminal activity is `validate-and-commit` (completed in `completedActivities`; PR #378 opened). A second `activity_entered` for `validate-and-commit` remains on the durable pointer after exit; no second exit/usage row.
- Usage ledger covers intake-and-context and both scope-and-draft dispatches (initial + post-checkpoint resume). quality-review (three fresh dispatches, including one meta-orchestrator agent id) and validate-and-commit left no `activity_usage` rows — recorded in coverage as unaccounted; wall-clock only.
- Successful terminal dispatch (`validate-and-commit-worker-ZR4PDX-1`) left no ledger row after exit.
