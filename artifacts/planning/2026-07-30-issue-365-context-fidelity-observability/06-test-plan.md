# Test Plan: Context Fidelity and Observability

> **ADR:** *(at close-out if owed)* · **Ticket:** [#365](https://github.com/m2ux/workflow-server/issues/365) · **PR:** [#366](https://github.com/m2ux/workflow-server/pull/366)

## Overview

This test plan validates server-side reconciliation, token usage rollup (no price), delivery-dedup coverage, and multi-agent observability for items S2–S5.

Key changes to validate:
1. `projectUsage` — rows plus plain-sum token aggregate; optional agent filter
2. `record_usage` — optional `agent_id` → `data.agentId`
3. `validateTechniqueFetches` — agent-scoped fetch credit
4. `appendTraceEvent` / `get_trace` — per-call `aid` and agent filter
5. `next_activity` — `artifacts_produced` accumulation + planning-folder id diff
6. `dedupTechniqueBlocks` — `provenance_note` + split inherited note/items
7. Resource load path — dual-mode unresolvable warnings; cross-workflow id qualify
8. Hybrid `step_started` / `step_completed` emission (RE-8)
9. Inspect oracle + parity loop over full `INSPECT_SESSION_VIEWS`

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR366-TC-01 | Verify `record_usage` accepts optional `agent_id` and omits cleanly | Unit |
| PR366-TC-02 | Verify usage rows without `agentId` still project (unattributed bucket) | Unit |
| PR366-TC-03 | Verify `projectUsage` plain-sum equals arithmetic sum of DELTA token fields | Unit |
| PR366-TC-04 | Verify resumed-dispatch row does not embed prior dispatch tokens | Integration |
| PR366-TC-05 | Verify usage view exposes token totals and requires no cost/price field | Unit |
| PR366-TC-06 | Verify three stale “usage on next_activity” phrases are absent | Unit |
| PR366-TC-07 | Verify delivery-ledger namespace comment matches `delivery.ts` keys | Unit |
| PR366-TC-08 | Verify `provenance_note` collapses to marker on second sibling technique | Unit |
| PR366-TC-09 | Verify inherited-block `note` markers while `items` remain full | Unit |
| PR366-TC-10 | Verify dry `bench:token` vs A0 — no unexpected regression; freeze only if moved | Performance |
| PR366-TC-11 | Verify before/after delta on same `bench:dispatch --gate` arm post coverage fix | Performance |
| PR366-TC-12 | Verify `TraceEvent.aid` from per-call `agent_id` (non-null, distinct across workers) | Integration |
| PR366-TC-13 | Verify `get_trace` agent filter ⊂ unfiltered | Integration |
| PR366-TC-14 | Verify two-agent fidelity: A fetches X, B manifests X without fetch → B warned | Integration |
| PR366-TC-15 | Verify inspect history filter narrows on `data.agentId` (TS + oracle parity) | Integration |
| PR366-TC-16 | Verify inspect usage filter + oracle `usage` view parity | Integration |
| PR366-TC-17 | Verify parity loop is derived from `INSPECT_SESSION_VIEWS` (missing oracle view fails) | Unit |
| PR366-TC-18 | Verify unresolvable resource warns in **reference** mode; call succeeds | Integration |
| PR366-TC-19 | Verify unresolvable resource warns in **full** mode; call succeeds | Integration |
| PR366-TC-20 | Verify cross-workflow extracted id qualifies (`meta/…`) and corpus unresolvable 29→12 | Integration |
| PR366-TC-21 | Verify bundled path emits idempotent `step_started` | Integration |
| PR366-TC-22 | Verify `step_manifest` path emits `step_completed` at transition | Integration |
| PR366-TC-23 | Verify multi lazy `get_technique` starts can carry distinct timestamps in one activity | Integration |
| PR366-TC-24 | Verify undeclared planning file named in `_meta.validation`; declared id not; success; manifest unchanged | Integration |
| PR366-TC-25 | Verify declaration writing outside folder reports *unknown*, not *missing* | Integration |
| PR366-TC-26 | Verify declaration at activity N suppresses warning at N+1 | Integration |

*Detailed steps, expected results, and source links will be added after implementation.*

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| SC-1 | Undeclared files named; join on id; unknown vs missing; success; no auto-manifest | PR366-TC-24, PR366-TC-25 |
| SC-2 | Manifest accumulates across activities | PR366-TC-26 |
| SC-3 | Optional `agent_id`; omit still valid | PR366-TC-01, PR366-TC-02 |
| SC-4 | DELTA + aggregate = plain sum | PR366-TC-03, PR366-TC-04 |
| SC-5 | Token aggregate only; no required price field | PR366-TC-05 |
| SC-6 | Stale usage statements gone; ledger namespaces match | PR366-TC-06, PR366-TC-07 |
| SC-7 | Honest before/after on dispatch bench arm | PR366-TC-11 |
| SC-8 | provenance_note + split note/items markers | PR366-TC-08, PR366-TC-09 |
| SC-9 | A0 dry compare; conditional re-freeze | PR366-TC-10 |
| SC-10 | Per-call `aid` + filtered get_trace | PR366-TC-12, PR366-TC-13 |
| SC-11 | No sibling fetch credit | PR366-TC-14 |
| SC-12 | Agent filter history+usage; oracle; full view loop | PR366-TC-15, PR366-TC-16, PR366-TC-17 |
| SC-13 | Resource warn full + reference | PR366-TC-18, PR366-TC-19 |
| SC-14 | Qualify + corpus 29→12 | PR366-TC-20 |
| RE-8 | Hybrid step events | PR366-TC-21, PR366-TC-22, PR366-TC-23 |

## Running Tests

*Commands will be added after implementation. Expected shapes:*

```bash
# From target worktree
npm run typecheck
npm run test:ci
# Module / name filters once tests land, e.g.:
# npx vitest run tests/mcp-server.test.ts tests/reference-delivery.test.ts
# Benches (manual, S4):
# npm run bench:dispatch -- --gate --min-saving-pct=<n>
# npm run bench:token
# Corpus SC-14 (host workflows):
# WORKFLOWS_DIR=/path/to/workflows <replay harness as implemented>
```
