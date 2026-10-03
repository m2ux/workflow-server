# Advance mode

Decides which initiatives and epics on a theme board are Ready or In Progress, after [Sync Mode](sync-mode.md) has recorded delivery. One ordinary initiative and one bug or tech-debt initiative may be In Progress per repository. A higher priority takes that place once the incumbent's open pull requests have completed, and a partly completed epic of the initiative that steps down is Ready.

## Procedure

1. **Select.**
   - The board is a theme's board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](commands.md#find-theme-board) for the theme the user names.
   - When the request names none, ask which theme. Run this mode on one board at a time.
2. **Sync.**
   Run [Sync Mode](sync-mode.md) for each open initiative on the board, so Status matches delivery before the queue is decided.
3. **Priorities.**
   - List every open initiative on the board with no priority label.
   - When the list is empty, go on.
   - Recommend one label for each, from its goal against the initiatives on the board that already have one. The labels are this mode's Priorities rule.
   - Confirm the whole list with the user, then add each confirmed label with [Add Labels](commands.md#add-labels).
4. **Fetch.**
   - [Fetch Board Fields](commands.md#fetch-board-fields), [Find Status Field](commands.md#find-status-field), and [Fetch Board Items with Status](commands.md#fetch-board-items-with-status).
   - [Fetch All Initiative Pull Requests](commands.md#fetch-all-initiative-pull-requests) for the board's repository, appending each further repository the board's issues live in.
   - [Find User](commands.md#find-user) for the assignee.
5. **Plan.**
   Run [Plan Queue](commands.md#plan-queue). When it prints `blocked: priorities`, return to step 3.
6. **Write.**
   - Run each call it prints.
   - When it reports unresolved, fetch that issue with [Fetch Issue](commands.md#fetch-issue) and re-run with `--others`.
   - Fetch the items again and re-run. The queue is current when it reports nothing to do.
7. **Report.**
   - Each move, each swap waiting on an open pull request, and the epics a Ready initiative would start with.
   - A hold line names an open initiative that still has no priority label.

## Rules

- **Slots.**
  Per repository on the board, one open initiative with neither `bug` nor `tech-debt` may be In Progress, and one open initiative with either label may be. An initiative In Review fills neither slot.
- **Priorities.**
  Nothing on the board moves while any open initiative lacks a priority label. Highest first, the labels are `priority: highest`, `priority: high`, `priority: medium`, `priority: low` and `priority: lowest`. A tie breaks toward the lower initiative number.
- **Initiatives.**
  - The choice is the highest-priority open initiative of a slot, apart from one In Review or Done.
  - When none of that slot is In Progress, the choice moves to Ready, and every other Ready initiative of that slot moves to Backlog.
  - When the choice is not the initiative In Progress, and a pull request of that initiative is open, the initiative stays In Progress and the choice is not moved.
  - When the choice is not the initiative In Progress, and no pull request of that initiative is open, it moves to Ready and the choice moves to In Progress.
  - An initiative In Review or Done is left as it stands.
- **Epics.**
  - On the initiative that is In Progress:
    - A partly completed epic is In Progress.
    - An epic that is next moves to Ready.
    - Any other Ready epic of it moves to Backlog.
    - An epic In Review or Done is left as it stands.
  - An epic is next when every dependency in its Depends on cell is delivered and its Open Questions section is empty. Delivered is the reading [Plan Board Changes](commands.md#plan-board-changes) uses.
  - Partly completed means a delivered task row on an epic that is not closed as completed.
  - On an initiative that moves from In Progress to Ready:
    - Each partly completed epic is Ready.
    - Each epic In Progress, In Review or Ready becomes Ready.
    - An epic in Backlog that is not partly completed stays in Backlog.
  - A Ready epic of any other initiative moves to Backlog.
  - The epics a Ready initiative would start are reported and not moved.
- **The queue.**
  [Plan Board Changes](commands.md#plan-board-changes) leaves an initiative or an epic in Ready or Backlog when no pull request is open, and leaves In Progress when delivery has started. This mode is what moves them.
