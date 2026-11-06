# Work Planner Test Suite

Work Planner plans work as GitHub issues and keeps that plan true until the work lands. It scopes a problem, turns an approved proposal into initiatives and epics, breaks epics into tasks, places items on theme boards, delivers rows as pull requests, and records what landed. Everything it knows between runs lives in issue bodies, board fields and pull request records.

## What Is Under Test

- **The scripts.**
  Twenty-three programs read those issue bodies, board items and pull request records, and report what a run should change. Most modules here hold one script to the rules its own docstring states.
- **The prose.**
  Modes, protocols and artifacts are instructions an agent follows. Six modules check their shape: resolving links, contextual command contracts, selected checkout inputs, planning-record publication, worktree placement and this catalogue.
- **Neither against a live tracker.**
  Issue, board and pull request state arrives in shapes pinned in [fixtures](fixtures.py). A test writes those shapes to a temporary directory and runs a script over them.

Both kinds sit in one folder. The script tests import the fixture module from beside them, and a single discovery command runs the lot; `scripts/` holds the programs the skill runs, not the checks on them.

## Why It Is Tested

- **A wrong reading becomes a wrong write.**
  A script reports what a mode should change, and the mode changes the tracker accordingly. A misread board item costs a misassigned issue, a wrong board field, or a branch cut from the wrong base on work already under way.
- **The instructions are the product.**
  Editing a mode or an artifact changes what every later session does. A link that no longer resolves, a step that stops naming its command, or a command missing an input is a defect no compiler reports.
- **A session is expensive.**
  The suite runs with no network, so a change is checked before a session spends tokens acting on a real tracker.

## Catalogue

One row per module, split by what it tests. The description is the module's docstring, and the coverage table carries each module's test count beside its name.

### Script Tests

These modules exercise the programs in `../scripts`, which the coverage table maps back from.

| Module | What it guards |
| --- | --- |
| [test_agent_review](test_agent_review.py) | Current integration review evidence gates board and user handoff |
| [test_align](test_align.py) | Alignment repairs, unreadable evidence and reference visibility fixtures |
| [test_board](test_board.py) | The assignees [board](../scripts/board.py) gives an issue for its Status, and an initiative's Status once its criteria are ticked |
| [test_board_queue](test_board_queue.py) | The queue [board-queue](../scripts/board-queue.py) sets on a theme board |
| [test_closure](test_closure.py) | The closure gate passes on the issue and its Development links, the evidence GitHub exposes |
| [test_closure_sweep](test_closure_sweep.py) | The closure sweep lists each closed issue its criteria or Development links do not support |
| [test_command_contracts](test_command_contracts.py) | Documented commands preserve optional values, context and requested writes |
| [test_deliver](test_deliver.py) | The work [deliver](../scripts/deliver.py) finds available on a theme board, and the rows it reserves and releases |
| [test_deps](test_deps.py) | [deps](../scripts/deps.py) checks the task graph and proposes the rows that can share a pull request |
| [test_development_link](test_development_link.py) | Development links added and removed by [development-link](../scripts/development-link.py), and read back from both ends |
| [test_dispatch](test_dispatch.py) | Continuous dispatch from real delivery surveys and observed worker events |
| [test_format](test_format.py) | [format](../scripts/format.py) on standalone issues |
| [test_hotfix](test_hotfix.py) | [hotfix](../scripts/hotfix.py): a hot-fix's identity, target, board status, delivering pull requests and delivery unit state |
| [test_lane](test_lane.py) | Lane's raw-cell, assignment, consistency and admission contracts |
| [test_link_capture](test_link_capture.py) | The Development relation read from each end by [links-by-pull-request](../scripts/links-by-pull-request.py) and [links-by-issue](../scripts/links-by-issue.py), and the linked pull requests [linked-pull-requests](../scripts/linked-pull-requests.py) adds to a collection |
| [test_orphans](test_orphans.py) | [orphans](../scripts/orphans.py) keeps a proposal out of the hoist candidates and out of the initiative list, and a declared throwaway out of both candidate groups |
| [test_progress](test_progress.py) | [progress](../scripts/progress.py): one test per rule its docstring states |
| [test_renumber](test_renumber.py) | [renumber](../scripts/renumber.py) rewrites an initiative's epic numbers, or one epic's task numbers, across issue bodies |
| [test_revision_check](test_revision_check.py) | An instrument runs at the commit a branch or tag resolves to, and the run leaves no checkout |
| [test_shared](test_shared.py) | The helpers [progress](../scripts/progress.py) shares with [board](../scripts/board.py), [sync](../scripts/sync.py) and [format](../scripts/format.py) |
| [test_statuses](test_statuses.py) | The jurisdiction each mode's Status changes are held to, and the calls they render |
| [test_sync](test_sync.py) | Done on a Work Breakdown row, ticked when the row is complete |
| [test_templates](test_templates.py) | Body artifacts are the format checker's sole template source |

### Prose Tests

These modules read the skill's own documents rather than a script.

