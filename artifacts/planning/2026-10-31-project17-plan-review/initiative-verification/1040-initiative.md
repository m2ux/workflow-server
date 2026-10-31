## Overview

A work-package run spends only what its change needs and carries every value it passes to where it is read: each review leaves one terse report, the full prism pipeline runs only where it is chosen, assumptions converge only where they are settled, independent work runs side by side, and implementation is checked against tests written from the plan before the code. An implement run, a review run, and a remediate run are each startable, a worker on one is sent no step of another, and the combined workflow stays startable. The goal the reviews test against is those outcomes, each held by a canon audit and a sidecar specimen walk of the activities it changes.

## Problem

The work-package workflow spends effort its change does not need, and loses values it passes between steps.

- **Reports are long and repeated.**
  Each code, test-suite and strategic review wrote a findings report and a method record beside it, and report templates quoted code inline and listed sources in trailing tables.
- **The full prism pipeline was imposed.**
  A complex change took the full pipeline in every implementation run, with no recommendation and no way to choose the inline pass.
- **Assumptions converged everywhere.**
  Seven activities each ran the convergence loop over the same log, and four of them recorded an empty outcome straight after collecting.
- **Routine values went astray.**
  A routine renames its internals only where a step spells them, so values handed between the steps of the assumption routines, and the session and planning folder meta's activity loop is given, reached the wrong variable.
- **Independent work ran in series.**
  Code review, structural analysis and test-suite review run one after another inside post-implementation review, and research runs before implementation analysis though neither reads the other.
- **Tests restate the code they test.**
  The agent that writes the implementation writes its tests, so a test tends to confirm what the code does rather than what the plan asked for.
