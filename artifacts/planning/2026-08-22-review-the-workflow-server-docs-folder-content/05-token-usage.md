# Token Use and Cost Estimate

> Workflow Server docs/ documentation set · plain-language run · client session `OC4BF5` · meta session `H7JBHR` · 2026-08-22

Figures are a **cost estimate** rolled up from harness-relayed usage rows. They are meaningful for API-key per-token billing; on a Pro or Max subscription the figure is not a bill. This run ships **no price table**, so every money column reads `unknown`.

## Usage coverage (ledger vs dispatches)

| Metric | Count |
|--------|------:|
| Ledger entries (`activity_usage` on client session `OC4BF5`) | 8 |
| Client activity dispatches | 6 |
| Client activities holding no ledger row | 0 |
| Unaccounted remainder | 0 |

Coverage is complete: every client activity that ran left at least one row, the terminal `deliver` dispatch included. Rows outnumber dispatches because `evaluate` carries three rows across two agent contexts and `draft` carries two rows on two different bases.

## Per-activity table — client session `OC4BF5`

Rows are stored as recorded. A **delta** row counts one dispatch's own consumption; the single **cumulative** row reports an agent context's running total and is therefore held out of the delta sums below rather than added to them.

| Activity | Agent | Basis | subagent_tokens | input / output | Tool uses | Requests | Duration (min) | Model | priceTableVersion | Cost |
|----------|-------|-------|----------------:|---------------:|----------:|---------:|---------------:|-------|-------------------|------|
| intake-and-profile | pl-worker-01 | delta | 88 050 | — | 23 | — | 4.5 | — | — | unknown |
| source-analysis | pl-worker-01 | delta | — | 9 028 / 67 131 | — | 193 | — | — | — | unknown |
| draft | unattributed | cumulative | 350 308 | — | 95 | — | 67.3 | — | — | unknown |
| draft | pl-worker-01 | delta | — | 316 / 81 403 | — | 167 | — | — | — | unknown |
| evaluate (pre-gate) | pl-worker-02 | delta | 155 328 | — | 42 | — | 6.1 | — | — | unknown |
| evaluate | worker-evaluate-01 | delta | 140 868 | — | 60 | — | 9.0 | — | — | unknown |
| evaluate | worker-evaluate-01 | delta | 294 801 | — | 90 | — | 18.5 | — | — | unknown |
| deliver | worker-evaluate-01 | delta | 332 366 | — | 18 | — | 4.6 | — | — | unknown |

Cache traffic sits on the two rows that report input and output tokens.

| Activity | cache_creation_input_tokens | cache_read_input_tokens |
|----------|----------------------------:|------------------------:|
| source-analysis | 1 487 867 | 17 935 886 |
| draft | 1 859 217 | 45 775 271 |

## Per-workflow totals

| Field | Value |
|-------|------:|
| subagent_tokens (delta rows) | 1 011 413 |
| input_tokens (delta rows) | 9 344 |
| output_tokens (delta rows) | 148 534 |
| cache_creation_input_tokens | 3 347 084 |
| cache_read_input_tokens | 63 711 157 |
| Tool uses (delta rows) | 233 |
| Requests (delta rows) | 360 |
| Reported duration, delta rows (min) | 42.7 |
| Session elapsed wall clock (min) | 141.5 |
| cost_usd | unknown (no price table) |

The cumulative `draft` row's 350 308 subagent tokens and 67.3 reported minutes sit outside these sums, held as that context's running total.

Wall clock per activity does not add up to the session elapsed figure — dispatches overlap, and the `evaluate` stage overlapped with itself.

| Activity | Wall clock (min) |
|----------|-----------------:|
| intake-and-profile | 15.0 |
| source-analysis | 14.5 |
| draft | 68.7 |
| evaluate | 33.8 |
| deliver | not recorded |

## Meta session `H7JBHR` — orchestration, outside the client totals

| Activity | Agent | Basis | subagent_tokens | Tool uses | Duration (min) | Cost |
|----------|-------|-------|----------------:|----------:|---------------:|------|
| discover-session | worker-discover-01 | delta | 68 428 | 12 | 1.6 | unknown |
| initialize-session | worker-discover-01 | delta | 74 742 | 5 | 0.6 | unknown |
| resolve-target | worker-discover-01 | delta | 80 718 | 8 | 1.5 | unknown |
| dispatch-client-workflow | worker-dispatch-02 | delta | 105 474 | 44 | 17.6 | unknown |
| dispatch-client-workflow | worker-dispatch-02 | cumulative | 203 442 | 90 | 94.3 | unknown |

Delta total: 329 362 subagent tokens over 21.3 reported minutes; meta session elapsed wall clock is 161.5 minutes. The cumulative row is that context's running total and is held out of the delta sum.

Combined delta subagent tokens for the run, client plus meta: **1 340 775**.

**Caveat:** every figure here is an estimate. Without a price table, treat the token totals as the run's measured consumption rather than a bill.
