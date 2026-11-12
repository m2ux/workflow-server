# F16 Test Results

Branch `skill/engineering-direct-push` at fb06a8d02, cut from `workspace` at 5721e4aad and slimmed to four files as the user asked: c69a51165 states the planning-records branch rule in rules.md; fb06a8d02 makes deliver.py's survey take no epic base for `engineering`, with its captures, and keeps a unit's branch beside its push in an epic with no base (review finding 1).

## T1. Planner Suite

`cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` at fb06a8d02: 1181 tests, OK, 1 skipped. test_deliver's captures run deliver.py on fixture epics, work items and pull requests:

- `test_a_unit_changing_only_engineering_pushes_it_with_no_branch`: a row declaring only `engineering:` files, in an epic of one base and of three, prints `record …, push engineering` with no branch, base or worktree. Covers AC1.
- `test_an_engineering_epic_base_is_neither_required_nor_taken`: with `--bases i07/e00/engineering,i07/e00/main,i07/e00/workflows` and `engineering` declared, a row on `main` and `engineering` takes base `i07/e00/main` and `push engineering`, no line names `i07/e00/engineering`, and nothing is undeclared. Covers AC2.
- `test_an_epic_changing_engineering_and_main_merges_into_main_alone`: an epic whose rows change `main` and `engineering` offers a merge into `i07/e00/main` alone; a task pull request into `i07/e00/engineering` is no merge, and the free `engineering` row pushes. Covers AC3.
- `test_a_unit_of_an_epic_with_no_base_keeps_its_branch_beside_the_push`: in an epic with no base, a row on `main` and `engineering`, and an unplanned row joined to an `engineering` row, each keep a branch and add `push engineering`; an `engineering`-only row pushes alone. Covers AC1.

test_readme confirms the recounted test_deliver (109).

## T2. Shared Suite and Skill-File Check

`cd skills && scripts/sbx python3 -m unittest discover -s test` at fb06a8d02: 295 tests, OK. `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings; the rule's link to configuration.md's Planning Records resolves. rules.json maps guidelines.md's labelled rules alone, so rules.md's rule takes no entry. Covers AC4.

## T3. One Home

A read of the diff finds the rule stated once, in rules.md's Planning-records branch bullet; deliver.py's docstring and constant cite it. Covers AC4.

## T4. Whitespace

`git diff --check 5721e4aad fb06a8d02`: clean.
