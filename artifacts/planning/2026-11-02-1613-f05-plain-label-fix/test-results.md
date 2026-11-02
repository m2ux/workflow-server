# F05 Test Results

> Tested revision: c8ef9a8f2c2cb6208a3fdb1c2c62e5511b0c21fe on f05-plain-label-fix

## T1 Plain Criterion Labels Made Bold

Run from skills/work-planner: `python3 -m unittest discover -s test -p test_format.py`

- `PlainLabels.test_plain_criterion_labels_are_made_bold`: `AC1.`, `AC2.`, `AC4.` in plain text become `**AC1.**`, `**AC2.**`, `**AC4.**` with no repeated label, reported as `3 plain AC labels made bold`, with nothing to decide.
- The case fails on the base revision, where the fixer prepends a second label.
- Result: AC1 holds.

## T2 Plain Reference Labels Made Bold

Same run.

- `PlainLabels.test_plain_reference_labels_are_made_bold`: `R1.`, `R2.` in plain text become `**R1.**`, `**R2.**` with no repeated label, and nothing to decide.
- The case fails on the base revision.
- Result: AC2 holds.

## T3 Plain Labels Out of Sequence Left to Decide

Same run.

- `PlainLabels.test_plain_criterion_labels_partly_missing_are_left_to_decide`, `test_plain_criterion_labels_out_of_sequence_are_left_to_decide` and `test_plain_reference_labels_with_a_gap_are_left_to_decide`: each reports `AC labels partly missing or out of sequence` or `R labels partly missing or out of sequence`, and the items stand unchanged in the fixed body.
- Each case fails on the base revision.
- Result: AC3 holds.

## T4 Skill Test Suite

Run from skills/work-planner: `python3 -m unittest discover -s test`

- Result: 836 tests, OK (1 skipped).

## T5 Skill-File Check

Run in the worktree: `python3 skills/scripts/check_skill_files.py skills/work-planner`

- Result: 52 files checked, 0 findings.
