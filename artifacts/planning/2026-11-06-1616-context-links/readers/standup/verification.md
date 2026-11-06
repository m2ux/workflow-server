# Verification

- [x] Read installed skill, Rules, Conventions and Standup mode.
- [x] Follow applicable operation sections and command contracts.
- [x] Render supplied snapshots with requested window and initiative filter.
- [x] Compare rendered output against complete supplied snapshots.
- [x] Write management paragraph and rerender verbatim report.

## Context reuse

Rules and Conventions were read once and reused when Standup mode linked them. Supplied current checkpoint bypassed missing-checkpoint and refresh branches; no Sync mode was read or called. Supplied complete snapshots satisfied fetch outputs without tracker calls. Final render reused identical items, PRs, links, date and filter. There were no unresolved initiatives, unreadable work breakdowns or dependency findings, so issue resolution and issue-body repair branches were not read.

## Unnecessary reads and truncation

The parent checkout AGENTS.md and current worktree AGENTS.md duplicated the same instructions. Reading Fields after individual Management Paragraph, Report Result and Issue Link Snapshot sections repeated those three small sections; Fields was an explicit whole-section output requirement. Selected Board and Board State added small input-contract confirmations. No tool output was truncated. The initial path-discovery output used head -60 but returned only two file paths; it did not read source content. The .project/main/AGENTS.md path was absent in the worktree.

## Missing context

None for this request. Scope, window, current checkpoint and complete snapshots were supplied. No live board verification was performed by design.

## Correctness

Snapshot board identity is orgs/o/projectsV2/7, rendered as https://github.com/orgs/o/projects/7. Both paginated board pages are reflected: I07 is In Progress; E00 is Done with issue close 2026-11-04 and W01 PR 900 merged 2026-11-04; E01 is In Progress with draft PR 901; E02 is Ready with next W01 Render queue report. All completions fall within the requested window since 2026-11-01. Management paragraph uses only initiative and completed outcome, with no IDs, links, tool names or in-progress/next claims. Renderer exit codes are 0; stderr files are empty. Final report is verbatim renderer output. No repository edits, GitHub/Slack sends, sync writes, or external calls occurred.
