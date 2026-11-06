# Single-Use Operation Verification

## Result

Record Dispatch Status is shared. The baseline contains four linked references from three caller sections: two in Record Epic Review, one in Unit Dispatch and one in Hold Hot-fix Unit. The final source still contains four references; the hot-fix hold sequence is now part of Unit Dispatch, so two caller sections own those four sites. The operation remains in Board Delivery.

Thirty-five other artifact operations have exactly one linked reference, each from a procedural caller. They are inlined at those sites, including nested single-use operations. The skill has 65 remaining artifact operations, each with at least two incoming references; there are no one-reference or uncited artifact operations. Actual links exclude fenced/inline specimens, and commands retain their separate published specifications.

- Baseline: `2d2e223451815c2a8986bf2848bdd0dd7e4be58d`.
- Initial reviewed source: `5fdc535a8d0d29304293e782f97cdcfa11effd9a`.
- Corrected final source: `f819e3b68e32aa014c4ca58648ce674e542cf773`.

## Rule and Composition

Work Planner's Operation Scope guideline states the one-reference rule. Shared capabilities, command contracts and Fields remain in their subject artifacts; a caller owns its inlined sequence. A new installed-corpus test counts incoming links for every artifact operation and rejects single-reference or uncited operations without hardcoding their names or counts.

Conditional creation, new/retained holds, per-base loops, mutually exclusive Hoist destinations and dispositions, missing-board creation and shared continuation have explicit boundaries. Intermediate outputs stay available to the containing sequence, and the caller's final result remains at completion. Only the prerequisite imports affected by these moves are recalculated; eight files gain or lose imports whose direct use moved. This is not the separately planned prerequisite cleanup.

## Preservation

- All **116** command specifications, including imperative preambles, I/O roles, enriched invocation bytes, quotes and escaped continuation/redirection characters, are byte-identical.
- All **36** Fields sections are byte-identical, including field examples and structural templates. No command, field definition, template, source script or compatibility alias is added for the inlining.
- All code literals in the removed procedures remain in their final callers. Relative executable/data links resolve from those callers; literal example links keep their original content.
- The instruction comparison matches 177 lines after normalizing relative link locations, whitespace and the intermediate Provide/Retain verb. Fifteen context/result lines receive explicit semantic review: current measured evidence, locally resolved brief gaps, closure evidence for the next stage, outside-threat collection, local hot-fix number/body/status continuation, retained incorrect-link decisions, empty-audit continuation, retained placement/output results, and the review/refusal/comparison routes described below.
- A source search finds no remaining removed-operation anchors in current skills, README or docs. The section comparison reports the intentional removals and changed callers; exit 1 is expected and is retained separately from passing regression checks.

## Independent Review and Corrections

Three independent readers inspect stable source `5fdc535a8`. Sync/closure/board and Hoist/Align/Propose/goal/review comparisons identify no new lost instruction. Delivery review finds two introduced continuation ambiguities: retaining an initial hot-fix review failure did not explicitly jump to repair before later readiness actions, and an epic Submit refusal could exit its parent before shared refusal reporting. Main review also identifies the moved head-evidence comparison's obsolete delegation to “the requester.”

Final source `f819e3b68` sends an initial hot-fix finding directly to its repair loop, sends Submit Epic Merge refusal directly to Merge Refusals, and compares check/status evidence against target requirements after reviews are fetched. Intermediate review states remain in their enclosing flows. Two further independent fresh-context bounded checks confirm the corrected branches without receiving the prior findings or expected route: readiness write/readback is skipped before repair; harness refusal reaches reporting and stops merge attempts, with no approval request or same-run retry.

## Reading Evidence and Limits

The initial fresh Sync, Hoist and Understand trials do **not** establish complete disclosure conformance. Mandatory prerequisite-first cycles are inherited from the baseline, including Delivery Branches ↔ Work Item and Hot-fix ↔ Hot-fix Body, with wider board/delivery cycles. Readers report unrelated whole-file retrieval, incomplete transitive reads, truncation recovery and missing environment context. No cycle is waived. The inherited context cleanup is already planned in E02.

The two follow-up checks establish bounded instruction interpretation at the corrected source, not a complete skill execution, live delivery eligibility, consistent full reading behavior or token savings. One Hoist reader's local bubblewrap automation is unavailable; its source inspection and evidence limits are recorded. No reader changes source, tracker state, worktrees or graph data.

The comparison also identifies inherited readiness concerns: generic Epic Integration retry/success-readback wording is ambiguous alongside the common missing-harness-permission stop, the Merge Permission field describes narrower task/base examples, and a review failure after a hot-fix was marked ready lacks an explicit draft-restoration action. They exist at the baseline and are recorded as follow-up candidates; this refactor does not claim to resolve them. The retained-preparation creation/reuse ambiguity remains the approved E02 W10 plan.

## Checks

| Check | Result |
| --- | --- |
| Reference inventory | 100 → 65 operations; 35 inlined; zero remaining one-reference or uncited operations |
| Command and Field preservation | 116 complete specifications and 36 Fields sections identical |
| Complete planner suite at final pinned source | 944 tests: 943 passed, 1 opt-in skip |
| Shared checker suite | 277 passed |
| Installed model | 58 Markdown files, zero findings |
| Whitespace | `git diff --check` passed |
| Fresh route disclosure | Partial/failed full prerequisite ordering, inherited cycles unwaived |
| Corrected failure-branch interpretation | Two independent bounded checks confirm intended continuation; complete execution not claimed |

## Reproduction

At the final source, run inventory-operations.py with an output JSON path to recompute the current graph. Run verify-preservation.py with the original before.json and newly computed graph as its two arguments. It uses the exact baseline git source and writes comparison evidence under `/tmp`. The test_documents corpus gate and full planner suite observe the installed model. Every reading ledger retains its actual source and authority limits.
