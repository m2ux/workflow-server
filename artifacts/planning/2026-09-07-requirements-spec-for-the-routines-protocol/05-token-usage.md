# Token Usage — Requirements Spec for the Routines Protocol

Client session `6CKOVM` (workflow `requirements-refinement`), rendered from the full session ledger after the terminal activity `finalize-specification` exited. Meta session `6CQIBT`.

Figures are estimates for comparing runs, not a bill.

## Per-activity

Additive basis. Each row sums the `delta` ledger entries recorded against that activity; a `cumulative` entry is a running agent total and is reconciled separately below rather than added here.

| Activity | Ledger rows | Tool uses | Duration (min) | Subagent tokens | Model | Price table | Cost |
|---|---|---|---|---|---|---|---|
| intake-and-analyze | 1 | 17 | 1.9 | 122,744 | unknown | unknown | unknown |
| update-specification | 3 | 49 | 9.3 | 95,302 | unknown | unknown | unknown |
| validate-specification | 3 | 62 | 12.8 | 171,975 | unknown | unknown | unknown |
| finalize-specification | 2 | 39 | 7.6 | 104,730 | unknown | unknown | unknown |
| **Total** | **9** | **167** | **31.7** | **494,751** | | | **unknown** |

Neither model nor price-table version is recorded on any ledger entry, so every cost cell is unpriced.

## Per-workflow totals

| Measure | Value |
|---|---|
| Subagent tokens (delta basis) | 494,751 |
| Subagent tokens (per-agent reconciled) | 600,635 |
| Agent duration sum (min) | 58.6 |
| Session elapsed (min) | 91.9 |
| Cost | unknown |

Both token figures are **floors** — see `usage_coverage`.

Agent duration sums each agent's own latest reckoning and so exceeds the 31.7 minutes of the delta rows alone. Per-activity wall clock is not additive: the four activities interleave across shared agent contexts, so the session elapsed figure is the only sound end-to-end duration.

### Per-agent reconciliation

Four worker contexts carried the run. The first reported on a `cumulative` basis and the rest on `delta`, so a delta-only total omits the part of the first agent's consumption that its cumulative entries alone carry.

| Agent | Basis | Tool uses | Duration (min) | Subagent tokens |
|---|---|---|---|---|
| worker-intake-and-analyze-a1 | cumulative (latest of 3) | 47 | 28.8 | 228,628 |
| worker-update-specification-b1 | delta | 52 | 10.9 | 117,513 |
| worker-validate-specification-c1 | delta | 85 | 17.3 | 191,731 |
| worker-finalize-specification-d1 | delta | 13 | 1.6 | 62,763 |
| **Total** | | **197** | **58.6** | **600,635** |

Of agent `a1`'s 228,628 cumulative tokens, 122,744 entered the delta total. The 105,884-token difference is the gap between the two totals above.

### Wall clock by activity

Recorded per activity and non-additive, so kept out of the tables above.

| Activity | Wall clock (min) |
|---|---|
| intake-and-analyze | 28.0 |
| update-specification | 25.4 |
| validate-specification | 23.3 |
| finalize-specification | not recorded |

## usage_coverage

| Measure | Count |
|---|---|
| Ledger entries | 12 |
| Activity dispatch events | 13 |
| Unaccounted dispatches | 1 |
| Activities with no ledger row | 0 |

Every one of the four activities that ran carries at least one ledger row, including the terminal activity. One dispatch event has no matching entry, and the first agent's cumulative reporting leaves 105,884 tokens outside the delta total. Both totals are therefore floors: actual consumption is at or above them.
