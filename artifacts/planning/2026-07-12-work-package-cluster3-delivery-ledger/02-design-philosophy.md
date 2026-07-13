# Design Philosophy — Cluster 3 Delivery Ledger (server implementation)

> #189 · work-package `design-philosophy` · 2026-07-12 · This document is the record of truth for the problem classification and workflow-path decision. It implements the approved design spec [06-design-spec.md](../2026-07-12-workflow-design-cluster3-delivery-ledger/06-design-spec.md).

## Problem Statement

In persistent-mode (reference-delivery) sessions, `get_technique` re-delivers the shared workflow-contract blocks (`inherited_inputs`, `inherited_outputs`) and the merged `rules` block verbatim on every fetch. These blocks are identical across most techniques of a workflow, but the whole-payload hash (`technique:<id>`) always differs on the technique-specific core (`inputs`/`outputs`/`protocol`), so the existing B1 whole-payload dedup never matches and the shared blocks are re-sent every time — measured at ≈131k chars per work-package walk, roughly 25% of technique-delivery volume.

Separately, `get_workflow`'s orchestrator ops bundle (55.1k chars for work-package, 32.9k for ponytail) is always delivered full — it touches the delivery ledger not at all — and is therefore re-paid on every session resume.

Neither is a functional defect; both are avoidable token repetition that erodes the agent's working context in long-running sessions.

## System Understanding

- The **B1 whole-payload reference-delivery mechanism** already exists: content-keyed unchanged-markers (`{ delivery: "unchanged", content_hash }`) recorded in the session ledger by `src/utils/delivery.ts`, active only under `contextMode: "persistent"` or per-call `bundle: "reference"`.
- A **composed technique object** (`composeLoaded`, `src/loaders/technique-loader.ts:548-554`) carries discrete fields. Three are shared and dedup-eligible: `inherited_inputs`, `inherited_outputs` (workflow-root contract), and `rules` (mostly contract). The technique-specific core (`id`, `version`, `capability`, `provenance_note`, own `inputs`/`outputs`, `protocol`) is not.
- **Touch points** (all in the server, no workflow YAML): a new `dedupTechniqueBlocks` helper in `src/utils/delivery.ts`; `get_technique` in `src/tools/resource-tools.ts` (~605-666); `get_activity` eager step-technique bundling in `src/tools/workflow-tools.ts` (~588-696); and `get_workflow` in `src/tools/workflow-tools.ts:283-348` for C12.
- Delivery operates on the **projected ordered record** (`projectTechnique`'s `Record<string,unknown>`), post-compose/validate, so no schema or typed-`Technique` change is needed; `serialization.ts` already orders marker objects (confirm block keys are in the ordering list).

## Impact Assessment

- **Severity:** low — a token-efficiency enhancement, no correctness or behavioural change for functional output.
- **Benefit:** ~+13% of a work-package walk headroom under persistent mode (C2), layered on top of B1's existing 27%; plus a resume-only C12 saving (whole ops bundle collapses to one marker on the second+ `get_workflow` in a persistent session).
- **Blast radius:** confined to persistent-mode delivery paths. Fresh sessions and dispatched workers are byte-for-byte unchanged. No consumer of the wire format changes — block-position markers reuse the one canonical `unchangedMarker` shape agents already handle.

## Success Criteria

1. Block-level markers emitted correctly: in a persistent-mode technique fetch, contract/rules blocks already delivered by an earlier technique this session+agent collapse to markers while the technique-specific core stays full.
2. Cross-technique contract dedup: fetch technique A (all full) then technique B → B's shared blocks are markers, B's own core full.
3. Escape works: `full: true` (`get_technique`) / `bundle: "full"` (`get_activity`) re-delivers every block full even when block-delivered (the context-eviction recovery path).
4. Fresh mode never markers blocks.
5. C12: `get_workflow` collapses the ops bundle on a second (resume) call in persistent mode; full in fresh mode.
6. Existing whole-technique and whole-bundle dedup cases stay green (the cheapest-first layering must not perturb them).
7. `binding-fidelity` / `binding-provenance` snapshots are **structurally unchanged** — markerization is delivery-time, after composition and annotation.

## Constraints

- Server-only; no workflow-YAML change.
- Additive; no schema change (`technique.schema.ts`, `session.schema.ts`, `state.schema.ts` — the last two only gain ledger keys / no new events).
- No new architecture — extend the existing B1 mechanism to a finer granularity.
- Opt-in: active only under persistent / `bundle: "reference"` mode, with a full-content escape.
- Byte-for-byte unchanged for default (fresh) sessions and dispatched workers.
- Channel isolation preserved: block keys live in the `technique:` namespace (same channel as `technique:<id>` and get_activity eager bundling); the C12 key (`workflow_bundle:<hash>`) is its own channel — no cross-channel reference.
- Target semver: **minor**. Single server PR.

## Root Cause

Whole-payload content hashing is too coarse. Because it keys on the entire composed technique text, the always-differing technique-specific core perturbs the hash on every distinct technique, so the mechanism structurally cannot capture the "new technique, but its shared contract/rules were already delivered this session" case. Block-level, content-keyed dedup resolves exactly that case.

## Classification

| Field | Value |
|-------|-------|
| **Problem type** | `inventive-improvement` |
| **Complexity** | `moderate` |

### Rationale

**Type — inventive-improvement:** nothing is broken or failing. This is a proactive optimisation that extends an existing capability (B1 reference delivery) to finer granularity, plus a resume-only bundle saving. It enhances an existing capability rather than restoring lost function.

**Complexity — moderate:** the design spec is a complete, approved blueprint — exact file/line touch points, wire format, two-tier layering rule, and test plan, with all design judgements already resolved (block set = contract + rules only; C12 kept to a single whole-bundle key). There are no open architectural questions and no competing viable approaches to weigh, which rules out `complex`. But it is more than a trivial fix: it adds a shared helper and wires it into three delivery sites, requires care around cheapest-first layering and channel isolation, and needs test re-baselining. That is the signature of moderate. (Assessed from the spec text; no gitnexus complexity-signal run was needed given the design phase already located and enumerated every touch point.)

## Workflow Path

**Path chosen:** skip-optional (confirmed at the `classification-and-path-confirmed` checkpoint under delegated authority — resolution `skip-optional`).

| Gate | Value |
|------|-------|
| `needs_elicitation` | false |
| `needs_research` | false |
| `skip_optional_activities` | true |
| `needs_comprehension` | true (mandatory on every path) |
| `path_gating_complexity` | simple |

### Path rationale

The workflow-design phase already produced a complete, approved design spec that serves as the requirements. Requirements elicitation would re-derive what the spec already fixes, and research is unnecessary because the approach is locked and merely extends an existing in-repo mechanism — no external best-practices needed. Optional discovery activities (requirements-elicitation, research, implementation-analysis) are therefore skipped.

Codebase comprehension remains **mandatory**: the plan must verify the spec's cited line numbers (`resource-tools.ts` ~605-666, `workflow-tools.ts` ~588-696 and 283-348, `technique-loader.ts` 548-554, `delivery.ts:52`, `workflow-tools.ts:685`) against the actual worktree and confirm the `serialization.ts` block-key ordering before any edit — the spec explicitly flags that confirmation as a task.

**Next required activity:** `codebase-comprehension` (the activity's sole default transition), then `plan-prepare` once optional activities gate out.
