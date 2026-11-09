# W17 Validation

## Candidate

- Unit: I17:E02:W17, AC24.
- Task base: `a5435a843` (origin/i17/e02/workspace after W13 #1666).
- Task head: `792937fd5`, branch `i17/e02/w17-board-script-owns-title`.
- Owner: `skills/work-planner/scripts/board.py` — `tags` beside `PREFIX`, and `is_initiative` over it; completion through `sync.issue_done`, identity through `sync.issue_key`.
- Import graph: board imports sync; sync never imports board, so the graph stays acyclic.
- Consumers of `tags` (`board-queue.py`, `deliver.py`, `progress.py`) keep their copies until W24, W25 and W27 move them; `statuses.key_of` goes in W46.

## Observing Tests

[focused.log](focused.log): `test_shared` 17 pass, `test_board` 60 pass.

| Criterion part | Test |
| --- | --- |
| One tag parser: initiative, epic, task | `TitleTags.test_each_level_reads_its_numbers` |
| Hot-fix and plain titles carry no tag | `TitleTags.test_a_hotfix_or_plain_title_has_no_tags` |
| Initiative test over the parser | `TitleTags.test_only_an_initiative_tag_names_an_initiative` |
| board reaches sync's completion and identity, and holds no copy | `CompletionAndIdentity.test_board_reaches_the_single_implementations_in_sync` |
| Completion | `CompletionAndIdentity.test_only_closed_as_completed_is_done` |
| Identity | `CompletionAndIdentity.test_identity_is_repository_and_number` |

## Duplicate-Function Search

[duplicate-search.log](duplicate-search.log): board.py defines `tags` once and neither `completed` nor `key_of`; `issue_done` and `issue_key` are defined only in sync.py. The remaining `tags` copies are the consumer rows named above.

## Full Checks

- Planner: 1045 tests, one opt-in live-link skip, [planner.log](planner.log).
- Shared: 280 pass, [shared.log](shared.log).
- Skill checker: 59 files, zero findings, [skill-check.log](skill-check.log).
- Whitespace: zero findings, [whitespace.log](whitespace.log).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest discover -s test -p test_shared.py -v         # skills/work-planner
python3 -m unittest discover -s test -p test_board.py -v          # skills/work-planner
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace HEAD                    # checkout root
```
