# W07 Delivery Evidence

Delivery head: `e9ffe48c24ced60fc8d338e714a903cd8cac5539` on `i11/e10/w07-every-repeated-heading-reported`, which carries `origin/i11/e10/workspace` at `c1ec3b7c4037378582f637e4915ef6c117997848`. Merging that base brought W16's `empty_sections` beside `duplicate_anchors`; both run from `check`, and every result below is from the delivery head.

Changed paths: `skills/scripts/check_skill_files.py`, `skills/test/test_check_skill_files.py`, `skills/guidelines.md`, `skills/workflow-canon/references/revise-mode.md`.

Every command ran from the unit worktree under the workspace sandbox.

## Repeated Headings

T1, AC13. `RepeatedHeadings` in `skills/test/test_check_skill_files.py`, each asserting the exact `duplicate anchor` findings, with file, line and detail:

- `test_a_repeat_nothing_cites_is_reported` — two `## Terms`, no link: `guide.md:7`, `terms, also at line 3`.
- `test_a_cited_repeat_is_reported` — the same file cited from `SKILL.md`: the same single finding.
- `test_titles_differing_only_in_what_the_anchor_drops_are_one_anchor` — `## Open Questions` and `### open questions?`: `open-questions, also at line 3`.
- `test_each_further_repeat_names_the_first` — three `## Problem`: lines 7 and 11, each naming line 3.
- `test_distinct_headings_are_not_repeats` — `Epic Problem` and `Task Problem`: none.
- `test_one_title_in_two_files_is_not_a_repeat` — `## Problem` in two files: none.
- `test_a_repeat_inside_a_fence_is_a_specimen` — a fenced `## Terms`: none.

`python3 -m pytest skills/test/test_check_skill_files.py -k RepeatedHeadings`: `7 passed`. The suite's former `test_a_repeated_anchor_nobody_cites_is_left_alone` asserted the cited-only rule and is removed with it.

Result: all passed.

## Shared Check Suite

T2. `python3 -m pytest skills/test -q`: `89 passed, 3 subtests passed`.

Result: passed.

## Work Planner Suite

T3. `python3 -m pytest skills/work-planner/test -q`, which imports the shared check: `636 passed, 1 skipped, 1137 subtests passed`.

Result: passed.

## Every Repository Skill

T4, AC13. `python3 skills/scripts/check_skill_files.py skills/gitnexus skills/server-in-the-loop skills/work-planner skills/workflow-canon`: `76 files checked, 0 findings`. No repository skill carries a repeated heading, so no heading needed renaming.

Result: passed.

## Plan Changes

None applied and none held. The unit created no task, epic or issue, folded no work and moved no row.
