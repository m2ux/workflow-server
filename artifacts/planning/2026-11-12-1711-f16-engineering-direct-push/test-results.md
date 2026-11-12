# F16 Test Results

Branch `skill/engineering-direct-push` at 3ddedb1f1, cut from `workspace` at 5721e4aad. Commits: df114cfd1 makes deliver.py's survey take no epic base for `engineering` and adds its captures; 3ddedb1f1 states the direct-push rule at Planning Records and links it from the pages that push to `engineering`.

## T1. Planner Suite

`cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` at 3ddedb1f1: 1180 tests, OK, 1 skipped. test_deliver's captures run deliver.py on fixture epics, work items and pull requests:

- `test_a_unit_changing_only_engineering_pushes_it_with_no_branch`: a row declaring only `engineering:` files, in an epic of one base and of three, prints `record …, push engineering` with no branch, base or worktree. Covers AC1.
- `test_an_engineering_epic_base_is_neither_required_nor_taken`: with `--bases i07/e00/engineering,i07/e00/main,i07/e00/workflows` and `engineering` declared, a row on `main` and `engineering` takes base `i07/e00/main` and `push engineering`, and no line names `i07/e00/engineering`; a row on `engineering` alone is not undeclared. Covers AC2.
- `test_an_epic_changing_engineering_and_main_merges_into_main_alone`: an epic whose rows change `main` and `engineering` offers a merge into `i07/e00/main` alone; a task pull request into `i07/e00/engineering` is no merge, and the free `engineering` row pushes. Covers AC3.

test_readme confirms the recounted test_deliver (108).

## T2. Shared Suite and Skill-File Check

`cd skills && scripts/sbx python3 -m unittest discover -s test` at 3ddedb1f1: 295 tests, OK. `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings, so every link to [Planning Records](https://github.com/m2ux/workflow-server/blob/skill/engineering-direct-push/skills/work-planner/configuration.md#planning-records) from Publish Planning Record, Prepare Delivery Bases, Epic Bases, Changed Branches, Task Branches, Delivery Plan, Task Delivery, Task Merge and Deliver resolves. Covers AC4.

## T3. One Home

`grep -rn "Planning records go straight" skills/`: 0 lines; Commit Planning Record's restatement of the rule is gone. A read of the diff finds the rule stated only at Planning Records; every other page links it. Covers AC4.

## T4. Whitespace

`git diff --check 5721e4aad 3ddedb1f1`: clean.
