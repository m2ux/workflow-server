# W34 Test Evidence

Head `399c3dbed` on `i11/e10/w34-the-skill-check-decides-every`, base `ba685e7ed`.

## T1

`ReviewedCheckCases` run against the checker at `ba685e7ed`, the new test file beside it:

```text
sbx python3 -m pytest test -q -k ReviewedCheckCases
FAILED ReviewedCheckCases::test_a_bulleted_rest_gap_is_accepted
FAILED ReviewedCheckCases::test_a_classic_project_field_by_number_is_reported
FAILED ReviewedCheckCases::test_a_classic_project_route_is_reported
FAILED ReviewedCheckCases::test_a_classic_project_the_user_creates_is_reported
FAILED ReviewedCheckCases::test_a_classic_route_under_a_placeholder_is_reported
FAILED ReviewedCheckCases::test_a_function_named_projects_is_no_interface
FAILED ReviewedCheckCases::test_an_unbolded_mode_bullet_is_checked_for_its_trigger
FAILED ReviewedCheckCases::test_prose_naming_projects_is_no_interface
8 failed, 9 passed, 186 deselected, 2 subtests passed
```

Findings 1 (classic routes and field), 2 (prose and a function), 3 (bulleted gap) and 4 (unbolded mode) each fail before the fix. At the head all 17 pass.

## T2

The remaining cases observe branches that were already correct but untested (finding 5, and the untested parts of findings 1 and 3). Each is shown by a mutant of the head checker that its test kills:

```text
drop column route: test_a_classic_column_route_is_reported: KILLED
gap anywhere in file: test_a_gap_stated_by_another_specification_does_not_cover_it: KILLED
graphql in prose: test_graphql_named_in_prose_needs_no_gap: KILLED
mode join by space: test_a_multi_word_mode_is_carried_by_its_words_in_order: KILLED
mode join by anything: test_a_multi_word_mode_is_carried_by_its_words_in_order: KILLED
wraps heading exclusion: test_a_heading_followed_by_its_paragraph_is_not_wrapped: KILLED
fence language case: test_a_fence_language_is_read_whatever_its_case: KILLED
entry Commands allowed: test_an_entry_point_commands_section_is_outside_the_set: KILLED
mood key drops parent: test_siblings_under_different_parents_are_not_compared: KILLED
```

The mood test that compared sections at different levels is named for that: `test_sections_of_different_kinds_or_levels_are_not_compared`.

## T3

At the head, with `origin/i11/e10/workspace` unchanged at `ba685e7ed`:

```text
sbx python3 -m pytest skills/test -q                 203 passed, 9 subtests passed
sbx python3 -m pytest skills/work-planner/test -q    720 passed, 1 skipped, 1835 subtests passed
sbx python3 -m pytest skills/workflow-canon/test -q  39 passed, 38 skipped, 21 subtests passed
sbx python3 skills/scripts/check_skill_files.py skills   82 files checked, 0 findings
```
