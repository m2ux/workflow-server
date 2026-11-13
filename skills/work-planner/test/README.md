# Work Planner Test Suite

Work Planner plans work as GitHub issues and keeps that plan true until the work lands. It scopes a problem, turns an approved proposal into initiatives and epics, breaks epics into tasks, places items on theme boards, delivers rows as pull requests, and records what landed. Everything it knows between runs lives in issue bodies, board fields and pull request records.

## What Is Under Test

- **The scripts.**
  Twenty-eight programs read those issue bodies, board items and pull request records, and report what a run should change. Most modules here hold one script to the rules its own docstring states.
- **The prose.**
  Modes, protocols and artifacts are instructions an agent follows. The modules check their shape: resolving links, contextual command contracts, selected checkout inputs, planning-record publication, worktree placement and this catalogue.
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
| [test_advance_decisions](test_advance_decisions.py) | [board-queue](../scripts/board-queue.py) over captured Advance boards: a saved answer settles the queue, and missing or further evidence keeps it pending |
| [test_agent_review](test_agent_review.py) | Current integration review evidence gates board and user handoff |
| [test_align](test_align.py) | Alignment reports an unreadable test plan, a checked list among them, and reference visibility fixtures |
| [test_board](test_board.py) | The assignees [board](../scripts/board.py) gives an issue for its Status, and an initiative's Status once its criteria are ticked |
| [test_board_queue](test_board_queue.py) | The queue [board-queue](../scripts/board-queue.py) sets on a theme board |
| [test_closure](test_closure.py) | The closure gate passes on the issue and its Development links, the evidence GitHub exposes |
| [test_closure_sweep](test_closure_sweep.py) | The closure sweep lists each closed issue its criteria or Development links do not support |
| [test_command_contracts](test_command_contracts.py) | Documented commands preserve optional values, context and requested writes |
| [test_deliver](test_deliver.py) | The work [deliver](../scripts/deliver.py) finds available on a theme board, and the rows it reserves and releases; [deliver](../scripts/deliver.py) reaches each kind of work through the script registry and each shared rule through its single home |
| [test_deps](test_deps.py) | [deps](../scripts/deps.py) checks the task graph and proposes the rows that can share a pull request |
| [test_development_link](test_development_link.py) | Development links added and removed by [development-link](../scripts/development-link.py), and read back from both ends |
| [test_dispatch](test_dispatch.py) | Continuous dispatch from real delivery surveys and observed worker events |
| [test_format](test_format.py) | [format](../scripts/format.py) on standalone issues |
| [test_hotfix](test_hotfix.py) | [hotfix](../scripts/hotfix.py): a hot-fix's identity, labels, target, board status, delivering pull requests, delivery unit state and agent review rule, each reached through the Kind interface the module supplies, which is all it exports |
| [test_kinds](test_kinds.py) | The script registry, [kinds](../scripts/kinds.py), maps each kind of work to its module and selects an item's kind from its title, and each registered module supplies the Kind interface |
| [test_lane](test_lane.py) | Lane's raw-cell, assignment, consistency and admission contracts |
| [test_link_capture](test_link_capture.py) | The Development relation read from each end by [links-by-pull-request](../scripts/links-by-pull-request.py) and [links-by-issue](../scripts/links-by-issue.py), and the linked pull requests [linked-pull-requests](../scripts/linked-pull-requests.py) adds to a collection |
| [test_orphans](test_orphans.py) | [orphans](../scripts/orphans.py) keeps a proposal out of the hoist candidates and out of the initiative list, a declared throwaway out of both candidate groups, and an issue of each registered kind of work out of both, reaching the kind through the script registry |
| [test_priority](test_priority.py) | [priority](../scripts/priority.py): the rank a priority label gives, the label a number names, and the execution-order key, as Work Priority states them |
| [test_progress](test_progress.py) | [progress](../scripts/progress.py): one test per rule its docstring states |
| [test_pull_request_body](test_pull_request_body.py) | [pull_request_body](../scripts/pull_request_body.py): a pull request body checked against the Template, or against Review Body for an epic review, each finding naming its section, as Validate Pull Request Body states it |
| [test_renumber](test_renumber.py) | [renumber](../scripts/renumber.py) rewrites an initiative's epic numbers, or one epic's task numbers, across issue bodies |
| [test_revision_check](test_revision_check.py) | An instrument runs at the commit a branch or tag resolves to, and the run leaves no checkout |
| [test_review_scope](test_review_scope.py) | An agent review record's scope notes waive no finding: every finding meets its disposition rules |
| [test_shared](test_shared.py) | The helpers [progress](../scripts/progress.py) shares with [board](../scripts/board.py), [sync](../scripts/sync.py) and [format](../scripts/format.py), the title tags [board](../scripts/board.py) owns, the completion and issue identity it reaches through [sync](../scripts/sync.py), and the title-tag, pull-request home and epic pull-request title patterns every script reaches through their one definition in [sync](../scripts/sync.py) |
| [test_statuses](test_statuses.py) | The jurisdiction each mode's Status changes are held to, and the calls they render |
| [test_sync](test_sync.py) | Done on a Work Breakdown row, ticked when the row is complete |
| [test_task_worktree](test_task_worktree.py) | Retained preparations validate and preserve real Git task worktrees |
| [test_templates](test_templates.py) | Body artifacts are the format checker's sole template source |
| [test_testplan](test_testplan.py) | [testplan](../scripts/testplan.py): the rows of a Test Plan section, whether the plan has passed, and the criteria it claims, as Test Plan states them |