- **One workflow holds three modes.**
  [`is_review_mode`](https://github.com/m2ux/workflow-server/blob/bb38d574eae1d8bf8af0bd40128fd9b872428543/corpus/work-package/workflow.yaml#L19) and [`stealth_mode`](https://github.com/m2ux/workflow-server/blob/bb38d574eae1d8bf8af0bd40128fd9b872428543/corpus/work-package/workflow.yaml#L106) select review and remediate inside the workflow a worker is sent.

## Proposal

- **Lean reviews.**
  One report per review, code named in words and links in prose, agent records as JSON, and a decision that puts an assessed prism recommendation to the user.
- **Assumption settling.**
  Collect assumptions wherever they surface, converge them only where they are settled, and settle them through one routine.
- **Routine bindings.**
  Every routine name reaches the variable its site binds, held by the routine splice and the routines guard.
- **Parallel reviews.**
  Run the independent reviews, and research beside implementation analysis, as branches of one fan.
- **Contract-first tests.**
  State each task's contract in the plan, write its tests from the contract alone, and run them against the implementation at the join.
- **Tip validation.**
  Re-run every criterion's named instrument on the initiative tips and record the results in one ledger before those tips merge.
- **Separate mode runs.**
  Implement, review, and remediate are each a workflow an operator can start.
- **A worker sees one mode.**
  A worker on one run is sent no step of another mode.
- **The combined run stays.**
  The combined workflow remains a workflow an operator can start.
- **One library home.**
  Shared routines, techniques, and resources live in one library the modes name.

## Work Breakdown

| Epic | Description | Coverage | Depends on | Done |
| --- | --- | --- | --- | --- |
| [E00](https://github.com/m2ux/workflow-server/issues/1041) | Lean Reviews | AC1, AC2, AC3, AC4, AC13, AC14 | | ✓ |
| [E01](https://github.com/m2ux/workflow-server/issues/1042) | Assumption Settling | AC5, AC6, AC13, AC14 | | ✓ |
| [E02](https://github.com/m2ux/workflow-server/issues/1043) | Routine Bindings | AC7, AC13, AC14 | [E01](https://github.com/m2ux/workflow-server/issues/1042) | ✓ |
| [E03](https://github.com/m2ux/workflow-server/issues/1044) | Parallel Reviews | AC8, AC9, AC13, AC14 | [E00](https://github.com/m2ux/workflow-server/issues/1041), [E01](https://github.com/m2ux/workflow-server/issues/1042) | ✓ |
| [E04](https://github.com/m2ux/workflow-server/issues/1045) | Contract-First Tests | AC10, AC11, AC12, AC13, AC14 | [E01](https://github.com/m2ux/workflow-server/issues/1042) | ✓ |
| [E05](https://github.com/m2ux/workflow-server/issues/1099) | Tip Validation | AC15 | [E00](https://github.com/m2ux/workflow-server/issues/1041), [E01](https://github.com/m2ux/workflow-server/issues/1042), [E02](https://github.com/m2ux/workflow-server/issues/1043), [E03](https://github.com/m2ux/workflow-server/issues/1044), [E04](https://github.com/m2ux/workflow-server/issues/1045) | ✓ |
| [E06](https://github.com/m2ux/workflow-server/issues/1126) | Work Package Modes | AC16, AC17, AC18, AC19, AC20, AC21, AC22 | [E05](https://github.com/m2ux/workflow-server/issues/1099) | |

## Acceptance Criteria

- [x] **AC1.** Each work-package review writes one report, as the work-package snapshot walk's artifact list shows.
- [x] **AC2.** Every work-package report guide names code in words and places links in prose, as a canon audit of the guides confirms.
- [x] **AC3.** An implementation run of a complex change takes the full prism pipeline only after the user accepts an assessed recommendation, as the prism-decision specimen walk shows.
- [x] **AC4.** A review run of a complex change takes the full prism pipeline with no gate raised, as the prism-decision specimen walk shows.
- [x] **AC5.** Assumptions converge only in the activities that settle them, as the work-package snapshot walk's executed steps show.
- [x] **AC6.** Every activity that settles assumptions settles them through one routine, as the repeated-run guard reports no repeated settling run.
- [x] **AC7.** Every routine name a body step reads or writes reaches the variable its reference site binds, as the routines guard reports against the corpus.
- [x] **AC8.** The automated post-implementation reviews run as branches of one fan, as the work-package snapshot walk shows.
- [x] **AC9.** Research and implementation analysis run as branches of one fan, as the work-package snapshot walk shows.
- [x] **AC10.** Each implementation task's contract tests are written from the plan before its implementation exists, as a contract-first specimen walk shows.
- [x] **AC11.** The implementation's join runs its contract tests against the implementation, as a contract-first specimen walk shows.
- [x] **AC12.** A failing contract test returns the task to its implementer, as a contract-first specimen walk shows.
- [x] **AC13.** Every change the initiative makes passes a canon audit with no open High finding, as each epic's audit record shows.
- [x] **AC14.** Every activity the initiative changes is walked by a sidecar specimen, as each epic's claim table records.
- [ ] **AC15.** Every criterion of this initiative passes the instrument it names, on the integration tips, as the validation ledger records.
- [ ] **AC16.** An operator can start an implement run, a review run, and a remediate run, as a specimen walk of each run shows.
- [ ] **AC17.** A worker on one of those runs is sent no step of another mode, as that walk's step manifest shows.
- [ ] **AC18.** The combined work-package workflow remains a workflow an operator can start, as its specimen walk shows.
- [ ] **AC19.** A remediate push reaches only a private remote, as the remediate specimen walk shows.
- [ ] **AC20.** That push waits for a confirmation that names the remote, as the remediate specimen walk shows.
- [ ] **AC21.** Shared routines, techniques, and templates resolve from `corpus/work-package`, as the corpus index reports.
- [ ] **AC22.** Each mode workflow declares only variables its activities read or write, as the mode-variable guard reports.

## Non-Goals

- Changing what a review checks, or the depth prism analyses to.
- Converging the validate, strategic-analysis or close-out work into fans.
- Porting reports written by earlier runs to the new shapes.
- This initiative does not change the engine that loads a workflow.
- This initiative does not remove the combined workflow.

## References

- **R1.** [Planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-09-29-work-package-streamline) — The scan, the decisions, and each delivery's claim table.
- **R2.** [Work Package Modes](https://github.com/m2ux/workflow-server/issues/1125) — the proposal whose goal the mode runs carry.
- **R3.** [Mode planning record](https://github.com/m2ux/workflow-server/tree/engineering/artifacts/planning/2026-10-04-1125-work-package-modes) — the layout, the mode graphs, and the grain rubric.
