# Cluster 3 Delivery Ledger (server impl) - Implementation Plan

> plan · LOW · Ready · 1-4h agentic + 0.5-1h review · 2026-07-12

Design spec: [06-design-spec.md](../2026-07-12-workflow-design-cluster3-delivery-ledger/06-design-spec.md) · Design philosophy: [02-design-philosophy.md](02-design-philosophy.md) · Comprehension: [delivery-ledger.md](../../comprehension/delivery-ledger.md) · Issue [#189](https://github.com/m2ux/workflow-server/issues/189) · PR [#223](https://github.com/m2ux/workflow-server/pull/223)

## Overview

### Problem Statement

In persistent-mode (reference-delivery) sessions, `get_technique` re-delivers the shared workflow-contract blocks (`inherited_inputs`, `inherited_outputs`) and the merged `rules` block verbatim on every fetch. These blocks are identical across most techniques of a workflow, but the whole-payload hash (`technique:<id>`) always differs on the technique-specific core, so the existing B1 whole-payload dedup never matches — ≈131k chars per work-package walk, ~25% of technique-delivery volume. Separately, `get_workflow`'s orchestrator ops bundle (55.1k wp / 32.9k ponytail) is always delivered full and re-paid on every session resume. Neither is a correctness defect; both are avoidable token repetition that erodes the agent's working context in long sessions.

### Scope

**In Scope:**
- C2 — block-level delivery ledger: a new `dedupTechniqueBlocks` helper in `src/utils/delivery.ts`, wired into the full-delivery branch of `get_technique` and into `get_activity`'s eager step-technique bundling.
- C12 — `get_workflow` orchestrator ops-bundle slimming under persistent mode (single `workflow_bundle:<hash>` key).
- Test coverage in `tests/reference-delivery.test.ts` (extend, do not loosen).
- Docs riding the impl PR: `delivery.ts` header, `docs/api-reference.md`, `get_technique` / `get_activity` tool descriptions + `bundle_note`.

**Out of Scope:**
- Modifying `projectTechnique` — the helper operates on its *output record*, deliberately avoiding the CRITICAL blast radius. (Reason: DP-5 / spec §2.6; touching the shared primitive would ripple across 8 processes.)
- Eager-budget accounting of block-marker savings — budget still draws on full pre-marker text; block dedup reduces wire bytes only, not budget draw. (Reason: spec keeps the document-order prefix stable; Q6, a later optimisation.)
- Per-technique cross-channel reuse for C12 (`bundle:<ref>`) — would couple the get_workflow and get_activity channels, breaking channel isolation. (Reason: DP-7; the ○-low, resume-only win doesn't justify the coupling.)
- Schema changes to `technique.schema.ts`, `session.schema.ts`, `state.schema.ts` — confirmed unnecessary; `deliveredContent` gains keys only, markerization runs after validation. (Reason: spec §2.6.)
- Empirical re-walk to measure the projected ~+13% (C2) / C12 resume delta — a validation note, not a blocker. (Reason: spec §7.)

## Research & Analysis

*Optional discovery activities were skipped (skip-optional path); the approved design spec is the requirements record.*

### Key Findings Summary

**From the design spec (authoritative blueprint):**
- Delivery is a two-tier decision, cheapest-first: whole-technique hash first (unchanged from today), then per-block markers only for a *not-yet-seen* technique whose shared contract was already delivered by a sibling technique.
- Block keys are content-keyed and namespaced in the `technique:` channel: `technique:inherited_inputs:<hash>`, `technique:inherited_outputs:<hash>`, `technique:rules:<hash>`. Content-keying auto-invalidates on any contract change or provenance annotation.
- Block markers reuse the one canonical `unchangedMarker` shape (`delivery.ts:52`), placed at the block position.

**From codebase comprehension (anchors verified against the live worktree):**
- `dedupTechniqueBlocks` is additive — it hooks the full-delivery branch of `get_technique` (`resource-tools.ts`, at the current single `projectTechniqueToYaml` call, line 605) and `get_activity` at the `{ marker, ...projectTechnique(technique) }` spread (`workflow-tools.ts:685`); it never modifies `projectTechnique`.
- **C12 is the one non-trivial wiring point:** `get_workflow` calls `advanceSession(state)` with no mutator at line 299, *before* `opsBlock` is built at 308. C12 must reorder to decide the marker first, then commit `workflow_bundle:<hash>` via a `recordDeliveries` mutator.
- No schema/serialization change: `deliveredContent` is `Record<record<string>>`; `stringifyForResponse` is insertion-order (no ordering list), so a marker substituted at a block position in `projectTechnique`'s ordered record keeps its position automatically. The spec's "confirm block keys are in the ordering list" is moot — no list exists.

## Proposed Approach

### Solution Design

Extend the existing B1 reference-delivery mechanism to a finer granularity — no new architecture, no schema change. One new pure helper, `dedupTechniqueBlocks(projected, state, newDeliveries)`, operates on the projected ordered record (`projectTechnique`'s `Record<string,unknown>`), replacing each dedup-eligible block whose per-block content hash is already delivered with an `unchangedMarker`, and accumulating newly-delivered block hashes into the caller's `newDeliveries` map. It is called on the full-delivery branch of both technique-emitting tools, after composition and provenance decoration, so an annotated `inherited_inputs` variant hashes differently and correctly delivers full. C12 brings `get_workflow`'s ops bundle into the ledger under a single content-keyed `workflow_bundle:<hash>` key, gated on persistent mode.

The `DEDUP_BLOCKS` constant (`['inherited_inputs', 'inherited_outputs', 'rules']`) is the single source of the eligible-block set; it names `projectTechnique`'s key names, so it is co-located with the note that a rename of those keys must touch it too.

### Alternatives Considered

| Option | Pros | Cons | Decision |
|--------|------|------|----------|
| Block-level content-keyed dedup on the projected record (C2) | Catches new-technique-shared-contract case; no schema/typed-`Technique` friction; auto-stale-free under provenance annotation | Helper depends on `projectTechnique` key names | **Selected** |
| id-keyed block dedup (`contract:<workflowId>`, per eval sketch) | Marginally more compact (last-wins) | Staleness under provenance annotation; needs invalidation logic | Rejected — content-keying matches the `bundle:rules:<hash>` precedent and is stale-free |
| Modify `projectTechnique` to emit markers directly | One site | CRITICAL blast radius (8 processes); couples composition with delivery | Rejected — DP-5 |
| C12 per-technique cross-channel reuse of `bundle:<ref>` | Extra solo-mode cross-dedup | Couples get_workflow + get_activity channels; breaks channel isolation | Rejected — DP-7; single `workflow_bundle:<hash>` instead |

### Assumptions

- The spec's cited line numbers still match the current worktree — **verified during planning**: `delivery.ts:52` (`unchangedMarker`), `resource-tools.ts:605` (`projectTechniqueToYaml` call) + the whole-marker branch at 640 / full-delivery branch at 661-666, `workflow-tools.ts:685` (`{marker,...projectTechnique}` spread), `:299`/`:308` (get_workflow `advanceSession`/`opsBlock`), `serialization.ts` (18 lines, insertion-order). All anchors present.
- `serialization.ts` needs no ordering-list edit — insertion-order emission preserves block-marker position automatically.
- Markerization is invisible to composition, so `binding-fidelity` / `binding-provenance` snapshots stay structurally unchanged.

## Implementation Tasks

Ordered by dependency depth (leaves before callers): the helper is the leaf; the two wire-ins and C12 consume it; docs last.

### Task 1: Add the `dedupTechniqueBlocks` helper + `DEDUP_BLOCKS` constant
**Goal:** Provide the shared, pure block-dedup transform both technique-emitting tools call, plus the new channel-key namespaces documented in the module header.
**Deliverables:**
- `src/utils/delivery.ts` — new `DEDUP_BLOCKS` const and `dedupTechniqueBlocks(projected, state, newDeliveries)` export. Iterates the eligible blocks on a shallow copy of the projected record; for each present block, hashes its single-key projection (`contentHash(stringifyForResponse({ [block]: out[block] }))`), keys it `technique:<block>:<hash>`, and substitutes `unchangedMarker(hash)` when the hash is already in the ledger or in `newDeliveries`, else records it into `newDeliveries`.
- `src/utils/delivery.ts` header — document the `technique:<block>:<hash>` and `workflow_bundle:<hash>` namespaces and the content-keying rationale; refresh the stale `bundle:rules` header line to `bundle:rules:<hash>` while there.

### Task 2: Wire block dedup into `get_technique`
**Goal:** On a not-yet-seen technique in persistent mode, collapse already-delivered contract/rules blocks to markers while the technique-specific core stays full.
**Deliverables:**
- `src/tools/resource-tools.ts` — split the single `projectTechniqueToYaml(technique)` call (line 605) into project → maybe-dedup → stringify: compute `ordered = projectTechnique(technique)`; the whole-technique hash is `contentHash(stringifyForResponse(ordered))` (pre-marker, unchanged from today) and the whole-marker branch (640) stays. On the full-delivery branch (661-666), when `state.contextMode === 'persistent' && full !== true`, run `dedupTechniqueBlocks(ordered, state, blockDeliveries)`, stringify the result for the response body, and merge `{ [ledgerKey]: hash, ...blockDeliveries }` into the existing `recordDeliveries` call. When `full === true` or fresh mode, stringify `ordered` untouched.
**Depends on:** Task 1.

### Task 3: Wire block dedup into `get_activity` eager bundling
**Goal:** Apply the same block dedup to each eagerly-inlined step technique so a bundle's shared contract/rules collapse to markers once delivered.
**Deliverables:**
- `src/tools/workflow-tools.ts` — at the eager-bundle full branch (line 685), run `dedupTechniqueBlocks` on the `projectTechnique(technique)` record before the `{ marker, ...projectTechnique(technique) }` spread, and merge the returned block hashes into the existing `newDeliveries` accumulator (committed at 775). Budget accounting stays on the full pre-marker `projectTechniqueToYaml` length (662) — block dedup shrinks wire bytes, not budget draw.
**Depends on:** Task 1.

### Task 4: C12 — `get_workflow` ops-bundle slimming
**Goal:** Under persistent mode, collapse the orchestrator ops bundle to a `workflow_bundle:<hash>` marker on the second+ (resume) `get_workflow` call; full in fresh mode.
**Deliverables:**
- `src/tools/workflow-tools.ts` — reorder `get_workflow`: build `opsBlock` and compute its content hash before advancing the session; when `state.contextMode === 'persistent'`, look up `workflow_bundle:<hash>` and either substitute a marker (with a short `note`) or stage the hash for recording; fold `recordDeliveries` into the `advanceSession` mutator at line 299 (which today advances with no mutator). The post-`---` workflow summary stays full.
**Depends on:** none of Tasks 2-3 (independent channel); depends on Task 1's helpers only for `contentHash`/`deliveredHash`/`recordDeliveries`, which already exist.

### Task 5: Extend `tests/reference-delivery.test.ts`
**Goal:** Guard block-marker emission, cross-technique contract dedup, the `full`/`bundle:full` escape, fresh-mode non-markering, and C12 — without loosening the existing shape assertions.
**Deliverables:**
- `tests/reference-delivery.test.ts` — new cases: (a) persistent-mode technique fetch whose contract/rules blocks were delivered by an earlier technique returns those blocks as markers, core full; (b) fetch technique A (all full) then technique B (shared blocks → markers, B's own core full); (c) `full: true` re-delivers all blocks full even when block-delivered; (d) fresh mode never markers blocks; (e) C12 — `get_workflow` collapses the ops bundle on a second persistent-mode call, full in fresh mode. Existing whole-technique and whole-bundle dedup cases stay green.

### Task 6: Docs
**Goal:** State that inherited-contract/rules blocks and the ops bundle can be delivered as markers.
**Deliverables:**
- `docs/api-reference.md` — block-level delivery + C12 note.
- `get_technique` / `get_activity` tool descriptions + `bundle_note` — one-line addition that blocks can now be markers.
**Depends on:** Tasks 1-4 (documents their behaviour).

## Success Criteria

*Behavioural criteria mirror the design-philosophy success criteria; this is a token-efficiency enhancement with no functional output change.*

### Functional Requirements
- [ ] Block-level markers emitted correctly: persistent-mode fetch collapses already-delivered contract/rules blocks to markers, core full (addresses C2/R2).
- [ ] Cross-technique contract dedup: technique A full, then technique B's shared blocks are markers, B's core full.
- [ ] Escape works: `full: true` (get_technique) / `bundle: "full"` (get_activity) re-delivers every block full.
- [ ] Fresh mode never markers blocks.
- [ ] C12: `get_workflow` collapses the ops bundle on a second persistent-mode call; full in fresh mode (addresses C12/R12).

### Quality Requirements
- [ ] Existing whole-technique and whole-bundle dedup cases stay green (cheapest-first layering must not perturb them).
- [ ] `binding-fidelity` / `binding-provenance` snapshots structurally unchanged (markerization is delivery-time).
- [ ] All tests passing; typecheck clean.

### Measurement Strategy
- The new `tests/reference-delivery.test.ts` cases prove each functional criterion (marker vs. full body assertions via `isUnchangedMarker` / `splitActivityResponse` helpers).
- Snapshot suites (`binding-fidelity`, `binding-provenance`) prove the structural-unchanged criterion by remaining green with no snapshot update.
- Optional post-merge: an instrumented persistent-mode work-package re-walk quantifies the projected ~+13% (C2) and C12 resume delta (out of scope; validation note).

## Testing Strategy

### Unit Tests
- `dedupTechniqueBlocks`: marker substitution when hash present in ledger; recording into `newDeliveries` when absent; no-op on a block absent from the projected record; idempotence across `newDeliveries` within one call.

### Integration Tests
- `tests/reference-delivery.test.ts` cases (a)-(e) above — exercise the helper through the real `get_technique` / `get_activity` / `get_workflow` handlers with a persistent-mode session and on-disk ledger.

### E2E Tests
*Omit — no end-user workflow surface changes; covered by the integration cases through the tool handlers.*

## Dependencies & Risks

### Risks
| Risk | Impact | Probability | Mitigation |
|------|--------|-------------|------------|
| Accidental modification of `projectTechnique` (CRITICAL blast radius) | HIGH | LOW | Helper operates on the *output record* only; enforced by the plan's out-of-scope boundary and Task 1's helper signature (`projected: Record<string,unknown>`). |
| C12 `advanceSession` reorder introduces a double-advance or missed record | MEDIUM | LOW | Single mutator folds the record; covered by C12 test case (e) asserting full-then-marker across two calls. |
| Block markering perturbs a snapshot suite | MEDIUM | LOW | Markerization runs after compose + provenance decoration; `binding-fidelity`/`binding-provenance` green-with-no-update is a criterion. |
| Layering perturbs the existing cheapest-first whole-technique path | MEDIUM | LOW | Whole-marker branch (640) unchanged; regression covered by existing green cases. |

**Status:** Ready for implementation
