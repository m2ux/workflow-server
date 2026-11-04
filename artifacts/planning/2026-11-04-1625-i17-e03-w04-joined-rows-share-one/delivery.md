# Delivery Evidence

## Scope

W04, W05 and W06 are one joined unit on the task branch i17/e03/w04-joined-rows-share-one. Lane is a task-table cell; populated cells hold bare decimal indices, and empty cells are unlaned.

## Execution Checklist

- [x] Confirm all three live row reservations and the published work items.
- [x] Agree component ownership and the shared reader interface.
- [ ] Implement the artifact, shared reader and format integration. **In progress.**
- [ ] Verify criterion cases, table-operation preservation and complete suites.
- [ ] Publish the task PR and merge verified work into the epic base.
- [ ] Record delivery, update draft integration and confirm board state.

## T1: Joined-Lane Rule

Coverage: AC3. Inspect the committed Dependency Graph artifact for same-index or all-empty joins, refusal of split units, and both resolutions.

## T2: Dependency Lane Reader

Coverage: AC4. Run test_deps.py cases for valid, empty, malformed and split joined units, including task rows without a work-item link.

## T3: Format Cell Validation

Coverage: AC13. Run test_format.py cases for bare indices, empty values, code spans, links, labels and prose.

## T4: Table-Operation Preservation

Coverage: AC14. Run real normalization, reservation/release and delivery-recording paths over populated and empty Lane cells, checking values by task id and Done in the final column.

## T5: Combined Validation

Run the complete planner and affected shared-checker suites and the skill-file check from the task checkout. Record the tested commit and distinguish opt-in skips from passes.
