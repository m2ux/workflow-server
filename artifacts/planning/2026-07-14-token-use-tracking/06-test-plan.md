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

| Test ID | Objective | Type | Source |
|---------|-----------|------|--------|
| PR233-TC-01 | Verify a `SessionFile` parses with the `usage` field present and round-trips through the HMAC seal | Unit | [session-schema.test.ts:331](https://github.com/m2ux/workflow-server/blob/92536815/tests/session-schema.test.ts#L331) |
| PR233-TC-02 | Verify an existing `SessionFile` with `usage` absent parses unchanged (back-compat, SC-6) | Unit | [session-schema.test.ts:355](https://github.com/m2ux/workflow-server/blob/92536815/tests/session-schema.test.ts#L355) |
| PR233-TC-03 | Verify a `usage_recorded` history entry validates against `HistoryEntrySchema` | Unit | [session-schema.test.ts:360](https://github.com/m2ux/workflow-server/blob/92536815/tests/session-schema.test.ts#L360) |
| PR233-TC-04 | Verify canonical serialization places `usage` per `TOP_LEVEL_KEY_PRIORITY` | Unit | [session-store.test.ts:73](https://github.com/m2ux/workflow-server/blob/92536815/tests/session-store.test.ts#L73) |
| PR233-TC-05 | Verify `estimateCost` computes base input/output cost per the price table | Unit | [usage.test.ts:19](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L19) |
| PR233-TC-06 | Verify `estimateCost` derives cache rates (5m ×1.25, 1h ×2, read ×0.1) from base input (RS-2) | Unit | [usage.test.ts:27](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L27) |
| PR233-TC-07 | Verify `estimateCost` returns `null` for a model absent from the price table (SC-4) | Unit | [usage.test.ts:43](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L43) |
| PR233-TC-08 | Verify `sumUsageTree` sums parent + nested child `workflowTotal` over the tree (SC-5) | Unit | [usage.test.ts:92](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L92) |
| PR233-TC-09 | Verify the config price table defaults load and `PRICE_TABLE_VERSION` env override applies (MD-5) | Unit | [config.test.ts:96](https://github.com/m2ux/workflow-server/blob/92536815/tests/config.test.ts#L96), [config.test.ts:102](https://github.com/m2ux/workflow-server/blob/92536815/tests/config.test.ts#L102) |
| PR233-TC-10 | Verify `next_activity` accepts a `usage` param and records a per-activity entry keyed to the exited activity (SC-2) | Integration | [mcp-server.test.ts:333](https://github.com/m2ux/workflow-server/blob/92536815/tests/mcp-server.test.ts#L333) |
| PR233-TC-11 | Verify `next_activity` with the `usage` param omitted completes and records no usage (graceful, SC-6) | Integration | [mcp-server.test.ts:370](https://github.com/m2ux/workflow-server/blob/92536815/tests/mcp-server.test.ts#L370) |
| PR233-TC-12 | Verify recorded figures include cache-read/cache-write when supplied and omit them when absent (SC-2) | Integration | [mcp-server.test.ts:391](https://github.com/m2ux/workflow-server/blob/92536815/tests/mcp-server.test.ts#L391) |
| PR233-TC-13 | Verify per-activity capture rolls up into `workflowTotal`, stamped with `model` + `priceTableVersion` (SC-3) | Unit | [usage.test.ts:106](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L106), [mcp-server.test.ts:354](https://github.com/m2ux/workflow-server/blob/92536815/tests/mcp-server.test.ts#L354) |
| PR233-TC-14 | Verify a dispatched child's usage is included in the parent `workflowTotal` at completion (SC-5) | Unit | [usage.test.ts:92](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L92) — integration E2E via `dispatch_child` pending |
| PR233-TC-15 | Verify an unknown model records tokens with `cost_usd: null` and the run completes (SC-4) | Integration | [mcp-server.test.ts:418](https://github.com/m2ux/workflow-server/blob/92536815/tests/mcp-server.test.ts#L418) |
| PR233-TC-16 | Verify `build:schemas` regenerates `session-file.schema.json`/`state.schema.json` in sync | Integration | [generated-schemas.test.ts:36](https://github.com/m2ux/workflow-server/blob/92536815/tests/generated-schemas.test.ts#L36) |
| PR233-TC-17 | Verify a completed run produces `NN-token-usage.md` + a README summary/link matching session state (SC-1) | E2E | Pending corpus Task 8 — [14-token-usage.md](14-token-usage.md) written manually for QOBJOC close-out |

Additional coverage: [usage.test.ts:116](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L116) (re-entered activity merge), [usage.test.ts:157](https://github.com/m2ux/workflow-server/blob/92536815/tests/usage.test.ts#L157) (null cost propagation).

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

From the feature worktree with the `workflows` git worktree present:

```bash
git worktree add ./workflows workflows   # if not already present
npm run build:schemas
npm test
```

PR233 integration tests in `mcp-server.test.ts` require the `workflows` corpus; they fail with `Workflow not found: work-package` when the worktree is absent ([10-test-suite-review](10-test-suite-review.md) TR-1).
