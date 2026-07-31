# ADR-0008: Context Fidelity and Observability (S2–S5)

## Status
Accepted

## Context
The workflow MCP server records worker claims and per-dispatch magnitudes but does not reconcile undeclared planning files, roll up token usage across a run, measure block-level delivery dedup against the fresh-mode gate, or close three observability gaps (resource validation, step events, per-agent filtering). Issue [#365](https://github.com/m2ux/workflow-server/issues/365) scopes this package to S2, S3 tail (token aggregate only), S4, and S5. Five coupled surfaces share one advisory channel (`_meta.validation` / inspect projections). Full forces and baselines: [design philosophy](../planning/2026-07-30-issue-365-context-fidelity-observability/02-design-philosophy.md), [requirements](../planning/2026-07-30-issue-365-context-fidelity-observability/03-requirements-elicitation.md).

## Decision Drivers
1. **No behavioural break on success paths** — undeclared-file handling is warn-only; existing runs stay green when operators ignore warnings.
2. **Faithful token figures** — DELTA per dispatch; plain-sum aggregate; no fabricated price in this package.
3. **Agent-scoped evidence** — multi-worker fidelity and inspect/trace filters attribute events to the worker context that incurred them.
4. **One discrepancy channel** — set-diff, reduction, and error-channel changes report through `_meta.validation` / projections, not three parallel surfaces.
5. **Server half only** — corpus persist staging remains companion [#338](https://github.com/m2ux/workflow-server/issues/338) territory.

## Considered Options

| Option | Pros | Cons |
|--------|------|------|
| **Three mechanisms, one channel** (selected) | Matches set-diff / reduction / emission shapes; single place operators look | No shared abstraction across items |
| Shared mechanism for S2/S3/S5 | One abstraction | Set-diff ≠ reduction ≠ emission |
| Block `next_activity` on undeclared files | Hard prevention | Behavioural break; strands runs |
| Price table + money on usage view | Meets original cost checkbox | Stakeholder deferred (D-4) |
| Cumulative resumed-worker usage | Matches some harness totals | Double-counts on resume; rejected for DELTA |
| Formalise improvised `dispatch` usage key | Uses live rows | Duplicates agent dimension |

## Decision
Ship four items as **three mechanisms on one advisory channel**:

| Item | Mechanism | Primary surfaces |
|------|-----------|------------------|
| **S2** | Set-diff on declared artifact **id** | Session `declaredArtifacts`; `next_activity` merge + planning-folder diff → warn-only `unknown` vs undeclared |
| **S3** | DELTA rows + plain-sum token aggregate + optional `agent_id` | `record_usage`; `projectUsage` rows + totals; no cost/price field |
| **S4** | Coverage + measure | `provenance_note` in `DEDUP_BLOCKS`; split inherited `note`/`items`; before/after `bench:dispatch` |
| **S5** | Emission + filter + warn | Trace `aid` from call `agent_id`; agent filters on trace/history/usage; resource warn both modes + qualify extracted ids; hybrid `step_started`/`step_completed` (RE-8) |

**Implementation outcome (PR [#366](https://github.com/m2ux/workflow-server/pull/366)):** feature branch `feat/365-context-fidelity-observability` at package **0.2.0**; local validation **787** tests passed; stakeholder review **pass**. PR remains open and **draft** (REST cannot undraft — see planning follow-ups F-1). Price capture stays deferred (D-4).

## Consequences

**Positive:**
- Undeclared planning files are named before staging without blocking the run
- Run token spend is summable and optionally attributable per worker
- Sibling workers no longer satisfy each other's technique-fetch fidelity
- Unresolvable resources surface in full and reference delivery modes
- Step clocks exist without a new worker-facing tool

**Negative:**
- Warn-only S2 does not stop corpus wholesale commit if the orchestrator ignores warnings (D-1 / #338)
- Token ledger completeness depends on harness `record_usage` discipline; partial ledgers understate a run
- No money/cost field until a later package reopens D-4

**Neutral:**
- A0 token-benchmark freeze decision remains measurement-driven (SC-9)
- Companion #338 W3 still owns writing aggregates into planning `token-usage` artifacts from the corpus side

## Related Decisions
- [ADR-0006: Agent-Relayed Token Usage at the Activity Transition Seam](0006-agent-relayed-token-usage-at-activity-transition.md) — usage capture seam; this ADR settles DELTA + plain-sum aggregate and defers price
- [ADR-0003: Server-Managed Session State](0003-server-managed-session-state.md) — `declaredArtifacts` and history events live in sealed session state

## Confirmation
Success criteria SC-1–SC-14 and RE-8 in [requirements](../planning/2026-07-30-issue-365-context-fidelity-observability/03-requirements-elicitation.md#success-criteria); suite green at 787; stakeholder review pass on PR #366.

## References
- Issue: https://github.com/m2ux/workflow-server/issues/365
- PR: https://github.com/m2ux/workflow-server/pull/366
- Plan: [06-work-package-plan.md](../planning/2026-07-30-issue-365-context-fidelity-observability/06-work-package-plan.md)
