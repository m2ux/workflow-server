# Standup Mode

Summarises a project board as a standup, in Slack markup for pasting into a channel: a paragraph for management on what the window accomplished, then what completed, what is in progress, and what is next. The board's Status is the source, so the summary is as current as the board.

## Prerequisites

Read these files first.

- [Board](../artifacts/board.md)
- [Sync Mode](sync-mode.md)
- [Pull Request](../artifacts/pull-request.md)
- [Standup Report](../artifacts/standup-report.md)
- [Issue](../artifacts/issue.md)
- [Epic Issue Body](../artifacts/epic-issue-body.md)
- [Issue Body](../artifacts/issue-body.md)

## Procedure

The main path meets [Outcomes](#outcomes).

1. **Select the scope.**
   Run [Select Project Board](../artifacts/board.md#select-project-board) for the requested board, each requested board when the scope is all, or the theme board of the named initiative.
   - Retain the selected window and initiative filter.
   - Complete steps 2–6 separately for each selected board.
2. **Bring delivery current.**
   - Use the delivery results and board state a caller passed in, where this run follows one that already brought the board current. A request made directly by the user supplies none, so the checkpoint is absent.
   - If the checkpoint is absent:
     - Read the board through [Read Board State](../artifacts/board.md#read-board-state).
     - Treat each selected initiative's delivery state as needing refresh.
   - For initiatives with known delivery changes or unknown freshness, run [Sync Mode](sync-mode.md) for the affected initiatives on that board.
   - Resume the fetch step after their delivery results are saved.
   - Report a blocker that prevents a current summary.
   - Retain it as a gap if presenting a partial report.
3. **Fetch.**
   Run [Read Board State](../artifacts/board.md#read-board-state) with the selected board identity.
   - Run [Fetch All Initiative Pull Requests](../artifacts/pull-request.md#fetch-all-initiative-pull-requests) for the [repositories](../artifacts/board.md#repositories) Read Board State returned.
   - Run [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links) for those records.
   - Pass the returned snapshots to Compose Standup Report.
4. **Compose.**
   Call [Compose Standup Report](../artifacts/standup-report.md#compose-standup-report) with the board items, initiative pull request records, complete issue-link snapshot, selected window and initiative filter, resolved off-board initiative records and output paths.
5. **Resolve evidence.**
   For each unresolved initiative:
   - Call [Locate Initiative Issue](../artifacts/issue.md#locate-initiative-issue).
   - Run [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue) for its current JSON.
   - Repeat [Compose Standup Report](../artifacts/standup-report.md#compose-standup-report) with all resolved initiative records, retaining the board items, pull requests, links, selected window and filter. An unavailable record remains a reported gap.
6. **Report.**
   Present the returned report verbatim in a fenced block for copying.
   - Put unresolved findings beneath it.
   - For an epic [Compose Standup Report](../artifacts/standup-report.md#compose-standup-report) returns with an unreadable Work Breakdown:
     - Run [Repair Issue Format](../artifacts/issue-body.md#repair-issue-format) with the epic identity, current JSON, [epic template and field conditions](../artifacts/epic-issue-body.md#fields), required related evidence and output body path.
     - If it confirms a saved correction, repeat steps 3–6 with refreshed records, retaining the selected board, window and initiative filter.
     - If it reports a blocker or no correction, return the unresolved finding without repeating the same repair.

## Outcomes

- **A standup for the window.**
  The user has a summary they can paste, of what the window accomplished, what completed, what is in progress, and what is next.
- **Current with the board.**
  The summary matches the board's Status.
- **The board they asked for.**
  The summary covers the board they name, every board, or the one initiative they name.
- **A paragraph for management.**
  The user has one paragraph on what the window delivered for the initiatives it serves.
