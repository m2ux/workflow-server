# Standup Report

A board progress report for a selected window, formatted for pasting into Slack.

## Prerequisites

Read these files first.

- When no window start is supplied, read [Standup Configuration](../configuration.md#standup).
- [Hot-fix Body](hotfix-body.md)
- [Hot-fix](hotfix.md)

## Operations

### Compose Standup Report

The copyable report and any missing-evidence findings.

**Inputs:** [Board Items](#board-items), [Pull Request Records](#pull-request-records), [Issue Link Snapshot](#issue-link-snapshot), [Report Selection](#report-selection), [Initiative Records](#initiative-records), [Output Paths](#output-paths).

**Outputs:** [Report Result](#report-result).

#### 1. Require Complete Link Snapshot

Require the complete issue-link snapshot.

#### 2. Render Window Progress

Apply [Summarise Progress](#summarise-progress), passing items as `--items`, pull requests as `--prs`, links as `--links`, the selected start as `--since`, the filter as `--initiative` and every resolved initiative as `--initiatives`.

#### 3. Return Unresolved Initiatives

If initiative references remain unresolved, return them for the caller to supply.

#### 4. Write Management Paragraph

- Write the management paragraph from the rendered Initiatives and Completed sections.
- It must meet [Management Paragraph](#management-paragraph).

#### 5. Render Final Report

Apply [Summarise Progress](#summarise-progress) with the same inputs and the paragraph file as `--summary`.

#### 6. Return Report Findings

- Return the report and separate unresolved findings.
- The report must meet [Fields](#fields).

### Summarise Progress

Prints the standup from supplied board items, pull request records and their issue-link snapshot.

**Inputs:** [Board Items](#board-items), [Pull Request Records](#pull-request-records), [Issue Link Snapshot](#issue-link-snapshot), [Report Selection](#report-selection), [Initiative Records](#initiative-records), [Management File](#management-file).

**Outputs:** [Report Result](#report-result).

#### 1. Summarise Progress

- Run the following command with the supplied inputs.

- `--links` is the supplied complete pull-request issue-link snapshot; it identifies the issue each pull request delivers.
- `--since` supplies the window start in [Report Selection](#report-selection), selecting the [window](#scope).
- `--initiative` selects the initiative filter in [Report Selection](#report-selection). **Examples:** `I08`, `owner/repo:I08`.
- `--initiatives` gives supplied off-board initiative records, each as a separate file argument.
- `--summary` gives the paragraph for management.

- The optional flags may be combined or omitted. Omitting all four uses the default window and all initiatives with no off-board records or management paragraph. **Example combinations:** a focused report can use `--since 2026-09-21 --initiative I08`; resolving an off-board initiative adds `--initiatives issue-946.json`; the final report adds `--summary summary.txt` to the same inputs.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/progress.py --items '[**&lt;board-items-file&gt;**](#board-items)' --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records)' --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-link-snapshot)' --since '[**&lt;window-start-date&gt;**](#report-selection)' --initiative '[**&lt;initiative-filter&gt;**](#report-selection)' --initiatives '[**&lt;initiative-json-file&gt;**](#initiative-records)' --summary '[**&lt;management-paragraph-file&gt;**](#management-file)'
</pre></big>

**Example:**

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace)" && "[**&lt;workspace&gt;**](#workspace)/scripts/sbx" python3 skills/work-planner/scripts/progress.py --items items.json --prs prs.json --links links.json --since 2026-09-21 --initiative I08 --initiatives issue-946.json --summary summary.txt
</pre></big>

## Fields

### Scope

When no start date is supplied, the window follows [Standup Configuration](../configuration.md#standup). A supplied start date selects another window, such as the previous working day for a daily standup. An initiative filter names one initiative, qualified by repository when its number is ambiguous.

Each repository numbers its own initiatives, and an initiative's epics and task issues may live in other repositories. Each item's place follows the Work Breakdown links, or for a task issue the pull request whose Development field links it. A pull request counts towards the epic of its reference in the epic's repository or its initiative's.

### Sections

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

An unresolved initiative identifies its number and repository for the caller to fetch. An off-board dependency is blocked. An epic with unreadable Work Breakdown is summarised without tasks and returned as a finding. Unresolved lines are separate from the copyable report.

### Report Selection

The optional window start uses `YYYY-MM-DD`. The optional initiative filter is an initiative id, or `<owner>/<repo>:<initiative-id>` where that id names initiatives in several repositories.

### Initiative Records

The supplied resolved off-board initiative JSON records, each at a separate local file path.

### Output Paths

The supplied report and paragraph output paths.

### Management File

The optional local file holding the management paragraph. It is absent before the paragraph is written.

### Report Result

The rendered copyable report and separate unresolved evidence findings.

### Board Items

The supplied board items with Status and their complete issue records, at the local paginated snapshot path.

### Pull Request Records

The supplied current complete pull request records, one JSON object per nonempty line at the local file path.

### Issue Link Snapshot

The complete supplied pull-request issue-link snapshot at its local JSON path.

### Workspace

The absolute supplied checkout path holding the installed Work Planner scripts and sandbox helper.
