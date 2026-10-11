# Canon Audit Matrix Implementation

## Progress

- [x] W01 source and criterion inventories.
- [x] W02 section matrices and mapping evidence.
- [x] W03 independent verification and completion gates.
- [x] W04 bounded assignments and durable results.
- [x] W05 Author/Audit integration and freshness.
- [x] Existing corpus structural specimens, adversarial checks and controlled semantic qualification.
- [x] Independent skill walks, with failed disclosure behavior retained as an acceptance limitation.
- [x] Commit and push implementation and incremental evidence.
- [x] Publish final qualification evidence and hand off the requested [AP/DP quality review](../2026-10-11-canon-quality-review/README.md).
- [x] Finish the declared four-walk check-selector cycle and preserve its result without further retries.
- [ ] Strict skill disclosure acceptance: three final walks fail T12 through prerequisite ordering or unrelated reads; no unqualified Revise-mode completion claim. The bounded work is stopped with this acceptance gap recorded.

## Scope

Implement the approved plan on `skill/canon-audit-matrices` in `/home/mike1/projects/dev/workflow-server/.worktrees/skill/canon-audit-matrices`. Planning and evidence stay in this engineering record. Existing corpus specimens are validation inputs; corpus remediation requires its own confirmed findings and authorized scope.

## Implementation

The skill captures the complete source inventory, native or revision-bound item addresses, relationship context and every AP/DP entry. It renders one sectioned matrix document per element type. Independent receipts cover both the inventory and every applicability decision, including exclusions. Evaluation waits for that entire verified map. Completion also requires every applicable cell, whole-file read, supplemental unit, selected check and finding confirmation.

The coordinator owns durable state and immutable worker returns. Assignment planning accounts for serialized packets, output, work and allocated slots; criterion or obligation-kind seams retain shared context. Changed generations invalidate all evidence conservatively. Accepted partial work remains resumable within an identical generation. Status returns bounded counts and artifact paths.

## Delivery

