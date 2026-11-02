# Test Evidence

Base `3cb9cbcf3`; head `c780b08b8` on `skill/delivery-board-first`. Failing-before runs keep the new tests and the base scripts (the board-queue run restores `board-queue.py` from the base with a named stash, then applies it back by commit). Commands run from the worktree root:

```bash
cd <worktree> && <workspace>/scripts/sbx python3 -m pytest skills/work-planner/test skills/test -q
```

## T1

AC1: an epic with no priority label stays in Backlog when no labelled sibling can start or is running.

Tests in `skills/work-planner/test/test_board_queue.py`:

- `test_an_epic_with_no_priority_stays_in_backlog_when_no_labelled_sibling_can_start`: two unlabelled epics of an In Progress initiative; neither moves to Ready.
- `test_an_epic_with_no_priority_stays_in_backlog_while_its_labelled_sibling_has_open_questions`: the board 17 shape on 2026-11-02 (I11:E18 `priority: 2` held by Open Questions, I11:E14 #1427 unlabelled). The unlabelled epic stays in Backlog, gets no assignee and no `next` line.
- `test_a_ready_epic_with_no_priority_returns_to_backlog`: an unlabelled epic already Ready returns to Backlog.

At `3cb9cbcf3`, all three fail. The open-questions case prints `set #3 [I01:E01] Epic 3: Work: Backlog → Ready` and `assign #3 ... (Ready)`, the same move board 17 was offered for #1427.

At `c780b08b8`: pass.

## T2

AC2: Advance reports each open epic with no priority label as waiting on a priority.

- `test_an_epic_with_no_priority_is_reported_waiting_on_a_priority`: `rank #1 [I01] Current: Work: E01` beside a labelled sibling, and `rank #1 [I01] Current: Work: E00, E01` when neither is labelled.
- `test_a_labelled_epic_is_not_reported_waiting_on_a_priority`: no `rank` line when every epic is labelled.
- The open-questions case in T1 also asserts `rank #1 [I01] Current: Work: E01`.

At `3cb9cbcf3`: the first fails (no `rank` line). At `c780b08b8`: pass. Advance mode's Report step lists the `rank` line, and [Report Lines](https://github.com/m2ux/workflow-server/blob/skill/delivery-board-first/skills/work-planner/artifacts/board-queue.md#report-lines) defines it.

## T3

AC3: a read of Deliver mode's Procedure, step 2 (Advance), at `c780b08b8`:

> This step reads the board and each open epic's priority label live, before the run changes any status, assignee or branch. No memory, summary or earlier note stands in for that read.
>
> A status move to Ready or In Progress, an assignment and an epic base come only from the queue this step returned in the same run. An epic that queue leaves in Backlog does not start, whatever this run was asked for.

Step 7 (Hold) passes Reserve Task Rows the board items the latest Plan Available Work read, so T4's refusal applies on the main path.

## T4

AC4: the delivery plan refuses a unit whose epic is not Ready or In Progress in the board items it was given.

The survey already offers no unit from an epic outside Ready and In Progress (`test_epic_in_backlog_offers_nothing`, passing at both revisions). The new guard sits where a unit is held. Tests in `skills/work-planner/test/test_deliver.py`:

- `test_reserve_refuses_a_unit_whose_epic_is_not_ready_or_in_progress`: Backlog, In Review, Done and off the board; exit 1, the epic named with its Status, no body written.
- `test_reserve_holds_a_unit_whose_epic_is_ready_or_in_progress`: Ready and In Progress reserve.
- `test_reserve_needs_the_board_items`: `--reserve` without `--items` exits 1.

At `3cb9cbcf3`: the refusal (four subtests) and the `--items` test fail; the reservation succeeds (`reserved: W01 → …`). At `c780b08b8`: pass.

## T5

The full suites and the skill file check at `c780b08b8`:

- `skills/work-planner/test skills/test`: 954 passed, 1 skipped, 1886 subtests passed.
- `check_skill_files.py skills/work-planner`: 50 files checked, 0 findings.
