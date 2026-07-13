# Change Block Index — Cluster 3 Delivery Ledger (#189)

Branch `feat/189-cluster3-delivery-ledger` compared against work-package base `0ea367b9` · **5 files · 16 hunks · ~8 minutes**

> Reviewer instructions: open the diff side-by-side in your external tool (VS Code, Meld, etc.). For each row, confirm the rationale paragraph below is accurate. Reply with corrections and/or comma-separated row numbers for any block with an issue, or `none`.

| Row | Path | File |
|-----|------|------|
| [1](#block-1) | `docs/` | api-reference.md |
| [2](#block-2) | `src/tools/` | resource-tools.ts |
| [3](#block-3) | `src/tools/` | workflow-tools.ts |
| [4](#block-4) | `src/utils/` | delivery.ts |
| [5](#block-5) | `tests/` | reference-delivery.test.ts |

## Block Rationale

### Block 1
`docs/api-reference.md` — documents the two new delivery behaviours for readers of the reference-delivery section. The Ledger bullet gains `workflow_bundle:*` as a fourth namespaced channel and states the channel-isolation invariant explicitly (a marker only references content from its own channel). A new `get_workflow ops-bundle slimming` bullet and a `Block-level delivery` bullet describe C12 and C2 respectively, and the stale forward-reference to "deferred to C2 work" in the resources-stay-lazy bullet is removed now that C2 has landed. Documentation-only; it describes the system as it now is.

### Block 2
`src/tools/resource-tools.ts` — wires block-level dedup into `get_technique`. The import swaps `projectTechniqueToYaml` for `projectTechnique` (the split project→dedup→stringify now needs the ordered record, not a pre-serialised string) and adds `dedupTechniqueBlocks`. The single `projectTechniqueToYaml(technique)` call becomes `ordered = projectTechnique(technique)` + `stringifyForResponse(ordered)`, deliberately keeping the whole-technique hash over the *pre-marker* text so the existing whole-technique collapse branch is untouched. On the full-delivery branch, when `contextMode==='persistent' && full!==true`, it runs `dedupTechniqueBlocks(ordered,…)`, stringifies the deduped record into `body`, and records the returned block hashes alongside the whole-technique key in the same `recordDeliveries`. The tool description gains a sentence on block markers and the `full:true` escape.

### Block 3
`src/tools/workflow-tools.ts` — two changes. (a) C12: `get_workflow` brings its orchestrator ops bundle into the ledger under `workflow_bundle:<hash>`, persistent-mode only. The `advanceSession` was moved *below* bundle construction so the marker decision and the new ledger-key commit happen in one mutator (previously get_workflow advanced with no mutator). On a persistent resume where the agent already holds the bundle, `opsBlock` becomes a single canonical marker plus a `note`; the post-`---` summary always stays full. (b) C2 in the eager-bundle path: each full-delivered `step_techniques` entry runs `dedupTechniqueBlocks` on its `projectTechnique(technique)` record before the spread (guarded by `referenceMode`), so shared blocks already delivered by a sibling bundled step or an earlier fetch collapse to markers; block hashes merge into the existing `newDeliveries`. The `bundle_note` and `get_activity` tool description gain the block-marker explanation.

### Block 4
`src/utils/delivery.ts` — adds the shared `dedupTechniqueBlocks` helper used by both wiring sites and its `DEDUP_BLOCKS` constant (`inherited_inputs`, `inherited_outputs`, `rules`). The helper operates on the *projected* record (not the typed `Technique`), so substituting a marker for a typed block carries no TS friction, and hashes each block over the same single-key projection (`{ [block]: value }`) the reader hashes so hashes match across techniques sharing a contract. It reads the ledger via `deliveredHash(state,…)`, also honours an in-flight `newDeliveries` staging map (intra-call idempotence), and returns a shallow copy (input not mutated). The module header is extended to document the two new content-keyed channels and the content-keying-means-no-staleness rationale, and refreshes the stale `bundle:rules` line to `bundle:rules:<hash>`.

### Block 5
`tests/reference-delivery.test.ts` — extends the reference-delivery suite with two describe blocks (`block-level delivery ledger (C2)`, 4 cases; `get_workflow ops-bundle slimming (C12)`, 3 cases). C2 cases: cross-technique block collapse with a hash-match assertion against A's block projection; `full:true` re-delivers every block; fresh mode never markers; the `technique:<block>:<hash>` ledger key is recorded on disk. C12 cases: ops bundle collapses to the canonical marker (with hash + note) on the second persistent call while the summary stays full; fresh mode always full; the `workflow_bundle:<hash>` ledger key is recorded. A `findTwoTechniqueStepIds` helper discovers two technique-bound steps on a throwaway probe session so the probe's `get_activity` does not pollute the test session's ledger.
