# Task Body

The body of an existing task issue, and the record of its delivery.

## Prerequisites

Read these files first.

- [Issue Body](issue-body.md)
- [Epic Issue Body](epic-issue-body.md)

## Operations

### Record Task Delivery

One task body with its confirmed delivery and verified criteria recorded.

#### 1. Record Verified Delivery

Apply [Sync Task Issue](#sync-task-issue "ƒ") to [Task Record](#task-record "○") with [Pull Request Records](#pull-request-records "○"), [Issue Links](#issue-links "○") and [Delivery Selection](#delivery-selection "○"), writing to [Output Body](#output-body "○"). Tick only criteria the requester has verified.

#### 2. Provide Delivery Findings

Provide [Output Body](#output-body "●") and [Delivery Findings](#delivery-findings "●"); the requester publishes comments and closes the tracker issue.

### Sync Task Issue

Records the pull request that delivers a task issue, open or merged, ticks verified criteria, and reports whether it is closable.

An open pull request supplies verification evidence; completion requires its merge.

#### 1. Sync Task Issue

`<criterion-ids>` is a comma-separated list of verified criterion ids.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && \
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;task-json-file&gt;**](#task-record "○")' \
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' \
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' \
  --pr [**&lt;pull-request-number&gt;**](#delivery-selection "○") \
  --tick [**&lt;criterion-ids&gt;**](#delivery-selection "○") \
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

#### 2. Provide Recorded Task Issue

Provide [Output Body](#output-body "●"), [Delivery Findings](#delivery-findings "●") to the requester.

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

- The title is `[I07:E00:W01] Name: Subtitle`. Its prefix is the initiative, epic and row id of its row in the epic's Work Breakdown.
- The label is `type:task`.
- `W` is the task within the epic. Tasks count from `W01`.

### Open Questions

- Each holds only what is undecided, and is resolved before the task starts.

### Acceptance Criteria

- A task criterion meets the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria).

### Sections

- A task has the [epic issue body](epic-issue-body.md)'s sections without the Work Breakdown table.
- New task planning follows [Work Breakdown](epic-issue-body.md#work-breakdown). This body describes an existing task issue.

### Task Record

The supplied current task issue JSON.

**Example:**

```text
issue-637.json
```

### Pull Request Records

The supplied current pull request records.

**Example:**

```text
prs.json
```

### Issue Links

The complete supplied issue-link snapshot.

**Example:**

```text
links.json
```

### Delivery Selection

The supplied delivering pull request number and verified criterion ids.

**Example:**

```text
pull-request-number: 950
criterion-ids: AC1
```

### Output Body

The supplied local destination for the complete provided body.

**Example:**

```text
fixed-637.md
```

### Delivery Findings

The resulting body and eligibility findings for the supplied task delivery.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.
