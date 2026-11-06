# Task Body

The body of an existing task issue, and the record of its delivery.

## Commands

### Sync Task Issue

Record the open or merged pull request delivering a task issue, tick verified criteria, report whether the task issue is closable, and provide [Output Body](#output-body "●") and [Delivery Findings](#delivery-findings "●") to the requester. Tick only criteria the requester has verified. The requester publishes comments and closes the tracker issue.

An open pull request supplies verification evidence; completion requires its merge.

`<criterion-ids>` is a comma-separated list of verified criterion ids.

<big><pre>
cd "[**&lt;workspace&gt;**](#workspace "○")" && &#92;
  "[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx" python3 skills/work-planner/scripts/sync.py '[**&lt;task-json-file&gt;**](#task-record "○")' &#92;
  --prs '[**&lt;pull-request-records-file&gt;**](#pull-request-records "○")' &#92;
  --links '[**&lt;issue-link-snapshot-file&gt;**](#issue-links "○")' &#92;
  --pr [**&lt;pull-request-number&gt;**](#delivery-selection "○") &#92;
  --tick '[**&lt;criterion-ids&gt;**](#delivery-selection "○")' &#92;
  --fix '[**&lt;output-body-file&gt;**](#output-body "○")'
</pre></big>

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

The existing task issue's collection of unresolved question statements.

- Each holds only what is undecided, and is resolved before the task starts.

### Acceptance Criteria

The existing task issue's collection of labelled criterion statements.

- A task criterion must meet the [shared acceptance criteria](issue-body.md#shared-acceptance-criteria).

### Sections

- A task has the [epic issue body](epic-issue-body.md)'s sections without the Work Breakdown table.
- New task planning must follow [Work Breakdown](epic-issue-body.md#work-breakdown). This body describes an existing task issue.

### Task Record

The supplied current task issue JSON. eg `issue-637.json`

### Pull Request Records

The supplied current pull request records. eg `prs.json`

### Issue Links

The complete supplied issue-link snapshot. eg `links.json`

### Delivery Selection

Verified criterion ids may be empty when recording delivery without requesting criterion ticks.

The supplied delivering pull request number and verified criterion ids. eg `pull-request-number: 950`, `criterion-ids: AC1`

### Output Body

The supplied local destination for the complete provided body. eg `fixed-637.md`

### Delivery Findings

The resulting body and eligibility findings for the supplied task delivery.

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.
