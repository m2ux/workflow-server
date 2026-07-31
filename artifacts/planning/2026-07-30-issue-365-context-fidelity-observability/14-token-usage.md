# Token Use and Cost Estimate

> Context Fidelity and Observability · #365 · session `7Q54WJ` · 2026-07-31

Figures are a **cost estimate** from harness-relayed usage rows. They are meaningful for API-key per-token billing; on Pro/Max subscriptions the figure is not a bill. This package ships **no price table** (D-4) — money columns are `unknown`.

## Usage coverage (ledger vs dispatches)

| Metric | Count |
|--------|------:|
| Ledger entries (`activity_usage` on work-package session) | 8 |
| Actual activity dispatches | 29 |
| Unaccounted dispatches | 21 |

Totals below are a **floor** — 21 of 29 dispatches carry no recorded usage figure.

## Per-activity table

Rows are DELTA figures as stored (`subagent_tokens` is the only numeric token key present on this run). Resume rows are separate ledger entries.

| Activity | Dispatch | subagent_tokens | duration_ms | tool_uses | model | priceTableVersion | cost_usd |
|----------|----------|----------------:|------------:|----------:|-------|-------------------|----------|
| start-work-package | initial | 136552 | 698655 | 49 | — | — | unknown |
| start-work-package | resume-after-checkpoint | 156898 | 785533 | 17 | — | — | unknown |
| design-philosophy | initial | 91361 | 568967 | 15 | — | — | unknown |
| design-philosophy | resume-after-checkpoint | 135023 | 640009 | 17 | — | — | unknown |
| codebase-comprehension | initial | 313561 | 1575989 | 111 | — | — | unknown |
| codebase-comprehension | resume-after-checkpoint | 317108 | 132745 | 6 | — | — | unknown |
| requirements-elicitation | initial | 60842 | 111595 | 13 | — | — | unknown |
| requirements-elicitation | resume-after-checkpoint | 167870 | 946350 | 51 | — | — | unknown |
| research … complete | (no ledger rows) | — | — | — | — | — | unknown |

## Per-workflow totals (floor)

| Field | Value |
|-------|------:|
| subagent_tokens (sum of 8 rows) | 1 379 215 |
| duration_ms (sum) | 5 459 843 |
| tool_uses (sum) | 279 |
| cost_usd | unknown (D-4 — price deferred) |

**Caveat:** Cost is an **estimate**. Without a price table and with 21 unaccounted dispatches, treat token totals as a lower bound on run spend, not a complete bill.
