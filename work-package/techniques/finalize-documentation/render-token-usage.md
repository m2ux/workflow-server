---
metadata:
  version: 1.2.0
---

## Capability

Sole cost home for a run — the token-use and cost-estimate artifact, reconciled against the run's actual dispatch count, with a one-line README link. A draft written mid-`complete` is revised after the client exits by [workflow-engine::revise-session-metrics](../../../meta/techniques/workflow-engine/revise-session-metrics.md) so the terminal activity is included.

## Inputs

### planning_folder_path

Path to the planning folder where the token-usage artifact is written and the README lives.

### trace_tokens

*(optional)* Opaque trace tokens accumulated across the run; the dispatch record the ledger is reconciled against. Empty when the run accumulated none.

## Outputs

### token_usage_document

Per-activity token table, per-workflow totals, cost estimate (labelled an estimate), and the ledger-versus-dispatch reconciliation.

#### artifact

`token-usage.md`

#### usage_coverage

Share of the run's dispatches the ledger accounts for: ledger entry count, actual dispatch count, and the unaccounted remainder. The remainder is zero when every dispatch carries a figure.

## Protocol

### 1. Read the Ledger

- Read rolled-up usage from session state. When usage is absent, skip artifact creation and README update — do not fabricate figures.

### 2. Reconcile Against Dispatches

- Resolve `{trace_tokens}` and count the run's actual dispatches from the resolved trace. Skip the count when `{trace_tokens}` is empty.
- Count the ledger's entries — the transition-keyed usage records session state holds.
- Emit `{token_usage_document.usage_coverage}` from the two counts. The ledger carries one entry per recorded dispatch, so the remainder counts the dispatches whose figure the harness never surfaced or that went unrecorded.

### 3. Write the Cost Artifact

- Create `{token_usage_document}` at `{planning_folder_path}` per [artifact-prefix](../manage-artifacts/TECHNIQUE.md#artifact-prefix) containing:
  - A title identifying this as a token-use and cost **estimate** for the work package.
  - A per-activity table: activity id, input/output/total tokens, cache-read and cache-write columns when present, **Duration (min)** (convert harness `duration_ms` with `min = ms / 60000`, one decimal), model, `priceTableVersion`, and per-activity cost (or `unknown` when `cost_usd` is null).
  - A per-workflow totals section with input/output/total tokens, total wall duration in minutes, and total cost (or `unknown` when unpriced activities contributed).
  - The reconciliation from `{token_usage_document.usage_coverage}`: ledger entries, actual dispatches, and the unaccounted count. When the unaccounted count is above zero, state the totals as a floor rather than a total.
  - A caveat that cost is an **estimate** meaningful for API-key per-token billing; on Pro/Max subscriptions the figure is not a bill.
- A mid-`complete` write is a **draft**: it cannot yet include the terminal activity's own dispatch figure. [workflow-engine::revise-session-metrics](../../../meta/techniques/workflow-engine/revise-session-metrics.md) (meta `end-workflow`) rewrites the same artifact after client exit.

### 4. Link From the README

- Add one line to the planning folder `README.md` summarizing total tokens and estimated cost with a markdown link to the token-usage artifact. When usage was absent, omit the line.


## Rules

### estimate-not-bill

Always label cost as an estimate. Carry the API-key-vs-subscription caveat in the artifact body.

### no-fabrication

When session state has no `usage` field, produce no artifact and no README line.

### reconciled-or-a-floor

A total is reported as a total only when `{token_usage_document.usage_coverage}` shows every dispatch accounted for. With any dispatch unaccounted, the figure is labelled a floor and the unaccounted count is stated beside it — an unreconciled ledger understates a run by however much it cannot see, and an unlabelled understatement reads as a measurement.
