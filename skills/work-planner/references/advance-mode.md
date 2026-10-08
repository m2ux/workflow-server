# Advance mode

Decides which initiatives and epics on a theme board are Ready or In Progress, after [Sync Mode](sync-mode.md) has recorded delivery. Initiatives with the same priority number run together. A larger number is higher, and there is no maximum.

## Procedure

1. **Select.**
   - The board is a theme's board, per SKILL.md's [Themes and Boards](../SKILL.md#themes-and-boards): run [Find Theme Board](commands.md#find-theme-board) for the theme the user names.
   - When the request names none, ask which theme as an [Interview](interview.md). Run this mode on one board at a time.
2. **Sync.**
   Run [Sync Mode](sync-mode.md) for each open initiative on the board, so Status matches delivery before the queue is decided.
3. **Fetch.**
   - [Fetch Board Fields](commands.md#fetch-board-fields), [Find Status Field](commands.md#find-status-field), and [Fetch Board Items with Status](commands.md#fetch-board-items-with-status).
   - [Fetch All Initiative Pull Requests](commands.md#fetch-all-initiative-pull-requests) for the board's repository, appending each further repository the board's issues live in.
   - [Find User](commands.md#find-user) for the assignee.
4. **Plan.**
   Run [Plan Queue](commands.md#plan-queue). Ask only from a line it prints. The queue is not finished while an `order` or `ask` line is printed.
   - **Order.**
     The line lists the initiatives. Ask for a parallel work map: a positive integer on each, where every initiative with the same number runs together. One left unordered stays in Backlog.
   - **Ask.**
     An `ask` line names an initiative In Progress with no priority label. Ask for a positive integer, or none. A number keeps it In Progress. None sends it to Backlog once its open pull requests have completed, passed as `--unplanned`.
   - **Waiting.**
     A `wait` line names an open pull request. That initiative stays In Progress. A lower set then moves to Ready if it is the next number, or to Backlog if a number sits between it and the highest. The highest set moves to In Progress now.
   - **Next.**
     A `next` line names epics, as this mode's Report rule says.
   - Give an issue it reports unresolved with `--others`, then run it again.
   - After an answer, add each label with [Add Labels](commands.md#add-labels), fetch the items again, and run [Plan Queue](commands.md#plan-queue) again.
5. **Write.**
   - Run each call it prints.
   - Fetch the items again and re-run. Stop when it prints no `order` or `ask` line and nothing to do.
6. **Report.**
   - Each move, each `order`, `ask` and `wait` line, and each `next` line.

## Rules

- **Priorities.**
  - A priority label is `priority:` and a positive integer. A larger number is higher. There is no maximum.
  - Two such labels on one initiative count as the larger number.
  - Every initiative with the same number is one set. The highest number is In Progress, all of them together. The next number is Ready, all of them together. A lower number stays in Backlog. When the highest set leaves In Progress, the Ready set moves to In Progress.
  - An initiative in Backlog with no priority label stays in Backlog.
  - An initiative in Ready with no priority label moves to Backlog, and its epics move to Backlog with it.
  - When no open initiative has a priority label, the `order` line asks for the parallel work map, including an initiative already In Progress.
- **Initiatives.**
  - Each initiative in the highest set moves to In Progress. Each initiative in the next set moves to Ready.
  - An initiative In Review or Done is left as it stands.
  - An initiative stays In Progress while an open pull request names one of its epics, `[Ixx:Eyy]`, even when a higher set has started. It then moves to Ready if it is the next number, or to Backlog with its epics if a number sits between it and the highest. An initiative the user leaves unplanned follows that same wait, and then moves to Backlog with its epics.
- **Epics.**
  - On the initiative that is In Progress:
    - A partly completed epic is In Progress. Open questions do not change that.
    - An epic that is next, and has not started, moves to Ready.
    - Any other Ready epic of it moves to Backlog.
    - An epic In Review or Done is left as it stands.
  - An epic is next when every dependency in its Depends on cell is delivered and its Open Questions section is empty. Delivered is the reading [Plan Board Changes](commands.md#plan-board-changes) uses.
  - Partly completed means a delivered task row on an epic that is not closed as completed.
  - On an initiative that moves to Backlog, its epics move to Backlog.
  - A Ready epic of an initiative that is not In Progress moves to Backlog.
- **Tasks.**
  A task is Ready only when its epic is Ready or In Progress. [Plan Board Changes](commands.md#plan-board-changes) follows that. This mode does not move task issues.
- **Report.**
  For an initiative In Progress, the `next` line names the epics that are Ready.
- **The queue.**
  [Plan Board Changes](commands.md#plan-board-changes) leaves an initiative or an epic in Ready or Backlog when no pull request is open, and leaves In Progress when delivery has started. This mode is what moves them.
