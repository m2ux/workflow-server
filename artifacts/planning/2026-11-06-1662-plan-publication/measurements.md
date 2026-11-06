# Plan Publication Graph Measurements

## Revision and Freshness

- Review checkout: `/home/mike1/projects/dev/workflow-server/.worktrees/pr/1662-581c525137d0`; clean detached HEAD.
- Pull request: `https://github.com/m2ux/workflow-server/pull/1662`.
- Head: `581c525137d0779649ad97e89370bafbde927d34`.
- Comparison base: `50da3794d96e816a1938e1643a0f79fc0596bc37` (`workspace`).
- Storage: `/tmp/deliver17-20261106/gitnexus-e05-final`; every invocation sets `GITNEXUS_STORAGE_PATH` to this path and runs from the review checkout.
- GitNexus CLI: `1.6.12`; initial index uses `analyze --index-only` with two workers. No tracked source or generated agent guide is changed.
- Indexed at `2026-11-06T11:50:24.597Z`; metadata carries the exact full head. Initial and final status report index content matching all 203 covered files and up-to-date status. The metadata's overall file count is 205; these are distinct reported counts, not interchangeable coverage claims.
- Raw context/Cypher responses do not emit the contract's `staleness` JSON block. Exact metadata, initial/final status and unchanged checkout supply the available freshness evidence; no absent staleness field is fabricated.

The [index receipt](index-receipt.json), [initial status](index-status-initial.log), [final status](index-status-final.log) and [analysis log](index-analyze.log) preserve those observations.

## Complete Changed-Symbol Contexts

`detect-changes --scope compare --base-ref <exact base> --limit 200` reports three files, 46 changed symbols, zero affected processes and low risk. Its CLI renderer still prints only the first 15 symbol names plus a remaining count. That displayed truncation is supplemented rather than treated as a complete symbol inventory.

The projected graph inventory has 63 symbols in the three changed files. The exact diff hunks select six Plan headings, six catalogue headings and all 34 symbols in the newly added fixture file: 46 changed symbols. `measure_contexts.py` queries each exact UID with `context --limit 200`, rejects missing-symbol responses and writes a [46-entry manifest](context-manifest.json) linked to its raw `context-NN.json` output. The navigation inventory and exact diff are preserved in [symbols.json](symbols.json) and [change-hunks.diff](change-hunks.diff).

- Every selected context returns `status: found`.
- Every selected context reports an empty Process list.
- The largest returned incoming/outgoing relationship collection has 14 entries, below the requested cap of 200.
- The 12 Markdown section contexts omit `CONTAINS`; a dedicated raw `CodeRelation` query supplies those edges.
- Some code contexts contain unrelated weak receiver matches, including `walk`'s access to a `current` symbol in workflow-canon. That edge is not used as an architectural dependency.
- Parameter-dispatched calls from `walk(tracker, ...)` to tracker methods are not fully resolved. They are described from pinned source and fixture observations, not added to the graph diagrams.

No affected Process is reported to trace. Repository-wide Process nodes exist, and supporting unchanged parser symbols participate in some of them; those are not reported affected publication flows. The functional diagram instead uses the separately measured static nested call path below.

## Structural Diagram Evidence

The [raw containment query](containment.json) returns 15 `CONTAINS` edges within the Plan document, under a cap of 100. Five edges define the six displayed nodes:

| Parent symbol | Relation | Child symbol |
| --- | --- | --- |
| `Plan Mode` | `CONTAINS` | `Procedure` |
| `Procedure` | `CONTAINS` | `6. Publish` |
| `6. Publish` | `CONTAINS` | `Parent Identity` |
| `6. Publish` | `CONTAINS` | `Epic Publication` |
| `6. Publish` | `CONTAINS` | `Saved Validation` |

Each edge has confidence `1` and reason `markdown-heading`. The drawn area follows measured document containment rather than a directory-derived subsystem boundary. All six headings are reported changed symbols; unchanged context is not added to pad the diagram.

## Functional Diagram Evidence

The [nested call query](nested-fixture-path.json) returns one matching four-edge chain under a cap of 20:

| Nested position | Exact measured symbol |
| --- | --- |
| 1 | `SavedPlanPublication.test_existing_parent_saves_epic_then_parent_then_reads_before_validation` in `test_plan_publication.py` |
| 2 | `walk` in `test_plan_publication.py` |
| 3 | `section` in `test_plan_mode.py` |
| 4 | `parse` in `check_skill_files.py` |
| 5 | `scan_blocks` in `check_skill_files.py` |

Each adjacent pair has an actual static `CALLS` relation with confidence `0.85`. The first and last edges have reason `local-call`; the middle two have reason `import-resolved`. This is nested call order along a measured chain, not execution timing or inferred ordering between separate calls.

The diagram contains five participants and these four edges only. It contains no invented return arrows and no production tracker participant. Green identifies the two changed fixture symbols; grey identifies the existing three reader/scanner symbols. All symbols are pinned to the reviewed tree through source permalinks in the overview and [supporting symbol locations](sequence-support-symbols.json).

Additional [walk](walk-context.json), [section](section-context.json), [parse](parse-context.json) and [scan_blocks](scan-blocks-context.json) contexts preserve the supporting relationships. `section-calls.json` preserves all measured outgoing relations from the shared section reader; duplicate CALLS occurrences are not treated as separate functional stages.

## Interpretation Boundaries

- Publication order is specified in the pinned Plan source and supported by offline scenarios and independent readers. It is described as source-defined behavior in the overview; no graph Process claims that order.
- The structural diagram has six truthful heading nodes. The functional diagram has five truthful participants. Their sizes satisfy the current five-to-ten-element rule without padding.
- All graph source locations are normalized to actual one-based source lines for permalinks; raw projected `startLine` values are zero-based.
- A first speculative section-UID probe returned `not found`; it is excluded from valid measurements. The exact graph UID inventory resolved all 46 selected contexts.
- No live tracker writes, source changes, external messages or review-setting changes occur during overview measurement.
- The graph evidence does not establish perfect static resolution, runtime coverage, zero behavioral impact or complete disclosure conformance.

## Reproduction

From the pinned review checkout, set the storage override before every invocation. The measuring script contains the exact UID selection and `context --limit 200` loop. The raw path query uses incoming Cypher syntax to avoid a local shell-hook false positive while retaining the measured call direction from scenario to scanner.

The overview's diagrams use only the listed `CONTAINS` and `CALLS` measurements. All source-specific publication gates are cited independently at the full reviewed head.

## Refreshed Integration Evidence

The target now includes the completed E04 integration. The new base-to-head diff is rechecked in full: the same three E05 files comprise 389 added and 13 removed lines. Plan Mode, the publication fixture and the selected owning save/read/body/goal/dependency contracts and parser helpers are byte-identical to the previously reviewed source; the catalogue also preserves the E04 module/coverage rows. The complete repository tree is not claimed equal to the initial task tree.

All 46 symbol contexts and the containment/call-path queries are rerun from the clean new detached checkout against the correct `gitnexus-e05-final` index. The index accidentally built from the main project checkout is excluded; no receipt from `gitnexus-e05-refreshed` is used. Raw relationship identifiers belong to this fresh index rather than the prior index.

The exact current criterion log identifies this head and reports 14 publication tests passed. The combined current planner suite reports 1004 tests run, 1003 passed and one opt-in live Development-link check skipped; the checker reports 59 files and zero findings. These supplement the historical task logs. Previous receipts remain available through the engineering branch's published history.
