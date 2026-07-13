# Test Plan: Cluster 3 Delivery Ledger (block-level dedup + get_workflow slimming)

> **ADR:** `06-design-spec.md` · **Ticket:** [#189](https://github.com/m2ux/workflow-server/issues/189) · **PR:** [#223](https://github.com/m2ux/workflow-server/pull/223)

## Overview

This test plan validates block-level delivery dedup (C2) and `get_workflow` ops-bundle slimming (C12) — extending the existing B1 reference-delivery mechanism to a finer granularity so persistent-mode sessions receive less duplicate contract/rules content and skip the orchestrator ops bundle on resume.

Key changes to validate:
1. `dedupTechniqueBlocks` - replaces already-delivered `inherited_inputs` / `inherited_outputs` / `rules` blocks of a projected technique with unchanged-markers, recording newly-delivered block hashes.
2. `get_technique` full-delivery branch - block dedup applied under persistent mode; whole-marker branch and `full: true` escape unchanged.
3. `get_activity` eager step-technique bundling - block dedup applied on each inlined technique before the spread; budget draw unchanged.
4. `get_workflow` (C12) - orchestrator ops bundle collapses to a `workflow_bundle:<hash>` marker on resume under persistent mode.

## Planned Test Cases

| Test ID | Objective | Type |
|---------|-----------|------|
| PR223-TC-01 | Verify a persistent-mode `get_technique` fetch collapses contract/rules blocks already delivered by an earlier technique to markers while the technique-specific core stays full | Integration |
| PR223-TC-02 | Verify cross-technique contract dedup: fetch technique A (all blocks full), then technique B returns its shared blocks as markers and its own core full | Integration |
| PR223-TC-03 | Verify `get_technique { full: true }` re-delivers every block full even when the blocks were previously block-delivered (context-eviction escape) | Integration |
| PR223-TC-04 | Verify a fresh-mode (non-persistent) `get_technique` fetch never markers any block | Integration |
| PR223-TC-05 | Verify `get_activity` eager bundling emits block markers for inlined step techniques whose shared blocks were already delivered, and `bundle: "full"` re-delivers them full | Integration |
| PR223-TC-06 | Verify `get_workflow` collapses the orchestrator ops bundle to a `workflow_bundle:<hash>` marker on a second (resume) persistent-mode call; delivers it full in fresh mode | Integration |
| PR223-TC-07 | Verify `dedupTechniqueBlocks` unit behaviour: marker substitution when a block hash is in the ledger, recording into `newDeliveries` when absent, no-op for a block absent from the projected record | Unit |
| PR223-TC-08 | Verify existing whole-technique (`technique:<id>`) and whole-bundle (`bundle:rules:<hash>`) dedup cases stay green — the cheapest-first layering does not perturb them | Integration |
| PR223-TC-09 | Verify `binding-fidelity` and `binding-provenance` snapshot suites remain structurally unchanged (markerization is delivery-time, after composition and annotation) | Integration |

*Detailed steps, expected results, and source links will be added after implementation.*

## Acceptance Criteria Matrix

| Requirement | Acceptance Criterion | Verifying Test Cases |
|-------------|----------------------|----------------------|
| C2 block-level dedup | Already-delivered contract/rules blocks collapse to markers; core stays full | PR223-TC-01, PR223-TC-02, PR223-TC-07 |
| Escape path | `full: true` / `bundle: "full"` re-delivers every block full | PR223-TC-03, PR223-TC-05 |
| Fresh-mode invariance | Fresh/default sessions never markered | PR223-TC-04 |
| C12 ops-bundle slimming | Ops bundle collapses on resume under persistent mode; full in fresh mode | PR223-TC-06 |
| No regression | Existing dedup cases green; snapshots structurally unchanged | PR223-TC-08, PR223-TC-09 |

## Running Tests

*Commands will be added after implementation.*
