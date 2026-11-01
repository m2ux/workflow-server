# Test evidence

Evaluated at `6e3f7bf2e` on `i11/e10/w27-joins-proposed-as-units`, `origin/i11/e10/workspace` at `50a6535db` merged in. Each suite runs from the worktree under `sbx`.

## T1

**Candidate units from shared components** (AC42, AC43, AC44). `test_deps.py::CandidateUnits` over a specimen epic carrying a same-component dependent pair (W01 → W02 on `a.py`), a same-component independent pair (W03, W04 on `b.py`) and a different-component independent pair (W05 on `c.py`, W06 on `d.py`). The section prints exactly the two candidates, the first naming the edge a join drops, and nothing for W05 and W06; a joined candidate and a delivered row leave it; a path through an outside row splits a candidate by rule; a joined pair needing each other through an outside row is a problem.

```text
CandidateUnits::test_rows_declaring_one_component_are_a_candidate_with_the_edge_to_drop PASSED
CandidateUnits::test_independent_rows_declaring_different_components_draw_no_finding PASSED
CandidateUnits::test_a_joined_candidate_leaves_the_section PASSED
CandidateUnits::test_a_delivered_row_joins_no_candidate PASSED
CandidateUnits::test_a_path_through_a_row_outside_splits_by_rule PASSED
CandidateUnits::test_a_joined_row_needing_another_through_a_row_outside_their_unit_is_a_problem PASSED
```

AC42 is a read of [Work Breakdown](https://github.com/m2ux/workflow-server/blob/i11/e10/w27-joins-proposed-as-units/skills/work-planner/artifacts/epic-issue-body.md#work-breakdown): a joined unit holds no Depends on between its members, and only a path between two members through a task outside the unit bars a join.

## T2

**One record line per split candidate, and the six-criterion bound** (AC45, AC46). `test_deps.py::UnitAccounting`: one line naming exactly a three-row candidate's rows empties the section; a line naming some of them, or rows besides, accounts for none; a seven-criterion candidate is split by rule; a six-criterion one stays open; a joined unit of seven criteria is a problem.

```text
UnitAccounting::test_one_line_naming_the_candidate_rows_accounts_for_it PASSED
UnitAccounting::test_a_line_naming_only_some_of_its_rows_accounts_for_none PASSED
UnitAccounting::test_a_line_naming_rows_besides_accounts_for_none PASSED
UnitAccounting::test_a_seven_criterion_candidate_is_split_by_rule PASSED
UnitAccounting::test_a_six_criterion_candidate_is_open PASSED
UnitAccounting::test_a_joined_unit_over_the_bound_is_a_problem PASSED
```

## T3

**A directory declared as a component** (AC47). `test_deps.py::DirectoryComponents`: a work item declaring `workspace:skills/scripts/` or `workspace:skills/**` is a problem and its row is named unchecked; a path naming a directory in the checkout is one, and a file path or a suffixless path naming no directory is not.

```text
DirectoryComponents::test_a_component_ending_in_a_slash_is_a_problem PASSED
DirectoryComponents::test_a_component_carrying_a_glob_is_a_problem PASSED
DirectoryComponents::test_a_component_naming_a_directory_in_the_checkout_is_a_problem PASSED
```

## T4

**E10 run.** The check over the live #1181 body and the work item every row links, with [joins.md](joins.md) as `R=`: no problem, exit 0. Its candidates match the units the E10 review chose, as [joins.md](joins.md) compares.

```text
--- problems
none

--- joins: candidate units, rows of one epic extending one component
E10:W01, E10:W04, E10:W05, E10:W06, E10:W07, E10:W08, E10:W15, E10:W17, E10:W19, E10:W20, E10:W21, E10:W29 extend workspace:skills/scripts/check_skill_files.py: split by rule, 16 criteria exceed the bound of 6
E10:W02, E10:W23, E10:W24 extend workspace:skills/work-planner/scripts/sync.py: split by rule, 7 criteria exceed the bound of 6
```

## T5

**Suites.** `python3 -m pytest skills/work-planner/test -q`: 660 passed, 1 skipped, 1822 subtests passed. `python3 -m pytest skills/test -q`: 114 passed. `check_skill_files.py skills/work-planner skills/workflow-canon`, the roots CI checks: 68 files, 0 findings.
