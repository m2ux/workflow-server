# Delivery Evidence

Task branch `i11/e13/w02-the-format-check-reads` at `5f5e4bff7`, based on `i11/e13/workspace` at `ecee8631c`.

## Changed Paths

- `skills/work-planner/scripts/format.py`
- `skills/work-planner/test/test_format.py`
- `skills/work-planner/artifacts/epic-issue-body.md`

Each lies inside the work item's file-change declaration.

## Declaration at the Evaluated Commit

`test_format.py`'s `DeclarationAtRevision` cases, run against fixture git repositories with `python3 -m unittest discover -s test` from `skills/work-planner`:

| Case | Observes | Result |
| --- | --- | --- |
| `test_the_guide_names_the_declaration_and_its_fields` | The guide names `config/required-criteria.json` and its four fields, matching the reader's | Pass |
| `test_the_criteria_and_their_source_come_from_the_resolved_commit` | The criteria come from the commit; the source names the path, that commit and the shared git directory | Pass |
| `test_divergent_revisions_each_read_their_own_declaration` | Two branches declaring different criteria each read their own, whichever is checked out | Pass |
| `test_working_files_choose_nothing` | An uncommitted edit to the declaration is ignored | Pass |
| `test_the_same_revision_reads_alike_from_every_worktree` | The main and a linked worktree read identical criteria and source for one revision | Pass |
| `test_a_revision_resolving_to_no_commit_is_unevaluable` | An unknown revision is unevaluable, with no criteria | Pass |
| `test_a_project_declaring_none_is_unevaluable` | A commit without the file is unevaluable | Pass |
| `test_a_declaration_at_another_revision_supplies_nothing` | A file present at an earlier commit, or only in the working tree, supplies nothing at a commit without it | Pass |
| `test_an_empty_declaration_is_unevaluable` | An empty file, an empty array and a non-array are unevaluable | Pass |
| `test_an_unreadable_declaration_is_unevaluable` | A declaration that is not JSON is unevaluable | Pass |
| `test_an_entry_lacking_a_field_is_unevaluable` | An entry missing or emptying a field is unevaluable, naming the fields | Pass |

## Required Criteria Check

`RequiredReach` and `CheckFormat` cases:

| Case | Observes | Result |
| --- | --- | --- |
| `RequiredReach` (10 cases) | An epic reaching a declared branch through an epic base, initiative branch or the long-lived branch lacks the criterion until one of its criteria holds the phrase, in any case; an epic off the branch, or without pull requests, lacks nothing; another project's declared vocabulary is matched and the corpus audit's is not assumed; unevaluable criteria are reported and none is reported lacking | Pass |
| `test_the_run_names_its_source_and_the_lacking_criterion` | The command prints the source line and the lacking criterion, exit 1 | Pass |
| `test_a_missing_declaration_is_reported_unevaluable` | A declaration only in the working tree is reported unevaluable, with no lacking criterion, exit 1 | Pass |
| `test_project_and_revision_go_together` | `--project` without `--revision` is refused | Pass |

## Run on This Epic

`format.py` on epic #1373 with `--revision origin/i11/e13/workspace`, from the main checkout and from this task's worktree. Both print the same source, and the declaration is unevaluable at that commit, since this project's own declaration is W03's:

```text
#1373 epic (open): 0 fixed, 0 to apply, 1 to decide
  source: config/required-criteria.json at ecee8631cbae816dc0088305eff9b4ebaae8ef4e in /home/mike1/projects/dev/workflow-server/.git
  decide: required criteria unevaluable: no config/required-criteria.json at ecee8631cbae816dc0088305eff9b4ebaae8ef4e in /home/mike1/projects/dev/workflow-server/.git
```

## Suite

- `python3 -m unittest discover -s test`: 488 tests, OK.
- `python3 -m pytest skills/work-planner/test -q`: 489 passed, 1 collection error in `test_align.py::test_plan_agreement`. The error is present at the epic base before this change; [#1491](https://github.com/m2ux/workflow-server/issues/1491) carries it.
- `python3 skills/scripts/check_skill_files.py skills/work-planner`: 51 files checked, 0 findings.

## Limitations

The Corpus Audit section and this project's `config/required-criteria.json` remain for W03, so a run on this repository reports the criteria unevaluable until W03 lands.
