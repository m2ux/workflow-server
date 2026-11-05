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
