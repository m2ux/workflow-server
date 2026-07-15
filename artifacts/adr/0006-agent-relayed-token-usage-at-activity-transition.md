# ADR-0006: Agent-Relayed Token Usage at the Activity Transition Seam

**Status:** Proposed
**Date:** 2026-07-15
**Issue:** [#232](https://github.com/m2ux/workflow-server/issues/232)
**PR:** [#233](https://github.com/m2ux/workflow-server/pull/233)

---

## Context

### Technical Forces

The workflow-server observes only MCP tool-call payloads. It has no access to the agent's LLM context or tokenizer, so it cannot faithfully measure token consumption itself. Session state persists in a HMAC-sealed `session.json` under each work package's planning folder; activities advance at the `next_activity` transition seam where the orchestrator records the exited activity and enters the next one.

Stakeholders need a durable per-activity and per-workflow usage record with a cost estimate frozen at capture time, including usage from dispatched child workflows, without blocking runs when figures or model prices are missing.

### Business Forces

Work-package owners and platform maintainers need to review spend after a run completes, identify expensive activities, and compare efficiency across runs. Cost figures are guidance for API-key billing contexts, not authoritative invoices.

### Operational Forces

Usage must degrade gracefully: absent relayed figures are omitted (not fabricated); unknown models record tokens with `cost_usd: null`. The server must not write human-readable planning artifacts — agents render `.md` files from structured session state.

## Decision Drivers

1. **Faithfulness** — Recorded usage must reflect native model-reported figures, not server-side approximations.
2. **Attribution** — Per-activity capture must align with a stable, auditable workflow boundary.
3. **Durability** — Usage must survive in the same sealed session store as the rest of workflow state.
4. **Graceful degradation** — Missing usage or unknown pricing must never block a run.
5. **Separation of concerns** — Structured state is server-owned; rendered artifacts are agent-owned.

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Declared `usage` param on `next_activity`** (selected) | Zod-validated at the MCP boundary; exact per-activity attribution at the transition seam; harness-agnostic; missing figure visibly missing | Requires a corpus instruction for the orchestrator to populate the param |
| Request usage via SDK `_meta` / extra channel | Same data source potential | Unvalidated; silent when absent; couples to request shaping |
| Claude Code OpenTelemetry ingest | Automatic emission from harness | No per-activity identifier; cost meaningless on flat subscriptions; adds OTLP infrastructure |
| Server-side re-tokenization | No relay channel needed | Unfaithful to actual model usage; violates native-usage constraint |

**Rejected:** OTEL deferred as optional future enrichment; re-tokenization rejected outright; `_meta` rejected as strictly weaker than a declared param.

## Decision

Implement **agent-relayed native usage** captured at the **`next_activity` transition seam** via an optional, Zod-validated `usage` object parameter. The orchestrator (not the worker) reads harness-reported completion usage and passes it on the subsequent `next_activity` call for the activity just completed.

Persist usage as:
- `usage_recorded` history events (audit trail)
- A rolled-up optional `SessionFile.usage` field (`perActivity` + `workflowTotal`)

Estimate cost at capture time from a versioned config price table (base input/output per model + derived cache multipliers). Stamp each entry with `model` and `priceTableVersion`. Unknown model → tokens recorded, `cost_usd: null`.

At workflow completion, fold child workflow usage into the parent total via in-tree traversal of embedded `triggeredWorkflows` state (`sumUsageTree`).

Render completion artifacts (per-activity table, totals, cost estimate) from session state via corpus-side completion techniques — the server writes no `.md`.

## Consequences

**Positive:**
- Durable, reproducible usage record tied to workflow activities
- Clear audit trail via history events
- Child-inclusive totals without extra I/O
- Backward compatible — existing sessions and callers unchanged until usage is relayed

**Negative:**
- Server param is inert until corpus instructs the orchestrator to populate it
- Per-activity granularity mis-attributes spend in checkpoint/dispatch windows (accepted for v1)
- Anthropic-seeded price table ties cost estimates to a specific vendor's published rates

**Neutral:**
- Cost is an estimate labelled for guidance; subscription billing contexts may find it less meaningful

## Related Decisions

- [ADR-0003: Server-Managed Session State](0003-server-managed-session-state.md) — `session.json` as durable store; server owns structured state, agents read but do not write sealed files.

## Confirmation

- Success criteria SC-1..SC-6 in [requirements elicitation](../artifacts/planning/2026-07-14-token-use-tracking/03-requirements-elicitation.md#success-criteria)
- Unit and integration tests mapped in [test plan](../artifacts/planning/2026-07-14-token-use-tracking/06-test-plan.md)

## References

- [KB & web research — DI-1 channel head-to-head](../artifacts/planning/2026-07-14-token-use-tracking/04-kb-research.md#di-1-channel--head-to-head)
- [Implementation analysis](../artifacts/planning/2026-07-14-token-use-tracking/05-implementation-analysis.md)
- [Work package plan](../artifacts/planning/2026-07-14-token-use-tracking/06-work-package-plan.md)
