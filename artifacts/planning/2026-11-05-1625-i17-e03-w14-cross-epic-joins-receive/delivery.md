# Delivery Evidence

## Checklist

- [x] Confirm the published W14 reservation and exact AC15.
- [x] Match AC15 to real CLI regression fixtures.
- [x] Implement and publish the isolated task branch.
- [x] Run focused dependency, complete planner, shared-checker and skill-file checks.
- [x] Incorporate the current epic base and verify the combined head.
- [x] Publish the task PR, record its link and merge verified work.
- [x] Record AC15/Done, update draft integration and verify board state.

## T1: Bounded Join Diagnostics

Coverage: AC15. Initial tested task head: 74f65c6aecce21c3b89f2ccb5b052a4d005a9067.

The six JoinedEpicScope checks run the actual deps.py CLI over temporary epic files. The pinned reciprocal E05 W01/E06 W01 input exits 1, names both owning and joined rows, has empty stderr, and prints no epic-priority report. The same input with an initiative file also exits before whole-epic prerequisite derivation. A one-way cross-epic join reports its owner/target, and an unknown target retains its unknown-row finding.

Same-epic local and qualified reciprocal joins exit 0 and retain priority output. A same-epic split-lane fixture retains both its Lane and unknown-dependency findings. The complete dependency module suite passes all 78 tests, covering the existing lane, joins, component and dependency behaviors.

The guard is a row-scope validation before whole-epic analysis. It does not catch RecursionError or define cross-epic delivery semantics. Existing collected validation findings remain visible.

## T2: Complete Validation

At the initial tested task head, the full planner suite ran 888 tests: 887 passed and one opt-in live Development-link test skipped. The shared checker suite passed 208 tests. The Work Planner file check inspected 52 files with zero findings. git diff --check passed.

The task checkout alone was changed while another unit held shared publication. The already-published work item supplied the component and observing-test scope; its refinement and this evidence are published when the coordinator grants the shared turn.

## Combined Task Head

The current task head is a2169bc306fa55f7450aab555a6db515e6d8b190, incorporating merged Deliver-mode PR #1634 at 1eb5ea97dc29202cd3dd8d15e0c191363a7316f7. The incoming change touches only the Deliver-mode document. The dependency code and tests are identical to the complete-suite-tested W14 head.

At this combined head, 78 dependency tests, four mode-interface tests, 11 document tests and the 52-file skill check pass with zero findings. Those checks cover the changed dependency behavior and the incorporated document. The initial full planner/shared evidence remains applicable; no further source change or test failure calls for repeating those complete suites.

## Merge and Recording

Task PR #1635 merged into i17/e03/workspace at b5c0654013269a382883c4e41fe20937e20ed60b, with exact verified task head a2169bc306fa55f7450aab555a6db515e6d8b190. The merged tree equals the tested task tree. All six real-CLI JoinedEpicScope checks pass at the exact merged revision.

Fresh readiness confirmed the exact head/body, clean mergeability, no branch protection (HTTP 404), no active target rules, no reviews, no check runs and no commit status contexts. GitHub's aggregate pending label covers an empty status collection; there is no actual pending or required check on this epic base. The native permission reviewer allowed the SHA-pinned task merge, and its actual merged state/head/target were read back.

The tracker and canonical epic body record AC15 and W14 Done. W11, W12 and W13 retain their free work-item links and incomplete state. Draft integration #1627 now describes bounded join diagnostics and cites #1635 alongside the prior six task merges; its complete body was read back exactly. The exact Project 17 item remains In Progress, and the epic remains open for its remaining work. No task issue exists to close and this row-only task PR has no Development issue link.

The local epic-base checkout is clean and fast-forwarded to b5c0654013269a382883c4e41fe20937e20ed60b. No branch history was rewritten. The prior #1630 source remains subsumed by W14; this unit supplies its actual fix. Historical #1626 W01/AC1 evidence is preserved. No new plan changes, arising issues or validation debt remain.
