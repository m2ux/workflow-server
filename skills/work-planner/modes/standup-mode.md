# Standup Mode

Summarises a project board as a standup, in Slack markup for pasting into a channel: a paragraph for management on what the window accomplished, then what completed, what is in progress, and what is next. The board's Status is the source, so the summary is as current as the board.

Follow the [Procedure](#procedure "ƒ"), adhering to [Rules](../rules.md) and [Conventions](../conventions.md) and ensure all [Outcomes](#outcomes) are met.

## Procedure

### 1. Select the Scope

- Apply [Select Project Board](../artifacts/board.md#select-project-board "ƒ") for the requested board, each requested board when the scope is all, or the theme board of the named initiative.

- Retain the selected window and initiative filter.
- Complete steps 2–6 separately for each selected board.

### 2. Bring Delivery Current

- Use the delivery results and board state a caller passed in, where this run follows one that already brought the board current. A request made directly by the user supplies none, so the checkpoint is absent.

#### Missing Checkpoint

- If the checkpoint is absent:

- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") for the board.
- Treat each selected initiative's delivery state as needing refresh.

#### Refresh Selected Initiatives

- For initiatives with known delivery changes or unknown freshness, Follow [Sync Mode](sync-mode.md "ƒ") for the affected initiatives on that board.

- Resume the fetch step after their delivery results are saved.
- Report a blocker that prevents a current summary.
- Retain it as a gap if presenting a partial report.

### 3. Fetch

- Apply [Read Board State](../artifacts/board.md#read-board-state "ƒ") with the selected board identity.

- Apply [Fetch All Delivery Pull Requests](../artifacts/pull-request.md#fetch-all-delivery-pull-requests "ƒ") for the [repositories](../artifacts/board.md#repositories) and items Read Board State provided.
- Apply [Fetch Pull Request Issue Links](../artifacts/pull-request.md#fetch-pull-request-issue-links "ƒ") for those records.
- Pass the provided snapshots to Compose Standup Report.

### 4. Compose

Apply [Compose Standup Report](../artifacts/standup-report.md#compose-standup-report "ƒ") for the selected board, reporting window and initiative filter.

### 5. Resolve Evidence

- For each unresolved initiative:

- Run [Find Initiative Issue](../artifacts/issue.md#find-initiative-issue "ƒ").
- Apply [Read Tracker Issue](../artifacts/issue.md#read-tracker-issue "ƒ") for its current JSON.
- Apply [Compose Standup Report](../artifacts/standup-report.md#compose-standup-report "ƒ") again with all resolved initiative records, retaining the selected window, filter and original snapshots. An unavailable record remains a reported gap.

### 6. Report

- Present the provided report verbatim in a fenced block for copying.

- Put unresolved findings beneath it.

- For an epic the preceding Compose Standup Report call returns with an unreadable Work Breakdown:

- Apply [Repair Issue Format](../artifacts/issue-body.md#repair-issue-format "ƒ") for that epic against its [template and field conditions](../artifacts/epic-issue-body.md#fields).
- If it confirms a saved correction, repeat steps 3–6 with refreshed records, retaining the selected board, window and initiative filter.
- If it reports a blocker or no correction, provide the unresolved finding without repeating the same repair.

## Outcomes

- **A standup for the window.**
  The user has a summary they can paste, of what the window accomplished, what completed, what is in progress, and what is next.
- **Current with the board.**
  The summary matches the board's Status.
- **The board they asked for.**
  The summary covers the board they name, every board, or the one initiative they name.
- **A paragraph for management.**
  The user has one paragraph on what the window delivered for the initiatives it serves.
