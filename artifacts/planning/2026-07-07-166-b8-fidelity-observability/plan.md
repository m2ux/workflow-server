# #166 B8 — Fidelity observability (fetch tracking)

**Date:** 2026-07-07 · **Branch:** `feat/166-b8-fidelity-observability` · **Scope:** server-only (no workflows-submodule change) · **Risk:** none (warn-only, additive)

## Objective

From the epic (#166): record `get_technique`/`get_resource` fetches (per agent_id, per step) in session history; `next_activity` manifest validation warns when a manifested technique step had no fetch in-session. Resolves friction F12 — no server-side signal existed for the smoke-run silent-degradation mode (steps reported complete without their technique content ever loaded). Hard prerequisite for B11 (hybrid bundling is to be evaluated against B8's fidelity-fetch data).

## Design

### Recording

Two new `HistoryEventType` values (`src/schema/state.schema.ts`), additive to the enum — old session files parse unchanged:

- `technique_fetched` — appended by `get_technique` on **both** delivery paths (full content and the persistent-mode unchanged-reference stub: a stub answer is still a fetch). `data: { techniqueId, stepId?, agentId }`, `activity` = current activity at fetch time (omitted before the first `next_activity`). `techniqueId` is the **resolved** id (post activity-group-shorthand resolution).
- `resource_fetched` — appended by `get_resource`. `data: { resourceId, agentId }`. Observability only: the server cannot know which resources an activity requires, so no validation reads these.

History growth: same accepted trade-off as the B1 delivery ledger (small entries, ~1 per fetch; second-order next to existing history volume).

### Validation

New `validateTechniqueFetches(manifest, workflow, activityId, history)` in `src/utils/validation.ts`, called by `next_activity` alongside `validateStepManifest` (signature of the existing validator untouched). Warn-only, one aggregated warning listing unfetched step ids.

- Checks **manifested** technique-kind steps only (`flattenActivitySteps`, so loop-body claims are covered; action/checkpoint/loop steps carry no technique and are never flagged). Unmanifested steps are the existing Missing-steps check's business.
- **Visit-scoped:** only events after the most recent `activity_entered` for the activity count — a loop-back revisit needs its own fetches.
- **Coverage rule:** a step is covered by a step-bound fetch (`data.stepId` match) or by any in-activity fetch whose resolved technique id matches the step's binding — the authored ref or its `<activityId>::<op>` activity-group form, the only two ids `get_technique`'s shorthand resolution can record. So coverage needs no composition at validation time, and one fetch covers N manifested steps bound to the same op (deliberate: fidelity is about content delivery, and the same-technique×N-steps corpus pattern shouldn't warn N−1 times).

### E2E walker

The robot walker manifested technique steps without ever fetching — exactly the degradation signature — so every baseline would have flipped `manifestStatus: valid→warning`. Fix in kind, not in baselines: `executeActivitySteps` now calls `get_technique { step_id }` once per technique step id per activity visit, mirroring the real per-step disclosure contract (and live-testing the recording path on every walk). Robot mode is work-package-only (snapshot/definition-lint/robot-execution/workflow-e2e); graph-mode walks (all-workflows, enumeratePaths) are unaffected. Snapshot baselines stayed byte-identical.

## Execution log

1. Impact analysis (GitNexus): `HistoryEventTypeSchema`, `validateStepManifest`, `executeActivitySteps` — all LOW, no direct callers outside the touched call sites. `detect_changes` cannot see linked worktrees (index bound to the main checkout); scope verified by diff review instead — exactly the intended files.
2. Enum + recording + validator + wiring + walker as designed; `npm run build:schemas` regenerated `session-file.schema.json` / `state.schema.json` (new enum values only).
3. Tests: 7-case unit block for `validateTechniqueFetches` (step-bound credit, technique-id credit incl. shorthand form, manifested-only, cross-activity isolation, revisit scoping, unknown-activity/empty-manifest); new `tests/fetch-observability.test.ts` (4 wire-level cases against the real corpus incl. stub-path recording and the next_activity warning split). One pre-existing integration test (`mcp-server.test.ts` "should not warn on valid activity transition with manifest") manifested all steps without fetching — updated to fetch each technique step first, as the contract now expects.
4. Suite 465/0 (`npx vitest run`), typecheck clean, e2e snapshots unchanged, guard tests green.
5. Docs: `api-reference.md` new **Fidelity Observability** section + tool-table rows + validation/enforcement-boundary lists; `workflow-fidelity.md` Layer 5 fidelity paragraph; `schemas/README.md` history event-types list; `get_technique`/`get_resource`/`next_activity` tool descriptions.

## Deferred / follow-ups

- **B11 consumes this:** the opt-in bundling flag is to be tuned against accumulated `technique_fetched` data from real sessions — let it accumulate before starting B11.
- Per-call `agent_id` is not a `get_technique` parameter; the recorded `agentId` is the session's current one (workers sharing a session index inherit it). Good enough for the F12 signal; revisit only if per-worker attribution is ever needed.
- Resource fetches recorded but unvalidated by design (no declared resource⇄step contract exists to check against).
