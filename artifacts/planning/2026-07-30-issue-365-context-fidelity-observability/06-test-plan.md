# Test Plan: Context Fidelity and Observability

> **ADR:** [0008-context-fidelity-observability](../../adr/0008-context-fidelity-observability.md) · **Ticket:** [#365](https://github.com/m2ux/workflow-server/issues/365) · **PR:** [#366](https://github.com/m2ux/workflow-server/pull/366) · **Tip:** [`b5cc8985`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5)

## Overview

This test plan validates server-side reconciliation, token usage rollup (no price), delivery-dedup coverage, and multi-agent observability for items S2–S5.

Key changes validated:
1. `projectUsage` — rows plus plain-sum token aggregate; optional agent filter
2. `record_usage` — optional `agent_id` → `data.agentId`
3. `validateTechniqueFetches` — agent-scoped fetch credit
4. Trace / `get_trace` — per-call `aid` and agent filter
5. `next_activity` — `artifacts_produced` accumulation + planning-folder id diff
6. `dedupTechniqueBlocks` — `provenance_note` + split inherited note/items
7. Resource load path — dual-mode unresolvable warnings; cross-workflow id qualify
8. Hybrid `step_started` / `step_completed` emission (RE-8)
9. Inspect oracle + parity loop over full `INSPECT_SESSION_VIEWS`

## Test Cases (source-linked)

Commit base for links: [`b5cc8985`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5).

| Test ID | Objective | Type | Source |
|---------|-----------|------|--------|
| PR366-TC-01 / 02 | Optional `agent_id`; omit stays unattributed | Unit | [`mcp-server.test.ts:920`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/mcp-server.test.ts#L920) |
| PR366-TC-03 / 05 | Plain-sum aggregate; no cost field | Unit | [`mcp-server.test.ts:952`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/mcp-server.test.ts#L952) |
| PR366-TC-04 | Resumed-dispatch DELTA (covered by aggregate + resume fixtures in same block) | Integration | [`mcp-server.test.ts:952`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/mcp-server.test.ts#L952) |
| PR366-TC-06 | Stale usage-on-`next_activity` phrases absent | Unit | [`mcp-server.test.ts:968`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/mcp-server.test.ts#L968) |
| PR366-TC-07 | Delivery-ledger namespace comment matches keys | Unit | [`mcp-server.test.ts:979`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/mcp-server.test.ts#L979) |
| PR366-TC-08 | `provenance_note` marker on second sibling | Unit | [`reference-delivery.test.ts:934`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/reference-delivery.test.ts#L934) |
| PR366-TC-09 | Inherited `note` marker; `items` full | Unit | [`reference-delivery.test.ts:963`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/reference-delivery.test.ts#L963) |
| PR366-TC-10 / 11 | Bench arms (manual S4 measurement) | Performance | Host `npm run bench:token` / `bench:dispatch -- --gate` (not automated in CI) |
| PR366-TC-12 / 13 | Per-call `aid`; `get_trace` filter ⊂ unfiltered | Integration | [`mcp-server.test.ts:1073`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/mcp-server.test.ts#L1073) |
| PR366-TC-14 | Sibling fetch does not credit | Integration | [`validation.test.ts:494`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/validation.test.ts#L494) |
| PR366-TC-15 / 16 / 17 | History/usage agent filter + oracle + `INSPECT_SESSION_VIEWS` loop | Integration | [`inspect_session.py`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fixtures/inspect-session/inspect_session.py) + mcp-server parity suite |
| PR366-TC-18 / 19 | Unresolvable resource warn full + reference | Integration | Covered in fetch/resource paths exercised by [`fetch-observability.test.ts`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fetch-observability.test.ts) |
| PR366-TC-20 | `qualifyResourceId` cross-workflow prefix | Unit | [`resource-ref.test.ts:4`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/resource-ref.test.ts#L4) |
| PR366-TC-21 | Bundled idempotent `step_started` | Integration | [`fetch-observability.test.ts:316`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fetch-observability.test.ts#L316) |
| PR366-TC-22 | `step_completed` at transition | Integration | [`fetch-observability.test.ts:334`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fetch-observability.test.ts#L334) |
| PR366-TC-23 | Multi lazy starts distinct timestamps | Integration | [`fetch-observability.test.ts:362`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fetch-observability.test.ts#L362) |
| PR366-TC-24 / 25 | Undeclared warn; outside-folder unknown | Integration | [`fetch-observability.test.ts:381`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fetch-observability.test.ts#L381) |
| PR366-TC-26 | Declaration at N suppresses at N+1 | Integration | [`fetch-observability.test.ts:415`](https://github.com/m2ux/workflow-server/blob/b5cc898595c086d8b265012bc5c2f0dfc85582c5/tests/fetch-observability.test.ts#L415) |

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-1 | Undeclared files named; join on id; unknown vs missing; success; no auto-manifest | PR366-TC-24, PR366-TC-25 |
| SC-2 | Manifest accumulates across activities | PR366-TC-26 |
| SC-3 | Optional `agent_id`; omit still valid | PR366-TC-01, PR366-TC-02 |
| SC-4 | DELTA + aggregate = plain sum | PR366-TC-03, PR366-TC-04 |
| SC-5 | Token aggregate only; no required price field | PR366-TC-05 |
| SC-6 | Stale usage statements gone; ledger namespaces match | PR366-TC-06, PR366-TC-07 |
| SC-7 | Honest before/after on dispatch bench arm | PR366-TC-11 (manual) |
| SC-8 | provenance_note + split note/items markers | PR366-TC-08, PR366-TC-09 |
| SC-9 | A0 dry compare; conditional re-freeze | PR366-TC-10 (manual) |
| SC-10 | Per-call `aid` + filtered get_trace | PR366-TC-12, PR366-TC-13 |
| SC-11 | No sibling fetch credit | PR366-TC-14 |
| SC-12 | Agent filter history+usage; oracle; full view loop | PR366-TC-15, PR366-TC-16, PR366-TC-17 |
| SC-13 | Resource warn full + reference | PR366-TC-18, PR366-TC-19 |
| SC-14 | Qualify + corpus 29→12 | PR366-TC-20 (+ corpus replay on host) |
| RE-8 | Hybrid step events | PR366-TC-21, PR366-TC-22, PR366-TC-23 |

## Running Tests

```bash
# From target worktree (.worktrees/.../feat/365-context-fidelity-observability)
npm run typecheck
npm run test:ci
# Focused:
npx vitest run tests/mcp-server.test.ts tests/reference-delivery.test.ts \
  tests/validation.test.ts tests/fetch-observability.test.ts tests/resource-ref.test.ts
# Benches (manual, S4):
npm run bench:dispatch -- --gate
npm run bench:token
```

**Validation result (close-out):** `npm run test:ci` — **787 passed**.
