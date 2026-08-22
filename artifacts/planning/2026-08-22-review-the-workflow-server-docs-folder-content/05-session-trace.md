# Session Trace

> Workflow Server docs/ documentation set · plain-language run · resolved at close-out · 2026-08-22 · client session `OC4BF5` · meta session `H7JBHR`

Cost lives in [05-token-usage.md](05-token-usage.md), the run's sole cost home. No token figures are restated here.

## Run shape — client session `OC4BF5`

| Metric | Value |
|--------|------:|
| Activities entered | 6 |
| Activities exited | 5 |
| Activity dispatches | 6 |
| Activity redeliveries | 1 |
| Checkpoints reached / responded | 2 / 2 |
| History events | 135 |
| Steps started / completed | 16 / 22 |
| Techniques bundled / fetched | 13 / 3 |
| Resources fetched | 21 |
| Progress publications | 5 |
| Usage ledger rows | 8 |
| Errors | 0 |
| `vw` clusters | none observed |
| In-memory `get_trace` events at close-out | 0 (trace empty; durable history is the mechanical witness) |

## Per-activity summary

Tool-use counts come from the usage ledger rather than from history events; duration is the reported figure on those same rows, in minutes.

| Activity | Dispatches | Ledger rows | Tool uses | Duration (min) | Wall clock (min) | Errors | `vw` clusters |
|----------|-----------:|------------:|----------:|---------------:|-----------------:|-------:|---------------|
| intake-and-profile | 1 | 1 | 23 | 4.5 | 15.0 | 0 | — |
| source-analysis | 1 | 1 | — | — | 14.5 | 0 | — |
| draft | 1 | 2 | 95 | 67.3 | 68.7 | 0 | — |
| evaluate | 2 | 3 | 192 | 33.5 | 33.8 | 0 | — |
| deliver | 1 | 1 | 18 | 4.6 | not recorded | 0 | — |

The `draft` row's 95 tool uses and 67.3 minutes come from a cumulative-basis ledger entry, so they are that agent context's running totals rather than the activity's own share.

## Checkpoint decisions

| Checkpoint | Response | Effect | Responded |
|------------|----------|--------|-----------|
| `evaluation-reviewed#0` | `revise` | `needs_revision: true` | 05:13:30Z |
| `evaluation-reviewed#1` | `accept` | `needs_revision: false` | 05:33:02Z |

## Run shape — meta session `H7JBHR`

| Metric | Value |
|--------|------:|
| Activities entered | 5 |
| Activity dispatches | 5 |
| History events | 81 |
| Techniques bundled / fetched | 12 / 1 |
| Resources fetched | 2 |
| Usage ledger rows | 5 |
| Checkpoints reached | 0 |
| Errors | 0 |

## Mechanical notes

- The `evaluate` stage was entered twice and dispatched twice, across three ledger rows and two agent contexts. Two round-0 evaluations ran at once: a fresh worker was dispatched while the earlier agent chain was still live, and both produced a report. The duplicate surfaced sixteen issues against the first pass's six, among them eight of the fifteen documents the draft had effectively skipped. The revision was redirected onto the fuller set, so the concurrency changed what the run examined rather than only what it cost.
- The `deliver` activity's step binds its target directory to a variable that resolves to an empty string rather than being absent, so the worker took the declared default. The client bag still carries `output_path` as `""`.
- The client session record shows `deliver` as the current activity with no exit event, although the activity completed and the workflow reached `workflow_complete`. Its usage row exists, so the ledger is unaffected; the gap is in the activity-exit record alone.
- Completed steps outnumber started steps, 22 against 16. Steps whose technique arrives inlined in the activity bundle report completion without a separate server-side start event.
- No error events and no `vw` clusters appear anywhere in either session's history.
