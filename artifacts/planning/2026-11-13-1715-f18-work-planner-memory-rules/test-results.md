# F18 Test Results

Branch `skill/work-planner-memory-rules` at d26dc4c00, cut from `workspace` at c1c069b41.

## T1. Planner Suite

`cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` at d26dc4c00: 1185 tests, OK, 1 skipped.

- `test_merge_outcomes`: `test_epic_integration_hands_off_without_a_merge` shows Epic Integration names no merge operation and returns after its handoff. `test_an_epic_review_hands_off_before_any_mutation` shows Merge Delivery Pull Request returns `human-handoff` with no mutation. `test_no_command_merges_an_epic_review` shows Merge Pull Request is the only merge command. The route-fixture tests reject a removed guard, an injected merge call and a removed return. Covers AC1.
- `test_deliver`: `test_a_ready_epic_review_pull_request_is_never_merged` shows a ready review pull request from `i07/e00/main` into `main` with a passed plan yields `merge: 0`. Covers AC2.
- `test_agent_review` and `test_review_scope`: an open finding is refused at either severity, a deferred disposition is invalid, and a fixed finding needs linked evidence. Covers AC3.

test_readme confirms the recounted test_deliver (111), test_merge_outcomes (15), test_agent_review (22) and test_hotfix (24).

## T2. Shared Suite and Skill-File Check

`cd skills && scripts/sbx python3 -m unittest discover -s test` at 02cc78cb0: 295 tests, OK. `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner` at d26dc4c00: 65 files checked, 0 findings. Covers AC5.

## T3. Read of the Proposals Board Command

Find Proposals Board selects `.title == "Proposals" or (.title | startswith("Proposals: "))` among open boards. A board titled `Proposals: Incoming Feature and Project Funnel` and a bare `Proposals` both match, and `Proposals Template` does not. Covers AC4.

## T4. Whitespace

`git diff --check c1c069b41 d26dc4c00`: clean.

## Re-Check at 31ad62178

- **Planner suite at 9846016ec:** 1185 tests, OK, 1 skipped. `test_merge_outcomes` at 31ad62178: OK. test_readme confirms test_deliver (110) and test_merge_outcomes (16).
- **Shared suite:** 295 tests, OK.
- **check_skill_files.py skills/work-planner at 31ad62178:** 65 files, 0 findings.
- **`git diff --check`:** clean.
