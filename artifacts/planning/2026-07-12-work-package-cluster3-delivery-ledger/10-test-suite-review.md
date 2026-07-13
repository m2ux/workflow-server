# Test-Suite Review — Cluster 3 Delivery Ledger (#189)

Changed test file: `tests/reference-delivery.test.ts` (+213 lines, 7 new cases across 2 describe blocks). Baseline: `reference-delivery` 29/29 green; `binding-provenance` 22/22 green (snapshots structurally unchanged, confirming delivery-time-only behaviour).

## Coverage map (diff-aware)

`dedupTechniqueBlocks` is the changed multi-instance symbol; it takes **two instances** in the running system — the `get_technique` full-delivery path and the `get_activity` eager-bundle path. The C12 `workflow_bundle` collapse is a third changed path.

| Behaviour (spec §4) | Instance | Test |
|---|---|---|
| Block collapse across techniques + hash match | get_technique | ✅ `collapses already-delivered … blocks to markers` |
| `full:true` re-delivers blocks | get_technique | ✅ `full: true re-delivers every block full` |
| Fresh mode never markers | get_technique | ✅ `fresh mode never markers blocks` |
| `technique:<block>:<hash>` ledger key | get_technique | ✅ `records block hashes under the … channel` |
| Block collapse in eager bundle | **get_activity** | ❌ **gap — no direct test** |
| C12 ops-bundle collapse on resume | get_workflow | ✅ `collapses the ops bundle …` |
| C12 fresh mode full | get_workflow | ✅ `never markers … in fresh mode` |
| C12 `workflow_bundle:<hash>` key | get_workflow | ✅ `records the workflow_bundle:<hash> …` |

## Findings

### Minor — routes `needs_test_improvements`

- **TEST-1 — the `get_activity` eager-bundle block-dedup call site is untested.** All C2 cases fetch via `get_technique`; none exercise the second `dedupTechniqueBlocks` instance at `src/tools/workflow-tools.ts:714-716`. That call site has a *different gate* (`referenceMode`, i.e. `bundle:"reference"` OR persistent) and merges block hashes into the shared `newDeliveries` accumulator — behaviour the updated `bundle_note` now promises to workers ("a marker may appear in place of a single … block inside an otherwise-full step_techniques entry"). Per the multi-instance coverage gate, an instance of the changed helper with no exercising test is a Minor coverage gap. **Recommendation:** add one persistent-mode `get_activity` case whose activity bundles ≥2 technique steps sharing a contract (an earlier get_technique or earlier bundled step having delivered the block), asserting a `step_techniques` entry carries a full core with a `{ delivery: "unchanged", content_hash }` in place of `inherited_inputs`/`inherited_outputs`/`rules`.

### Nit — documented, not auto-routed

- **TEST-2 — no re-collapse-after-full recovery case.** The `full:true` test seeds a whole technique then forces the sibling full; it does not assert recovery of a block that was *already collapsed* once (the summarised-away escape). Same gate boolean as the covered case, so low incremental value. Optional.

## Anti-patterns / quality

- No flakiness, over-mocking, or brittle-assertion smells. The hash-match assertions recompute the expected hash from the *actually delivered* sibling block (not a hard-coded literal), so they stay correct if the corpus contract changes — good, non-brittle.
- The `findTwoTechniqueStepIds` throwaway-probe pattern correctly isolates the test session's ledger from the discovery `get_activity` (which records whole-technique keys in every mode) — a real hazard avoided deliberately. Well-constructed.
- On-disk ledger-key assertions use a precise regex on the channel key shape — good, verifies the wire contract not just behaviour.

## Verdict

Test adequacy is strong for the get_technique and get_workflow paths and matches the spec test plan there. One genuine diff-aware coverage gap (TEST-1) on the get_activity bundle instance routes a test improvement.

## Fix-cycle resolution

- **TEST-1 — RESOLVED.** Added `collapses shared blocks inside get_activity eager step_techniques entries` to the C2 describe block. It enters `start-work-package` (entry activity, no transition gate; eager-bundles ≥2 techniques sharing the contract) under persistent mode and asserts that within a single `get_activity` response at least one shared block delivers full and at least one sibling's shared block collapses to a marker — exercising the `workflow-tools.ts` bundle-path call site of `dedupTechniqueBlocks`. `reference-delivery.test.ts` now 30/30 green.
- **Induced site-data staleness — RESOLVED.** The requested tool-description trims made `tests/site.test.ts` fail (`site/api/tools.html` is generated from the server tool descriptions). Ran `npm run build:site`; `tools.html` regenerated (1-line region change), `site.test.ts` back to 4/4.
- `needs_test_improvements` set false after this cycle (the only routed test finding is closed).
