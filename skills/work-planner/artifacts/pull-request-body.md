# Pull Request Body

Populates one pull request body from its change, review scope and validation evidence, and validates a body against its template. [pull_request_body](../scripts/pull_request_body.py) implements the validation.

## Operations

### Validate Pull Request Body

One body file checked against the [Template](#template), or against [Review Body](#review-body) for an epic review.

#### 1. Check Body Against Template

Run [Check Pull Request Body](#check-pull-request-body "ƒ") for the [Body File](#body-file).

#### 2. Provide Body Findings

Provide the [Body Findings](#body-findings).

### Populate Review Body

The current change carried by one epic base.

#### 1. Populate Base Review

- Populate the [Template](#template) from the actual task merges in [Change Evidence](#change-evidence), incorporating [Current Body](#current-body) when present and writing to [Output Body](#output-body).
- All populated fields must meet [Fields](#fields).

#### 2. Account for Task Merge

- For a later task merge:
- Restate each standing Changes bullet the merged change makes false, so the bullet states the base as it now is.
- Add its functional change under the corresponding area.
- Cite the merged task pull request as the next reference.

#### 3. Provide Updated Body

Provide the complete [updated body](#output-body) file to the caller.

## Commands

### Check Pull Request Body

Check one body file against its template and provide [Body Findings](#body-findings "●") to the requester.

Exit 1 means the body has a finding.

<big><pre>
[**&lt;workspace&gt;**](#workspace "○")/scripts/sbx python3 [**&lt;workspace&gt;**](#workspace "○")/skills/work-planner/scripts/pull_request_body.py '[**&lt;body-file&gt;**](#body-file "○")'
</pre></big>

- An epic review body adds `--review`, which holds it to [Review Body](#review-body).

## Fields

### Template

The Test Plan section holds the table [Test Plan](test-plan.md) defines.

````markdown
## Overview

{{One paragraph: what this pull request delivers and why.}}

## Changes

{{One sentence on what changed and why it was needed. Then one heading per area the changes sit in. A heading is two to five words, in title case, such as Queue Placement or Task Readiness. Under each heading, one bullet per functional change in that area. The bullet opens with a bold lead, as the scheme's Bold leads rule lays one out. The change is at most two lines, the lead included: the lead names what it does, and the behavior is the single line under it.}}

### {{Queue Placement}}

- **{{What it does.}}**
  {{The behavior as it is.}}

## Test Plan

| Test | Description | Coverage | Pass |
| --- | --- | --- | --- |
| T1 | {{Check name, per [Plan Columns](test-plan.md#plan-columns).}} | {{Observed criteria, if any.}} | [{{Result}}]({{Planning document URL#test-section}}) |

## Open Questions

- {{An undecided point. Resolve it, then delete the section.}}

## References

- **R1.** [{{Title}}]({{URL}}) — {{What the reader finds there. The issue this pull request delivers is not a reference: the Development field carries that link, as [Issue Links](pull-request.md#issue-links) state. Delete the section when there is none.}}
````

### Titles

- A pull request's title starts with the epic it works on: `[I07:E00] Purpose`.
- A hot-fix's pull request takes the title its [Delivering Pull Request](hotfix.md#delivering-pull-request) names.
- A pull request working on neither an epic nor a hot-fix takes `Name: Subtitle`, with no prefix, as a revision of the skill itself does.
- The prefix is how an epic's pull requests are found, and each one, open or merged, is matched to the tasks it works on from its changes and the tasks' Descriptions.
- The pull request that merges an epic base carries the same prefix. Its head is the epic base, which tells it from a task pull request.
- A title carrying an initiative's prefix names one of its epics. An epic sync reports one that names none as `no epic`, and one naming its epic by a task id, `[I07:E00:W01]`, as `retitle`.

### Review Body

The epic review document, containing Overview, Changes and References sections.

- Overview is one paragraph on what the base carries.
- Changes holds one heading per area, with a bullet per functional change.
- A Changes bullet states what the base does and carries no count of the corpus, such as how many specifications or files it holds. A count belongs in the unit's planning record, with the revision that produced it.
- Each file a Changes bullet names in a code span stands at the base's head. A code name, such as `board.Outputs`, names no file.
- References cites each task pull request merged into that base.
- It carries no [Test Plan](test-plan.md), since it delivers no task of its own, and no statement about what the epic has yet to deliver. The epic's Work Breakdown is where delivery state is read.

### Change Evidence

The supplied current change summary and delivery scope, with validation evidence, and task-merge evidence for an epic review body.

### Current Body

The optional existing complete pull request body.

### Overview URL

The published architecture overview URL on the engineering branch.

### Output Body

The supplied local destination for the complete body. eg `fixed-950.md`

### Body File

The complete body a caller supplies for validation, alone in its file. eg `body.md`

### Body Findings

Each way the body departs from its template, each naming its section: a required section missing, an extra section, a repeated or misplaced section, text before the first section, an unreadable [Test Plan](test-plan.md#plan-table), or a `Target:` line, as a [hot-fix](hotfix-body.md#target)'s issue carries. Nothing when it departs in none. eg `body.md: extra section: Problem`

### Workspace

The absolute checkout holding the installed Work Planner scripts and sandbox helper.

## Guidance

### Test Coverage

- Every criterion a unit's Coverage names has an observing test in its work item and pull request. A criterion no test can observe remains in the [coverage report](issue-body.md#coverage-reports) and in a [Test Plan](test-plan.md#plan-columns) row with an empty Test cell.
- The criterion selects the test kind: a unit test for one component, an integration test for a seam between components, and an end-to-end or system test for running-system behaviour. That evidence must meet [Coverage Reports](issue-body.md#coverage-reports).
- An instrument that does not exist yet is work the task carries, as the verified rule defines. Use the project's own system test where it can observe the criterion.
- Every criterion in the unit's Coverage appears in at least one [Test Plan](test-plan.md#plan-table) row.
