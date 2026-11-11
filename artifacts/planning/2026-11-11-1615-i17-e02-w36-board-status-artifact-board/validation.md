# W36 Validation

## Candidate

- Unit: I17:E02:W36, AC6, AC7, AC8.
- Task base: `380110d19` (origin/i17/e02/workspace after W33 #1687).
- Task head: `3759e800c`, branch `i17/e02/w36-board-status-artifact-board`.
- Component: the eleven files [w36.md](w36.md) declares. The three planned artifacts change together with the callers of the retired Status Changes anchor (SKILL.md, board.md, board-queue.md, sync-mode.md), board.py's docstring, the new test module, the documented-command test and the test catalogue.

## Clause Owners

Every clause of Board Delivery's Status Changes at the base and its home at the head:

| Clause | Home |
| --- | --- |
| Completed closure is Done; any other closure removes the item | [Closure](https://github.com/m2ux/workflow-server/blob/i17/e02/w36-board-status-artifact-board/skills/work-planner/artifacts/board-status.md#closure) |
| Initiative and epic In Review, review evidence, active/inactive epic, initiative In Progress, task In Progress/Done, reservation, task readiness, unresolvable dependency | Item Status, linking the subject rules it consumes: agent-review.md Review Record, board-queue.md Epic Activity, Task Eligibility and Unresolvable Dependencies |
| Only an initiative, an epic or a hot-fix stands In Review | Write Jurisdiction, every jurisdiction: a task never stands In Review; In Review belongs to an initiative, an epic or an item whose registered kind supplies Settle Board Status |
| Delivery does not move an initiative or epic between Ready and Backlog | Write Jurisdiction, delivery |
| Dispatch writes only In Progress and In Review, no removal | Write Jurisdiction, dispatch |
| Queue write scope (stated in Board Queue at the base) | Write Jurisdiction, queue; Board Queue links it |
| A hot-fix's open lifecycle | Unchanged in hotfix.md Board Status; its closed case links Closure |

Board Status also holds Compute Board Changes and Compute Dispatch Status with their input fields, and the Status Change and Board Changes contracts. Board Delivery keeps Record Epic Review and Record Dispatch Status: they run Compute Dispatch Status, apply its calls, read each item back and provide Confirmed Statuses. Hot-fix's Settle Hot-fix Board Status applies the Board Status change. SKILL.md registers Status Change as the Settle Board Status contract. No protocol was needed: no ordered change spans the artifacts beyond the existing callers.

## Observing Tests

[test_board_status](https://github.com/m2ux/workflow-server/blob/i17/e02/w36-board-status-artifact-board/skills/work-planner/test/test_board_status.py), 27 tests:

- **AC6.** BoardStatusArtifact: the installed model reads board-status.md as an artifact with zero checker findings; its commands are the two status computations running board.py and deliver.py; every command input and output is one of its Fields; its Guidance is Closure, Item Status and Write Jurisdiction; it and the scripts its commands run name no kind.
- **AC7.** DeliveryDecisions and DispatchDecisions run the documented commands from board-status.md: completed and other closure, missing review evidence holding an epic In Progress with its handoff blocked, reservation versus work-item link, absent item added then set on the next pass, an unresolvable dependency keeping its Status, a held dispatch, a review refusal, an absent dispatch item and a task set In Review. BoardDeliveryCallers: no kind name or kind-artifact link, no command or status rule of its own, dispatch and review statuses from Board Status with readback, Sync Mode running Compute Board Changes from Board Status, and no document reaching a retired target.
- **AC8.** HotfixDecisions runs the documented Compute Board Queue over hot-fix items: completed and other closure, ready and draft delivery, a hold, and malformed issue-link evidence. HotfixCaller: settlement applies the Status Change, closure comes from Closure, the registered contract is Status Change, and every board-status.md target resolves.

## Identical Outcomes

- The twelve decision fixtures pass at the base with the commands run from board-delivery.md ([decisions-base.log](decisions-base.log)) and at the head from board-status.md ([focused.log](focused.log)): same calls, refusals and exit codes for identical evidence. No script logic changed; board.py's diff is one docstring sentence.
- Control: the whole module at the base fails every test but the three hot-fix queue decisions, whose documented command does not move: 11 failures, subtests counted, and 16 errors ([board-status-base.log](board-status-base.log)).
- Kind search ([kind-search.log](kind-search.log)): at the base board-delivery.md:199 and board.py:44 name a hot-fix; at the head board-delivery.md, board-status.md, board.py and deliver.py name none, and no file links a retired Board Delivery target.
- Existing regressions keep their results: test_board, test_statuses, test_deliver, test_board_queue, test_hotfix, test_kind_operations, test_command_contracts, test_documents and test_checkouts with test_board_status, 374 tests ([focused.log](focused.log)).

## Full Checks

- Planner: 1174 tests, one opt-in live-link skip ([planner.log](planner.log)), including the installed document and model checks.
- Shared: 280 pass ([shared.log](shared.log)).
- Skill checker: 60 files, zero findings ([skill-check.log](skill-check.log)).
- Whitespace: zero findings; the log is empty ([whitespace.log](whitespace.log)).

Commands use `/home/mike1/projects/dev/md-composer/scripts/sbx`:

```text
python3 -m unittest -v test_board_status test_board test_statuses test_deliver test_board_queue test_hotfix test_kind_operations test_command_contracts test_documents test_checkouts   # skills/work-planner/test
python3 -m unittest discover -s test                              # skills/work-planner
python3 -m unittest discover -s skills/test                       # checkout root
python3 skills/scripts/check_skill_files.py skills/work-planner   # checkout root
git diff --check origin/i17/e02/workspace                         # checkout root
```

The base runs use a `git archive 380110d19 skills` export with test_board_status.py copied in; decisions-base.log runs its three decision classes with the command document set to board-delivery.md.
