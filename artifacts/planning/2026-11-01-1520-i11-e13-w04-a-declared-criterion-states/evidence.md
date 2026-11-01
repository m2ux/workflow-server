# Delivery Evidence

Task branch `i11/e13/w04-a-declared-criterion-states` at `ae65460cd`, based on `i11/e13/workspace` at `67eb02353`.

## Changed Paths

- `config/required-criteria.json`
- `skills/work-planner/scripts/format.py`
- `skills/work-planner/artifacts/epic-issue-body.md`
- `skills/work-planner/artifacts/initiative-issue-body.md`
- `skills/work-planner/modes/deliver-mode.md`
- `skills/work-planner/test/test_format.py`

## Path Fixtures

`test_format.py`'s `RequiredPaths` reviews an epic whose pull request #950 reaches `workflows`, against the guide example's declaration (`paths: ["corpus"]`).

| Fixture | Changed files | Result |
| --- | --- | --- |
| `test_a_change_touching_no_declared_path_is_held_to_nothing` | `config/branches` | No criterion lacking, nothing unevaluable |
| `test_a_change_touching_one_declared_path_is_held_to_its_criterion` | `config/branches`, `corpus/meta/workflow.toon` | Lacking the canon-audit criterion |
| `test_a_declared_path_names_itself_and_what_lies_under_it` | one file each | A file equal to or under a declared path holds the epic; `corpus/metadata.toon` beside `corpus/meta/` does not |
| `test_a_change_to_a_declared_path_on_another_branch_is_held_to_nothing` | `corpus/meta/workflow.toon` into `main` | Nothing |
| `test_a_pull_request_without_its_changed_files_is_unevaluable` | not supplied | `required criteria unevaluable: no changed files for #950, reaching workflows`, nothing lacking |
| `test_a_known_change_to_a_declared_path_holds_the_epic_beside_an_unknown_one` | #950 not supplied, #951 `corpus/…` | Lacking, named for #951 |
| `test_an_epic_carrying_the_criterion_needs_no_changed_files` | not supplied | Nothing |

All pass.

## Declaration Fields

`DeclarationAtRevision.test_an_entry_lacking_a_field_is_unevaluable` reports `lacks paths, phrase, row`, and `test_paths_other_than_a_list_of_paths_are_unevaluable` reports `lacks paths` for `"corpus"`, `[]`, `[""]` and `["corpus", 3]`. `test_the_guide_names_the_declaration_and_its_fields` confirms the guide's table lists `branch`, `paths`, `criterion`, `phrase`, `row`, the fields `format.py` validates. All pass.

## Check Format

`CheckFormat` runs `format.py` as a command with `--files 950=<changed-950.txt>`:

- `test_the_run_names_its_source_and_the_lacking_criterion`: a change to `corpus/meta/workflow.toon` reports the lacking criterion and its source.
- `test_changed_files_touching_no_declared_path_bring_nothing`: `config/branches` alone reports neither a lacking criterion nor an unevaluable one.
- `test_files_name_their_pull_request`: `--files` without `NUMBER=` exits non-zero with `expected NUMBER=FILE`.

All pass.

## Live Check of I11:E09

`format.py` from this branch on epic [#1176](https://github.com/m2ux/workflow-server/issues/1176), with the 59 `[I11` pull requests as `--prs`, and the changed files of #1495 and #1497, the two reaching `workflows`, read with Fetch Pull Request Files. Each changes only `config/branches`.

With `--files 1495=… --files 1497=… --project /home/mike1/projects/dev/workflow-server --revision a5a65f3aa`:

```text
#1176 epic (open): 0 fixed, 0 to apply, 1 to decide
  source: config/required-criteria.json at a5a65f3aa8946b9904f7be399a91ebb337ea19d9 in /home/mike1/projects/dev/workflow-server/.git
  decide: AC labels partly missing or out of sequence
```

No canon-audit finding. The remaining finding concerns the E09 body's labels, which concurrent E09 sessions are editing, and is not a required-criteria finding.

Without `--files`:

```text
  decide: required criteria unevaluable: no changed files for #1497, #1495, reaching workflows
```

At the epic base `67eb02353`, whose declaration has no `paths`:

```text
  decide: required criteria unevaluable: an entry in config/required-criteria.json at 67eb02353… lacks paths
```

## Outstanding Defined

A read of `config/required-criteria.json` at `a5a65f3aa`:

```json
"criterion": "The definitions this epic changes carry no outstanding confirmed finding, one neither fixed on the epic's branch nor taken by an issue, as the canon audit's coverage report shows."
```

The criterion states that a finding is outstanding while it is neither fixed on the epic's branch nor taken by an issue. The guide's Required Criteria example carries the same entry.

## Suite

- `python3 -m unittest discover -s skills/work-planner/test`: 499 tests, OK.
- `python3 -m pytest skills/work-planner/test -q`: 500 passed, 1 error. The error is `test_align.py::test_plan_agreement`, a helper whose name pytest collects as a test and whose arguments it reads as missing fixtures. It errors identically on the epic base.
- `skills/scripts/check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
