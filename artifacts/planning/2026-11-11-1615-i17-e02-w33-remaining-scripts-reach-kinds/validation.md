# W33 Validation

## Candidate

- Unit: I17:E02:W33, AC63.
- Task base: `390a76300` (origin/i17/e02/workspace after W34 #1686), merged with origin/workspace `bfb6e7ca9` (#1645) at `53d1396f0`.
- Task head: `44137801b5dfd111e29070508599a136625f2181`, branch `i17/e02/w33-remaining-scripts-reach-kinds`, current with the epic base.
- Component: the files [w33.md](w33.md) declares.

## Workspace Merge

#1645's five conflicts resolve keeping both sides:

| File | Resolution |
| --- | --- |
| deliver.py | #1645's `ordered_epics` and `priority.rank` beside E02's registry imports, board tags and sync identity. |
| delivery-plan.md | Dispatch Export follows Priority Sets; a kind unit uses its tag. |
| dispatch-batch.md | Preparations hold prepared task worktrees and captured declared-file context. |
| test_dispatch.py | The registry's Kinds class beside #1645's DispatchPriority and DispatchBlockers. |
| test/README.md | Both sides' rows, delivery-branches and priority included, at current counts. |

Board Queue's priority-set exclusion, which #1645 wrote as hot-fixes, names a [kind unit](https://github.com/m2ux/workflow-server/blob/i17/e02/workspace/skills/work-planner/artifacts/delivery-plan.md#kind-units). The suites passed on the merge commit before the separation edits: planner 1135 with one opt-in skip, shared 280, skill checker 0 findings.

## Separation

| File | Base | Head |
| --- | --- | --- |
| board-queue.py | `hotfixes` with `is_hotfix`, `board_status`, `delivering_pulls`, `OFF_BOARD` from hotfix; own `tags`, `PREFIX`, `PULL_HOME`; `key_of` from statuses | `kinded` places each registered kind's issue through `interface(kind).board_status`; `tags`, `PULL_REF` from board, `issue_key` from sync, `rank` from priority |
| progress.py | Hot-fix sections through `hotfix_tag`, `delivering_pulls`, `target`; `HOTFIX` title stripping; `F=Hot-fix` key literal; own `tags`; `key_of` | Kind sections through the interface; `format.untagged` strips a kind's tag; `key_lines` keys each registered kind by its `letter`; `tags` from board, `issue_key` from sync |
| statuses.py | `is_hotfix` jurisdiction; own `key_of` | `kind_of` jurisdiction; `issue_key` from sync |
| kinds.py | Kind interface without a tag letter | Kind interface adds `letter` |
| hotfix.py | `is_hotfix`, `hotfix_tag`, public patterns and `targets` | Public names are exactly the Kind interface |

## Searches

[w33-search.py](w33-search.py) ([w33-search.log](w33-search.log)):

- Kind search over board-queue.py, progress.py and statuses.py: 0 mentions at the head; 11 at the base.
- Import search: only kinds.py reaches the hot-fix module, by name through `import_module`.
- Duplicate search: `tags`, `issue_key`, `rank` and `untagged` each defined only in their home; the priority-label pattern only in priority.py. sync.py still compiles its own tag-prefix pattern beside board.py's; that is outside this change and is an arising issue.
- Hot-fix exports equal the Kind interface.

## Tests

- [kinds.log](kinds.log) (102 pass): the kind search and its recognition cases; stand-in kinds placed by board-queue, summarised and keyed by progress, and given the queue's In Review and Done by statuses, each through the registry; shared-rule identity for all three; every board-queue and progress hot-fix fixture keeping its outcome; hot-fix tests through the interface and its export check; #1645's dispatch priority and blocker tests; script reach counting the registry's import.
- [test_task_worktree](https://github.com/m2ux/workflow-server/blob/i17/e02/w33-remaining-scripts-reach-kinds/skills/work-planner/test/test_task_worktree.py) runs in the planner suite unchanged.

## Suites

At the head current with the epic base:

- Planner: 1147 tests, one opt-in live-link skip, including the document and model checks ([planner.log](planner.log)).
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 59 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test                                                 # skills/work-planner
python3 -m unittest -v test_kinds test_hotfix test_statuses.KindRegistry ...         # skills/work-planner/test
python3 -m unittest discover -s skills/test                                          # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner                      # checkout root
python3 w33-search.py <skill directory> <directory of the base files>                # planning folder
git diff --check origin/i17/e02/workspace                                            # checkout root
```
