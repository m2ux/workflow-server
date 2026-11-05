# Work Planner Test Suite

Work Planner plans work as GitHub issues and keeps that plan true until the work lands. It scopes a problem, turns an approved proposal into initiatives and epics, breaks epics into tasks, places items on theme boards, delivers rows as pull requests, and records what landed. Everything it knows between runs lives in issue bodies, board fields and pull request records.

## What Is Under Test

- **The scripts.**
  Twenty-three programs read those issue bodies, board items and pull request records, and report what a run should change. Most modules here hold one script to the rules its own docstring states.
- **The prose.**
  Modes, protocols and artifacts are instructions an agent follows. Five modules hold their shape instead of a script's behaviour: that every link resolves, that each operation names its inputs, that each command names the checkout it acts on, and that a plan is written where the plan says.
- **Neither against a live tracker.**
  Issue, board and pull request state arrives in shapes pinned in `fixtures.py`. A test writes those shapes to a temporary directory and runs a script over them.

## Why It Is Tested

- **A wrong reading becomes a wrong write.**
  A script reports what a mode should change, and the mode changes the tracker accordingly. A misread board item costs a misassigned issue, a wrong board field, or a branch cut from the wrong base on work already under way.
- **The instructions are the product.**
  Editing a mode or an artifact changes what every later session does. A link that no longer resolves, a step that stops naming its command, or an operation missing an input is a defect no compiler reports.
- **A session is expensive.**
  The suite runs with no network, so a change is checked before a session spends tokens acting on a real tracker.

## Catalogue

One row per module. The description is the module's docstring, and the tests column is the count of `test_` methods.

| Module | What it guards | Scripts | Tests |
| --- | --- | --- | --- |
| `test_agent_review.py` | Current integration review evidence gates board and user handoff | `agent_review.py` | 16 |
| `test_align.py` | Alignment repairs, unreadable evidence and reference visibility fixtures | `align.py`, `sync.py` | 18 |
| `test_board.py` | The assignees `board.py` gives an issue for its Status, and an initiative's Status once its criteria are ticked | `board.py`, `statuses.py` | 60 |
| `test_board_queue.py` | The queue `board-queue.py` sets on a theme board | `board-queue.py` | 75 |
| `test_checkouts.py` | Each command acting on its checkout is run in a named one | — | 7 |
| `test_closure.py` | The closure gate passes on the issue and its Development links, the evidence GitHub exposes | `closure.py` | 13 |
| `test_closure_sweep.py` | The closure sweep lists each closed issue its criteria or Development links do not support | `closure-sweep.py` | 14 |
| `test_deliver.py` | The work `deliver.py` finds available on a theme board, and the rows it reserves and releases | `deliver.py` | 96 |
| `test_deps.py` | `deps.py` checks the task graph and proposes the rows that can share a pull request | `deps.py` | 74 |
| `test_development_link.py` | Development links added and removed by `development-link.py`, and read back from both ends | `development-link.py` | 9 |
| `test_dispatch.py` | Continuous dispatch from real delivery surveys and observed worker events | `deliver.py`, `dispatch.py`, `lane.py` | 19 |
| `test_documents.py` | The installed prose API exposes complete inputs and directed reading paths | — | 11 |
| `test_format.py` | `format.py` on standalone issues | `format.py` | 109 |
| `test_hotfix.py` | `hotfix.py`: a hot-fix's identity, target, board status, delivering pull requests and delivery unit state | `hotfix.py` | 16 |
| `test_lane.py` | Lane's raw-cell, assignment, consistency and admission contracts | `lane.py` | 12 |
| `test_link_capture.py` | The Development relation read from each end by `links-by-pull-request.py` and `links-by-issue.py`, and the linked pull requests `linked-pull-requests.py` adds to a collection | `development.py`, `linked-pull-requests.py`, `links-by-issue.py`, `links-by-pull-request.py`, `sync.py` | 22 |
| `test_modes.py` | Mode summaries in each skill's `SKILL.md` | — | 4 |
| `test_orphans.py` | `orphans.py` keeps a proposal out of the hoist candidates and out of the initiative list, and a declared throwaway out of both candidate groups | `orphans.py` | 3 |
| `test_plan_mode.py` | Plan Mode keeps a plan in one home: its planning record on the engineering branch | — | 6 |
| `test_progress.py` | `progress.py`: one test per rule its docstring states | `progress.py` | 76 |
| `test_readme.py` | The test folder's README names every module and every script, and its rows match what the folder holds | — | 11 |
| `test_renumber.py` | `renumber.py` rewrites an initiative's epic numbers, or one epic's task numbers, across issue bodies | `renumber.py` | 32 |
| `test_revision_check.py` | An instrument runs at the commit a branch or tag resolves to, and the run leaves no checkout | `revision-check.py` | 8 |
| `test_shared.py` | The helpers `progress.py` shares with `board.py`, `sync.py` and `format.py` | `board.py`, `format.py`, `statuses.py`, `sync.py` | 11 |
| `test_statuses.py` | The jurisdiction each mode's Status changes are held to, and the calls they render | `statuses.py` | 21 |
| `test_sync.py` | Done on a Work Breakdown row, ticked when the row is complete | `format.py`, `sync.py` | 185 |
| `test_templates.py` | Body artifacts are the format checker's sole template source | `format.py` | 4 |
| `test_worktrees.py` | Every worktree the skill creates is placed by a field, and git places a relative path where the command runs | — | 2 |

