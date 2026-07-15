# Test Plan: Token Use Tracking and Cost Estimation

> **ADR:** `adr-token-use-tracking` · **Ticket:** [#232](https://github.com/m2ux/workflow-server/issues/232) · **PR:** [#233](https://github.com/m2ux/workflow-server/pull/233)

## Overview

This test plan validates per-activity + per-workflow token-use capture, cost estimation, durable persistence in `session.json`, and graceful degradation.

Key changes to validate:
1. `usageSchema` param on `next_activity` - accepts an optional native-usage object at the transition seam.
2. `SessionFile.usage` field + `usage_recorded` event - the durable rolled-up record and per-event audit trail.
3. `estimateCost` - cost from the config price table with derived cache multipliers; unknown model → `null`.
4. `sumUsageTree` - child-inclusive per-workflow roll-up over `triggeredWorkflows`.

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR233-TC-01 | Verify a `SessionFile` parses with the `usage` field present and round-trips through the HMAC seal | Unit |
| PR233-TC-02 | Verify an existing `SessionFile` with `usage` absent parses unchanged (back-compat, SC-6) | Unit |
| PR233-TC-03 | Verify a `usage_recorded` history entry validates against `HistoryEntrySchema` | Unit |
| PR233-TC-04 | Verify canonical serialization places `usage` per `TOP_LEVEL_KEY_PRIORITY` | Unit |
| PR233-TC-05 | Verify `estimateCost` computes base input/output cost per the price table | Unit |
| PR233-TC-06 | Verify `estimateCost` derives cache rates (5m ×1.25, 1h ×2, read ×0.1) from base input (RS-2) | Unit |
| PR233-TC-07 | Verify `estimateCost` returns `null` for a model absent from the price table (SC-4) | Unit |
| PR233-TC-08 | Verify `sumUsageTree` sums parent + nested child `workflowTotal` over the tree (SC-5) | Unit |
| PR233-TC-09 | Verify the config price table defaults load and `PRICE_TABLE_VERSION` env override applies (MD-5) | Unit |
| PR233-TC-10 | Verify `next_activity` accepts a `usage` param and records a per-activity entry keyed to the exited activity (SC-2) | Integration |
| PR233-TC-11 | Verify `next_activity` with the `usage` param omitted completes and records no usage (graceful, SC-6) | Integration |
| PR233-TC-12 | Verify recorded figures include cache-read/cache-write when supplied and omit them when absent (SC-2) | Integration |
| PR233-TC-13 | Verify per-activity capture rolls up into `workflowTotal`, stamped with `model` + `priceTableVersion` (SC-3) | Integration |
| PR233-TC-14 | Verify a dispatched child's usage is included in the parent `workflowTotal` at completion (SC-5) | Integration |
| PR233-TC-15 | Verify an unknown model records tokens with `cost_usd: null` and the run completes (SC-4) | Integration |
| PR233-TC-16 | Verify `build:schemas` regenerates `session-file.schema.json`/`state.schema.json` in sync | Integration |
| PR233-TC-17 | Verify a completed run produces `NN-token-usage.md` + a README summary/link matching session state (SC-1) | E2E |

*Detailed steps, expected results, and source links will be added after implementation.*

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-1 | Completion artifact + README summary/link exist and match state | PR233-TC-17 |
| SC-2 | Input/output/total + cache figures when present; absent omitted | PR233-TC-10, PR233-TC-12 |
| SC-3 | Cost frozen per activity + per workflow, stamped model + price-table version | PR233-TC-13 |
| SC-4 | Unknown model → tokens recorded, cost `unknown`, no failure | PR233-TC-07, PR233-TC-15 |
| SC-5 | Per-workflow totals include child (`triggeredWorkflows`) usage | PR233-TC-08, PR233-TC-14 |
| SC-6 | No usage relayed → run completes, figures omitted, nothing fabricated | PR233-TC-02, PR233-TC-11 |

## Running Tests

*Commands will be added after implementation.*
