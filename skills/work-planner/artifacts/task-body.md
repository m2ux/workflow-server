# Task Body

Populates one task body.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)

## Operations

### *Populate* Task Body

One task body within its supplied epic context.

**Inputs:** Task scope, epic context, design, criteria and output path.

- Populate the body from the [Template](#template) at the supplied output path.
  - The title must meet the shared [Titles](issue-body.md#titles) conditions.
  - The Problem and Proposal must meet [Problem and Proposal](issue-body.md#problem-and-proposal).
  - Acceptance criteria must meet the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria).
  - All populated fields must meet [Fields](#fields), including the required [Sections](#sections).

### *Record* Task Delivery

One task body with its confirmed delivery and verified criteria recorded.

**Inputs:** Task JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids and output body file.

1. Run [Sync Task Issue](#sync-task-issue) with the task JSON, records as `--prs`, snapshot as `--links`, delivery number as `--pr`, verified ids as `--tick` and output as `--fix`. Tick only criteria the caller has verified.
2. Return the body and eligibility findings; the caller publishes comments and closes the tracker issue.

## Fields

### Template

````markdown
## Overview

{{One paragraph: what this task delivers and why it exists within the epic.}}

## Problem

{{The friction as it is now. Bullets for distinct facets, sub-bullets for several items.}}

## Proposal

{{The design, in bullets or paragraphs, each opening with a bold statement, and its body on the next line.}}

## Acceptance Criteria

- [ ] **AC1.** {{An end state of one invariant. It ends by naming its instrument.}}

## Open Questions

- {{An undecided point the task cannot start without. Resolve every one before the task starts, then delete the section.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there. Delete the section when there is none.}}
````

### Titles

- The title is `[I07:E00:W01] Name: Subtitle`.
- The label is `type:task`.
- `W` is the task within the epic. Tasks count from `W01`.

### Open Questions

- Each holds only what is undecided, and is resolved before the task starts.

### Acceptance Criteria

- A task criterion meets the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria).

### Sections

- A task has the [epic issue body](epic-issue-body.md)'s sections without the Work Breakdown table.
- New task planning follows [Work Breakdown](epic-issue-body.md#work-breakdown). This body describes an existing issue kept as a task.

## Commands

### Sync Task Issue

Records the pull request that delivers a task issue, open or merged, ticks verified criteria, and reports whether it is closable.

An open pull request supplies verification evidence; completion requires its merge.

**Inputs:** Task JSON, pull request records, complete issue-link snapshot, delivering pull request number, verified criterion ids and output file.

`<criterion-ids>` is a comma-separated list of verified criterion ids.

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py '<task-json-file>' --prs '<pull-request-records-file>' --links '<issue-link-snapshot-file>' --pr '<pull-request-number>' --tick '<criterion-ids>' --fix '<output-body-file>'
```

**Example:**

```bash
cd "<workspace>" && "<workspace>/scripts/sbx" python3 skills/work-planner/scripts/sync.py issue-637.json --prs prs.json --links links.json --pr 950 --tick AC1 --fix fixed-637.md
```