`fixtures.py` holds no tests. It builds board items, issues and pull requests as the REST API returns them, and runs the scripts over them.

## Coverage

One row per script in `../scripts`.

| Script | Exercised by |
| --- | --- |
| `agent_review.py` | `test_agent_review.py` |
| `align.py` | `test_align.py` |
| `board.py` | `test_board.py`, `test_shared.py` |
| `board-queue.py` | `test_board_queue.py` |
| `closure.py` | `test_closure.py` |
| `closure-sweep.py` | `test_closure_sweep.py` |
| `deliver.py` | `test_deliver.py`, `test_dispatch.py` |
| `deps.py` | `test_deps.py` |
| `development.py` | `test_link_capture.py` |
| `development-link.py` | `test_development_link.py` |
| `dispatch.py` | `test_dispatch.py` |
| `format.py` | `test_format.py`, `test_shared.py`, `test_sync.py`, `test_templates.py` |
| `hotfix.py` | `test_hotfix.py` |
| `lane.py` | `test_dispatch.py`, `test_lane.py` |
| `linked-pull-requests.py` | `test_link_capture.py` |
| `links-by-issue.py` | `test_link_capture.py` |
| `links-by-pull-request.py` | `test_link_capture.py` |
| `orphans.py` | `test_orphans.py` |
| `progress.py` | `test_progress.py` |
| `renumber.py` | `test_renumber.py` |
| `revision-check.py` | `test_revision_check.py` |
| `statuses.py` | `test_board.py`, `test_shared.py`, `test_statuses.py` |
| `sync.py` | `test_align.py`, `test_link_capture.py`, `test_shared.py`, `test_sync.py` |

This table states reach, not depth. A module that imports a script and tests one branch of it reads the same as one that tests every branch; the Tests column is the only signal of depth.

## Keeping It Current

- **Both tables are checked.**
  `test_readme.py` fails when a module or script has no row, when a row names something absent, and when a cell disagrees with the file it describes.
- **A script reached through another still has a row.**
  Where no module imports a script directly, the module that imports the script reaching it holds the row, so a shared reader stays covered through its callers.
- **Fix the row the check names.**
  The check reports the row and the file to add or remove. A description is read from its module's docstring, so correcting the prose there keeps the two one statement.

## Running the Suite

Run every module from the skill directory:

```bash
cd "<workspace>/skills/work-planner" && "<workspace>/scripts/sbx" python3 -m unittest discover -s test
```

Run one module by name:

```bash
cd "<workspace>/skills/work-planner" && "<workspace>/scripts/sbx" python3 -m unittest -v test.test.format
```

A module that reaches `gh` runs outside the sandbox. No module docstring repeats these commands; this section is their only home.
