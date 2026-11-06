# Standup Report

A board progress report for a selected window, formatted for pasting into Slack.

## Operations

### Compose Standup Report

The copyable report and any missing-evidence findings.

#### 1. Require Complete Link Snapshot

Require the complete [Issue Link Snapshot](#issue-link-snapshot).

#### 2. Render Window Progress

Run [Summarise Progress](#summarise-progress "ƒ") for the selected reporting window.

#### 3. Provide Unresolved Initiatives

If initiative references remain unresolved, provide them for the caller to supply.

#### 4. Write Management Paragraph

- Write the management paragraph from the rendered Initiatives and Completed sections.
- It must meet [Management Paragraph](#management-paragraph).

#### 5. Render Final Report

Run [Summarise Progress](#summarise-progress "ƒ") with the same inputs and the paragraph file as `--summary`.

#### 6. Provide Report Findings

- Provide [Report Result](#report-result) with the report and separate unresolved findings.
- The report must meet [Fields](#fields).

## Commands

### Summarise Progress

Print the standup from supplied board items, pull request records and their issue-link snapshot and provide [Report Result](#report-result "●") to the requester.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/progress.py &#92;
  --items '[**&lt;board-items-file&gt;**](#board-items "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-link-snapshot "○")' &#92;
  --since [**&lt;window-start-date&gt;**](#report-selection "○") &#92;
  --initiative [**&lt;initiative-filter&gt;**](#report-selection "○") &#92;
  --initiatives '[**&lt;initiative-json-file&gt;**](#initiative-records "○")' &#92;
  --summary '[**&lt;management-paragraph-file&gt;**](#management-file "○")'
</pre></big>

- Select the reporting [window](#scope) from the supplied [Report Selection](#report-selection "○").
- An initiative filter can be `I08` or `owner/repo:I08`.
- Pass each supplied off-board [initiative record](#initiative-records "○") as a separate argument after `--initiatives`.

- The optional flags may be combined or omitted. Omitting all four uses the default window and all initiatives with no off-board records or management paragraph. **Example combinations:** a focused report can use `--since 2026-09-21 --initiative I08`; resolving an off-board initiative adds `--initiatives issue-946.json`; the final report adds `--summary summary.txt` to the same inputs.

## Fields

### Scope

The report window and optional repository-qualified initiative filter. When no start date is supplied, the window follows [Standup Configuration](../configuration.md#standup). A supplied start date selects another window, such as the previous working day for a daily standup. An initiative filter names one initiative, qualified by repository when its number is ambiguous.

Each repository numbers its own initiatives, and an initiative's epics and task issues may live in other repositories. Each item's place follows the Work Breakdown links, or for a task issue the pull request whose Development field links it. A pull request counts towards the epic of its reference in the epic's repository or its initiative's.

### Sections

The report document's management paragraph, board link, initiative, Completed, In progress, Next, hot-fix and key sections.

The management paragraph is set off by blank lines, with the board's link beneath the heading.

- **Initiatives.**
  One line for each initiative with work under Completed or In progress, its title's name and subtitle, opening with the mark of its state. One off the board is done when closed, else in progress. An item works for the initiative whose table links its epic and for the one its epic's title names.
- **Completed.**
  Items Done whose issue closed in the window, grouped under their epic, and tasks whose pull requests merged in it. Closing is when an issue became Done; an issue the board caught up with later still falls on its closing date.
- **In progress.**
  Epics In Progress or In Review and task issues In Progress, each epic with its open pull requests, or else its next task.
- **Next.**
  The five Ready items, each epic with its next task, and a count of the rest.
  - Ready hot-fixes lead.
  - They rank by the priority label of the initiative their epic belongs to, then by their epic's own.
  - An epic is placed ahead of any listed epic naming it, so a supplier reads before the work drawing on it. An epic names another when a task row names one of its rows or the initiative row names it whole.
- **Hot-fixes.**
  Each [hot-fix](hotfix-body.md) follows the epic groups of Completed, In progress or Next as its status places it, with its [delivering pull requests](hotfix.md#delivering-pull-request) beneath. An initiative filter leaves hot-fixes out.
- **Key.**
  I Initiative, E Epic, W Work Item and F Hot-fix. Opening marks are ✅ done, 🔄 in progress (an initiative, epic or hot-fix open and not In Review, or a task issue In Progress), 👀 in review (an initiative, epic or hot-fix In Review, or a pull request ready for review), 📝 draft and ▶️ ready.

### Management Paragraph

One plain-language paragraph describes what the window delivered as outcomes for the initiatives it serves, grounded in Initiatives and Completed. It carries no references, links, task ids or tool names, and leaves out work in progress and next. With nothing completed, it says so in one sentence.

### Unresolved Evidence

A collection of unresolved initiative identities and dependency or unreadable-breakdown findings, separate from the report. An unresolved initiative identifies its number and repository for the caller to fetch. An off-board dependency is blocked. An epic with unreadable Work Breakdown is summarised without tasks and provided as a finding. Unresolved lines are separate from the copyable report.

### Report Selection

The optional window start uses `YYYY-MM-DD`. The optional initiative filter is an initiative id, or `<owner>/<repo>:<initiative-id>` where that id names initiatives in several repositories. eg `window-start-date: 2026-09-21`, `initiative-filter: I08`

### Initiative Records

The supplied resolved off-board initiative JSON records, each at a separate local file path. eg `issue-946.json`

### Output Paths

The supplied report and paragraph output paths.

### Management File

The optional local file holding the management paragraph. It is absent before the paragraph is written. eg `summary.txt`

### Report Result

The rendered copyable report and separate unresolved evidence findings.

### Board Items

The supplied board items with Status and their complete issue records, at the local paginated snapshot path. eg `items.json`

### Pull Request Records

The supplied current complete pull request records, one JSON object per nonempty line at the local file path. eg `prs.json`

### Issue Link Snapshot

The complete supplied pull-request issue-link snapshot at its local JSON path. eg `links.json`

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.
