# Validation

## Acceptance Boundary

The accepted scope is the Work Planner mode-family presentation. The strict proposed declarations are exercised in an isolated source copy; installed model adoption belongs to W08. The installed checker currently reports exactly one expected structural mismatch: Revise Fields is outside its installed mode section set. That observation is retained separately from strict target acceptance and from the zero-finding remaining installed files. No installed declaration is weakened or activated here.

## Source Identities

Baseline: `238b652aaa52057f66c86c9651c379296a7ba5b2`. The six reading walks use staged tree `171effffc8783af1ed348fecacd07f6d55a29e6d`; [Disclosure](disclosure.md#candidate-to-final-delta) records the single later call-presentation line. Final committed head: `c28be9980208c469e2c119e715a5b9b50b9e246e`; final tree: `96924656d6f331ad480615db0b76d6c3a2296d20`. The final source differs from the walked tree only by the one recorded Sync call-presentation line.

## Mode Structure and Preservation

Interim strict checks reported ten converted modes and zero findings. The reproducible [instrument](verify-modes.py) takes its supplied checkout or detached current directory, uses fresh temporary source/declaration caches, verifies literal preservation against the named baseline, retains installed-model findings and exercises missing-preamble/incorrect-call negative controls. Final Run at Revision executed the published instrument in a disposable detached checkout of `c28be9980208c469e2c119e715a5b9b50b9e246e`: ten modes, zero strict target findings; all ten original Prerequisites sections byte-identical; four original command bodies byte-identical after removing only presentation markup; original code specimens and Runs in preserved. Missing-preamble and incorrect-operation-verb negative controls were rejected, then restored copied source passed with fresh caches. The supplied checkout's source bytes remained intact. [Raw instrument result](head-mode-model.json), [revision helper log](head-revision.log).

## Behavioral Suites

Interim complete Work Planner suite: 923 tests, 922 passed and one opt-in live skip. Complete shared suite: 255 passed. The initial converted-source run exposed only mode-reader failures; the Plan reader and Apply call reader now preserve their original behavioral guarantees and their focused checks pass. Final Run at Revision against `c28be9980208c469e2c119e715a5b9b50b9e246e`: 923 tests, 922 passed, one opt-in live skip, exit 0. The complete shared suite at the same literal head passed all 255 tests, exit 0. [Planner raw result](head-planner-suite.json), [shared raw result](head-shared-suite.json). No failed reader/test is waived.

## Disclosure Observations

[Six independent repeated observations](disclosure.md) are explicitly partial: recovered truncation, incomplete recursive prerequisite closure, unproved ordering in some batches and incomplete graph/diagram evidence remain. Historical Standup drafts and temporary Revise candidates completed within their authority; complete Understand/workflow delivery did not. No clean disclosure, full workflow or token-reduction claim is made.

## Reproduction

Run `revision-check.py --project <project-checkout> --revision <literal-commit> -- <absolute-sbx> python3 <published-record>/verify-modes.py --self-test`. Run the complete Work Planner suite with `python3 -m unittest discover -s skills/work-planner/test` and the complete shared suite with `python3 -m unittest discover -s skills/test` in a detached checkout of that same literal revision, using the prescribed absolute sandbox launcher. The helper emits the tested commit and removes its temporary checkout on completion. Installed checker output is retained, not relabeled as zero.

## Installed Model Boundary

The exact-head instrument invokes the shared checker against installed declarations before injecting the proposed modes declaration in a fresh temporary copy. It records 58 files and exactly one installed diagnostic, `work-planner/modes/revise-mode.md:128: section outside the set — Fields`. The 48 remaining installed-model files have zero findings. This is the expected staged model mismatch W08 owns; the installed checker is not reported as a zero-finding pass. The strict target mode declaration reports zero over all ten converted files. [Raw result](head-mode-model.json) includes both results and the exact declaration exercised.

## Disclosure Evidence Audit

The audit assertion is that all six independent prompts, actual read receipts, command results, local outputs and stated limitations are retained and accounted for in the published [partial observations](disclosure.md), [raw archive](walk-evidence.tar.gz) and [checksummed manifest](walk-manifest.json). That bounded evidence-accounting assertion holds. **Disclosure observations remain Partial.** This audit is not a passed clean-disclosure test.

Target model, preservation and source readers pass. Bounded outputs are correct under the given authority. Strict selection order, full prerequisite closure and complete graph outcomes are not established. Source review found no introduced missing-context or routing defect; inherited full-file fanout and unavailable graph/publication evidence remain explicit.

## Exact-Head Reproduction

The published [run-head-checks.py](run-head-checks.py) runs from the detached current checkout and stores the exact head, command, exit and complete stdout/stderr of each check. [head-revision.log](head-revision.log) records the helper's literal revision and temporary checkout, then each completed result. The task checkout remains clean after source push; the temporary checkout is removed by the helper. For another record destination, use verify-modes.py directly with its supplied checkout and capture output locally. No editable-branch source is read by the model instrument.

## Pull Request Readback

Task PR 1643 targets `i17/e01/workspace`, is non-draft, and reports the exact verified head `c28be9980208c469e2c119e715a5b9b50b9e246e`. At capture its merge state is CLEAN and no remote status checks are reported; the local detached-revision checks are the validation evidence, not a claim of remote CI execution. The complete Development capture confirms this PR has no closing issue reference: the row has no task issue, and the whole epic is not linked as its delivering issue.

Record Epic Delivery produces only the W03 planning-folder-to-PR link change. W04/W05 reservations, all other rows, AC8 and the epic's incomplete state are preserved. The coordinator cleared the literal tested head for merge. Merged-revision verification supplies the criterion evidence below.

## Open Row Readback

The live epic was fetched immediately before its write and matched the reviewed proposal base. Its saved/read-back body equals the published row-only source: W03 links PR 1643, W04/W05 reservations and W08 are identical, and AC3/AC8 remain unticked. The epic remains open and its integration stays draft while sibling delivery is incomplete. [Live readback](epic-open-readback.json).

## Merged Revision Verification

PR 1643 merged with an exact-head SHA guard at `c28be9980208c469e2c119e715a5b9b50b9e246e`, after fresh target/readiness evidence and coordinator clearance. The merge commit and epic-base head are `fb9a834c940cbed9742709d7e03594900e31d22f`; its tree is `96924656d6f331ad480615db0b76d6c3a2296d20`, equal to the verified task-head tree. Update Epic Base found the current workspace target already incorporated. [Merge result](merge-result.json), [merged metadata](pr-merged.json), [readiness evidence](merge-readiness.json).

Run at Revision created a disposable detached checkout of that literal merge commit. The published mode instrument passed all strict target, original-prerequisite, four command-body, literal-code-span, Runs in, negative-control and source-byte assertions. It retained the same sole installed Revise Fields diagnostic; the remaining installed files report no findings. The complete Work Planner suite passed 923 tests with one opt-in live skip; the complete shared suite passed 255. All commands exited 0 and the helper removed its temporary checkout. [Mode result](merged-mode-model.json), [planner result](merged-planner-suite.json), [shared result](merged-shared-suite.json), [revision log](merged-revision.log), [runner](run-merged-checks.py).

These results verify AC3 only. Disclosure observations remain Partial. Installed model adoption remains assigned to W08/AC8; no other criterion is verified by this unit. The proposed completion body changes only W03's Done cell and AC3's tick. Sibling reservations and incomplete epic/adoption state are preserved. The exact board item after merge identifies epic 1616 as In Progress, not In Review. Final tracker and integration readbacks are recorded below.

## Confirmed Unit Completion

Task Merge is complete for W03. [Epic readback](epic-final.json) confirms only W03 Done and verified AC3 were added; W04/W05 holds, W08 and unticked AC8 remain intact. Epic 1616 remains open. [Integration readback](integration-final.json) confirms draft PR 1641 at the merged epic-base head, targeting workspace, with all three actual task references retained. The final delivery computation reports no link, criterion, Done, reference or Changes-path discrepancy and writes an identical body; its only incomplete result is the still-undelivered sibling work and criteria. [Final consistency output](final-sync.log).

[Exact board item readback](board-final.json) identifies Project 17 item 291152098 as issue 1616 with Status field 422017304 equal to In Progress. This task merge requires no board status write; the incomplete epic does not enter review. No task issue exists to close, the epic/base is not closed or integrated into workspace, and no successor begins. [Completion identity](completion.json).

Applied and held plan-change lists are empty. Target model, preservation and readers pass at both literal task head and literal merged revision; bounded outputs are correct under their authority. Strict selection order, full prerequisite closure and complete graph outcomes remain unestablished, as the Partial disclosure account states.