### Prose Tests

These modules exercise the skill's instruction routes and document contracts.

| Module | What it guards |
| --- | --- |
| [test_board_status](test_board_status.py) | Board Status owns the proposed board change and the commands computing it, and Board Delivery and Hot-fix reach them with the decisions they gave |
| [test_checkouts](test_checkouts.py) | Checkout-sensitive commands consume linked input contracts |
| [test_documents](test_documents.py) | The installed prose API exposes complete inputs and directed reading paths, [Work Priority](../artifacts/work-priority.md), [Proposal](../artifacts/proposal.md) and [Test Plan](../artifacts/test-plan.md) each define what every other file reaching it links, and [Proposals Board](../artifacts/proposals-board.md) alone selects and creates the proposals board |
| [test_kind_operations](test_kind_operations.py) | Each [Work Kind](../artifacts/work-kind.md) step links each supplying kind's operation and no Registration, each hot-fix operation has its linked callers, and no general step applies an unlinked kind operation |
| [test_merge_outcomes](test_merge_outcomes.py) | Merge instructions bind verified heads and select terminal or bounded recovery routes |
| [test_modes](test_modes.py) | Mode summaries in each skill's `SKILL.md` |
| [test_plan_mode](test_plan_mode.py) | Plan Mode keeps a plan in one home: its planning record on the engineering branch, and drafts from an Approved proposal |
| [test_plan_publication](test_plan_publication.py) | Plan publication validates confirmed saved epic and parent identities |
| [test_readme](test_readme.py) | The test folder's README names every module and every script, and its rows match what the folder holds |
| [test_worktrees](test_worktrees.py) | Every worktree the skill creates is placed by a field, and git places a relative path where the command runs |

[test_readme](test_readme.py) checks this catalogue rather than an artifact, so it sits here by the same rule: it reaches no script.

[fixtures](fixtures.py) holds no tests. It builds board items, issues and pull requests as the REST API returns them, and runs the scripts over them.

## Coverage

One row per script in `../scripts`, then one per document the tests read. The table is the reverse of the catalogue: it answers what exercises a given file. Each module carries its test count, which is the only signal of how much of a subject a module reaches.

### Scripts

