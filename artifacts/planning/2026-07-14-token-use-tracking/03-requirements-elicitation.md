# Requirements Elicitation: Token Use Tracking and Cost Estimation

> 2026-07-15 · Confirmed

## Problem Statement

The workflow-server keeps no record of the LLM tokens an agent consumes while executing a workflow, nor of the resulting cost. Once a work package completes there is no durable, per-work-package record of how many tokens each activity used, what the whole run cost, or which activities were most expensive. This work adds per-activity and per-workflow token-use tracking and cost estimation, logged to the work package's planning records on completion.

## Goal

Every work package carries a durable usage and cost record: a per-activity token table with per-workflow totals and a cost estimate, derived from native model-reported usage relayed by the agent, written into the planning folder on completion so runs can be reviewed, expensive activities spotted, and efficiency compared over time.

## Stakeholders

### Primary Users

| User Type | Needs | User Story |
|-----------|-------|------------|
| Work-package owner / engineer | See what a completed run cost and which activities dominated | As a work-package owner, I want a per-activity token + cost record so that I can review spend and find expensive activities after a run |
| Workflow / platform maintainer | Compare efficiency across runs and workflow revisions | As a platform maintainer, I want durable per-workflow usage totals so that I can compare cost and efficiency over time |

## Context

### Integration Points

- **`next_activity` transition seam** — the activity exit/entry/completion block is where per-activity usage is captured and per-workflow roll-up (including child `triggeredWorkflows` sessions) is aggregated.
- **`session.json` (SessionFile)** — Zod-validated, HMAC-sealed, persisted on every authenticated call; the durable home for usage via history events and a rolled-up usage field.
- **`finalize-activity` / planning `README.md`** — the completion path that writes durable per-work-package artifacts and maintains the folder Progress table.
- **Agent/harness usage channel** — native model usage figures must arrive via a declared channel (the server observes only tool-call parameters; it has no LLM/tokenizer on the request path).

### Dependencies

- Native usage figures depend on the calling agent/harness relaying them to the server; the server cannot self-measure.
- Exact usage-channel selection depends on the research activity that runs next.

### Constraints

- **Technical:** The server sees only tool-call payloads, never the agent's full LLM context, so it cannot re-tokenize to measure real usage — usage must be agent-relayed. `session.json` is the only durable store (the in-memory TraceStore is ephemeral and unsuitable).
- **Timeline:** v1 scope; finer-grained attribution deferred.
- **Resources:** No new external services; a config-held price table supplies cost basis.

## Scope

### In Scope

1. Per-activity token capture (input, output, total; cache-read and cache-write when the harness reports them) recorded at the `next_activity` transition seam.
2. Per-workflow roll-up of usage and cost, including child (`triggeredWorkflows`) session usage.
3. Cost estimation frozen at activity time from a config price table, stamped with model id + price-table version.
4. Durable persistence of usage in `session.json` (history events + a rolled-up usage field).
5. Logging on completion to a dedicated `NN-token-usage.md` artifact (per-activity table + per-workflow totals) plus a one-line summary and link in the planning `README.md`.
6. Graceful degradation: record what is provided; when a figure is absent, omit it; when a model is unknown/unpriced, record tokens and mark cost `unknown` — never block the run.
7. Agent-relayed native usage via a declared channel (exact channel confirmed by research).

### Out of Scope

1. Server-side re-tokenization / self-measurement of usage — the server cannot see the agent's full context, so any self-measured figure would be unfaithful.
2. Tracking the server's own compute cost — negligible relative to LLM token cost; "token use" means the agent's LLM tokens.
3. Live re-computation of cost from a current price table at render time — cost is frozen at activity time for reproducibility.

### Deferred

Deferred scope items: [deferred-items register](deferred-items.md) — record each item there, not here.

## Success Criteria

| ID | Criterion | Verification Method |
|----|-----------|---------------------|
| SC-1 | A completed work package has a `NN-token-usage.md` with a per-activity token table and per-workflow totals, and the README carries a one-line summary + link | Run a workflow to completion; inspect the planning folder artifact and README |
| SC-2 | Recorded figures include input, output, total, and cache-read/cache-write when the harness reports them; absent figures are omitted, not fabricated | Complete a run where cache figures are present and one where they are absent; confirm the table reflects each |
| SC-3 | Cost is a single total per activity and per workflow, frozen at activity time and stamped with model id + price-table version | Inspect a recorded activity entry; confirm the cost and the model/price-table stamp |
| SC-4 | An unknown/unpriced model records tokens with cost marked `unknown` and the run still completes | Run with a model absent from the price table; confirm tokens recorded, cost `unknown`, no failure |
| SC-5 | Per-workflow totals include usage from child (`triggeredWorkflows`) sessions | Run a workflow that dispatches a child; confirm the parent roll-up includes the child's usage |
| SC-6 | When the agent relays no usage, the run completes with figures omitted (no fabricated values, no block) | Complete a run without relaying usage; confirm graceful omission |

## Assumptions

Assumptions surfaced during elicitation: [assumptions log](assumptions-log.md) — record each there (categories: Requirement Interpretation, Scope Boundaries, Implicit Requirements, Success Criteria), not here. The three carried-in open assumptions (DP-1 which cost, DP-2 native-usage channel, DP-4 logging location) are resolved by this elicitation and recorded in the log.

## Elicitation Log

### Questions Asked

| Domain | Question | Response Summary |
|--------|----------|------------------|
| Problem / Scope | Where should results be logged on completion — dedicated artifact, README section, or both? (DP-4) | Both: dedicated `NN-token-usage.md` (per-activity table + per-workflow totals) plus a one-line README summary + link |
| Success Criteria | Which usage figures, and is cost one number or a breakdown? | Input, output, total + cache-read/cache-write when reported (omit gracefully when absent); cost = single total per activity and per workflow, breakdown in the table |
| Context / Success Criteria | Cost basis: frozen at activity time or recomputed live? Unknown models? (DP-1 cost basis) | Frozen at activity time from a config price table, stamped with model id + price-table version; unknown models record tokens, mark cost `unknown`, never block |
| Scope | Capture beyond `next_activity` (checkpoints/dispatch/other tool calls), or per-activity granularity for v1? | Per-activity granularity for v1 at the `next_activity` seam, per-workflow roll-up including child sessions; finer attribution deferred |
| Context / Scope | Acceptable that native usage depends on the agent relaying it and that v1 degrades gracefully? (DP-2) | Yes: agent-relayed native usage via a declared channel, durable in `session.json`, degrade gracefully when absent; exact channel left to research |

### Clarifications Made

- "Token use" and cost mean the agent's LLM token consumption, not the server's own compute (confirms DP-1).
- "Use the model's native capabilities" means consuming harness/model-reported usage relayed to the server, not server-side re-tokenization (confirms DP-2's interpretation).

### Open Questions Resolved

- DP-1 (which cost is tracked): agent LLM tokens; cost frozen at activity time from a config price table.
- DP-4 (where results are logged): both a dedicated artifact and a README summary + link.
- DP-2 (native-usage channel): agent-relayed via a declared channel accepted in principle; the exact channel (declared `next_activity` param vs. request `_meta` via SDK `extra`) is an open research candidate, not a closed decision.

## Confirmation

**Confirmed by:** User
**Date:** 2026-07-15
