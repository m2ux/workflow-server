# Token Usage

Cost record for the `prism-evaluate` evaluation of shorthand expression grammar for workflow YAML. This file is the sole cost home for the run; the mechanical trace in `04-session-trace.md` links here rather than restating figures.

Figures are read from the workflow-server `activity_usage` ledger after the client workflow reached its terminal activity.

## Sessions accounted

| Session | Workflow | Role | Status |
|---|---|---|---|
| `H376E6` | `meta` v5.23.0 | Meta orchestration | running (closing) |
| `2J6KER` | `prism-evaluate` v2.1.0 | Client evaluation workflow | completed |
| `YM6QZV` | `prism` | Group 1 — Consistency, full-prism, lenses 00/01/02 | running, current activity `deliver-result` |
| `7OPXHM` | `prism` | Group 2 — Expressiveness/Architecture/Feasibility, portfolio, lenses 06/07/08/12/15 | running, current activity `deliver-result` |

## usage_coverage

| Session | Ledger rows | Dispatches | Unaccounted | Totals are |
|---|---|---|---|---|
| `H376E6` | 4 | 5 | 1 | **floor** |
| `2J6KER` | 11 | 13 | 2 | **floor** |
| `YM6QZV` | 6 | 6 | 0 | complete |
| `7OPXHM` | 4 | 4 | 0 | complete |

The meta remainder is the `end-workflow` dispatch itself, in flight while this file is written; the orchestrator accounts it after the worker envelope returns. The client remainder is two dispatch legs that left no ledger row — every one of the six client activities carries at least one row, so no activity is wholly unaccounted, and the gap sits in re-dispatches across checkpoint resumes.

No ledger row on any of the four sessions carries a `model` or `priceTableVersion` field, so every cost cell reads `unknown` and no price table is cited.

## Meta session `H376E6` — `meta`

| Activity | Rows | Tool uses | Duration (min) | Subagent tokens | Model | priceTableVersion | Cost |
|---|---|---|---|---|---|---|---|
| `discover-session` | 1 | 13 | 2.2 | 72,944 | unrecorded | unrecorded | unknown |
| `initialize-session` | 1 | 5 | 0.7 | 80,433 | unrecorded | unrecorded | unknown |
| `resolve-target` | 1 | 7 | 1.8 | 86,665 | unrecorded | unrecorded | unknown |
| `dispatch-client-workflow` | 1 | 6 | 1.5 | 50,171 | unrecorded | unrecorded | unknown |
| `end-workflow` | 0 | — | — | — | unrecorded | unrecorded | unknown |
| **Total** | **4** | **31** | **6.2** | **290,213** | | | **unknown** |

Session elapsed: 1,340.0 min (22.3 h).

## Client session `2J6KER` — `prism-evaluate`

| Activity | Rows | Tool uses | Duration (min) | Subagent tokens | Model | priceTableVersion | Cost |
|---|---|---|---|---|---|---|---|
| `scope-definition` | 3 | 23 | 5.7 | 226,460 | unrecorded | unrecorded | unknown |
| `dimension-planning` | 2 | 24 | 19.5 | 281,865 | unrecorded | unrecorded | unknown |
| `execute-analysis` | 2 | 26 | 4.8 | 224,306 | unrecorded | unrecorded | unknown |
| `consolidate-report` | 1 | 18 | 7.1 | 134,203 | unrecorded | unrecorded | unknown |
| `deliver-results` | 2 | 16 | 3.3 | 168,469 | unrecorded | unrecorded | unknown |
| `resolution-dialogue` | 1 | 18 | 2.7 | 214,191 | unrecorded | unrecorded | unknown |
| **Total** | **11** | **125** | **43.1** | **1,249,494** | | | **unknown** |

Session elapsed: 1,333.4 min (22.2 h).

The `resolution-dialogue` row is the one row on any session whose basis is `cumulative` rather than `delta`; its 214,191 is agent `client-worker-05`'s latest cumulative figure. The server's own delta subtotal of 1,035,303 excludes it, and the total above is that subtotal plus the cumulative figure.

## Group 1 session `YM6QZV` — `prism`, full-prism

| Activity | Rows | Tool uses | Duration (min) | Subagent tokens | Model | priceTableVersion | Cost |
|---|---|---|---|---|---|---|---|
| `select-mode` | 1 | 14 | 2.7 | 71,254 | unrecorded | unrecorded | unknown |
| `structural-pass` | 1 | 76 | 13.0 | 175,958 | unrecorded | unrecorded | unknown |
| `adversarial-pass` | 1 | 63 | 21.4 | 186,639 | unrecorded | unrecorded | unknown |
| `synthesis-pass` | 1 | 41 | 20.9 | 169,564 | unrecorded | unrecorded | unknown |
| `generate-report` | 1 | 33 | 13.4 | 180,857 | unrecorded | unrecorded | unknown |
| `deliver-result` | 1 | 18 | 2.9 | 75,027 | unrecorded | unrecorded | unknown |
| **Total** | **6** | **245** | **74.2** | **859,299** | | | **unknown** |

Session elapsed: 130.3 min.

## Group 2 session `7OPXHM` — `prism`, portfolio

| Activity | Rows | Tool uses | Duration (min) | Subagent tokens | Model | priceTableVersion | Cost |
|---|---|---|---|---|---|---|---|
| `select-mode` | 1 | 21 | 9.5 | 97,287 | unrecorded | unrecorded | unknown |
| `structural-pass` | 1 | 83 | 23.4 | 214,902 | unrecorded | unrecorded | unknown |
| `generate-report` | 1 | 56 | 18.6 | 232,220 | unrecorded | unrecorded | unknown |
| `deliver-result` | 1 | 14 | 1.7 | 71,293 | unrecorded | unrecorded | unknown |
| **Total** | **4** | **174** | **53.2** | **615,702** | | | **unknown** |

Session elapsed: 79.7 min.

## Run totals

| Scope | Rows | Tool uses | Duration (min) | Subagent tokens | Cost |
|---|---|---|---|---|---|
| Meta `H376E6` | 4 | 31 | 6.2 | 290,213 | unknown |
| Client `2J6KER` | 11 | 125 | 43.1 | 1,249,494 | unknown |
| Group 1 `YM6QZV` | 6 | 245 | 74.2 | 859,299 | unknown |
| Group 2 `7OPXHM` | 4 | 174 | 53.2 | 615,702 | unknown |
| **Run** | **25** | **575** | **176.7** | **3,014,708** | **unknown** |

The run total is a **floor**: three dispatch legs across the meta and client sessions left no ledger row.

Accounted execution time is 176.7 min (2.9 h) against 22.3 h of meta-session wall clock. The difference is time spent waiting at checkpoints for user decisions, not compute. Wall-clock spans are not additive across sessions and are omitted from the totals column for that reason.

The two `prism` group sessions carry 1,475,001 tokens, 49 percent of the run — analysis dominates the cost, and the meta layer's 290,213 is 10 percent.

## Estimate, not a bill

These figures are the workflow-server ledger's own accounting of subagent token counts and dispatch durations. They are an estimate of consumption, not a billing record. No model identity or price table version was recorded against any dispatch, so no monetary figure can be derived from them without re-deriving which model served each dispatch.