| Module | What it guards |
| --- | --- |
| [test_checkouts](test_checkouts.py) | Checkout-sensitive commands consume linked input contracts |
| [test_documents](test_documents.py) | The installed prose API exposes complete inputs and directed reading paths |
| [test_modes](test_modes.py) | Mode summaries in each skill's [SKILL](../SKILL.md) |
| [test_plan_mode](test_plan_mode.py) | Plan Mode keeps a plan in one home: its planning record on the engineering branch |
| [test_readme](test_readme.py) | The test folder's README names every module and every script, and its rows match what the folder holds |
| [test_worktrees](test_worktrees.py) | Every worktree the skill creates is placed by a field, and git places a relative path where the command runs |

[test_readme](test_readme.py) checks this catalogue rather than an artifact, so it sits here by the same rule: it reaches no script.

[fixtures](fixtures.py) holds no tests. It builds board items, issues and pull requests as the REST API returns them, and runs the scripts over them.

## Coverage

One row per script in `../scripts`, then one per document the prose tests read. The table is the reverse of the catalogue: it answers what exercises a given file. Each module carries its test count, which is the only signal of how much of a subject a module reaches.

### Scripts

| Script | Exercised by |
| --- | --- |
| [agent_review](../scripts/agent_review.py) | [test_agent_review](test_agent_review.py) (16) |
| [align](../scripts/align.py) | [test_align](test_align.py) (18) |
| [board](../scripts/board.py) | [test_board](test_board.py) (60), [test_shared](test_shared.py) (11) |
| [board-queue](../scripts/board-queue.py) | [test_board_queue](test_board_queue.py) (75) |
| [closure](../scripts/closure.py) | [test_closure](test_closure.py) (13), [test_command_contracts](test_command_contracts.py) (14) |
| [closure-sweep](../scripts/closure-sweep.py) | [test_closure_sweep](test_closure_sweep.py) (14) |
| [deliver](../scripts/deliver.py) | [test_deliver](test_deliver.py) (96), [test_dispatch](test_dispatch.py) (19) |
| [deps](../scripts/deps.py) | [test_deps](test_deps.py) (74) |
| [development](../scripts/development.py) | [test_link_capture](test_link_capture.py) (22) |
| [development-link](../scripts/development-link.py) | [test_development_link](test_development_link.py) (9) |
| [dispatch](../scripts/dispatch.py) | [test_dispatch](test_dispatch.py) (19) |
| [format](../scripts/format.py) | [test_format](test_format.py) (109), [test_shared](test_shared.py) (11), [test_sync](test_sync.py) (185), [test_templates](test_templates.py) (6) |
| [hotfix](../scripts/hotfix.py) | [test_hotfix](test_hotfix.py) (16) |
| [lane](../scripts/lane.py) | [test_dispatch](test_dispatch.py) (19), [test_lane](test_lane.py) (12) |
| [linked-pull-requests](../scripts/linked-pull-requests.py) | [test_link_capture](test_link_capture.py) (22) |
| [links-by-issue](../scripts/links-by-issue.py) | [test_link_capture](test_link_capture.py) (22) |
| [links-by-pull-request](../scripts/links-by-pull-request.py) | [test_link_capture](test_link_capture.py) (22) |
| [orphans](../scripts/orphans.py) | [test_orphans](test_orphans.py) (3) |
| [progress](../scripts/progress.py) | [test_progress](test_progress.py) (76) |
| [renumber](../scripts/renumber.py) | [test_renumber](test_renumber.py) (32) |
| [revision-check](../scripts/revision-check.py) | [test_revision_check](test_revision_check.py) (8) |
| [statuses](../scripts/statuses.py) | [test_board](test_board.py) (60), [test_shared](test_shared.py) (11), [test_statuses](test_statuses.py) (21) |
| [sync](../scripts/sync.py) | [test_align](test_align.py) (18), [test_link_capture](test_link_capture.py) (22), [test_shared](test_shared.py) (11), [test_sync](test_sync.py) (185) |

### Documents

| Document | Exercised by |
| --- | --- |
| `*/SKILL.md` | [test_modes](test_modes.py) (4) |
| [README](README.md) | [test_readme](test_readme.py) (14) |
| [SKILL](../SKILL.md) | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| `artifacts/` | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| [delivery-branches](../artifacts/delivery-branches.md) | [test_worktrees](test_worktrees.py) (2) |
| [planning-record](../artifacts/planning-record.md) | [test_plan_mode](test_plan_mode.py) (8) |
| [configuration](../configuration.md) | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| [conventions](../conventions.md) | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| [guidelines](../guidelines.md) | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| `modes/` | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| [plan-mode](../modes/plan-mode.md) | [test_plan_mode](test_plan_mode.py) (8) |
| `protocols/` | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| `references/` | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |
| [rules](../rules.md) | [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (13) |

A count beside a module measures that module, not the subject it appears against. The 19 tests of [test_dispatch](test_dispatch.py) do not all touch [deliver](../scripts/deliver.py), so a row's numbers are not a total.

A folder row stays as code text because a link to a directory resolves to nothing a reader can open. [README](README.md) is this folder's own file, so [test_readme](test_readme.py) is the one row whose subject is the catalogue itself.

## Keeping It Current

- **All three tables are checked.**
  [test_readme](test_readme.py) fails when a module, script or document has no row, when a row names something absent, and when a cell disagrees with the file it describes.
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
