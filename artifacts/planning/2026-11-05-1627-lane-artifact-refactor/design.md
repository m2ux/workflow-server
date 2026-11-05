# Lane Ownership Design

## Subject

The Lane artifact owns the opaque board-wide decimal index, row assignments, empty/unlaned meaning, raw-cell validation, unit consistency and requested-lane admission. The epic body owns the table shape and the Lane column's position after Joins and before Done.

## Interfaces

- `artifacts/lane.md` defines Read Task Lanes, Assign Task Lanes, Check Unit Lanes and Determine Lane Admission, each with a concrete implementation command and inputs/results.
- `scripts/lane.py` owns the corresponding pure operations and CLI. It depends on standard-library value/collection support, with no import from dependency analysis, delivery or queue modules.
- `deps.py` reads/checks lane assignments through the lane module. Its graph, component and priority behavior remains its own responsibility.
- `format.py`, `deliver.py` and `board-queue.py` use the same lane operations, including unit consistency and labels. Requested lane validation also uses that owner.
- Epic population delegates confirmed lane assignment to the Lane artifact. Plan and Deliver route through the new owner; queue and dependency artifacts reference it without repeating its invariants.
- The existing artifact-ownership guideline explicitly includes state, invariants, operations and their subject implementation module.

## Verification

Preserve existing behavioral tests and add direct lane-operation/CLI tests, including assignment and errors. Exercise dependency, format, delivery and board consumers. Run the full planner and shared suites, skill-file checks, section-move accounting and fresh-context disclosure walks. Review the complete diff from the current workspace target for all five SOLID principles and guideline compliance; fix findings on this integration branch. Renew exact-head architecture/review evidence and return the same PR to ready/In Review only with current passing evidence.
