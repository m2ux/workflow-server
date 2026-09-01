# Token Usage

Cost record for the `workflow-authoring` run on issue #519. This file is the sole cost home for the run; the mechanical trace in [`09-session-trace.md`](./09-session-trace.md) links here rather than restating figures.

Figures are read from the workflow-server `activity_usage` ledger after the client workflow reached its terminal activity.

## Sessions accounted

| Session | Workflow | Role | Status |
|---|---|---|---|
| `QZAMAD` | `meta` v6.1.0 | Meta orchestration | running (closing) |
| `3IXIS7` | `workflow-authoring` v1.6.0 | Client authoring workflow | running at terminal activity `validate-and-commit` |

## usage_coverage

| Session | Ledger rows | Dispatches | Unaccounted | Totals are |
|---|---|---|---|---|
| `QZAMAD` | 4 | 5 | 1 | **floor** |
| `3IXIS7` | 7 | 7 | 0 | **floor** |

The meta remainder is the `end-workflow` dispatch itself, in flight while this file is written; the orchestrator accounts it after the worker envelope returns. The client session leaves no dispatch unledgered — its total is a floor for a different reason, given under Reporting basis below.

No ledger row on either session carries a `model` or `priceTableVersion` field, so every cost cell reads `unknown` and no price table is cited.

## Reporting basis

Rows arrive on one of two bases. A `delta` row states what that dispatch spent and is additive. A `cumulative` row states an agent context's running figure at that moment, so cumulative rows are read one-per-agent — the latest — rather than summed.

On the meta session the two bases fall to different agents: `worker-QZAMAD-01` filed three delta rows, `worker-QZAMAD-02` a single cumulative row. The two are disjoint and add cleanly.

On the client session they do not. `worker-3IXIS7-01` filed two delta rows for `intake-and-context` and then two cumulative rows for `scope-and-draft` and `quality-review`; the ledger does not record whether those cumulative figures already contain the agent's earlier delta spend. Adding the delta subtotal to that agent's latest cumulative figure would risk counting `intake-and-context` twice, so the client total below is the additive delta subtotal alone and is labelled a floor. Were the delta subtotal and both agents' latest cumulative figures additive, the client figure would be 972,561; the ledger does not evidence that they are.

## Meta session `QZAMAD` — `meta`

| Activity | Rows | Tool uses | Duration (min) | Subagent tokens | Basis | Model | priceTableVersion | Cost |
|---|---|---|---|---|---|---|---|---|
| `discover-session` | 1 | 12 | 2.1 | 71,916 | delta | unrecorded | unrecorded | unknown |
| `initialize-session` | 1 | 6 | 0.8 | 80,692 | delta | unrecorded | unrecorded | unknown |
| `resolve-target` | 1 | 8 | 2.0 | 87,521 | delta | unrecorded | unrecorded | unknown |
| `dispatch-client-workflow` | 1 | 14 | 21.6 | 111,729 | cumulative | unrecorded | unrecorded | unknown |
| `end-workflow` | 0 | — | — | — | — | unrecorded | unrecorded | unknown |
| **Total** | **4** | **40** | **26.5** | **351,858** | | | | **unknown** |

Delta subtotal 240,129, plus `worker-QZAMAD-02`'s latest cumulative figure of 111,729. Session elapsed: 2,412.9 min (40.2 h).

## Client session `3IXIS7` — `workflow-authoring`

| Activity | Rows | Tool uses | Duration (min) | Subagent tokens | Basis | Model | priceTableVersion | Cost |
|---|---|---|---|---|---|---|---|---|
| `intake-and-context` | 2 | 86 | 13.8 | 334,779 | delta | unrecorded | unrecorded | unknown |
| `scope-and-draft` | 1 | 43 | 8.1 | 248,940 | cumulative | unrecorded | unrecorded | unknown |
| `quality-review` | 2 | 170 | 30.8 | 361,224 / 208,327 | cumulative | unrecorded | unrecorded | unknown |
| `validate-and-commit` | 2 | 197 | 29.6 | 125,406 / 276,558 | cumulative | unrecorded | unrecorded | unknown |
| **Total** | **7** | **496** | **82.3** | **≥ 334,779** | | | | **unknown** |

The paired figures on `quality-review` and `validate-and-commit` are the two rows each activity carries, one per agent context or one per pass; they are readings at a moment, not a sum. Latest cumulative figures by agent: `worker-3IXIS7-01` 361,224, `worker-3IXIS7-02` 276,558. Session elapsed: 2,407.3 min (40.1 h).

## Run totals

| Scope | Rows | Tool uses | Duration (min) | Subagent tokens | Cost |
|---|---|---|---|---|---|
| Meta `QZAMAD` | 4 | 40 | 26.5 | 351,858 | unknown |
| Client `3IXIS7` | 7 | 496 | 82.3 | ≥ 334,779 | unknown |
| **Run** | **11** | **536** | **108.8** | **≥ 686,637** | **unknown** |

The run total is a **floor** twice over: one meta dispatch left no ledger row, and five client rows report on a basis that cannot be added to the client delta subtotal.

Accounted execution time is 108.8 min (1.8 h) against 40.2 h of meta-session wall clock. The difference is time spent waiting at checkpoints for user decisions, not compute — one gate alone, `approve-to-commit#1`, stood open for 29.2 h. Wall-clock spans are not additive across sessions and are omitted from the totals column for that reason.

The client session carries 496 of the run's 536 tool calls, 93 percent; the meta layer's four dispatches account for the remaining 40.

## Estimate, not a bill

These figures are the workflow-server ledger's own accounting of subagent token counts and dispatch durations. They are an estimate of consumption, not a billing record. No model identity or price table version was recorded against any dispatch, so no monetary figure can be derived from them without re-deriving which model served each dispatch.
