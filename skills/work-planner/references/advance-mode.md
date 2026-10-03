# Advance mode

Decides which initiatives and epics on a theme board are Ready or In Progress, after [Sync Mode](sync-mode.md) has recorded delivery. One ordinary initiative and one bug or tech-debt initiative may be In Progress per repository. A higher priority takes that place once every open pull request of the incumbent has completed.

## Procedure

1. **Select.**
   - The board is a theme's board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](commands.md#find-theme-board) for the theme the user names.
   - When the request names none, ask which theme. Run this mode on one board at a time.
2. **Sync.**
   Run [Sync Mode](sync-mode.md) for each open initiative on the board, so Status matches delivery before the queue is decided.
3. **Priorities.**
   - When nothing is In Progress and no open initiative has a priority label, ask for two orders. In Review is not In Progress.
     - Ordinary initiatives, from `priority: 5` down to `priority: 1`.
     - Initiatives labelled `bug` or `tech-debt`, the same labels, as their own list.
     - An initiative left unordered stays in Backlog.
   - When an initiative In Progress has no priority label, ask for `priority: 5` down to `priority: 1`, or none.
     - A number keeps it In Progress. Add the label with [Add Labels](commands.md#add-labels).
     - None sends it to Backlog once its open pull requests have completed. Run [Plan Queue](commands.md#plan-queue) with `--unplanned` for that issue.
   - Add each confirmed label with [Add Labels](commands.md#add-labels), then continue.
4. **Fetch.**
   - [Fetch Board Fields](commands.md#fetch-board-fields), [Find Status Field](commands.md#find-status-field), and [Fetch Board Items with Status](commands.md#fetch-board-items-with-status).
   - [Fetch All Initiative Pull Requests](commands.md#fetch-all-initiative-pull-requests) for the board's repository, appending each further repository the board's issues live in.
   - [Find User](commands.md#find-user) for the assignee.
5. **Plan.**
   Run [Plan Queue](commands.md#plan-queue).
   - **Order.** An `order` line lists one kind. Ask as step 3 does, then run it again.
   - **Ask.**
     An `ask` line names an initiative In Progress with no priority label. Ask as step 3 does.
   - **Tie.**
     A `tie` line names labelled initiatives that share the highest rank. The queue does not choose between them.
   - **Waiting.**
     A `wait` line names an open pull request. Nothing in that slot moves until every such pull request is done.
   - **Next.**
     A `next` line names epics, as this mode's Report rule says.
   - Give an issue it reports unresolved with `--others`, then run it again.
6. **Write.**
   - Run each call it prints.
   - Fetch the items again and re-run. The queue is current when it reports nothing to do.
7. **Report.**
   - Each move, each `order`, `ask`, `tie` and `wait` line, and each `next` line.

## Rules

- **Slots.**
  Per repository on the board, one open initiative with neither `bug` nor `tech-debt` may be In Progress, and one with either label may be. The label is what lets the second run beside the first. An initiative In Review fills neither slot.
- **Priorities.**
  - The labels are `priority: 5` down to `priority: 1`. `priority: 5` is highest. Two such labels on one initiative count as the higher number.
  - An initiative in Backlog with no priority label stays in Backlog.
  - An initiative in Ready with no priority label moves to Backlog, and its epics move to Backlog with it.
  - Two labelled initiatives of one slot that share the highest rank are a tie. The one In Progress stays. When the slot is empty, neither moves to Ready.
  - Initiative number orders only a tie among unlabelled initiatives, and an unlabelled initiative is not a choice for a slot.
- **Initiatives.**
  - The choice is the labelled initiative of a slot with the strictly highest rank, apart from one In Review or Done.
  - When none of that slot is In Progress, the choice moves to Ready. Any other Ready initiative of that slot moves to Backlog.
  - When the choice outranks the initiative In Progress, nothing in the slot moves while any open pull request of an incumbent is open. The pull request is one [Sync Mode](sync-mode.md) would match: its title names the epic, `[Ixx:Eyy]`.
  - When every such pull request is done, each incumbent moves to Ready and the choice moves to In Progress.
  - An initiative the user leaves unplanned stays In Progress while such a pull request is open, and nothing else takes the slot. It then moves to Backlog, and its epics move to Backlog with it.
  - Advance moves an initiative to In Progress only in that swap. Sync moves a Ready initiative to In Progress when one of its epics has an open pull request.
  - An initiative In Review or Done is left as it stands.
- **Epics.**
  - On the initiative that is In Progress:
    - A partly completed epic is In Progress. Open questions do not change that.
    - An epic that is next, and has not started, moves to Ready.
    - Any other Ready epic of it moves to Backlog.
    - An epic In Review or Done is left as it stands.
  - An epic is next when every dependency in its Depends on cell is delivered and its Open Questions section is empty. Delivered is the reading [Plan Board Changes](commands.md#plan-board-changes) uses.
  - Partly completed means a delivered task row on an epic that is not closed as completed.
  - On an initiative that moves from In Progress to Ready:
    - Each partly completed epic is Ready.
    - Each epic In Progress, In Review or Ready becomes Ready.
    - An epic in Backlog that is not partly completed stays in Backlog.
  - A Ready epic of any other initiative moves to Backlog.
- **Tasks.**
  A task is Ready only when its epic is Ready or In Progress. [Plan Board Changes](commands.md#plan-board-changes) follows that. This mode does not move task issues.
- **Report.**
  - For an initiative that moved from In Progress to Ready, the `next` line names the epics that are Ready.
  - For an initiative that took an empty slot, the `next` line names the unstarted next epics, and those epics stay in Backlog.
- **The queue.**
  [Plan Board Changes](commands.md#plan-board-changes) leaves an initiative or an epic in Ready or Backlog when no pull request is open, and leaves In Progress when delivery has started. This mode is what moves them.
