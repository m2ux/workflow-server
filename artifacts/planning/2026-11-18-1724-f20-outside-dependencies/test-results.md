# F20 Test Results

Branch `f20-outside-dependencies` at 22f1a1023, cut from `workspace` at a70671a73.

## T1. Board Reader Tests

`cd skills/work-planner && scripts/sbx python3 -m unittest test_board` at 22f1a1023: `IssueDependencies` passes, with a consumer in `o/r` given `o/r#9` closed and `o/skills#9` open.

- `test_a_link_to_another_repository_names_that_repository_s_issue`: `[#9](…/o/skills/issues/9)` reads `o/skills#9`, unmet, and nothing is unresolved. Covers AC1.
- `test_a_link_to_another_repository_names_its_issue_whatever_the_text`: `[#4](…/o/skills/issues/9)` reads `o/skills#9`. Covers AC1.
- `test_a_link_carrying_a_fragment_names_its_issue`: a link ending `#issuecomment-1` still reads `o/skills#9`.
- `test_an_unlinked_number_names_the_row_s_own_repository_s_issue`: `#9` reads `o/r#9`, met. Covers AC2.
- `test_a_number_and_link_naming_different_issues_of_the_repository_cannot_resolve`: `[#9](…/o/r/issues/4)` is unresolvable and reported as `cannot resolve #9: its link names #4`. Covers AC3.
- `test_a_number_whose_link_names_no_issue_cannot_resolve`: `[#9](…/o/skills/pull/9)` is unresolvable and reported.

## T2. Dependency Check Tests

`cd skills/work-planner && scripts/sbx python3 -m unittest test_deps` at 22f1a1023: `IssueEntries` passes.

- `test_a_number_its_link_carries_passes`: `#750`, `[#9](…/o/skills/issues/9)` and `[#750](…/o/r/issues/750)` exit 0.
- `test_a_task_row_number_its_link_does_not_carry_is_a_problem`: `[#750]` linking issue 751 of `o/r`, of `o/skills`, and with a fragment each exits 1 naming `E01:W01: #750 links issue 751`. Covers AC3.
- `test_a_number_linking_no_issue_is_a_problem`: `[#9](…/o/skills/pull/9)` exits 1 naming `E01:W01: #9 links no issue`.
- `test_an_initiative_number_its_link_does_not_carry_is_a_problem`: the same entry in an initiative row exits 1 naming `initiative E00`. Covers AC3.

## T3. Work Breakdown and Skill-File Check

Work Breakdown's Depends on bullet in `skills/work-planner/artifacts/epic-issue-body.md` states: a dependency on another repository's issue is a link to that issue (`[#9](…/issues/9)`), whose number is the linked issue's; an unlinked `#750` names an issue of the row's own repository. `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner` at 22f1a1023: 65 files checked, 0 findings. `git diff --check` clean. Covers AC4.

## T4. Planner and Shared Suites

At 22f1a1023: `cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` ran 1197 tests, OK, 1 skipped; `scripts/sbx python3 -m unittest discover -s skills/test` ran 319 tests, OK. test_readme confirms the recounted test_board (67) and test_deps (88).
