# F15 Test Results

Branch `skill/behaviour-only-checks` at fc4d2641b, cut from `workspace` at e6eb1af6d and merged with `workspace` at ad6d35fa6, which brings in F08 (#1706). Commits: bdb2f4523 removes the before-use and Fields-candidate checks, Policy Review and Boundary review, test_reading_routes and test_unit_dispatch (items 1, 2, 3's #1694 part and 4); 17d3d5720, 8d1f606d8, 62b770d8d, 65a27c6ee and ae9477228 reduce the architecture, Advance, review-scope, dependency-graph and Required Criteria tests (item 3); 24e59a727 drops test_hotfix_readiness's Deliver-sentence asserts; 91b298f65 reads a Component line as a comma-separated `branch:path` list (item 5); 456a8ee5c writes the hot-fix key into progress.py (item 6); 73f4e679b retires the kind-module import rule and ce46d2c40 its script-test copies (item 7); 6c1df8b40 drops test_shared's two AST scans (item 8); review fix b1fca1a3c reads each entry as one whitespace-free `branch:path`; merge 156998dc6 resolves hotfix.py's docstring and the test README counts; efd82c53e deletes test_hotfix_readiness and 9cae1adc2 drops test_deliver's shared-rule source scan; 4382c8b10 and fc4d2641b re-wrap lines at the modules' width.

## T1. Planner Suite

`cd skills/work-planner && scripts/sbx python3 -m unittest discover -s test` at fc4d2641b: 1177 tests, OK, 1 skipped. test_readme confirms every catalogue row, coverage row and count. Covers AC2, AC3, AC5, AC6, AC8, AC10.

## T2. Shared Suite and Skill-File Check

`cd skills && scripts/sbx python3 -m unittest discover -s test` at fc4d2641b: 295 tests, OK. `FieldsBoundary` still reports a numbered step, numbered heading and operation call under Fields as "executable step in Fields". `scripts/sbx python3 skills/scripts/check_skill_files.py skills/work-planner`: 65 files checked, 0 findings. Covers AC1, AC4, AC7.

## T3. Removed-Name Grep

`grep -rnE` over `skills/` for `before_use`, `read_span`, `behavior_clauses`, `fields_candidates`, `CANDIDATES`, `before-use cycle`, `Fields behavior candidate`, `kind module imported`, `kind_findings`, `names_path`, `ABBREVIATION`, `def letter`, `.letter(`, `Policy Review`, `Boundary review`, `matched-contexts`, `evidence-controls`, `boundary-review`, `test_reading_routes`, `test_architecture_diagrams`, `test_unit_dispatch`, `prerequisites-756aaf9`, `hotfix_readiness` and `defines_no_shared_rule`: 0 lines; `skills/test/fixtures` no longer exists. A grep of `skills/work-planner/test` for Deliver's Review a Hot-Fix and Merge sentences (`Continue to [Merge]`, `Apply [Review Hot-fix Before Merge]`): 0 lines. Covers AC1, AC3, AC4, AC5, AC6, AC7, AC9, AC10.

## T4. Whitespace

`git diff --check ad6d35fa6 fc4d2641b`: clean.