The skill implementation is published on [skill/canon-audit-matrices](https://github.com/m2ux/workflow-server/tree/skill/canon-audit-matrices), at commit `e8be42ce97eeb427e337214890da52ce3c1e8906`. Plain pushes and remote ref reads establish that publication. [Pull request #1296](https://github.com/m2ux/workflow-server/pull/1296) delivers that branch to `workspace`. Its test plan is incomplete: T12 is Partial and carries the disclosure acceptance gap recorded below. The latest documentation change selects checks from the declared task/project contract and requires an identified comparison base for a delta. Core audit tools remain at their qualified bytes. The preceding `ac53785d` makes qualification scoring accept a principle's exact captured name with or without the numeric heading prefix. It preserves the fixed reference, source-location match and one-to-one result reconciliation; ordinal-only and unrelated names remain rejected. [Before](validation-evidence/qualification-names-before.json) and [after](validation-evidence/qualification-names-after.json) observations retain the two-round reproduction.

Engineering checkpoints `803c3408189df763568c1e4e10c6a42f460e16b4`, `51e45d0a` and `8453ecf6` are committed and pushed. They preserve implementation tests, corpus captures, original live runs, completed current applicability verification and exact reading traces. Final current qualification passes; its evidence is linked below. Raw evidence retains captured source/tool bytes, including their original whitespace; a clean prose/source diff does not imply whitespace-normalized raw evidence.

The paired engine composes borrowed technique contracts from the namespace where the definition is found. The implementation records that defining context separately from the executing workflow and full routine call chain. Evidence: engine `e889276ae7c49a6b5cd37b4928d5f983e76c9770`, `src/loaders/technique-loader.ts`, `composeTechniqueWithSource`, lines 650–659. The design record incorporates this observed correction.

## Mechanical Validation

| Check | Observation | Evidence |
| --- | --- | --- |
| Audit inventory, lifecycle and adversarial regressions | 35 passing tests | [Output](validation-evidence/canon-audit-unit-final.txt) |
| Existing definition edit guard | 36 passing tests | [Output](validation-evidence/canon-edit-guard-final.txt) |
| Shared skill mode summaries | 3 passing tests | [Output](validation-evidence/canon-summaries-final.txt) |
| Local Markdown references and metadata | 211 links resolve at the final selector revision; repository fields validate | [Output](validation-evidence/selector-cycle/static-checks.json) |
| Generic skill validator | Rejects the pre-existing hooks field; repository guidelines explicitly allow it | Compatibility limitation; not a new skill metadata defect |

The independent gate review exposed stale confirmations, incomplete packet costing, absent proposed inventories, replay/overwrite seams and insufficient source-span evidence. Regressions cover each correction. Findings can contain several distinct violations per cell; duplicate reports cannot silently lower severity or band. A live inventory pilot subsequently disputed missing supplemental/check projections, and the packet contract now exposes them.

A later independent review found an input-cost defect: verification/evaluation serialized mapping citations but omitted some cited source excerpts outside row.sources. The three corrected Author A relationships demonstrate missing routine, ancestor and leaf context plus a longer DP span. Two regressions failed in both affected phases before correction. The planner now merges exact mapping-evidence spans into its required context; all 35 audit tests pass. The [independent budget review](dispatch-budget-review.md) measured a packet increase from 14,834 to 16,742 bytes, still within that assignment's declared budget. Every known dependency is included in the candidate's serialized estimate.

All eight earlier live cases completed under their captured tooling and reconcile to the fixed six-defect reference. Their exact tool bytes and observations are preserved under [the prior generation](behavioral-qualification/tool-generations/22addabe6c9f/qualification-results.json). The current-generation captures started with all 1,584 cells unknown and no imported results. [Renewal proof](behavioral-qualification/current-generation/generation-renewal.json) establishes identical rows, criteria and source bytes, distinct snapshots, and refusal of the old tooling's completion gate. All 128 current inventory obligations and all 1,584 current mapping decisions are independently verified: 376 applicable and 1,208 excluded. All 376 applicable cells are evaluated (184 pass; 192 finding), all 64 supporting obligations are settled, and all 24 finding instances are independently confirmed. [Actual CLI completion calls](validation-evidence/current-final-completion.json) return exit 0 for every run; [fixed-reference reconciliation](behavioral-qualification/current-generation/qualification-results.json) accepts all eight cases.

## Existing Corpus Specimens

Corpus revision: `e70b44778f71d9d699f746f78a16b892531c82d3`. Paired engine: `e889276ae7c49a6b5cd37b4928d5f983e76c9770`. All 161 APs and 47 DPs are included.

| Specimen | Rows | Criteria | Cells | Illustrative Mapping Assignments | Structural Result |
| --- | ---: | ---: | ---: | ---: | --- |
| [MVW coverage](corpus-specimens/current-generation/mvw/audit-coverage.md) | 211 | 208 | 43,888 | 416 | Exact, disjoint coverage; all four types and relationship context |
| [Routine conformance coverage](corpus-specimens/current-generation/routine-conformance/audit-coverage.md) | 743 | 208 | 154,544 | 1,040 | Distinct routine instantiations and unchanged callers retained |

These tests qualify capture, rendering, sizing and ownership against existing corpus bytes. The assignment counts use an illustrative structural profile of 80 output units and two seconds per cell with three slots, not measured full-canon semantic costs. They do not claim completed semantic audits: their cells remain unresolved and their completion gates remain closed. [Measured results](corpus-specimens/current-generation/results.json) retain identities, estimates and elapsed time for the corrected tool generation.

The first global packing experiment was interrupted after excessive repeated cost calculations. Criterion/kind seams and cached source/canon spans bound that search. Interrupted exits 143 and 130 remain failed observations, not passing specimen tests. The final experiments take about 8 and 40 seconds; exact current measurements are in the results artifact.

## Live Agent Validation

The controlled four-criterion cases exercise six independently specified defect classes and clean controls across Author and Audit. They are a qualification dialect, separate from full-project-canon and engine-schema conformance. The expected-outcome manifest was fixed before evaluator access (SHA-256 `33393f80d126ea7054a637cea716308883944953cbbd5ea1d8fcf12c343eea36`). The current and prior generations each complete both modes twice: each pair has 196 clean-case cells and 200 seeded-case cells with independently verified applicability and all 94 applicable cells evaluated. Every clean case has zero findings and every seeded case has six independently confirmed defects. Current-generation workers retain earlier fixture exposure, so these repeated current results are not eight fresh blind experiments.

Every current first evaluation identifies all six expected defects. A later classification review reopens only the inherited-destination cells in both Audit seeded cases; renewed independent mapping verification and evaluation establish High Contract. The declarations conflict, but the fixture defines no destination-binding or conflict-precedence semantics establishing a particular runtime route. This is classification reconciliation, not an additional discovery. [Original states and reset evidence](behavioral-qualification/current-generation/classification-review/README.md) preserve the initial High Live judgment and the rejected band-only downgrade attempt. Severity remains High; the original and final bands both gate conformance.

Initial required-work pilots measured 49 mapping cells in 187 and 201 seconds, with 17,806 and 41,952 returned bytes; 16 inventory items took 222 seconds and 15,847 bytes. [Calibration](behavioral-qualification/calibration.json) uses conservative token upper bounds with margin. Each mode receives one child slot within a three-child pool. The revised mapping queues contain 32 bounded assignments per mode; inventory has eight assignments across four runs. Historical pilot receipts cannot satisfy the refreshed generation.

Observed overruns inform later queues: the first Author evaluation used 458.099 seconds for 72 remaining cells; one six-cell AP-01 return used 4,895 bytes against a 3,072-byte estimate. A second-round mapping return exceeded its estimate by 18 bytes. Both remained within the declared 16,000-token output bound under the conservative bytes/token proxy. Later Audit DP1 output averaged 1,175.45 bytes per cell, and Author evaluated 94 cells in 836.52 seconds excluding its recorded permission-review pause bracket. Current evaluation sizing uses 1,600 output units and ten seconds per item; mapping output uses 1,100. These are measured estimates, not guaranteed runtimes.

The host refused creation and activation of additional verifier threads after three children were allocated. Second-round Author and Audit mappers began with fresh contexts. Verification reuses an available agent who did not author those current mappings or inventories; its earlier fixture exposure is recorded, so this is independent verification but not a fresh-context verifier repeat. Unstarted ownership was released through typed retry before reassignment. No missing work is counted as complete.

Independent prior-skill Author and Audit baselines each found the same six planted defects and no clean-control defects. This fixture establishes no improvement in detection rate over that baseline. The new implementation's observed distinction is enforced, independently reconciled coverage and explicit residuals. Baseline inputs, source identities and returns are retained under behavioral-qualification.

Both prior-generation second-round mappers independently excluded seven workflow-to-activity graph relationships from the inherited-destination principle. Independent verifiers disputed those exclusions: the relationships select or re-enter the executing activity and carry its complete call chain to the leaf; the principle's independent-file exclusion does not exclude those calls. Their exact decisions, independently verified corrections and subsequent evaluations remain in that generation's ledger.

The isolated negative test supplies a missing DP, missing second clause, omitted called/exporting routine and an incorrect Protocol exclusion. Its independent verifier returned eight disputes across seventeen responsibilities, identifying all four fault classes. Both bad candidates refused the map gate with exit 2. Refresh and reset corrected the candidates; a second independent check accepted all sixteen inventory obligations and the new applicability decision. These test runs preserve their remaining mapping/evaluation obligations and are explicitly incomplete; the separate positive controlled cases exercise complete coverage. [Original results](behavioral-qualification/adversarial/reconciled-results.json) and [correction results](behavioral-qualification/adversarial/corrected-results.json) retain both observations.

## Disclosure Evidence

| Walk | Observation | Retained Output |
| --- | --- | --- |
| Author 1 | Correct lifecycle; unrelated Render command content retrieved | [Transcript](validation-evidence/author-disclosure-one-transcript.txt) |
| Audit 1 | Correct recovery; exposed Edit Hook nesting and early-check reconciliation ambiguity | [Transcript](validation-evidence/audit-disclosure-one-transcript.txt) |
| Author 2 | Correct Author path and gates; broad heading/file discovery recorded | [Transcript](validation-evidence/author-disclosure-two-transcript.txt) |
| Audit 2 | Correct audit recovery; narrow canon question over-read catalog context | [Transcript](validation-evidence/audit-disclosure-two-transcript.txt) |
| Author 3 | Report layout retrieved before Report Context; caller link corrected | [Transcript](validation-evidence/author-disclosure-three-transcript.txt) |
| Audit 3 | Two state projections exceeded display limits; bounded status and resume routing provided | [Transcript](validation-evidence/audit-disclosure-three-transcript.txt) |

Fresh live qualification traces repeat the affected worker paths. Their observed reads and outcomes are evaluated separately from structural tests. No context-token savings or guaranteed detection of unknown defects is inferred from file sizes or successful controlled fixtures.

The [final independent disclosure review](validation-evidence/final-disclosure-review.md) inspects three further fresh instruction walks. All reach the required procedure, but all fail the strict disclosure rule through unnecessary conditional reads. It records five confirmed extra section bodies, three schema body lines, four unsupported production-check recipe selections, nonzero discovery commands and incomplete bootstrap provenance. These walks are procedural explanations, not semantic audits. T12 and the Revise-mode disclosure acceptance condition remain partial/failed despite successful implementation checks and complete controlled semantic coverage; the skill revision is not reported as an unqualified guideline pass.

The subsequent [bounded selector cycle](validation-evidence/selector-cycle/review.md) tests the one supported routing correction at `e8be42ce` with two fresh Author and two fresh Audit contexts. All four reach the supplied checker and generic operation without loading unsupported production-check or report branches. One passes the bounded procedural retrieval check; three load the check specification before its prerequisite section, two also read unrelated historical material, and one lacks the planning-owner instruction receipt. Correct final explanations do not erase those retrieval failures. The four-walk cycle is finished and stopped; no additional repair, rerun or canon implementation is started. The [complete canon-quality review](../2026-10-11-canon-quality-review/review-report.md) remains a separate delivered review with proposed fixes and additions.

The final [documentation review](documentation-review.md) found and verified corrections for worker finding prerequisites, confirmation-rule ownership and one template heading. Its scoped structural checks pass. Live disclosure behavior and fresh-context repeat limitations remain separate evidence gaps.

The fresh second Author mapper retrieved all of canon-context.md during mapping, including conditional check/edit-hook content. Its caller links are section-specific, so this is observed agent over-reading, not proof of a missing route. The fresh Audit mapper followed bounded canon-context lines 5–42 and returned complete source projections; a mandatory memory search also returned one unrelated registry hit without loading that earlier work. Live adherence is not uniformly clean, and no blanket disclosure-performance pass is claimed. The bounded single-entry question walk reached AP-22 and its explicit AP-23 exception without a full audit or output truncation. [Coordinator observations](root-validation-notes.md) distinguish actual reads, byte reuse and command recovery.
