# Context Fidelity and Observability - Implementation Plan

> plan · HIGH · Ready · 3-5h agentic + 1-2h review · 2026-07-31

## Overview

### Problem & Scope
Problem, scope, and success criteria: [requirements](03-requirements-elicitation.md).

## Inputs

- [Knowledge Base Research](04-kb-research.md#recommended-approach) — DELTA + plain-sum token aggregate; price capture out (D-4)
- [Implementation Analysis](05-implementation-analysis.md#gap-analysis) — G1–G16, RE-8 hybrid step events, ordered change surface
- [Design Philosophy](02-design-philosophy.md#system-context) — five coupled surfaces; no shared mechanism, one validation channel
- [Comprehension](../../comprehension/context-fidelity-observability.md) — baselines Q1–Q11, corpus resource replay figures

## Proposed Approach

### Solution Design

Four items, three mechanisms, one advisory channel (`_meta.validation` / projections):

| Item | Mechanism | Primary surfaces |
|------|-----------|------------------|
| **S3** | Reduction + attribution | `record_usage` optional `agent_id`; `projectUsage` rows + plain-sum token totals; DELTA docs; fix three stale usage-on-`next_activity` statements + ledger namespace comment |
| **S5** | Emission + filter + error-channel | Trace `aid` from call `agent_id`; agent filter on `get_trace` / inspect history+usage; `validateTechniqueFetches` scopes by `data.agentId`; resource warn both modes + qualify extracted ids; hybrid `step_started`/`step_completed` (RE-8) |
| **S2** | Set-diff | Session accumulated declared-artifact field; `next_activity` accepts produced set; planning-folder diff on **id**; warn-only (*unknown* vs *missing*) |
| **S4** | Coverage + measure | `provenance_note` in `DEDUP_BLOCKS`; hash inherited `note` separate from `items`; before/after `bench:dispatch`; dry `bench:token` for A0 freeze decision |

**No cost/price field** anywhere (D-4). Token keys summed when present: at minimum `input_tokens`, `output_tokens`, `total_tokens`, `subagent_tokens`; ignore unknown keys (IA-3 / RC-4 inventory at implement).

**GitNexus (plan sizing):** `projectUsage` CRITICAL graph / d=1 = `projectSessionView` only; `dedupTechniqueBlocks` d=1 = two tool registrations. Do not size tasks from bootstrap fan-out (IA-4).

**Implement order** (dependency, from analysis): S3 write → S3 read/oracle → S5 agent → S5 resource → S5 steps → S2 → S4.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Shared mechanism for S2/S3/S5 | One abstraction | Set-diff ≠ reduction ≠ emission | **Rejected** — one channel, three mechanisms (DP-1) |
| Block `next_activity` on undeclared files | Hard prevention | Behavioural break; strands runs | **Rejected** — warn-only (DP-7) |
| Manifest-only step events | No new writers | No in-flight clock | **Rejected** — hybrid RE-8 (IA) |
| New `record_step` tool | Full wall-clock starts | Fights bundling “no per-step ping” | **Rejected** |
| Price table + money on usage view | Meets original cost checkbox | Stakeholder deferred | **Out** — D-4 |
| Formalise improvised `dispatch` usage key | Uses live rows | Duplicates agent dimension | **Rejected** — optional `agent_id` |

### Assumptions
Assumptions underlying the approach: [assumptions log](02-assumptions-log.md).

## Implementation Tasks

Ordered for implementation (matches recommended surface order).

### Task 1: S3 write path — `agent_id` + DELTA docs + stale text (25-40 min)
**Goal:** Optional attribution on usage rows; contract text matches `record_usage`.
**Gaps:** G4, G6, G7 (partial)
**Deliverables:**
- `src/tools/workflow-tools.ts` — `record_usage` optional `agent_id` → `data.agentId`; omit → unattributed; DELTA in tool description
- Same file + `src/utils/dispatch.ts` — remove three “usage on next_activity” claims
- `tests/mcp-server.test.ts` — accept with/without `agent_id`; existing rows still project

### Task 2: S3 read path — token aggregate + agent filter + oracle (40-60 min)
**Goal:** `inspect_session view:usage` returns rows **and** plain-sum token totals; filterable; parity covers `usage`.
**Gaps:** G5, G13
**Deliverables:**
- `src/tools/workflow-tools.ts` — extend `projectUsage` (additive shape: rows + aggregate); optional agent filter on history/usage views
- `tests/fixtures/inspect-session/inspect_session.py` — implement `usage` + history filter on `data.agentId`
- `tests/mcp-server.test.ts` — derive PR215-TC-08 loop from `INSPECT_SESSION_VIEWS` (not seven-literal); SC-4/SC-5 fixtures (sum = arithmetic sum; no cost field)

### Task 3: S5 agent dimension — trace, fidelity, filters (35-50 min)
**Goal:** Multi-worker evidence separable; sibling fetch no longer credits.
**Gaps:** G11, G12, G13 (trace half)
**Deliverables:**
- `src/logging.ts` — `appendTraceEvent`: `aid = params.agent_id ?? state.agentId`
- `src/tools/workflow-tools.ts` — `get_trace` optional agent filter
- `src/utils/validation.ts` — `validateTechniqueFetches` scope fetched set by matching `data.agentId`
- Tests: non-null distinct `aid`; filtered ⊂ unfiltered; two-agent SC-11 regression

### Task 4: S5 resources — qualify + warn both modes (35-50 min)
**Goal:** Unresolvable refs visible; cross-workflow ids resolve when technique ≠ delivering workflow.
**Gaps:** G14, G15
**Deliverables:**
- `src/tools/workflow-tools.ts` — qualify extracted resource id with technique workflow when workflows differ; resolution/warn path in **full and reference** mode; call still succeeds
- Corpus replay gate (host `WORKFLOWS_DIR`): unresolvable 29→12, no new failures (SC-14)

### Task 5: S5 steps — hybrid RE-8 emission (30-45 min)
**Goal:** Live `step_started` / `step_completed` without new worker tools.
**Gaps:** G16
**Deliverables:**
- `src/tools/workflow-tools.ts` / `src/tools/resource-tools.ts` — on `technique_bundled` and step-bound `technique_fetched`, append idempotent `step_started` `{stepId, agentId}`
- `next_activity` — per `step_manifest` entry with output, append `step_completed` at transition time
- Tests: bundled start; manifest complete; multi-fetch start timestamps can differ

### Task 6: S2 artifact reconciliation (45-70 min)
**Goal:** Undeclared planning files named at `next_activity`; manifest accumulates by **id**.
**Gaps:** G1–G3
**Deliverables:**
- `src/schema/session.schema.ts` — accumulated declared-artifact field (`{id,name,path?}`), session-scoped
- `src/tools/workflow-tools.ts` — `next_activity` accepts produced artifacts; merge into accumulation; diff planning folder vs ids → `_meta.validation` (warn-only); outside-folder declared → *unknown* not *missing*
- Integration tests: SC-1 seed folder; SC-2 two-activity suppress

### Task 7: S4 block-dedup coverage + measurement (40-60 min)
**Goal:** Recover invariant preamble bytes; report honest before/after share.
**Gaps:** G8–G10
**Deliverables:**
- `src/utils/delivery.ts` — `provenance_note` candidate; hash inherited `note` separate from `items`
- `tests/reference-delivery.test.ts` — SC-8 markers for note + provenance; items full
- `scripts/` benches — same `bench:dispatch` arm pre/post (ΔsavingPct / ΔresumeChars); dry `bench:token` vs A0; re-freeze **only** if metrics move
- `session.schema.ts` delivery-ledger namespace comment aligned with `delivery.ts` keys (G7 remainder)

### Task 8: Docs adjacent to touched surfaces (15-25 min)
**Goal:** Tool/schema comments and any in-tree docs touched by Tasks 1–7 stay consistent (positive present).
**Deliverables:** descriptions/comments only on files already edited; no standalone docs PR; no price/cost language.

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics).

Task-level only:
- RE-8 hybrid emission (G16) — [analysis decision](05-implementation-analysis.md#internal-decision-re-8-step-event-emission-source)
- Parity loop = `INSPECT_SESSION_VIEWS` (G13 structural prerequisite for SC-12)
- Outside-folder declared ids → *unknown* (G1–G2)

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md). Fixture sessions and vitest preferred; benches only for S4; corpus replay for SC-14 with populated superproject `workflows/`.

## Dependencies & Risks

### Requires (Blockers)
- [ ] Populated workflows checkout for SC-14 corpus replay (`git worktree add ./workflows workflows` on host — present)
- [ ] Writable planning folder + target worktree `feat/365-context-fidelity-observability` (present)
- [x] Host `gh` keyring + SSH (unsandboxed) for PR body update and feature-branch push — completed at plan-prepare

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Cumulative harness posts inflate aggregate | HIGH | MEDIUM | DELTA docs + SC-4 test that resume row excludes prior tokens |
| S4 absolute `savingPct` misread as dedup share | MEDIUM | HIGH | Quote only before/after delta on same arm; never ~25% |
| A0 key-count shift from mode-independent ledger writes | MEDIUM | MEDIUM | Dry `bench:token` before freeze decision (RE-5) |
| SC-14 needs full corpus path | MEDIUM | LOW | Point `WORKFLOWS_DIR` at host `./workflows` |
| Sandboxed agent shell breaks keyring `gh` / SSH | LOW | HIGH | Run GitHub and git remote ops unsandboxed with `GH_TOKEN`/`GITHUB_TOKEN` unset (AGENTS.md); do not treat sandbox failures as broken host auth |
| Oracle drift on history filter shape | MEDIUM | MEDIUM | Mirror `data.agentId` narrow-before-reduce exactly (RE-6) |

**Status:** Ready for implementation
