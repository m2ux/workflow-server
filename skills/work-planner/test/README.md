# Work Planner Test Suite

Work Planner plans work as GitHub issues and keeps that plan true until the work lands. It scopes a problem, turns an approved proposal into initiatives and epics, breaks epics into tasks, places items on theme boards, delivers rows as pull requests, and records what landed. Everything it knows between runs lives in issue bodies, board fields and pull request records.

## What Is Under Test

- **The scripts.**
  Twenty-three programs read those issue bodies, board items and pull request records, and report what a run should change. Most modules here hold one script to the rules its own docstring states.
- **The prose.**
  Modes, protocols and artifacts are instructions an agent follows. Five modules hold their shape instead of a script's behaviour: that every link resolves, that each operation names its inputs, that each command names the checkout it acts on, and that a plan is written where the plan says.
- **Neither against a live tracker.**
  Issue, board and pull request state arrives in shapes pinned in `fixtures.py`. A test writes those shapes to a temporary directory and runs a script over them.

Both kinds sit in one folder. The script tests import `fixtures.py` from beside them, and a single discovery command runs the lot; `scripts/` holds the programs the skill runs, not the checks on them.

## Why It Is Tested

- **A wrong reading becomes a wrong write.**
  A script reports what a mode should change, and the mode changes the tracker accordingly. A misread board item costs a misassigned issue, a wrong board field, or a branch cut from the wrong base on work already under way.
- **The instructions are the product.**
  Editing a mode or an artifact changes what every later session does. A link that no longer resolves, a step that stops naming its command, or an operation missing an input is a defect no compiler reports.
- **A session is expensive.**
  The suite runs with no network, so a change is checked before a session spends tokens acting on a real tracker.

## Catalogue

One row per module, split by what it tests. Scope names the scripts the module imports or runs, the description is the module's docstring, and the tests column is the count of `test_` methods.

### Script Tests

These modules exercise the programs in `../scripts`.

| Module | Scope | What it guards | Tests |
| --- | --- | --- | --- |
| `test_agent_review.py` | `agent_review.py` | Current integration review evidence gates board and user handoff | 16 |
| `test_align.py` | `align.py`, `sync.py` | Alignment repairs, unreadable evidence and reference visibility fixtures | 18 |
| `test_board.py` | `board.py`, `statuses.py` | The assignees `board.py` gives an issue for its Status, and an initiative's Status once its criteria are ticked | 60 |
| `test_board_queue.py` | `board-queue.py` | The queue `board-queue.py` sets on a theme board | 75 |
| `test_closure.py` | `closure.py` | The closure gate passes on the issue and its Development links, the evidence GitHub exposes | 13 |
| `test_closure_sweep.py` | `closure-sweep.py` | The closure sweep lists each closed issue its criteria or Development links do not support | 14 |
| `test_deliver.py` | `deliver.py` | The work `deliver.py` finds available on a theme board, and the rows it reserves and releases | 96 |
| `test_deps.py` | `deps.py` | `deps.py` checks the task graph and proposes the rows that can share a pull request | 74 |
| `test_development_link.py` | `development-link.py` | Development links added and removed by `development-link.py`, and read back from both ends | 9 |
| `test_dispatch.py` | `deliver.py`, `dispatch.py`, `lane.py` | Continuous dispatch from real delivery surveys and observed worker events | 19 |
| `test_format.py` | `format.py` | `format.py` on standalone issues | 109 |
| `test_hotfix.py` | `hotfix.py` | `hotfix.py`: a hot-fix's identity, target, board status, delivering pull requests and delivery unit state | 16 |
| `test_lane.py` | `lane.py` | Lane's raw-cell, assignment, consistency and admission contracts | 12 |
| `test_link_capture.py` | `development.py`, `linked-pull-requests.py`, `links-by-issue.py`, `links-by-pull-request.py`, `sync.py` | The Development relation read from each end by `links-by-pull-request.py` and `links-by-issue.py`, and the linked pull requests `linked-pull-requests.py` adds to a collection | 22 |
| `test_orphans.py` | `orphans.py` | `orphans.py` keeps a proposal out of the hoist candidates and out of the initiative list, and a declared throwaway out of both candidate groups | 3 |
| `test_progress.py` | `progress.py` | `progress.py`: one test per rule its docstring states | 76 |
| `test_renumber.py` | `renumber.py` | `renumber.py` rewrites an initiative's epic numbers, or one epic's task numbers, across issue bodies | 32 |
| `test_revision_check.py` | `revision-check.py` | An instrument runs at the commit a branch or tag resolves to, and the run leaves no checkout | 8 |
| `test_shared.py` | `board.py`, `format.py`, `statuses.py`, `sync.py` | The helpers `progress.py` shares with `board.py`, `sync.py` and `format.py` | 11 |
| `test_statuses.py` | `statuses.py` | The jurisdiction each mode's Status changes are held to, and the calls they render | 21 |
| `test_sync.py` | `format.py`, `sync.py` | Done on a Work Breakdown row, ticked when the row is complete | 185 |
| `test_templates.py` | `format.py` | Body artifacts are the format checker's sole template source | 4 |

Every script in `../scripts` appears in a Scope cell, and `sync.py` is the widest, reached by four modules.

### Prose Tests

These modules read the skill's own documents rather than a script.

| Module | Scope | What it guards | Tests |
| --- | --- | --- | --- |
| `test_checkouts.py` | `SKILL.md`, `modes/`, `protocols/` | Each command acting on its checkout is run in a named one | 7 |
| `test_documents.py` | `SKILL.md`, `modes/`, `protocols/`, `artifacts/`, `references/` | The installed prose API exposes complete inputs and directed reading paths | 11 |
| `test_modes.py` | `*/SKILL.md` | Mode summaries in each skill's `SKILL.md` | 4 |
| `test_plan_mode.py` | `modes/plan-mode.md`, `artifacts/planning-record.md` | Plan Mode keeps a plan in one home: its planning record on the engineering branch | 6 |
| `test_readme.py` | `test/README.md` | The test folder's README names every module and every script, and its rows match what the folder holds | 11 |
| `test_worktrees.py` | `artifacts/` | Every worktree the skill creates is placed by a field, and git places a relative path where the command runs | 2 |

`test_readme.py` checks this catalogue rather than an artifact, so it sits here by the same rule: it reaches no script.

`fixtures.py` holds no tests. It builds board items, issues and pull requests as the REST API returns them, and runs the scripts over them.

Scope states reach, not depth. A module that imports a script and tests one branch of it reads the same as one that tests every branch; the Tests column is the only signal of depth.

## Keeping It Current

- **Both tables are checked.**
  `test_readme.py` fails when a module has no row, when a row names something absent, and when a cell disagrees with the file it describes.
- **Every script has a module.**
  The check reads the Scope cells for the scripts folder, so a script no module reaches fails, and a Scope cell naming a script that no longer exists fails with it.
- **A table follows its scripts.**
  A module that gains or loses a script import must move to the matching table, since the check reads the row's table against what the module reaches.
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
