# Token Use Tracking and Cost Estimation - Implementation Plan

> plan · HIGH · Ready · 3-5h agentic + 1-1.5h review · 2026-07-15

## Overview

### Problem & Scope

Problem, scope, and success criteria: [requirements](03-requirements-elicitation.md). Adds per-activity + per-workflow token-use tracking and cost estimation to the workflow-server, persisted in `session.json` and rendered to a completion artifact.

## Inputs

- [Implementation Analysis](05-implementation-analysis.md#concrete-extension-point-specification) — the finalized design and the seven grounded extension points (file:line) this plan expands into tasks.
- [KB & Web Research](04-kb-research.md#di-1-channel--head-to-head) — DI-1 channel head-to-head (declared param selected) and the current Claude pricing + universal cache multipliers seeding the price table.
- [Requirements Elicitation](03-requirements-elicitation.md#success-criteria) — SC-1..SC-6 the tasks satisfy.

## Proposed Approach

### Solution Design

Three coordinated changes across two repos, sequenced server-first (the corpus changes are inert without the server channel, and the server change is inert without the corpus populator — but the server can be built and unit-tested standalone):

**A. Server (target worktree `2026-07-14-token-use-tracking/`)** — a declared, Zod-validated optional `usage` object param on `next_activity`, captured at the transition seam into a `usage_recorded` history event and a rolled-up optional `SessionFile.usage` field; per-workflow roll-up (child-inclusive at completion via pure in-tree traversal); cost frozen at activity time from a config price table (base `{input,output}` per model + derived cache multipliers), stamped with `model` + `priceTableVersion`; unknown model → `cost_usd: null`, never blocks. Additive-only: optional param, optional field, one enum member, one config table — no migration, no snapshot churn.

**B. Corpus — orchestrator-populate instruction (`workflows` worktree)** — a workflow/technique instruction directing the orchestrator to read its harness usage figure and pass it as `usage` on each `next_activity` call. Without this the server param is inert (RS-3: the worker cannot self-measure; the populator is the orchestrator/harness).

**C. Corpus — completion renderer technique (`workflows` worktree)** — a technique that reads the rolled-up usage from session state and renders `NN-token-usage.md` (per-activity table + per-workflow totals + cost estimate, labelled an estimate with the subscription caveat) plus a one-line README summary/link, in the completion path alongside the existing `finalize-documentation` / README-update steps. The server writes no `.md`.

The design is fully specified in the analysis; this plan resolves the six open micro-decisions (below) and orders the buildable work.

### Micro-Decision Resolutions

The analysis enumerated six open micro-decisions; each is resolved here per its carried recommendation (all low-risk, code-side, within delegated planning authority — none is a stakeholder gate). The channel choice itself (RS-4/DI-1: declared `usage` param) is the one decision carried to the plan-approval checkpoint for the user's final sign-off.

| # | Decision | Resolution | Rationale |
|---|----------|------------|-----------|
| MD-1 | Roll-up read path for the renderer | Read the rolled-up `SessionFile.usage` field (via `inspect_session`/`get_workflow_status`), not a re-scan of `usage_recorded` events | One read, already child-inclusive at completion; events remain the audit trail. |
| MD-2 | Child roll-up timing | Completion-time in-tree traversal (`sumUsageTree`) for v1; parent-notification incremental fold noted as the pre-completion-visibility alternative, not built | Whole tree is in one `session.json`; traversal needs no extra I/O and is simpler (IA-3). |
| MD-3 | Seed empty `usage` at creation | Absent-until-first-use (do not seed in `createInitialSessionFile`) | Matches `deliveredContent`; slightly leaner; keeps existing `session.json` parse unchanged. |
| MD-4 | `total_tokens` derivation | Derive `input + output`; accept a relayed `total_tokens` only as a cross-check | Deterministic; avoids trusting a relayed derived figure. |
| MD-5 | Price-table override surface | Version-string env override (`PRICE_TABLE_VERSION`) only; table itself a build-time constant | A full-table env/file override is over-engineering for v1 (RS-5). |
| MD-6 | Cost/roll-up helper location | Dedicated `src/utils/usage.ts` housing `estimateCost` + `sumUsageTree` | Pure free functions, isolated unit tests, reusable by any reader. |

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Declared `usage` param on `next_activity` + config price table | Exact per-activity attribution at the seam; Zod-validated; harness-agnostic; missing figure visibly missing; testable | Requires a corpus instruction to populate it | **Selected** (RS-4/DI-1 rec) |
| Request `_meta` via SDK `extra` | Same source/attribution | Unvalidated by Zod; silent when absent; requires request shaping | Rejected — strictly worse than the param |
| Claude Code OTEL ingest | Automatic emission | No per-activity identifier (only `session.id`); cost an estimate meaningless on Pro/Max; forces OTLP-ingest infra + harness coupling | Deferred (optional future enrichment) |
| Server-side re-tokenization | No channel needed | Approximates a number it cannot faithfully measure; violates native-usage constraint | Rejected (out-of-scope #1) |
| Server writes the `.md` artifact | One place | Server has no filesystem-writing role today; breaks server-owns-structured / agent-owns-artifacts split (IA-1) | Rejected — renderer is corpus-side |

### Assumptions

Assumptions underlying the approach: [assumptions log](02-assumptions-log.md). Planning-phase assumptions appended by this activity.

## Implementation Tasks

Tasks are ordered by dependency depth (schema leaves before the handler that writes them; helpers before their callers). Server tasks 1-6 land in the target worktree; corpus tasks 7-8 land in the `workflows` worktree.

### Task 1: Add `usage_recorded` history event type (10-15 min)
**Goal:** Extend the shared history-event vocabulary so the audit event validates.
**Deliverables:**
- `src/schema/state.schema.ts` — add `'usage_recorded'` member to `HistoryEventTypeSchema` (`:6-30`); payload rides the existing open `HistoryEntry.data` (`z.record(z.unknown())`, `:41`) — no further schema change. Shared automatically by `SessionFile` and legacy `WorkflowState`.

### Task 2: Add rolled-up `usage` field to `SessionFile` (30-40 min)
**Goal:** Persist the child-inclusive per-activity + per-workflow roll-up.
**Deliverables:**
- `src/schema/session.schema.ts` — add optional `usage` object (`perActivity` record + `workflowTotal`) to `SessionFileBaseSchema` (`:57-157`), each entry carrying token figures, `model`, `cost_usd: nullable`, `priceTableVersion`; `workflowTotal.cost_usd` null if any activity is unpriced.
- `src/schema/session.schema.ts` — add the matching field to the hand-maintained `SessionFile` **interface** (`:163-187`) in lock-step (recursive-schema pattern requires it).
- Leave `createInitialSessionFile` (`:258-302`) unseeded (MD-3, absent-until-first-use).

### Task 3: Register `usage` in canonical serialization order (5-10 min)
**Goal:** List the new top-level field in the key-priority convention.
**Deliverables:**
- `src/utils/session/store.ts` — add `'usage'` to `TOP_LEVEL_KEY_PRIORITY` (`:85-107`), slotted after `variables`/`checkpointResponses`, before `history`.

### Task 4: Add the config price table + cost helper (45-60 min)
**Goal:** A versioned, env-overridable price table and a pure cost estimator.
**Deliverables:**
- `src/config.ts` — add `priceTable` (per-model `{ input, output }` USD-per-MTok) + `priceTableVersion: string` to `ServerConfig` (`:4-34`); `DEFAULT_PRICE_TABLE` + `DEFAULT_PRICE_TABLE_VERSION` constants next to `DEFAULT_BUNDLE_*` (`:49-50`), seeded from the [captured pricing](04-kb-research.md#current-claude-pricing-captured-2026-07-15--seeds-the-config-price-table-re-confirm-at-build-time); wire `PRICE_TABLE_VERSION` env override into `loadConfig` (`:125-135`) via `envOrDefault` (MD-5).
- `src/utils/usage.ts` (new) — `estimateCost(usage, priceTable, version)`: base input/output + derived cache rates (5m ×1.25, 1h ×2, read ×0.1); divide by 1e6; unknown model → `null`.

### Task 5: Add `sumUsageTree` child roll-up helper (15-20 min)
**Goal:** Child-inclusive per-workflow total by pure in-tree traversal.
**Deliverables:**
- `src/utils/usage.ts` — `sumUsageTree(state): workflowTotal` walking `state.usage.workflowTotal + Σ sumUsageTree(child.state)` over `triggeredWorkflows[].state` (MD-2). Pure, no I/O.

### Task 6: Wire the `usage` param + capture/roll-up into `next_activity` (45-60 min)
**Goal:** Accept usage at the boundary and aggregate it in the existing mutator.
**Deliverables:**
- `src/tools/workflow-tools.ts` — hoist a `usageSchema` (like `stepManifestSchema`, `:34-43`); add optional `usage` to the `next_activity` input object (`:374-380`) and destructure it in the handler (`:381`).
- `src/tools/workflow-tools.ts` — in the `advanceSession` mutator: in the exit-prior block (`:438-443`) when `draft.currentActivity` is set and `usage` supplied, compute `cost_usd` via `estimateCost`, push a `usage_recorded` event keyed to `draft.currentActivity`, and merge into `draft.usage.perActivity[...]`; maintain `draft.usage.workflowTotal` incrementally; at the completion block (`:452-455`) fold children via `sumUsageTree` (MD-2). `total_tokens` derived (MD-4).

### Task 7: Corpus — orchestrator-populate `usage` instruction (30-45 min, `workflows` worktree)
**Goal:** Make the orchestrator relay the harness-reported completion usage on every `next_activity` — the server param is inert without it (RS-3/IA-2/G6).
**Mechanism (concrete):** the orchestrator reads the worker sub-agent's token usage from the worker's **completion result** (in Claude Code, the `subagent_tokens` figure — plus cache and model fields when the harness surfaces them) and passes them as the `usage` object on the **subsequent** `next_activity` call (the transition off the activity the worker just completed). The worker plays **no** role — it cannot self-measure; the populate slot lives on the orchestrator's `next_activity` call. When the harness does not surface per-sub-agent usage, the param is omitted (graceful degradation, SC-6).
**Deliverables:**
- `workflows` worktree — a workflow/technique instruction (rule or technique step) directing the orchestrator to relay the harness-reported completion usage as described above, framed as "relay the harness-reported completion usage" (not "native capabilities"), harness-aware and degrading gracefully when the figure is unavailable.

### Task 8: Corpus — completion usage renderer technique (45-60 min, `workflows` worktree)
**Goal:** Render `NN-token-usage.md` + README summary/link from session state on completion (SC-1/G5).
**Deliverables:**
- `workflows` worktree — a completion-path technique that reads the rolled-up `SessionFile.usage` (MD-1) via `inspect_session`/`get_workflow_status` and renders the per-activity table + per-workflow totals + cost estimate (labelled an estimate; API-key-vs-subscription caveat) plus a one-line README summary/link, alongside the existing `finalize-documentation` / README-update steps.

## Success Criteria

Success criteria: [requirements](03-requirements-elicitation.md#success-criteria); baselines and measurement: [implementation analysis](05-implementation-analysis.md#baseline-metrics). Task→gap→SC map: T1-T2↔G2↔SC-1/SC-3; T4-T5↔G3/G4↔SC-4/SC-5; T6↔G1↔SC-2/SC-6; T7↔G6; T8↔G5↔SC-1.

## Testing Strategy

Test cases and acceptance matrix: [test plan](06-test-plan.md). Ordering constraint the test plan does not carry: `tests/generated-schemas.test.ts` fails until `npm run build:schemas` regenerates `schemas/session-file.schema.json` + `state.schema.json` after Tasks 1-2 — regenerate as part of the schema tasks, before running the suite. e2e snapshots are not perturbed (`snapshotWalk` excludes sessionIndex + the variable bag); corpus guards re-run only after Tasks 7-8.

## Dependencies & Risks

### Requires (Blockers)

- [ ] Tasks 7-8 (corpus) depend on Task 6 (the `usage` param existing) for the populate instruction to target and on Task 2 (the rolled-up field) for the renderer to read; sequence server-first.

### Risks

| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Relayed usage figure carries unearned authority — a wrong figure corrupts the durable cost record | MEDIUM | MEDIUM | Declared, Zod-validated param keeps a missing figure visibly missing (SC-6); every figure stamped with `model` + `priceTableVersion`; no server-side fabrication |
| Attribution-to-exited-activity — spend in the checkpoint/dispatch window mis-files onto the exited activity | LOW | MEDIUM | Accepted for v1 (RE-3); workflow total still sums correctly; finer attribution deferred (DI-2) |
| Cost is a client-side estimate, meaningless on Pro/Max subscriptions | LOW | HIGH | Label as estimate; carry the API-key-vs-subscription caveat into the artifact + README (Task 8) |
| The two corpus changes are load-bearing — the server param is inert without them | MEDIUM | LOW | Scoped as first-class Tasks 7-8, not server-only; plan sequences and tracks them |
| Schema/interface drift — Zod schema and hand-maintained interface fall out of lock-step | MEDIUM | LOW | Task 2 edits both together; `build:schemas` + `generated-schemas.test.ts` assert sync |

**Status:** Ready for implementation