| Script | Exercised by |
| --- | --- |
| [agent_review](../scripts/agent_review.py) | [test_agent_review](test_agent_review.py) (21), [test_review_scope](test_review_scope.py) (6) |
| [align](../scripts/align.py) | [test_align](test_align.py) (13) |
| [board](../scripts/board.py) | [test_board](test_board.py) (61), [test_board_queue](test_board_queue.py) (77), [test_deliver](test_deliver.py) (110), [test_progress](test_progress.py) (79), [test_shared](test_shared.py) (19) |
| [board-queue](../scripts/board-queue.py) | [test_advance_decisions](test_advance_decisions.py) (7), [test_board_queue](test_board_queue.py) (77), [test_shared](test_shared.py) (19) |
| [closure](../scripts/closure.py) | [test_closure](test_closure.py) (13), [test_command_contracts](test_command_contracts.py) (14) |
| [closure-sweep](../scripts/closure-sweep.py) | [test_closure_sweep](test_closure_sweep.py) (14) |
| [deliver](../scripts/deliver.py) | [test_deliver](test_deliver.py) (110), [test_dispatch](test_dispatch.py) (33), [test_shared](test_shared.py) (19) |
| [delivery-branches](../scripts/delivery-branches.py) | [test_task_worktree](test_task_worktree.py) (9) |
| [deps](../scripts/deps.py) | [test_deps](test_deps.py) (84) |
| [development](../scripts/development.py) | [test_link_capture](test_link_capture.py) (22) |
| [development-link](../scripts/development-link.py) | [test_development_link](test_development_link.py) (9) |
| [dispatch](../scripts/dispatch.py) | [test_dispatch](test_dispatch.py) (33) |
| [format](../scripts/format.py) | [test_format](test_format.py) (114), [test_progress](test_progress.py) (79), [test_shared](test_shared.py) (19), [test_sync](test_sync.py) (191), [test_templates](test_templates.py) (6) |
| [hotfix](../scripts/hotfix.py) | [test_hotfix](test_hotfix.py) (25), [test_kinds](test_kinds.py) (9) |
| [kinds](../scripts/kinds.py) | [test_agent_review](test_agent_review.py) (21), [test_board_queue](test_board_queue.py) (77), [test_deliver](test_deliver.py) (110), [test_dispatch](test_dispatch.py) (33), [test_format](test_format.py) (114), [test_hotfix](test_hotfix.py) (25), [test_kinds](test_kinds.py) (9), [test_orphans](test_orphans.py) (4), [test_progress](test_progress.py) (79), [test_statuses](test_statuses.py) (24), [test_sync](test_sync.py) (191) |
| [lane](../scripts/lane.py) | [test_dispatch](test_dispatch.py) (33), [test_lane](test_lane.py) (12) |
| [linked-pull-requests](../scripts/linked-pull-requests.py) | [test_link_capture](test_link_capture.py) (22) |
| [links-by-issue](../scripts/links-by-issue.py) | [test_link_capture](test_link_capture.py) (22) |
| [links-by-pull-request](../scripts/links-by-pull-request.py) | [test_link_capture](test_link_capture.py) (22) |
| [orphans](../scripts/orphans.py) | [test_orphans](test_orphans.py) (4) |
| [priority](../scripts/priority.py) | [test_board_queue](test_board_queue.py) (77), [test_deliver](test_deliver.py) (110), [test_hotfix](test_hotfix.py) (25), [test_priority](test_priority.py) (12), [test_progress](test_progress.py) (79) |
| [progress](../scripts/progress.py) | [test_progress](test_progress.py) (79), [test_shared](test_shared.py) (19) |
| [pull_request_body](../scripts/pull_request_body.py) | [test_pull_request_body](test_pull_request_body.py) (14) |
| [renumber](../scripts/renumber.py) | [test_renumber](test_renumber.py) (32), [test_shared](test_shared.py) (19) |
| [revision-check](../scripts/revision-check.py) | [test_revision_check](test_revision_check.py) (8) |
| [statuses](../scripts/statuses.py) | [test_board](test_board.py) (61), [test_shared](test_shared.py) (19), [test_statuses](test_statuses.py) (24) |
| [sync](../scripts/sync.py) | [test_align](test_align.py) (13), [test_board_queue](test_board_queue.py) (77), [test_deliver](test_deliver.py) (110), [test_link_capture](test_link_capture.py) (22), [test_progress](test_progress.py) (79), [test_shared](test_shared.py) (19), [test_statuses](test_statuses.py) (24), [test_sync](test_sync.py) (191) |
| [testplan](../scripts/testplan.py) | [test_align](test_align.py) (13), [test_testplan](test_testplan.py) (12) |

### Documents

| Document | Exercised by |
| --- | --- |
| `*/SKILL.md` | [test_modes](test_modes.py) (4) |
| [README](README.md) | [test_readme](test_readme.py) (14) |
| `SKILL.md` | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| `artifacts/` | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_command_contracts](test_command_contracts.py) (14), [test_documents](test_documents.py) (28) |
| [pull-request](../artifacts/pull-request.md) | [test_merge_outcomes](test_merge_outcomes.py) (19) |
| [epic-integration](../protocols/epic-integration.md) | [test_merge_outcomes](test_merge_outcomes.py) (19) |
| [hotfix](../artifacts/hotfix.md) | [test_kind_operations](test_kind_operations.py) (6) |
| [work-kind](../artifacts/work-kind.md) | [test_kind_operations](test_kind_operations.py) (6) |
| [delivery-branches](../artifacts/delivery-branches.md) | [test_worktrees](test_worktrees.py) (2) |
| [planning-record](../artifacts/planning-record.md) | [test_plan_mode](test_plan_mode.py) (14) |
| [configuration](../configuration.md) | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| [conventions](../conventions.md) | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| [guidelines](../guidelines.md) | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| `modes/` | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| [plan-mode](../modes/plan-mode.md) | [test_plan_mode](test_plan_mode.py) (14), [test_plan_publication](test_plan_publication.py) (14) |
| [propose-mode](../modes/propose-mode.md) | [test_plan_mode](test_plan_mode.py) (14) |
| [proposal](../artifacts/proposal.md) | [test_plan_mode](test_plan_mode.py) (14) |
| `protocols/` | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| `references/` | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |
| [rules](../rules.md) | [test_board_status](test_board_status.py) (24), [test_checkouts](test_checkouts.py) (10), [test_documents](test_documents.py) (28) |

A count beside a module measures that module, not the subject it appears against. The 33 tests of [test_dispatch](test_dispatch.py) do not all touch [deliver](../scripts/deliver.py), so a row's numbers are not a total.

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
