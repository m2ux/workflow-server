# Delivery Evidence

Task branch `i11/e13/w03-the-corpus-audit-moves` at `89fb2f048`, based on `i11/e13/workspace` at `13b2ce67b`.

Merged into `i11/e13/workspace` by [#1519](https://github.com/m2ux/workflow-server/pull/1519) as `48ac26494`.

## Changed Paths

- `config/required-criteria.json`
- `skills/work-planner/artifacts/epic-issue-body.md`
- `skills/work-planner/artifacts/initiative-issue-body.md`
- `skills/work-planner/modes/deliver-mode.md`
- `skills/work-planner/test/test_format.py`

Each lies inside the work item's file-change declaration.

## Guide Vocabulary

`test_format.py`'s `ProjectVocabulary.test_a_projects_required_criterion_stands_only_in_the_guide_example` reads every `.md`, `.py` and `.json` file of the skill outside `test/`, removes the Required Criteria Example's JSON block, and finds neither the declared phrase nor the declared row anywhere.

| Revision | Result |
| --- | --- |
| This branch's guide and callers | Pass |
| The epic base's guide and callers, with this branch's test | Fail: `epic-issue-body.md` names `canon audit` and `Canon audit of the changed definitions` in its Corpus Audit section |

A grep of `skills/work-planner` and `skills/scripts` for `corpus`, `canon audit`, `audit row`, `workflow definitions` and `epic's last`, outside `test/`, finds only the Required Criteria Example.

## Same Requirement over This Repository

`format.py` on epic [#1176](https://github.com/m2ux/workflow-server/issues/1176) (I11:E09), whose pull requests #1495 and #1497 reach `workflows`, with its 16 `[I11:E09]` pull requests as `--prs`.

Before W02, with the hard-coded match (`ecee8631c`, `--corpus workflows`):

```text
decide: its pull requests reach the corpus and no criterion is the corpus audit; add it with the task row that delivers it
```

This branch, with the declaration in place (`--project . --revision 89fb2f048`):

```text
source: config/required-criteria.json at 89fb2f04813f0b1263c83104055671f546454fff in /home/mike1/projects/dev/workflow-server/.git
decide: its pull requests reach workflows and no criterion carries "canon audit"; add "The definitions this epic changes carry no outstanding confirmed finding, as the canon audit's coverage report shows." with the task row "Canon audit of the changed definitions"
```

Epic [#1373](https://github.com/m2ux/workflow-server/issues/1373) (I11:E13), whose pull requests reach only `workspace`, reports no required-criteria finding at `89fb2f048`.

## None for a Project Declaring Nothing

The same run on #1176 at the epic base `13b2ce67b`, which carries no declaration:

```text
source: config/required-criteria.json at 13b2ce67bd08e7e9e032caae26e000bbcd3d411c in /home/mike1/projects/dev/workflow-server/.git
decide: required criteria unevaluable: no config/required-criteria.json at 13b2ce67bd08e7e9e032caae26e000bbcd3d411c in /home/mike1/projects/dev/workflow-server/.git
```

No criterion is reported lacking. The fixture cases `test_unevaluable_criteria_are_reported_and_none_is_lacking`, `test_a_project_declaring_none_is_unevaluable` and `test_a_missing_declaration_is_reported_unevaluable` pass on this branch.

## Suite

- `python3 -m unittest discover -s test` from `skills/work-planner`: 489 tests, OK.
- `python3 -m pytest skills/work-planner/test -q`: 490 passed, 1 collection error in `test_align.py::test_plan_agreement`. The error is present at the epic base; [#1491](https://github.com/m2ux/workflow-server/issues/1491) carries it, delivered on `i11/e16/workspace` by #1509.
- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
