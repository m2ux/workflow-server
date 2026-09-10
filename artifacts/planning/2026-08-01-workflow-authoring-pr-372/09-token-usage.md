# Token Use and Cost Estimate

> Workflows corpus batch (PR #372) · workflow-authoring session `WEGGYY` · 2026-08-01

Figures are a **cost estimate** from harness-relayed usage rows. They are meaningful for API-key per-token billing; on subscription plans the figure is not a bill. No price table is bound on this run — money columns are `unknown`.

## Usage coverage (ledger vs dispatches)

| Metric | Count |
|--------|------:|
| Ledger entries (`activity_usage` on client session) | 3 |
| Actual activity dispatches | 7 |
| Unaccounted dispatches | 4 |

Totals below are a **floor** — 4 of 7 dispatches carry no recorded usage figure.

## Per-activity table

Rows are DELTA figures as stored (`subagent_tokens` is the only numeric token key present on this run). Resume rows are separate ledger entries. Duration (min) = `duration_ms / 60000`, one decimal.

| Activity | Dispatch | subagent_tokens | Duration (min) | tool_uses | model | priceTableVersion | cost_usd |
|----------|----------|----------------:|---------------:|----------:|-------|-------------------|----------|
| intake-and-context | initial (ended at checkpoint impact-approved) | 125425 | 13.5 | 51 | — | — | unknown |
| intake-and-context | resume after checkpoint impact-approved | 124543 | 0.8 | 2 | — | — | unknown |
| scope-and-draft | initial (ended at checkpoint scope-confirmed#0) | 150320 | 17.4 | 44 | — | — | unknown |
| scope-and-draft | resume after checkpoint scope-confirmed#0 | — | — | — | — | — | unknown |
| quality-review | initial | — | — | — | — | — | unknown |
| validate-and-commit | initial (ended at checkpoint approve-to-commit#0) | — | — | — | — | — | unknown |
| validate-and-commit | resume after checkpoint approve-to-commit#0 (terminal) | — | — | — | — | — | unknown |

## Per-workflow totals (floor)

| Field | Value |
|-------|------:|
| subagent_tokens (sum of 3 rows) | 400288 |
| Duration (min) (sum of ledger rows) | 31.7 |
| tool_uses (sum) | 97 |
| cost_usd | unknown |

**Caveat:** Cost is an **estimate**. Without a price table and with 4 unaccounted dispatches, treat token totals as a lower bound on run spend, not a complete bill.
