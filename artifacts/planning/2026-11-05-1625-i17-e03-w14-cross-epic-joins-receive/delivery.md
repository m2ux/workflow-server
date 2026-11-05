# Delivery Evidence

## Checklist

- [x] Confirm the published W14 reservation and exact AC15.
- [x] Match AC15 to real CLI regression fixtures.
- [x] Implement and publish the isolated task branch.
- [x] Run focused dependency, complete planner, shared-checker and skill-file checks.
- [x] Incorporate the current epic base and verify the combined head.
- [ ] Publish the task PR, record its link and merge verified work. **In progress.**
- [ ] Record AC15/Done, update draft integration and verify board state.

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
