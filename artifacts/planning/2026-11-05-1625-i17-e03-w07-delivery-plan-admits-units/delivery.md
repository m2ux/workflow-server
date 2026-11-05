# Delivery Evidence

## Execution Checklist

- [x] Confirm live W07+W08 reservations and start the unit session.
- [x] Match AC2 and AC5 to artifact inspection and CLI fixtures.
- [ ] Implement and commit component groups. **In progress.**
- [ ] Verify focused cases, complete suites and skill files at the tested head.
- [ ] Publish task PR, record its links and merge verified work.
- [ ] Verify merged revision, criteria, Done cells and draft integration.
- [ ] Publish final evidence and change list.

## T1: Delivery Plan

AC2 is observed by reading the committed Delivery Plan artifact: request-lane admission, absent-lane admission, task-table source, unit-line lane and unchanged priority ordering.

## T2: Available Work

AC5 is observed by test_deliver.py fixtures executing the real survey over lanes 1 and 2 and unlaned rows, joined units and laned rows with no work-item link. Malformed and split units receive diagnostics; holds, blockers and merge evidence remain visible.

## T3: Combined Validation

Run the complete planner suite, shared checker suite and skill-file check. Record exact tested revision and pass/skip counts separately.
