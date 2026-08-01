# Token Use and Cost Estimate

> Corpus condition-to-when migration · workflow-authoring session `ZR4PDX` · 2026-08-01

Figures are a **cost estimate** from harness-relayed usage rows. They are meaningful for API-key per-token billing; on subscription plans the figure is not a bill. No price table is bound on this run — money columns are `unknown`.

## Usage coverage (ledger vs dispatches)

| Metric | Count |
|--------|------:|
| Ledger entries (`activity_usage` on client session) | 3 |
| Actual activity dispatches | 6 |
| Unaccounted dispatches | 3 |

Totals below are a **floor** — 3 of 6 dispatches carry no recorded usage figure.

## Per-activity table

Rows are DELTA figures as stored (`subagent_tokens` is the only numeric token key present on this run). Resume rows are separate ledger entries. Duration (min) = `duration_ms / 60000`, one decimal.

| Activity | Dispatch | subagent_tokens | Duration (min) | tool_uses | model | priceTableVersion | cost_usd |
|----------|----------|----------------:|---------------:|----------:|-------|-------------------|----------|
| intake-and-context | initial | 140170 | 13.5 | 48 | — | — | unknown |
| scope-and-draft | initial (ended at checkpoint scope-confirmed#0) | 94748 | 8.4 | 35 | — | — | unknown |
| scope-and-draft | resume after checkpoint scope-confirmed#0 | 101614 | 14.8 | 45 | — | — | unknown |
| quality-review (3 dispatches) | (no ledger rows) | — | — | — | — | — | unknown |
| validate-and-commit | (no ledger row) | — | — | — | — | — | unknown |

## Per-workflow totals (floor)

| Field | Value |
|-------|------:|
| subagent_tokens (sum of 3 rows) | 336532 |
| Duration (min) (sum of ledger rows) | 36.6 |
| tool_uses (sum) | 128 |
| cost_usd | unknown |

**Caveat:** Cost is an **estimate**. Without a price table and with 3 unaccounted dispatches, treat token totals as a lower bound on run spend, not a complete bill.
