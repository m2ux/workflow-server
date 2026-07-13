# Code Review — Cluster 3 Delivery Ledger (#189)

Authored surface: `src/utils/delivery.ts`, `src/tools/resource-tools.ts`, `src/tools/workflow-tools.ts`, `docs/api-reference.md`. Project type: other (Node/TypeScript) — Rust/Substrate criteria N/A. Base `0ea367b9`.

## Summary

The diff is a faithful, minimal realisation of the C2 + C12 design spec. Additive, no schema change, one shared `dedupTechniqueBlocks` helper wired into both `get_technique` and the `get_activity` eager bundle, and a single-key `workflow_bundle:<hash>` collapse in `get_workflow`. Typecheck and build clean; the targeted `reference-delivery` suite is 29/29 green. **No Critical, Major, or Minor findings.** Three Informational observations below.

## Verification against the design spec

- **C2 keying / channel isolation (DP-2):** block keys are `technique:<block>:<hash>`, content-keyed, in the same `technique:` channel as the whole-technique key — matches spec §2.2. `deliveredHash`/`recordDeliveries` keep the agent-scoped ledger contract.
- **C2 two-tier layering (DP-5):** `get_technique` computes the whole-technique hash on the **pre-marker** projected text (`ordered`), leaving the whole-technique collapse branch untouched; block dedup only runs on the full-delivery branch under `persistent && !full`. Matches spec §2.3 exactly.
- **C2 block position (DP-4):** `dedupTechniqueBlocks` does `{ ...projected }` and replaces values in place, so `projectTechnique`'s canonical key order (`inherited_inputs` … `inherited_outputs` … `rules`) is preserved and markers sit at the block's position. `stringifyForResponse` serialises in insertion order, so no explicit ordering list is needed (spec §2.6 "confirm block keys in ordering list" is satisfied structurally).
- **C2 provenance interaction (DP-2):** `dedupTechniqueBlocks` runs after `decorateTechniqueProvenance`, so an annotated `inherited_inputs` variant hashes differently and correctly delivers full — verified by reading the get_technique ordering (decorate at ~601, project→dedup after).
- **C2 escape (DP-3):** `full !== true` gate on get_technique and `referenceMode` gate on the get_activity bundle path both hold; `full:true` / `bundle:"full"` re-deliver every block.
- **C12 (DP-7/DP-8):** single `workflow_bundle:<hash>` key, persistent-gated, own channel — no cross-reference to `bundle:*`. The `advanceSession` was correctly moved below bundle construction so the marker decision and ledger commit share one mutator; the post-`---` summary stays full.
- **No schema change:** confirmed — `git diff` touches no `src/schema/`. Matches spec §2.6 / §6.

## Findings

### Informational

- **INFO-1 — C12 records the ledger key from the pre-await snapshot.** `get_workflow` decides the marker and records `workflow_bundle:<hash>` against `state` captured at load (`resource`-tools uses a fresh reload for the same reason). `resolveTechniques` awaits FS reads before `saveSessionForTool`, so a concurrent writer in that window is clobbered by the whole-file last-writer-wins save. This is **pre-existing** behaviour — the prior `advanceSession(state)` already saved from the same snapshot — so the change is not a regression; it only adds a ledger key to that existing save. `get_activity` avoids this via `reloaded = await loadSessionForTool(...)` (workflow-tools.ts:805). If get_workflow ever grows concurrent-write exposure, aligning it to the reload pattern would close the gap. No action required for this PR. (`src/tools/workflow-tools.ts:284-332`)

- **INFO-2 — C12 marker carries an extra `note` key.** The C12 marker is `{ ...unchangedMarker(h), note }` (3 keys) where block/whole-technique markers are the bare 2-key marker. The reader contract (`delivery`/`content_hash`) is satisfied by both, and the extra guidance string is additive; mirrors how `bundle_note` sits beside `bundle_mode`. No action. (`src/tools/workflow-tools.ts:319-322`)

- **INFO-3 — `DEDUP_BLOCKS` couples to `projectTechnique`'s key strings.** The constant string-literals must track `projectTechnique`'s emitted key names; the doc comment flags this explicitly. A drift would surface as the reference-delivery collapse tests failing (blocks would never match), so it is guarded indirectly. No dedicated assertion, but acceptable. (`src/utils/delivery.ts:71-79`)

## Fix-cycle resolution (user code-quality corrections)

The `rationale-confirmed-with-issues` checkpoint requested comment/description trims (non-behavioral) plus the TEST-1 add. Applied in the worktree:

- **Tool descriptions + `bundle_note` trimmed** on `get_technique` (resource-tools.ts) and `get_activity` (workflow-tools.ts), and the C12 marker `note` — behavioral contract preserved (block-dedup semantics, unchanged-marker, full/reference), padding cut. Net −25 comment/description lines across the three source files.
- **Planning-reference comments removed** — deleted `// C12 — …` / cluster-tag narration introduced by this diff, replaced with concise plain-English comments where the code needs one. Also refreshed one comment this diff had made stale ("deferred to the C2 … cluster" → plain "resources stay lazy") for consistency with the docs change. Pre-existing cluster tags from earlier clusters (`#189 C1c`, `#189 C7`) were left untouched — out of scope for this review.
- **`dedupTechniqueBlocks` docstring condensed** to a conventional what/params/return form matching surrounding density; design-spec narration removed.
- All trims are non-behavioral; delivery-payload byte-streams for existing cases are unchanged (the trimmed strings are tool-registration descriptions and a `note`/`bundle_note` asserted only for existence). The one downstream effect — `site/api/tools.html` is generated from the tool descriptions — was resolved by re-running `npm run build:site` (see test-suite review).

## Blast radius

`dedupTechniqueBlocks` is a new export with exactly two call sites (both in this diff). `projectTechnique` was already exported and used by `projectTechniqueToYaml`; the get_technique swap from `projectTechniqueToYaml` to `projectTechnique` + `stringifyForResponse` is behaviour-preserving on the non-persistent / `full:true` paths (same bytes). `get_workflow`'s `advanceSession` re-ordering is internal to the handler. No downstream caller of these tools sees a contract change in fresh/default mode — the design's "byte-for-byte unchanged for fresh sessions and dispatched workers" holds.
